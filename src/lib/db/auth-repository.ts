import "server-only";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import type { WorkspaceContext } from "@/lib/tenant/context";

type MembershipRow = {
  user_id: string;
  workspace_id: string;
  workspace_slug: string;
  display_name: string;
  role: WorkspaceContext["role"];
};

type PilotClaim = {
  workspaceSlug: string;
  externalAuthId: string;
  email: string;
  displayName: string;
};

export async function findWorkspaceForExternalUser(externalAuthId: string): Promise<WorkspaceContext | null> {
  const sql = db();
  const rows = await sql<MembershipRow[]>`
    SELECT
      u.id::text AS user_id,
      w.id::text AS workspace_id,
      w.slug AS workspace_slug,
      u.display_name,
      m.role
    FROM users u
    JOIN memberships m ON m.user_id = u.id
    JOIN workspaces w ON w.id = m.workspace_id
    WHERE u.external_auth_id = ${externalAuthId}
      AND u.deleted_at IS NULL
    ORDER BY m.created_at ASC
    LIMIT 1
  `;
  const membership = rows[0];
  if (!membership) return null;
  return {
    userId: membership.user_id,
    workspaceId: membership.workspace_id,
    workspaceSlug: membership.workspace_slug,
    displayName: membership.display_name,
    role: membership.role,
  };
}

export async function claimPilotWorkspace(claim: PilotClaim): Promise<void> {
  const sql = db();
  await sql.begin(async (transaction) => {
    const workspaces = await transaction<{ id: string }[]>`
      SELECT id::text
      FROM workspaces
      WHERE slug = ${claim.workspaceSlug}
      FOR UPDATE
    `;
    const workspace = workspaces[0];
    if (!workspace) throw new Error("Pilot workspace does not exist");

    const claimedOwners = await transaction<{ external_auth_id: string }[]>`
      SELECT u.external_auth_id
      FROM memberships m
      JOIN users u ON u.id = m.user_id
      WHERE m.workspace_id = ${workspace.id}
        AND m.role = 'owner'
        AND u.external_auth_id IS NOT NULL
        AND u.deleted_at IS NULL
      FOR UPDATE
    `;
    if (claimedOwners.some((owner) => owner.external_auth_id !== claim.externalAuthId)) {
      throw new Error("BidNivo workspace ownership has already been claimed");
    }

    const matchingUsers = await transaction<{ id: string }[]>`
      SELECT id::text
      FROM users
      WHERE external_auth_id = ${claim.externalAuthId}
         OR lower(email) = ${claim.email}
      FOR UPDATE
    `;
    if (matchingUsers.length > 1) {
      throw new Error("The Clerk identity conflicts with more than one GrowthOS user");
    }

    let userId = matchingUsers[0]?.id;
    if (userId) {
      await transaction`
        UPDATE users SET
          email = ${claim.email},
          display_name = ${claim.displayName},
          external_auth_id = ${claim.externalAuthId},
          email_verified_at = COALESCE(email_verified_at, now()),
          deleted_at = NULL,
          updated_at = now()
        WHERE id = ${userId}
      `;
    } else {
      const inserted = await transaction<{ id: string }[]>`
        INSERT INTO users (email, display_name, external_auth_id, email_verified_at)
        VALUES (${claim.email}, ${claim.displayName}, ${claim.externalAuthId}, now())
        RETURNING id::text
      `;
      userId = inserted[0]?.id;
    }
    if (!userId) throw new Error("Could not create the GrowthOS user");

    await transaction`
      DELETE FROM memberships m
      USING users u
      WHERE m.user_id = u.id
        AND m.workspace_id = ${workspace.id}
        AND m.role = 'owner'
        AND u.external_auth_id IS NULL
        AND u.email LIKE '%@bidnivo.local'
    `;
    await transaction`
      INSERT INTO memberships (workspace_id, user_id, role)
      VALUES (${workspace.id}, ${userId}, 'owner')
      ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'owner'
    `;
    await transaction`
      INSERT INTO audit_events (
        workspace_id, actor_user_id, action, entity_type, entity_id, metadata
      ) VALUES (
        ${workspace.id}, ${userId}, 'workspace.owner_claimed', 'workspace',
        ${workspace.id}, jsonb_build_object('source', 'verified_clerk_bootstrap')
      )
    `;
  });
}

export async function applyClerkUserEvent(eventId: string, event: WebhookEvent): Promise<"applied" | "duplicate" | "ignored"> {
  if (event.type !== "user.created" && event.type !== "user.updated" && event.type !== "user.deleted") {
    return "ignored";
  }
  const sql = db();
  return sql.begin(async (transaction) => {
    const claimed = await transaction<{ id: string }[]>`
      INSERT INTO identity_webhook_events (provider, event_id, event_type)
      VALUES ('clerk', ${eventId}, ${event.type})
      ON CONFLICT (provider, event_id) DO NOTHING
      RETURNING id::text
    `;
    if (claimed.length === 0) return "duplicate" as const;

    if (event.type === "user.deleted") {
      if (event.data.id) {
        await transaction`
          UPDATE users SET deleted_at = now(), updated_at = now()
          WHERE external_auth_id = ${event.data.id}
        `;
      }
      return "applied" as const;
    }

    const primary = event.data.email_addresses.find(
      (candidate) => candidate.id === event.data.primary_email_address_id,
    );
    const email = primary?.email_address.toLowerCase()
      ?? event.data.email_addresses[0]?.email_address.toLowerCase()
      ?? null;
    if (!email) throw new Error("Clerk user has no email address");
    const displayName = [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") || email;
    const verifiedAt = primary?.verification?.status === "verified" ? new Date() : null;
    const matches = await transaction<{ id: string }[]>`
      SELECT id::text
      FROM users
      WHERE external_auth_id = ${event.data.id} OR lower(email) = ${email}
      FOR UPDATE
    `;
    if (matches.length > 1) {
      throw new Error("Clerk identity conflicts with more than one GrowthOS user");
    }
    if (matches[0]) {
      await transaction`
        UPDATE users SET
          email = ${email},
          display_name = ${displayName},
          external_auth_id = ${event.data.id},
          email_verified_at = COALESCE(${verifiedAt}, email_verified_at),
          deleted_at = NULL,
          updated_at = now()
        WHERE id = ${matches[0].id}
      `;
    } else {
      await transaction`
        INSERT INTO users (email, display_name, external_auth_id, email_verified_at)
        VALUES (${email}, ${displayName}, ${event.data.id}, ${verifiedAt})
      `;
    }
    return "applied" as const;
  });
}

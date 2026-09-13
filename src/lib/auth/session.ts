import "server-only";
import { auth } from "@clerk/nextjs/server";
import { cache } from "react";
import { findWorkspaceForExternalUser } from "@/lib/db/auth-repository";
import { isClerkConfigured } from "@/lib/env";
import type { WorkspaceContext } from "@/lib/tenant/context";

const demoContext: WorkspaceContext = {
  userId: "20000000-0000-4000-8000-000000000001",
  workspaceId: "10000000-0000-4000-8000-000000000001",
  workspaceSlug: "bidnivo",
  displayName: "Fumani Khosa",
  role: "owner",
};

export function validateRuntimeAuthConfiguration(): void {
  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE === "true") {
    throw new Error("DEMO_MODE must never be enabled in production");
  }
}

export async function getWorkspaceSession(): Promise<WorkspaceContext | null> {
  validateRuntimeAuthConfiguration();
  if (process.env.DEMO_MODE === "true") {
    return demoContext;
  }
  if (!isClerkConfigured()) {
    return process.env.NODE_ENV !== "production" ? demoContext : null;
  }
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  return findWorkspaceForExternalUser(userId);
}

export const getAuthenticatedUserId = cache(async (): Promise<string | null> => {
  validateRuntimeAuthConfiguration();
  if (!isClerkConfigured()) return null;
  const { userId } = await auth();
  return userId;
});

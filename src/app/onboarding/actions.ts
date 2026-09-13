"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { canClaimPilotWorkspace } from "@/domain/bootstrap";
import { claimPilotWorkspace } from "@/lib/db/auth-repository";
import { readEnv } from "@/lib/env";

export async function claimBidNivoWorkspace() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const primaryEmail = user.primaryEmailAddress;
  const email = primaryEmail?.emailAddress.toLowerCase();
  if (!email || primaryEmail?.verification?.status !== "verified") {
    throw new Error("A verified primary email address is required");
  }

  const expectedOwnerEmail = readEnv().BOOTSTRAP_OWNER_EMAIL;
  if (!canClaimPilotWorkspace({
    accountEmail: email,
    expectedEmail: expectedOwnerEmail,
    verified: primaryEmail?.verification?.status === "verified",
  })) {
    throw new Error("This account is not authorised to claim the BidNivo workspace");
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || email;
  await claimPilotWorkspace({
    workspaceSlug: "bidnivo",
    externalAuthId: user.id,
    email,
    displayName,
  });

  redirect("/dashboard");
}

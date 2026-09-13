import "server-only";
import { redirect } from "next/navigation";
import { getAuthenticatedUserId, getWorkspaceSession } from "@/lib/auth/session";
import type { WorkspaceContext } from "@/lib/tenant/context";

export async function requireWorkspaceSession(): Promise<WorkspaceContext> {
  const session = await getWorkspaceSession();
  if (session) return session;
  const authenticatedUserId = await getAuthenticatedUserId();
  if (authenticatedUserId) redirect("/onboarding");
  redirect("/sign-in");
}

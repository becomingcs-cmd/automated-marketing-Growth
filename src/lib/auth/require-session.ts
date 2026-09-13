import "server-only";
import { redirect } from "next/navigation";
import { getWorkspaceSession } from "@/lib/auth/session";
import type { WorkspaceContext } from "@/lib/tenant/context";

export async function requireWorkspaceSession(): Promise<WorkspaceContext> {
  const session = await getWorkspaceSession();
  if (!session) redirect("/sign-in");
  return session;
}


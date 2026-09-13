import "server-only";
import type { WorkspaceContext } from "@/lib/tenant/context";

const demoContext: WorkspaceContext = {
  userId: "20000000-0000-4000-8000-000000000001",
  workspaceId: "10000000-0000-4000-8000-000000000001",
  workspaceSlug: "bidnivo",
  role: "owner",
};

export function validateRuntimeAuthConfiguration(): void {
  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE === "true") {
    throw new Error("DEMO_MODE must never be enabled in production");
  }
}

export async function getWorkspaceSession(): Promise<WorkspaceContext | null> {
  validateRuntimeAuthConfiguration();
  if (process.env.DEMO_MODE === "true" || process.env.NODE_ENV !== "production") {
    return demoContext;
  }
  return null;
}

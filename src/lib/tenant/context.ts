import type { Role } from "@/domain/access";

export type WorkspaceContext = Readonly<{
  userId: string;
  workspaceId: string;
  workspaceSlug: string;
  role: Role;
}>;

export function requireWorkspaceContext(context: Partial<WorkspaceContext> | null): WorkspaceContext {
  if (!context?.userId || !context.workspaceId || !context.workspaceSlug || !context.role) {
    throw new Error("Unauthorized: a complete workspace context is required");
  }
  return context as WorkspaceContext;
}

export function assertSameWorkspace(context: WorkspaceContext, resourceWorkspaceId: string): void {
  if (context.workspaceId !== resourceWorkspaceId) {
    throw new Error("Forbidden: cross-workspace access denied");
  }
}


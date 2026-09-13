import assert from "node:assert/strict";
import test from "node:test";
import { assertSameWorkspace, requireWorkspaceContext } from "../src/lib/tenant/context";

const context = {
  userId: "user-1",
  workspaceId: "workspace-1",
  workspaceSlug: "bidnivo",
  role: "owner" as const,
};

test("complete tenant context is accepted", () => {
  assert.equal(requireWorkspaceContext(context), context);
});

test("missing tenant context fails closed", () => {
  assert.throws(() => requireWorkspaceContext({ userId: "user-1" }), /Unauthorized/);
});

test("cross-workspace access is denied", () => {
  assert.throws(() => assertSameWorkspace(context, "workspace-2"), /cross-workspace/);
});


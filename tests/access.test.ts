import assert from "node:assert/strict";
import test from "node:test";
import { can, requirePermission } from "../src/domain/access";

test("owner has every required capability", () => {
  assert.equal(can("owner", "workspace.manage"), true);
  assert.equal(can("owner", "content.publish"), true);
});

test("creator cannot approve or publish their own draft", () => {
  assert.equal(can("creator", "content.write"), true);
  assert.equal(can("creator", "content.review"), false);
  assert.throws(() => requirePermission("creator", "content.publish"), /Forbidden/);
});

test("sales role cannot access audit history", () => {
  assert.equal(can("sales", "lead.write"), true);
  assert.equal(can("sales", "audit.read"), false);
});


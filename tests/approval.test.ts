import assert from "node:assert/strict";
import test from "node:test";
import { assertPublishable, transitionContent } from "../src/domain/approval";

test("content follows the controlled approval path", () => {
  assert.equal(transitionContent("draft", "in_review"), "in_review");
  assert.equal(transitionContent("in_review", "approved"), "approved");
  assert.equal(transitionContent("approved", "scheduled"), "scheduled");
});

test("draft cannot skip review", () => {
  assert.throws(() => transitionContent("draft", "published"), /Invalid content transition/);
});

test("safe mode blocks publishing regardless of approval", () => {
  assert.throws(
    () => assertPublishable({ status: "scheduled", safeMode: true, connectorEnabled: true, idempotencyKey: "post-1" }),
    /safe mode/,
  );
});

test("publishing requires connector and idempotency key", () => {
  assert.throws(
    () => assertPublishable({ status: "scheduled", safeMode: false, connectorEnabled: false, idempotencyKey: "post-1" }),
    /connector/,
  );
  assert.throws(
    () => assertPublishable({ status: "scheduled", safeMode: false, connectorEnabled: true }),
    /idempotency/,
  );
});


import assert from "node:assert/strict";
import test from "node:test";
import { canClaimPilotWorkspace } from "../src/domain/bootstrap";

test("verified allowlisted owner can claim the pilot workspace", () => {
  assert.equal(canClaimPilotWorkspace({
    accountEmail: "Founder@BidNivo.co.za",
    expectedEmail: "founder@bidnivo.co.za",
    verified: true,
  }), true);
});

test("unverified or non-allowlisted accounts cannot claim ownership", () => {
  assert.equal(canClaimPilotWorkspace({
    accountEmail: "founder@bidnivo.co.za",
    expectedEmail: "founder@bidnivo.co.za",
    verified: false,
  }), false);
  assert.equal(canClaimPilotWorkspace({
    accountEmail: "someone@example.com",
    expectedEmail: "founder@bidnivo.co.za",
    verified: true,
  }), false);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL("../database/migrations/0001_foundation.sql", import.meta.url);
const clerkMigrationUrl = new URL("../database/migrations/0003_clerk_identity.sql", import.meta.url);

test("every tenant-owned table enables row-level security", async () => {
  const migration = await readFile(migrationUrl, "utf8");
  const tenantTables = [
    "brand_profiles",
    "intelligence_items",
    "campaigns",
    "content_items",
    "approval_events",
    "leads",
    "audit_events",
  ];

  for (const table of tenantTables) {
    assert.match(migration, new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
    assert.match(migration, new RegExp(`CREATE POLICY tenant_${table} ON ${table}`));
  }
});

test("approval and audit history are protected against update and deletion", async () => {
  const migration = await readFile(migrationUrl, "utf8");
  assert.match(migration, /approval_events_no_update/);
  assert.match(migration, /audit_events_no_update/);
  assert.match(migration, /BEFORE UPDATE OR DELETE ON approval_events/);
  assert.match(migration, /BEFORE UPDATE OR DELETE ON audit_events/);
});

test("Clerk webhook deliveries have a database idempotency constraint", async () => {
  const migration = await readFile(clerkMigrationUrl, "utf8");
  assert.match(migration, /UNIQUE \(provider, event_id\)/);
  assert.match(migration, /ALTER TABLE users ADD COLUMN deleted_at/);
});

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const migrationsDirectory = path.join(process.cwd(), "database", "migrations");
const checkOnly = process.argv.includes("--check");

function checksum(contents: string): string {
  return createHash("sha256").update(contents).digest("hex");
}

function migrationBody(filename: string, contents: string): string {
  const trimmed = contents.trim();
  if (!/^BEGIN;\s/i.test(trimmed) || !/\sCOMMIT;$/i.test(trimmed)) {
    throw new Error(`${filename} must be wrapped in BEGIN; and COMMIT;`);
  }

  const body = trimmed
    .replace(/^BEGIN;\s*/i, "")
    .replace(/\s*COMMIT;$/i, "")
    .trim();

  if (!body) throw new Error(`${filename} contains no migration statements`);
  return body;
}

async function migrationFiles() {
  const entries = await readdir(migrationsDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && /^\d{4}_[a-z0-9_]+\.sql$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

async function main() {
  const files = await migrationFiles();
  if (files.length === 0) throw new Error("No migration files found");

  const migrations = await Promise.all(
    files.map(async (filename) => {
      const contents = await readFile(path.join(migrationsDirectory, filename), "utf8");
      return {
        filename,
        contents,
        body: migrationBody(filename, contents),
        checksum: checksum(contents),
      };
    }),
  );

  if (checkOnly) {
    console.log(`Validated ${migrations.length} migration files.`);
    return;
  }

  try {
    process.loadEnvFile(path.join(process.cwd(), ".env.local"));
  } catch (error: unknown) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  }

  const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required");
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 10,
    connect_timeout: 15,
    prepare: false,
  });

  try {
    await sql`SELECT pg_advisory_lock(hashtext('growthos_schema_migrations'))`;
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        checksum char(64) NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    const applied = await sql<{ filename: string; checksum: string }[]>`
      SELECT filename, checksum FROM schema_migrations
    `;
    const appliedByFilename = new Map(
      applied.map((migration) => [migration.filename, migration.checksum.trim()]),
    );

    for (const migration of migrations) {
      const previousChecksum = appliedByFilename.get(migration.filename);
      if (previousChecksum) {
        if (previousChecksum !== migration.checksum) {
          throw new Error(`${migration.filename} changed after it was applied`);
        }
        console.log(`Skipped ${migration.filename} (already applied).`);
        continue;
      }

      await sql.begin(async (transaction) => {
        await transaction.unsafe(migration.body);
        await transaction`
          INSERT INTO schema_migrations (filename, checksum)
          VALUES (${migration.filename}, ${migration.checksum})
        `;
      });
      console.log(`Applied ${migration.filename}.`);
    }
  } finally {
    try {
      await sql`SELECT pg_advisory_unlock(hashtext('growthos_schema_migrations'))`;
    } finally {
      await sql.end({ timeout: 5 });
    }
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

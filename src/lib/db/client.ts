import "server-only";
import postgres from "postgres";
import { readEnv } from "@/lib/env";

let client: ReturnType<typeof postgres> | undefined;

export function db() {
  const { DATABASE_URL } = readEnv();
  if (!DATABASE_URL) throw new Error("DATABASE_URL is required for database operations");
  client ??= postgres(DATABASE_URL, { max: 10, idle_timeout: 20, prepare: false });
  return client;
}

export async function withWorkspace<T>(
  workspaceId: string,
  operation: (transaction: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  if (!workspaceId) throw new Error("Workspace ID is required");
  const sql = db();
  return sql.begin(async (transaction) => {
    await transaction`SELECT set_config('app.workspace_id', ${workspaceId}, true)`;
    return operation(transaction);
  }) as Promise<T>;
}

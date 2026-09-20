import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

function isLocalDatabaseUrl(databaseUrl: string) {
  return /localhost|127\.0\.0\.1/.test(databaseUrl);
}

export function createSqlClient(databaseUrl: string) {
  return postgres(databaseUrl, {
    max: 1,
    prepare: false,
    ssl: isLocalDatabaseUrl(databaseUrl) ? false : "require",
  });
}

export function createDb(databaseUrl: string) {
  return drizzle(createSqlClient(databaseUrl));
}

export async function pingDatabase(databaseUrl: string): Promise<void> {
  const sql = createSqlClient(databaseUrl);
  try {
    await sql`select 1`;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

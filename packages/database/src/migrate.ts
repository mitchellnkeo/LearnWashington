import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createSqlClient } from "./client";
import { requireDatabaseUrl } from "./env";

const here = dirname(fileURLToPath(import.meta.url));
const sql = createSqlClient(requireDatabaseUrl());
const db = drizzle(sql);

await migrate(db, { migrationsFolder: resolve(here, "../drizzle") });
await sql.end({ timeout: 5 });

console.log("Migrations applied.");

import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

let loaded = false;

export function loadRepoEnv() {
  if (loaded) {
    return;
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const repoRoot = resolve(here, "../../..");
  config({ path: resolve(repoRoot, ".env.local") });
  config({ path: resolve(repoRoot, ".env") });
  loaded = true;
}

export function requireDatabaseUrl(): string {
  loadRepoEnv();
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DIRECT_URL or DATABASE_URL is required.");
  }
  return url;
}

export function requirePooledDatabaseUrl(): string {
  loadRepoEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required.");
  }
  return url;
}

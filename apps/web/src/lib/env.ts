import { config } from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";

const optionalUrl = z.union([z.string().url(), z.literal("")]).optional();

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),
  WEB_ORIGIN: optionalUrl,
  SENTRY_DSN: optionalUrl,
  NEXT_PUBLIC_SENTRY_DSN: optionalUrl,
  MAP_STYLE_URL: optionalUrl,
  MAP_API_TOKEN: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function loadLocalEnv() {
  if (process.env.DATABASE_URL) {
    return;
  }

  config({ path: resolve(process.cwd(), "../../.env.local") });
  config({ path: resolve(process.cwd(), ".env.local") });
}

export function getServerEnv(): ServerEnv {
  loadLocalEnv();

  return serverEnvSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    WEB_ORIGIN: process.env.WEB_ORIGIN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    MAP_STYLE_URL: process.env.MAP_STYLE_URL,
    MAP_API_TOKEN: process.env.MAP_API_TOKEN,
  });
}

export function requirePooledDatabaseUrl(): string {
  const env = getServerEnv();
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }
  return env.DATABASE_URL;
}

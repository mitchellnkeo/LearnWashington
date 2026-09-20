import { NextResponse } from "next/server";
import { pingDatabase } from "@fwty/database";
import { getServerEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DatabaseStatus = "up" | "down" | "skipped";

export async function GET() {
  const env = getServerEnv();
  let database: DatabaseStatus = "skipped";

  if (env.DATABASE_URL) {
    try {
      await pingDatabase(env.DATABASE_URL);
      database = "up";
    } catch {
      database = "down";
    }
  }

  const status = database === "down" ? "degraded" : "ok";

  return NextResponse.json({
    status,
    service: "from-washington-to-you",
    database,
    timestamp: new Date().toISOString(),
  });
}

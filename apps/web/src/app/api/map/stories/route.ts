import { listPublishedMapStories } from "@fwty/database";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getSql();

  try {
    const features = await listPublishedMapStories(sql);
    return NextResponse.json(
      { type: "FeatureCollection", features },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error(error);
    return apiError(500, "MAP_STORIES_FAILED", "Could not load map stories.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

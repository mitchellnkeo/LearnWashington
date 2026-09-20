import {
  isDiscoveryIssue,
  parseNearbyQuery,
} from "@fwty/shared";
import { listNearbyPublishedStories } from "@fwty/database";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const parsed = parseNearbyQuery(new URL(request.url).searchParams);
  if (isDiscoveryIssue(parsed)) {
    return apiError(400, "INVALID_NEARBY_QUERY", parsed.message, {
      field: parsed.field,
    });
  }

  const sql = getSql();

  try {
    const stories = await listNearbyPublishedStories(sql, parsed);
    return NextResponse.json(
      { stories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error(error);
    return apiError(500, "NEARBY_FAILED", "Could not load nearby stories.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

import {
  isDiscoveryIssue,
  parseSearchQuery,
} from "@fwty/shared";
import { searchPublishedContent } from "@fwty/database";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const parsed = parseSearchQuery(new URL(request.url).searchParams.get("q"));
  if (isDiscoveryIssue(parsed)) {
    return apiError(400, "INVALID_SEARCH", parsed.message, {
      field: parsed.field,
    });
  }

  const sql = getSql();

  try {
    const results = await searchPublishedContent(sql, parsed.q);
    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error(error);
    return apiError(500, "SEARCH_FAILED", "Could not search stories.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

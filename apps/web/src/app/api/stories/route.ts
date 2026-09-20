import { parseStoriesBrowseQuery } from "@fwty/shared";
import { listPublishedStories } from "@fwty/database";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const filter = parseStoriesBrowseQuery(new URL(request.url).searchParams);
  const sql = getSql();

  try {
    const stories = await listPublishedStories(sql, filter);
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
    return apiError(500, "STORIES_FAILED", "Could not load stories.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

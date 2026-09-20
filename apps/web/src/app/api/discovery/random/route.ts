import { parseExcludeStoryIds } from "@fwty/shared";
import { getRandomPublishedStory } from "@fwty/database";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const excludeStoryIds = parseExcludeStoryIds(params.get("excludeStoryIds"));
  const category = params.get("category")?.trim() || undefined;
  const sql = getSql();

  try {
    const story = await getRandomPublishedStory(sql, excludeStoryIds, category);
    if (!story) {
      return apiError(404, "NO_PUBLISHED_STORY", "No published story is available.");
    }

    return NextResponse.json(story, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return apiError(500, "RANDOM_STORY_FAILED", "Could not pick a story.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

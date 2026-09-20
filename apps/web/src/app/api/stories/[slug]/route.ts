import { getPublishedStoryBySlug } from "@fwty/database";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const sql = getSql();

  try {
    const story = await getPublishedStoryBySlug(sql, slug);
    if (!story) {
      return apiError(404, "STORY_NOT_FOUND", "Story not found.");
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error(error);
    return apiError(500, "STORY_FAILED", "Could not load this story.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

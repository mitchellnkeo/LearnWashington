import { listRelatedPublishedStories } from "@fwty/database";
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
    const stories = await listRelatedPublishedStories(sql, slug);
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
    return apiError(500, "RELATED_FAILED", "Could not load related stories.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

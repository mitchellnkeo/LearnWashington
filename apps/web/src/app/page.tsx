import { Suspense } from "react";
import { listPublishedMapStories } from "@fwty/database";
import { ExploreMap } from "@/components/explore/ExploreMap";
import { getSql } from "@/lib/db";
import { getServerEnv } from "@/lib/env";
import type { MapStoriesResponse } from "@/lib/story-types";

export const dynamic = "force-dynamic";

async function loadMapStories(): Promise<MapStoriesResponse> {
  if (!getServerEnv().DATABASE_URL) {
    return { type: "FeatureCollection", features: [] };
  }

  const sql = getSql();
  try {
    const features = await listPublishedMapStories(sql);
    return { type: "FeatureCollection", features };
  } catch (error) {
    console.error(error);
    return { type: "FeatureCollection", features: [] };
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export default async function HomePage() {
  const stories = await loadMapStories();

  return (
    <main id="main-content" className="h-dvh overflow-hidden overscroll-none">
      <h1 className="sr-only">From Washington To You</h1>
      <Suspense fallback={<div className="h-dvh bg-[var(--paper)]" />}>
        <ExploreMap initialStories={stories} />
      </Suspense>
    </main>
  );
}

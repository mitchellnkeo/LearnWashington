"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PostcardDrawer } from "@/components/postcard/PostcardDrawer";
import type { MapStoriesResponse, StoryPostcard } from "@/lib/story-types";

const WashingtonMap = dynamic(
  () =>
    import("@/components/map/WashingtonMap").then((module) => module.WashingtonMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-[var(--paper)]" /> },
);

export function ExploreMap({
  initialStories,
}: {
  initialStories: MapStoriesResponse;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedSlug = searchParams.get("story");
  const [loadedStory, setLoadedStory] = useState<StoryPostcard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectSlug = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set("story", slug);
      } else {
        params.delete("story");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (!selectedSlug) {
      return;
    }

    let cancelled = false;

    fetch(`/api/stories/${selectedSlug}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Story not found.");
        }
        return (await response.json()) as StoryPostcard;
      })
      .then((nextStory) => {
        if (!cancelled) {
          setLoadedStory(nextStory);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("That postcard could not be opened.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSlug]);

  const story = loadedStory?.slug === selectedSlug ? loadedStory : null;

  return (
    <div className="relative h-dvh w-full">
      <WashingtonMap
        stories={initialStories}
        selectedSlug={selectedSlug}
        onSelectSlug={selectSlug}
      />
      <div className="pointer-events-none absolute top-4 left-4 z-10 max-w-xs rounded border border-[var(--rule)] bg-[var(--paper)]/95 px-4 py-3 shadow-sm">
        <p className="text-xs tracking-[0.18em] text-[var(--muted)] uppercase">
          From Washington
        </p>
        <p className="serif text-2xl leading-tight">To You</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Explore Washington, one story at a time.
        </p>
      </div>
      {error && selectedSlug ? (
        <p className="absolute bottom-4 left-4 z-10 rounded bg-[var(--paper)] px-3 py-2 text-sm shadow">
          {error}
        </p>
      ) : null}
      <PostcardDrawer story={story} onClose={() => selectSlug(null)} />
    </div>
  );
}

"use client";

import { type MapBBox } from "@fwty/shared";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExplorerChrome } from "@/components/explore/ExplorerChrome";
import { PostcardDrawer } from "@/components/postcard/PostcardDrawer";
import { trackEvent } from "@/lib/analytics";
import { mapStoriesUrl, readMapView, writeMapView } from "@/lib/map-url";
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
  const view = readMapView(searchParams);
  const selectedSlug = view.story ?? null;
  const category = view.category;
  const [stories, setStories] = useState(initialStories);
  const [loadedStory, setLoadedStory] = useState<StoryPostcard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<{ bbox?: MapBBox; zoom?: number }>({
    zoom: view.zoom,
  });
  const [announcement, setAnnouncement] = useState("");
  const announcedRef = useRef(false);

  const initialView = useMemo(() => {
    if (view.lat === undefined || view.lng === undefined || view.zoom === undefined) {
      return undefined;
    }
    return { center: [view.lng, view.lat] as [number, number], zoom: view.zoom };
  }, [view.lat, view.lng, view.zoom]);

  const replaceQuery = useCallback(
    (next: Parameters<typeof writeMapView>[1]) => {
      if (pathname !== "/") {
        return;
      }
      const query = writeMapView(searchParams, next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const selectSlug = useCallback(
    (slug: string | null) => {
      replaceQuery({ story: slug });
    },
    [replaceQuery],
  );

  const openStory = useCallback(
    (slug: string) => {
      replaceQuery({ category: null, story: slug });
    },
    [replaceQuery],
  );

  const selectCategory = useCallback(
    (nextCategory: string | null) => {
      replaceQuery({ category: nextCategory, story: null });
    },
    [replaceQuery],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      mapStoriesUrl({
        bbox: viewport.bbox,
        category,
        zoom: viewport.zoom,
      }),
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load map stories.");
        }
        return (await response.json()) as MapStoriesResponse;
      })
      .then((payload) => {
        setStories(payload);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
        setError("The map could not refresh.");
      });

    return () => controller.abort();
  }, [category, viewport.bbox, viewport.zoom]);

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

  const onViewChange = useCallback(
    (next: { center: [number, number]; zoom: number; bbox: MapBBox }) => {
      setViewport({ bbox: next.bbox, zoom: next.zoom });
      replaceQuery({
        lat: next.center[1],
        lng: next.center[0],
        zoom: next.zoom,
      });
    },
    [replaceQuery],
  );

  const story = loadedStory?.slug === selectedSlug ? loadedStory : null;
  const selectedCenter = useMemo<[number, number] | undefined>(
    () => (story ? [story.longitude, story.latitude] : undefined),
    [story],
  );

  useEffect(() => {
    if (!announcedRef.current) {
      announcedRef.current = true;
      if (!story) {
        return;
      }
    }
    setAnnouncement(
      story
        ? `Opened ${story.title}. Map moved to that location.`
        : "Postcard closed.",
    );
    if (story) {
      trackEvent("story_opened", { slug: story.slug, surface: "map" });
    }
  }, [story]);

  return (
    <div className="relative h-dvh w-full">
      <div className="absolute inset-0" inert={Boolean(story)}>
        <WashingtonMap
          stories={stories}
          selectedSlug={selectedSlug}
          selectedCenter={selectedCenter}
          initialView={initialView}
          onSelectSlug={selectSlug}
          onViewChange={onViewChange}
        />
      </div>
      <ExplorerChrome
        category={category}
        onSelectCategory={selectCategory}
        onSelectStory={openStory}
        onError={setError}
      />
      {error ? (
        <p
          role="alert"
          className="absolute bottom-24 left-4 z-10 border-2 border-[var(--ink)] bg-[var(--sun)] px-3 py-2 text-sm font-bold md:bottom-4 md:left-28"
        >
          {error}
        </p>
      ) : null}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <PostcardDrawer
        story={story}
        onClose={() => selectSlug(null)}
        onSelectStory={openStory}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { MVP_CATEGORIES } from "@fwty/shared";
import { CategoryFilter } from "@/components/explore/CategoryFilter";
import type { StorySummary } from "@/lib/story-types";

function ResultPhoto({
  image,
}: {
  image: { url: string; altText: string };
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <img
      src={image.url}
      alt={image.altText}
      className="h-16 w-16 shrink-0 object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function CategoryResults({
  category,
  stories,
  selectedSlug,
  loading,
  onSelectCategory,
  onSelectStory,
}: {
  category: string;
  stories: StorySummary[];
  selectedSlug: string | null;
  loading: boolean;
  onSelectCategory: (next: string | null) => void;
  onSelectStory: (slug: string) => void;
}) {
  const categoryName =
    MVP_CATEGORIES.find((item) => item.slug === category)?.name ?? "This category";

  return (
    <aside
      className="pointer-events-auto flex max-h-[52vh] w-full flex-col border-2 border-[var(--ink)] bg-[var(--card)] md:max-h-full md:w-[22rem]"
      aria-label={`${categoryName} stories`}
    >
      <div className="shrink-0 border-b-2 border-[var(--park)] p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="kicker">{categoryName}</p>
            <p className="serif text-xl leading-tight">
              {loading
                ? "Looking…"
                : `${stories.length} ${stories.length === 1 ? "postcard" : "postcards"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="btn btn-quiet px-3 text-sm"
          >
            Clear
          </button>
        </div>
        <div className="mt-3">
          <CategoryFilter category={category} onSelect={onSelectCategory} />
        </div>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <li className="p-4 text-sm text-[var(--muted)]">Loading stories…</li>
        ) : stories.length === 0 ? (
          <li className="p-4 text-sm text-[var(--muted)]">
            No published stories in this category yet.
          </li>
        ) : (
          stories.map((story) => {
            const selected = story.slug === selectedSlug;
            return (
              <li key={story.slug} className="border-b border-[var(--rule)]">
                <button
                  type="button"
                  aria-current={selected ? "true" : undefined}
                  onClick={() => onSelectStory(story.slug)}
                  className={`flex w-full gap-3 p-3 text-left hover:bg-[var(--khaki)] ${
                    selected ? "bg-[var(--sun)]" : ""
                  }`}
                >
                  {story.image ? <ResultPhoto image={story.image} /> : null}
                  <span className="min-w-0">
                    <span className="serif block text-lg leading-tight">
                      {story.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--muted)]">
                      {story.locationLabel}
                      {story.dateLabel ? ` · ${story.dateLabel}` : ""}
                    </span>
                    <span className="mt-1 block text-sm leading-snug">
                      {story.hook}
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}

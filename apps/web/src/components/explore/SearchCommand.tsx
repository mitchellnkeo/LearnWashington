"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { SearchResults } from "@/lib/story-types";

type SearchHit =
  | { kind: "story"; slug: string; label: string; hint: string }
  | { kind: "place"; slug: string; storySlug: string; label: string }
  | { kind: "tag"; slug: string; storySlug: string; label: string }
  | { kind: "category"; slug: string; label: string };

export function SearchCommand({
  onSelectStory,
  onSelectCategory,
}: {
  onSelectStory: (slug: string) => void;
  onSelectCategory: (slug: string) => void;
}) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);

  const hits = useMemo<SearchHit[]>(() => {
    if (!results || query.trim().length < 2) {
      return [];
    }

    return [
      ...results.stories.map((story) => ({
        kind: "story" as const,
        slug: story.slug,
        label: story.title,
        hint: story.hook,
      })),
      ...results.places.map((place) => ({
        kind: "place" as const,
        slug: place.slug,
        storySlug: place.storySlug,
        label: place.name,
      })),
      ...results.tags.map((tag) => ({
        kind: "tag" as const,
        slug: tag.slug,
        storySlug: tag.storySlug,
        label: tag.name,
      })),
      ...results.categories.map((category) => ({
        kind: "category" as const,
        slug: category.slug,
        label: category.name,
      })),
    ];
  }, [query, results]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setBusy(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Search failed.");
          }
          return (await response.json()) as SearchResults;
        })
        .then((payload) => {
          setResults(payload);
          setActive(0);
          setOpen(true);
          setBusy(false);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setBusy(false);
        });
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function choose(hit: SearchHit) {
    trackEvent("search_used", {
      kind: hit.kind,
      q: query.trim().slice(0, 40),
    });
    if (hit.kind === "category") {
      onSelectCategory(hit.slug);
    } else if (hit.kind === "story") {
      onSelectStory(hit.slug);
    } else {
      onSelectStory(hit.storySlug);
    }
    setOpen(false);
    inputRef.current?.blur();
  }

  const showList = open && query.trim().length >= 2;

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="story-search">
        Search stories, places, and topics
      </label>
      <input
        ref={inputRef}
        id="story-search"
        type="search"
        value={query}
        autoComplete="off"
        placeholder="Search Washington…"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showList && hits[active] ? `${listId}-${active}` : undefined
        }
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (hits.length > 0) {
            setOpen(true);
          }
        }}
        onKeyDown={(event) => {
          if (!showList) {
            return;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => (index + 1) % Math.max(hits.length, 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive(
              (index) => (index - 1 + hits.length) % Math.max(hits.length, 1),
            );
          } else if (event.key === "Enter" && hits[active]) {
            event.preventDefault();
            choose(hits[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className="field py-2.5 text-sm"
      />
      {showList ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full right-0 left-0 z-40 mt-1.5 max-h-72 overflow-y-auto rounded-xl border-2 border-[var(--rule-strong)] bg-[var(--card)] py-1 shadow-lg"
        >
          {hits.length === 0 && !busy ? (
            <li className="px-3 py-2 text-sm text-[var(--muted)]">
              No matches yet.
            </li>
          ) : null}
          {busy && hits.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[var(--muted)]">
              Searching…
            </li>
          ) : null}
          {hits.map((hit, index) => (
            <li key={`${hit.kind}-${hit.slug}`} role="none">
              <button
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(hit)}
                className={`flex w-full flex-col items-start px-3 py-2.5 text-left text-sm ${
                  index === active ? "bg-[var(--sage)]" : ""
                }`}
              >
                <span className="eyebrow">{hit.kind}</span>
                <span className="font-semibold">{hit.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

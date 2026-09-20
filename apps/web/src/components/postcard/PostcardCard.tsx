"use client";

import { useState } from "react";
import Link from "next/link";
import { DEFAULT_CATEGORY_COLOR, MVP_CATEGORIES } from "@fwty/shared";
import { trackEvent } from "@/lib/analytics";
import type { StoryMedia, StoryPostcard } from "@/lib/story-types";

function categoryColor(slug: string) {
  return (
    MVP_CATEGORIES.find((item) => item.slug === slug)?.color ??
    DEFAULT_CATEGORY_COLOR
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0">
      <path
        d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" fill="currentColor" />
    </svg>
  );
}

function PostcardPhoto({ media, slug }: { media: StoryMedia; slug: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <figure className="mb-6">
      <div className="overflow-hidden rounded-2xl border-2 border-[var(--rule-strong)] bg-[var(--sage)]">
        <img
          src={media.url}
          alt={media.altText}
          className="postcard-photo"
          onError={() => setFailed(true)}
        />
      </div>
      {media.creditLine ? (
        <figcaption className="mt-2 px-1 text-xs leading-relaxed text-[var(--muted)]">
          {media.sourceUrl ? (
            <a
              href={media.sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackEvent("source_clicked", {
                  slug,
                  publisher: media.creator ?? "photo-credit",
                })
              }
              className="underline decoration-[var(--rule-strong)] underline-offset-2 hover:decoration-[var(--evergreen)]"
            >
              {media.creditLine}
            </a>
          ) : (
            media.creditLine
          )}
        </figcaption>
      ) : null}
    </figure>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-[var(--evergreen)] uppercase">
      <span
        aria-hidden="true"
        className="h-3 w-3 rounded-full border-2 border-[var(--amber)]"
      />
      {children}
    </h2>
  );
}

function formatReviewed(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function relationshipLabel(value: string | null) {
  if (!value) {
    return "Related";
  }

  return value.replace(/[-_]/g, " ");
}

export function PostcardCard({
  story,
  showPermalink = true,
  onSelectStory,
}: {
  story: StoryPostcard;
  showPermalink?: boolean;
  onSelectStory?: (slug: string) => void;
}) {
  const reviewed = formatReviewed(story.lastReviewedAt);

  const photo = story.media[0];

  return (
    <article className="flex flex-col">
      {photo ? <PostcardPhoto media={photo} slug={story.slug} /> : null}
      <p className="eyebrow">From Washington · To You</p>
      <h1 id="postcard-title" className="serif mt-2 text-3xl leading-tight">
        {story.title}
      </h1>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--muted)]">
        <IconPin />
        <span>
          {story.locationLabel}
          {story.dateLabel ? ` · ${story.dateLabel}` : ""}
        </span>
      </p>

      <p className="mt-4 rounded-xl border-l-4 border-[var(--amber)] bg-[var(--sage)] px-4 py-3 text-base font-semibold">
        {story.hook}
      </p>

      <div className="mt-4 space-y-3 text-[1rem] leading-relaxed text-[var(--ink)]">
        {story.bodyMd
          .trim()
          .split(/\n\s*\n/)
          .map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph.replace(/\s+/g, " ")}</p>
          ))}
      </div>

      <ul className="mt-5 flex flex-wrap gap-2">
        {story.categories.map((category) => (
          <li
            key={category.slug}
            className="flex items-center gap-2 rounded-full border border-[var(--rule-strong)] bg-[var(--card)] px-3 py-1 text-xs font-semibold"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ background: categoryColor(category.slug) }}
            />
            {category.name}
          </li>
        ))}
      </ul>

      <section className="mt-8">
        <hr className="trail-rule mb-5" />
        <SectionHeading>Sources ({story.sources.length})</SectionHeading>
        <ul className="mt-3 space-y-3">
          {story.sources.map((source) => (
            <li
              key={source.url}
              className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-3"
            >
              <p className="eyebrow">
                {source.sourceType} · Tier {source.tier}
              </p>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackEvent("source_clicked", {
                    slug: story.slug,
                    publisher: source.publisher,
                  })
                }
                className="font-semibold text-[var(--evergreen)] underline decoration-[var(--rule-strong)] underline-offset-2 hover:decoration-[var(--evergreen)]"
              >
                {source.publisher}
              </a>
              <p className="text-sm text-[var(--muted)]">{source.title}</p>
            </li>
          ))}
        </ul>
        {reviewed ? (
          <p className="mt-4 text-xs text-[var(--muted)]">
            Last reviewed: {reviewed}
          </p>
        ) : null}
      </section>

      {story.related.length > 0 ? (
        <section className="mt-8">
          <hr className="trail-rule mb-5" />
          <SectionHeading>Keep wandering</SectionHeading>
          <ul className="mt-3 space-y-3">
            {story.related.map((related) => (
              <li
                key={related.slug}
                className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-3"
              >
                <p className="eyebrow">
                  {relationshipLabel(related.relationshipType)}
                </p>
                {onSelectStory ? (
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent("related_story_clicked", {
                        from: story.slug,
                        to: related.slug,
                      });
                      onSelectStory(related.slug);
                    }}
                    className="text-left font-semibold text-[var(--evergreen)] underline decoration-[var(--rule-strong)] underline-offset-2 hover:decoration-[var(--evergreen)]"
                  >
                    {related.title}
                  </button>
                ) : (
                  <Link
                    href={`/story/${related.slug}`}
                    onClick={() =>
                      trackEvent("related_story_clicked", {
                        from: story.slug,
                        to: related.slug,
                      })
                    }
                    className="font-semibold text-[var(--evergreen)] underline decoration-[var(--rule-strong)] underline-offset-2 hover:decoration-[var(--evergreen)]"
                  >
                    {related.title}
                  </Link>
                )}
                <p className="text-sm text-[var(--muted)]">{related.hook}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showPermalink ? (
        <p className="mt-6">
          <Link href={`/story/${story.slug}`} className="btn btn-quiet text-sm">
            Open permanent story page
          </Link>
        </p>
      ) : null}
    </article>
  );
}

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

function PostcardPhoto({ media, slug }: { media: StoryMedia; slug: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <figure className="mb-5">
      <div className="border border-[var(--rule-strong)] bg-[var(--khaki)]">
        <img
          src={media.url}
          alt={media.altText}
          className="postcard-photo"
          onError={() => setFailed(true)}
        />
      </div>
      {media.creditLine ? (
        <figcaption className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
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
              className="underline decoration-[var(--rule-strong)] underline-offset-2 hover:decoration-[var(--park)]"
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
      <p className="kicker">From Washington to you</p>
      <h1 id="postcard-title" className="serif mt-1 text-3xl leading-tight">
        {story.title}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {story.locationLabel}
        {story.dateLabel ? ` · ${story.dateLabel}` : ""}
      </p>

      <p className="lede mt-4">{story.hook}</p>

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
          <li key={category.slug} className="specimen">
            <span
              aria-hidden="true"
              className="specimen-swatch"
              style={{ background: categoryColor(category.slug) }}
            />
            {category.name}
          </li>
        ))}
      </ul>

      <section className="mt-8 border-t-2 border-[var(--park)] pt-4">
        <h2 className="serif text-xl">Sources ({story.sources.length})</h2>
        <ul className="mt-3 space-y-3">
          {story.sources.map((source) => (
            <li key={source.url} className="border border-[var(--rule)] p-3">
              <p className="kicker">
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
                className="font-bold text-[var(--park-deep)] underline decoration-[var(--rule-strong)] underline-offset-2 hover:decoration-[var(--park)]"
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
        <section className="mt-8 border-t-2 border-[var(--park)] pt-4">
          <h2 className="serif text-xl">Keep wandering</h2>
          <ul className="mt-3 space-y-3">
            {story.related.map((related) => (
              <li key={related.slug} className="border border-[var(--rule)] p-3">
                <p className="kicker">
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
                    className="text-left font-bold text-[var(--park-deep)] underline decoration-[var(--rule-strong)] underline-offset-2 hover:decoration-[var(--park)]"
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
                    className="font-bold text-[var(--park-deep)] underline decoration-[var(--rule-strong)] underline-offset-2 hover:decoration-[var(--park)]"
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

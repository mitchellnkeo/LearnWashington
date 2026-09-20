"use client";

import { useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import type { StoryMedia, StoryPostcard } from "@/lib/story-types";

function PostcardPhoto({ media, slug }: { media: StoryMedia; slug: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <figure className="mb-5">
      <div className="overflow-hidden rounded-sm bg-[var(--rule)]">
        <img
          src={media.url}
          alt={media.altText}
          className="block h-auto w-full"
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
              className="underline decoration-[var(--rule)] underline-offset-2 hover:decoration-[var(--ink)]"
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
      <p className="text-xs tracking-[0.18em] text-[var(--muted)] uppercase">
        From Washington · To You
      </p>
      <h1 id="postcard-title" className="serif mt-3 text-3xl leading-tight">
        {story.title}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {story.locationLabel}
        {story.dateLabel ? ` · ${story.dateLabel}` : ""}
      </p>
      <p className="mt-4 text-base text-[var(--ink)]">{story.hook}</p>
      <div className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-[var(--ink)]">
        {story.bodyMd
          .trim()
          .split(/\n\s*\n/)
          .map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph.replace(/\s+/g, " ")}</p>
          ))}
      </div>
      <p className="mt-5 text-sm text-[var(--muted)]">
        {story.categories.map((category) => category.name).join(" · ")}
      </p>
      <section className="mt-8 border-t border-[var(--rule)] pt-5">
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          Sources ({story.sources.length})
        </h2>
        <ul className="mt-3 space-y-3">
          {story.sources.map((source) => (
            <li key={source.url}>
              <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
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
                className="text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-2 hover:decoration-[var(--ink)]"
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
        <section className="mt-8 border-t border-[var(--rule)] pt-5">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Related stories
          </h2>
          <ul className="mt-3 space-y-3">
            {story.related.map((related) => (
              <li key={related.slug}>
                <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
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
                    className="text-left text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-2 hover:decoration-[var(--ink)]"
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
                    className="text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-2 hover:decoration-[var(--ink)]"
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
        <p className="mt-6 text-sm">
          <Link
            href={`/story/${story.slug}`}
            className="underline decoration-[var(--rule)] underline-offset-2"
          >
            Open permanent story page
          </Link>
        </p>
      ) : null}
    </article>
  );
}

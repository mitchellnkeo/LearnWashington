"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { readSurpriseExcludes, rememberSurpriseSlug } from "@/lib/surprise";

function IconBlaze() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <rect
        x="7"
        y="7"
        width="10"
        height="10"
        transform="rotate(45 12 12)"
        fill="currentColor"
      />
    </svg>
  );
}

export function SurpriseButton({
  onSelectStory,
  onError,
  compact = false,
}: {
  onSelectStory: (slug: string) => void;
  onError: (message: string) => void;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function surprise() {
    setBusy(true);
    try {
      const excludes = readSurpriseExcludes();
      const params = new URLSearchParams();
      if (excludes.length > 0) {
        params.set("excludeStoryIds", excludes.join(","));
      }
      const response = await fetch(
        `/api/discovery/random${params.size ? `?${params}` : ""}`,
      );
      if (!response.ok) {
        throw new Error("Could not find a story.");
      }
      const payload = (await response.json()) as { slug: string };
      rememberSurpriseSlug(payload.slug);
      trackEvent("surprise_me_clicked", { slug: payload.slug });
      onSelectStory(payload.slug);
    } catch {
      onError("Surprise Me could not find a story.");
    } finally {
      setBusy(false);
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => void surprise()}
        disabled={busy}
        aria-label="Surprise Me"
        className="flex min-h-12 min-w-12 flex-col items-center justify-center gap-0.5 bg-[var(--blaze)] px-1 text-[0.65rem] font-bold text-[var(--card)] disabled:opacity-60"
      >
        <IconBlaze />
        {busy ? "Hold on" : "Surprise"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void surprise()}
      disabled={busy}
      aria-label="Surprise Me"
      className="btn btn-blaze w-full"
    >
      <IconBlaze />
      {busy ? "Finding a story…" : "Surprise Me"}
    </button>
  );
}

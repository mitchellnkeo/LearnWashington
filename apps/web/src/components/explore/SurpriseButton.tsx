"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { readSurpriseExcludes, rememberSurpriseSlug } from "@/lib/surprise";

function IconTrailMarker() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M12 3v18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M12 4h7l-2 3 2 3h-7z" fill="currentColor" />
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
        className="flex min-h-12 min-w-12 flex-col items-center justify-center gap-0.5 rounded-xl bg-[var(--amber)] px-1 text-[0.65rem] font-bold text-[var(--ink)] disabled:opacity-60"
      >
        <IconTrailMarker />
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
      className="btn btn-primary w-full"
    >
      <IconTrailMarker />
      {busy ? "Finding a story…" : "Surprise Me"}
    </button>
  );
}

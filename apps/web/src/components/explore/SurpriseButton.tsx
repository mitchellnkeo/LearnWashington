"use client";

import { useState } from "react";
import { readSurpriseExcludes, rememberSurpriseSlug } from "@/lib/surprise";

export function SurpriseButton({
  onSelectStory,
  onError,
}: {
  onSelectStory: (slug: string) => void;
  onError: (message: string) => void;
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
      onSelectStory(payload.slug);
    } catch {
      onError("Surprise Me could not find a story.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void surprise()}
      disabled={busy}
      className="min-h-11 w-full rounded border border-[var(--ink)] bg-[var(--ink)] px-3 text-sm text-[var(--paper)] disabled:opacity-60"
    >
      {busy ? "Finding a story…" : "Surprise Me"}
    </button>
  );
}
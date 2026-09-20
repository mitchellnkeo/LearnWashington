"use client";

import { useEffect, useRef } from "react";
import { PostcardCard } from "@/components/postcard/PostcardCard";
import type { StoryPostcard } from "@/lib/story-types";

export function PostcardDrawer({
  story,
  onClose,
  onSelectStory,
}: {
  story: StoryPostcard | null;
  onClose: () => void;
  onSelectStory?: (slug: string) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!story) {
      return;
    }

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [story, onClose]);

  if (!story) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-end md:items-stretch">
      <button
        type="button"
        className="pointer-events-auto absolute inset-0 bg-[var(--ink)]/20 md:bg-transparent"
        aria-label="Close postcard"
        onClick={onClose}
      />
      <aside
        className="pointer-events-auto relative max-h-[80vh] w-full overflow-y-auto border-t border-[var(--rule)] bg-[var(--paper)] p-5 shadow-2xl md:max-h-none md:w-[26rem] md:border-t-0 md:border-l"
        role="dialog"
        aria-modal="true"
        aria-labelledby="postcard-title"
      >
        <div className="mb-4 flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded border border-[var(--rule)] px-3 py-1 text-sm"
          >
            Close
          </button>
        </div>
        <div id="postcard-title">
          <PostcardCard story={story} onSelectStory={onSelectStory} />
        </div>
      </aside>
    </div>
  );
}

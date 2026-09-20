"use client";

import { useEffect, useRef } from "react";
import { PostcardCard } from "@/components/postcard/PostcardCard";
import type { StoryPostcard } from "@/lib/story-types";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusables(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (node) => !node.hasAttribute("disabled") && node.tabIndex !== -1,
  );
}

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
  const panelRef = useRef<HTMLElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!story) {
      lastFocusRef.current?.focus();
      lastFocusRef.current = null;
      return;
    }

    lastFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const nodes = focusables(panelRef.current);
      if (nodes.length === 0) {
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
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
        className="pointer-events-auto absolute inset-0 bg-[var(--ink)]/25 md:bg-[var(--ink)]/10"
        aria-label="Close postcard"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        className="pointer-events-auto relative max-h-[72vh] w-full rounded-t-2xl border-t border-[var(--rule)] bg-[var(--paper)] p-5 shadow-2xl md:max-h-none md:w-[26rem] md:rounded-none md:border-t-0 md:border-l"
        role="dialog"
        aria-modal="true"
        aria-labelledby="postcard-title"
      >
        <div
          className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--rule)] md:hidden"
          aria-hidden="true"
        />
        <div className="mb-4 flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="min-h-11 rounded border border-[var(--rule)] px-3 text-sm"
          >
            Close
          </button>
        </div>
        <PostcardCard story={story} onSelectStory={onSelectStory} />
      </aside>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CategoryFilter } from "@/components/explore/CategoryFilter";
import { SearchCommand } from "@/components/explore/SearchCommand";
import { SurpriseButton } from "@/components/explore/SurpriseButton";

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconCompass() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="m14.8 9.2-1.6 5-5-1.6 1.6-5z" fill="currentColor" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="m4 8 8-4 8 4-8 4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="m4 12 8 4 8-4" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="m4 16 8 4 8-4" fill="none" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function ExplorerChrome({
  category,
  onSelectCategory,
  onSelectStory,
  onError,
}: {
  category: string | null | undefined;
  onSelectCategory: (slug: string | null) => void;
  onSelectStory: (slug: string) => void;
  onError: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const searchHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape" && open) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const input = searchHostRef.current?.querySelector("input");
    input?.focus();
  }, [open]);

  const tools = (
    <>
      <SurpriseButton compact onSelectStory={onSelectStory} onError={onError} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-12 min-w-12 flex-col items-center justify-center gap-0.5 rounded text-[0.65rem] tracking-wide text-[var(--ink)]"
      >
        <IconSearch />
        Search
      </button>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="explorer-panel"
        onClick={() => setOpen((current) => !current)}
        className={`flex min-h-12 min-w-12 flex-col items-center justify-center gap-0.5 rounded text-[0.65rem] tracking-wide ${
          open || category
            ? "text-[var(--ink)]"
            : "text-[var(--muted)]"
        }`}
      >
        <IconLayers />
        Explore
      </button>
      <Link
        href="/stories"
        className="flex min-h-12 min-w-12 flex-col items-center justify-center gap-0.5 rounded text-[0.65rem] tracking-wide text-[var(--muted)]"
      >
        <IconCompass />
        List
      </Link>
    </>
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 md:inset-auto md:top-4 md:bottom-4 md:left-4">
      <div className="pointer-events-auto flex flex-col-reverse md:h-full md:flex-row md:items-stretch">
        <nav
          aria-label="Explore Washington"
          className="flex items-center justify-around gap-1 border border-[var(--rule)] bg-[var(--paper)]/95 px-2 py-2 shadow-sm md:w-16 md:flex-col md:justify-start md:rounded-md md:py-3"
        >
          <p className="serif hidden text-sm leading-none md:block">WA</p>
          {tools}
        </nav>

        {open ? (
          <section
            id="explorer-panel"
            className="max-h-[50vh] overflow-y-auto border border-[var(--rule)] bg-[var(--paper)]/95 p-4 shadow-sm md:max-h-none md:w-72 md:rounded-l-none md:rounded-r-md md:border-l-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.18em] text-[var(--muted)] uppercase">
                  From Washington
                </p>
                <p className="serif text-2xl leading-tight">To You</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-11 rounded border border-[var(--rule)] px-3 text-sm"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Search, filter, or jump to a story. The map stays the main view.
            </p>
            <div ref={searchHostRef} className="mt-4 space-y-3">
              <SearchCommand
                onSelectStory={(slug) => {
                  setOpen(false);
                  onSelectStory(slug);
                }}
                onSelectCategory={(slug) => onSelectCategory(slug)}
              />
              <CategoryFilter
                wrap
                category={category}
                onSelect={onSelectCategory}
              />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

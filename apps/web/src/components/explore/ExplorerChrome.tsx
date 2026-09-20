"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CategoryFilter } from "@/components/explore/CategoryFilter";
import { SearchCommand } from "@/components/explore/SearchCommand";
import { SurpriseButton } from "@/components/explore/SurpriseButton";

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle
        cx="11"
        cy="11"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="m16 16 4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function IconCompass() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
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
      <path
        d="m4 12 8 4 8-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="m4 16 8 4 8-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

const TOOL_BASE =
  "flex min-h-12 min-w-12 flex-col items-center justify-center gap-0.5 px-1 text-[0.65rem] font-bold";

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

  const exploreActive = open || Boolean(category);

  const tools = (
    <>
      <SurpriseButton compact onSelectStory={onSelectStory} onError={onError} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${TOOL_BASE} text-[var(--ink)] hover:bg-[var(--khaki)]`}
      >
        <IconSearch />
        Search
      </button>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="explorer-panel"
        onClick={() => setOpen((current) => !current)}
        className={`${TOOL_BASE} ${
          exploreActive
            ? "bg-[var(--park)] text-[var(--card)]"
            : "text-[var(--ink)] hover:bg-[var(--khaki)]"
        }`}
      >
        <IconLayers />
        Explore
      </button>
      <Link
        href="/stories"
        className={`${TOOL_BASE} text-[var(--ink)] hover:bg-[var(--khaki)]`}
      >
        <IconCompass />
        List
      </Link>
    </>
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 md:inset-auto md:top-4 md:bottom-4 md:left-4">
      <div className="pointer-events-auto flex flex-col-reverse md:h-full md:flex-row md:items-start">
        <nav
          aria-label="Explore Washington"
          className="flex items-center justify-around gap-1 border-2 border-b-0 border-[var(--ink)] bg-[var(--card)] px-1 py-1 md:w-[4.25rem] md:flex-col md:justify-start md:border-b-2 md:py-2"
        >
          {tools}
        </nav>

        {open ? (
          <section
            id="explorer-panel"
            className="plaque max-h-[50vh] overflow-y-auto border-2 border-[var(--ink)] bg-[var(--card)] p-4 md:ml-3 md:max-h-[calc(100dvh-2rem)] md:w-72"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="kicker">From Washington</p>
                <p className="serif text-2xl leading-tight">To You</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-quiet px-3 text-sm"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Search, filter, or jump to a story. The map stays the main view.
            </p>
            <hr className="my-4 border-[var(--rule-strong)]" />
            <div ref={searchHostRef} className="space-y-4">
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

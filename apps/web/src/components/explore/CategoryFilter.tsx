"use client";

import { MVP_CATEGORIES } from "@fwty/shared";

export function CategoryFilter({
  category,
  onSelect,
}: {
  category: string | null | undefined;
  onSelect: (next: string | null) => void;
}) {
  return (
    <div
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="Story categories"
    >
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`min-h-11 shrink-0 rounded-full border px-3 text-sm ${
          category
            ? "border-[var(--rule)] text-[var(--muted)]"
            : "border-[var(--ink)] text-[var(--ink)]"
        }`}
      >
        All
      </button>
      {MVP_CATEGORIES.map((item) => (
        <button
          key={item.slug}
          type="button"
          onClick={() => onSelect(item.slug)}
          className={`min-h-11 shrink-0 rounded-full border px-3 text-sm ${
            category === item.slug
              ? "border-[var(--ink)] text-[var(--ink)]"
              : "border-[var(--rule)] text-[var(--muted)]"
          }`}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

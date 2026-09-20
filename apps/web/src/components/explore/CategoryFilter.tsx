"use client";

import { MVP_CATEGORIES } from "@fwty/shared";
import { trackEvent } from "@/lib/analytics";

const CHIP_BASE =
  "flex min-h-11 shrink-0 items-center gap-2 rounded-full border-2 px-3.5 text-sm font-semibold";
const CHIP_ON =
  "border-[var(--evergreen-deep)] bg-[var(--evergreen)] text-[var(--card)]";
const CHIP_OFF =
  "border-[var(--rule-strong)] bg-[var(--card)] text-[var(--ink)] hover:bg-[var(--sage)]";

function Dot({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="h-2.5 w-2.5 rounded-full"
      style={{ background: color }}
    />
  );
}

export function CategoryFilter({
  category,
  onSelect,
  wrap = false,
}: {
  category: string | null | undefined;
  onSelect: (next: string | null) => void;
  wrap?: boolean;
}) {
  return (
    <div
      className={
        wrap
          ? "flex flex-wrap gap-2"
          : "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      }
      role="group"
      aria-label="Story categories"
    >
      <button
        type="button"
        aria-pressed={!category}
        onClick={() => {
          trackEvent("category_selected", { category: "all" });
          onSelect(null);
        }}
        className={`${CHIP_BASE} ${category ? CHIP_OFF : CHIP_ON}`}
      >
        <Dot color={category ? "var(--bark)" : "var(--amber)"} />
        All
      </button>
      {MVP_CATEGORIES.map((item) => {
        const active = category === item.slug;
        return (
          <button
            key={item.slug}
            type="button"
            aria-pressed={active}
            onClick={() => {
              trackEvent("category_selected", { category: item.slug });
              onSelect(item.slug);
            }}
            className={`${CHIP_BASE} ${active ? CHIP_ON : CHIP_OFF}`}
          >
            <Dot color={active ? "var(--amber)" : item.color} />
            {item.name}
          </button>
        );
      })}
    </div>
  );
}

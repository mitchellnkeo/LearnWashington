import Link from "next/link";

function TreeMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 shrink-0">
      <path d="M12 3 7 10h3l-4 6h5v5h2v-5h5l-4-6h3z" fill="currentColor" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="bg-[var(--evergreen)] text-[var(--card)]">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <TreeMark />
          <span className="serif text-xl leading-tight">
            From Washington To You
          </span>
        </Link>
        <nav aria-label="Primary" className="flex gap-2 text-sm font-semibold">
          <Link
            href="/"
            className="rounded-full border border-[var(--card)]/40 px-3.5 py-1.5 hover:bg-[var(--evergreen-deep)]"
          >
            Map
          </Link>
          <Link
            href="/stories"
            className="rounded-full border border-[var(--card)]/40 px-3.5 py-1.5 hover:bg-[var(--evergreen-deep)]"
          >
            Stories
          </Link>
        </nav>
      </div>
      <div className="h-1.5 bg-[var(--amber)]" aria-hidden="true" />
    </header>
  );
}

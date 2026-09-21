import Link from "next/link";

function BlazeMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 shrink-0">
      <rect
        x="7"
        y="7"
        width="10"
        height="10"
        transform="rotate(45 12 12)"
        fill="var(--park)"
      />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b-4 border-[var(--park)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <BlazeMark />
          <span className="serif text-[1.35rem] leading-none">
            From Washington To You
          </span>
        </Link>
        <nav aria-label="Primary" className="flex gap-5 text-sm font-bold">
          <Link href="/" className="underline-offset-4 hover:underline">
            Map
          </Link>
          <Link href="/stories" className="underline-offset-4 hover:underline">
            Stories
          </Link>
        </nav>
      </div>
    </header>
  );
}

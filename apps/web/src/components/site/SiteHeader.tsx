import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--rule)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="serif text-xl leading-tight">
          From Washington To You
        </Link>
        <nav aria-label="Primary" className="flex gap-4 text-sm">
          <Link href="/" className="underline-offset-2 hover:underline">
            Map
          </Link>
          <Link href="/stories" className="underline-offset-2 hover:underline">
            Stories
          </Link>
        </nav>
      </div>
    </header>
  );
}

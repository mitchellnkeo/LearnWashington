import { MVP_CATEGORIES, parseStoriesBrowseQuery } from "@fwty/shared";
import { listPublishedRegions, listPublishedStories } from "@fwty/database";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getSql } from "@/lib/db";
import { getServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stories · From Washington To You",
  description: "Browse every published Washington story without the map.",
  alternates: { canonical: "/stories" },
};

type PageProps = {
  searchParams: Promise<{ q?: string; category?: string; region?: string }>;
};

async function loadCatalog(searchParams: URLSearchParams) {
  const filter = parseStoriesBrowseQuery(searchParams);
  if (!getServerEnv().DATABASE_URL) {
    return { stories: [], regions: [], filter };
  }

  const sql = getSql();
  try {
    const [stories, regions] = await Promise.all([
      listPublishedStories(sql, filter),
      listPublishedRegions(sql),
    ]);
    return { stories, regions, filter };
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export default async function StoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.q) {
    query.set("q", params.q);
  }
  if (params.category) {
    query.set("category", params.category);
  }
  if (params.region) {
    query.set("region", params.region);
  }

  const { stories, regions, filter } = await loadCatalog(query);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto min-h-dvh max-w-3xl px-6 py-10">
        <h1 className="serif text-4xl leading-tight">Stories</h1>
        <p className="mt-2 text-[var(--muted)]">
          The full catalog, readable without the map. Filter by category, region, or
          search.
        </p>

        <form
          method="get"
          action="/stories"
          className="mt-6 grid gap-3 rounded border border-[var(--rule)] bg-[var(--paper)] p-4 md:grid-cols-4"
          role="search"
        >
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs tracking-[0.16em] text-[var(--muted)] uppercase">
              Search
            </span>
            <input
              type="search"
              name="q"
              defaultValue={filter.q ?? ""}
              placeholder="Rainier, orcas, Grand Coulee…"
              className="min-h-11 w-full rounded border border-[var(--rule)] bg-[var(--paper)] px-3 text-sm"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs tracking-[0.16em] text-[var(--muted)] uppercase">
              Category
            </span>
            <select
              name="category"
              defaultValue={filter.category ?? ""}
              className="min-h-11 w-full rounded border border-[var(--rule)] bg-[var(--paper)] px-3 text-sm"
            >
              <option value="">All</option>
              {MVP_CATEGORIES.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs tracking-[0.16em] text-[var(--muted)] uppercase">
              Region
            </span>
            <select
              name="region"
              defaultValue={filter.region ?? ""}
              className="min-h-11 w-full rounded border border-[var(--rule)] bg-[var(--paper)] px-3 text-sm"
            >
              <option value="">All</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end md:col-span-4">
            <button
              type="submit"
              className="min-h-11 rounded border border-[var(--ink)] bg-[var(--ink)] px-4 text-sm text-[var(--paper)]"
            >
              Apply filters
            </button>
          </div>
        </form>

        {stories.length === 0 ? (
          <p className="mt-10 text-[var(--muted)]">No published stories match.</p>
        ) : (
          <ul className="mt-10 space-y-6">
            {stories.map((story) => (
              <li key={story.slug} className="border-t border-[var(--rule)] pt-6">
                <h2 className="serif text-2xl leading-tight">
                  <Link
                    href={`/story/${story.slug}`}
                    className="underline decoration-[var(--rule)] underline-offset-2 hover:decoration-[var(--ink)]"
                  >
                    {story.title}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {story.locationLabel}
                  {story.dateLabel ? ` · ${story.dateLabel}` : ""}
                  {story.region ? ` · ${story.region}` : ""}
                </p>
                <p className="mt-2">{story.hook}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {story.categories.map((category) => category.name).join(" · ")}
                </p>
                <p className="mt-3 text-sm">
                  <Link
                    href={`/?story=${story.slug}`}
                    className="underline underline-offset-2"
                  >
                    Open on the map
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

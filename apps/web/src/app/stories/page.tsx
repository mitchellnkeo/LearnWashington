import {
  DEFAULT_CATEGORY_COLOR,
  MVP_CATEGORIES,
  parseStoriesBrowseQuery,
} from "@fwty/shared";
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

function categoryColor(slug: string) {
  return (
    MVP_CATEGORIES.find((item) => item.slug === slug)?.color ??
    DEFAULT_CATEGORY_COLOR
  );
}

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
      <main id="main-content" className="min-h-dvh">
        <div className="topo border-b border-[var(--rule)]">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <h1 className="serif text-4xl leading-tight">Stories</h1>
            <p className="mt-2 max-w-xl text-[var(--muted)]">
              The whole collection, readable without the map. Filter by category
              or region, or search for the place you have been wondering about.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 py-10">
          <form
            method="get"
            action="/stories"
            className="card card-raised grid gap-4 p-5 md:grid-cols-4"
            role="search"
          >
            <label className="md:col-span-2">
              <span className="eyebrow mb-1.5 block">Search</span>
              <input
                type="search"
                name="q"
                defaultValue={filter.q ?? ""}
                placeholder="Rainier, orcas, Grand Coulee…"
                className="field text-sm"
              />
            </label>
            <label>
              <span className="eyebrow mb-1.5 block">Category</span>
              <select
                name="category"
                defaultValue={filter.category ?? ""}
                className="field text-sm"
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
              <span className="eyebrow mb-1.5 block">Region</span>
              <select
                name="region"
                defaultValue={filter.region ?? ""}
                className="field text-sm"
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
              <button type="submit" className="btn btn-primary text-sm">
                Apply filters
              </button>
            </div>
          </form>

          {stories.length === 0 ? (
            <p className="mt-10 text-[var(--muted)]">
              No published stories match.
            </p>
          ) : (
            <ul className="mt-10 space-y-6">
              {stories.map((story) => (
                <li
                  key={story.slug}
                  className="card card-raised overflow-hidden"
                >
                  {story.image ? (
                    <div className="border-b border-[var(--rule)] bg-[var(--sage)]">
                      <img
                        src={story.image.url}
                        alt={story.image.altText}
                        className="postcard-photo postcard-photo-thumb"
                      />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <h2 className="serif text-2xl leading-tight">
                      <Link
                        href={`/story/${story.slug}`}
                        className="underline decoration-[var(--rule-strong)] underline-offset-4 hover:decoration-[var(--evergreen)]"
                      >
                        {story.title}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {story.locationLabel}
                      {story.dateLabel ? ` · ${story.dateLabel}` : ""}
                      {story.region ? ` · ${story.region}` : ""}
                    </p>
                    <p className="mt-3">{story.hook}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {story.categories.map((category) => (
                        <li
                          key={category.slug}
                          className="flex items-center gap-2 rounded-full border border-[var(--rule-strong)] px-3 py-1 text-xs font-semibold"
                        >
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 rounded-full"
                            style={{ background: categoryColor(category.slug) }}
                          />
                          {category.name}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4">
                      <Link
                        href={`/?story=${story.slug}`}
                        className="btn btn-quiet text-sm"
                      >
                        Open on the map
                      </Link>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedStoryBySlug } from "@fwty/database";
import { StoryViewed } from "@/components/analytics/StoryViewed";
import { PostcardCard } from "@/components/postcard/PostcardCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getSql } from "@/lib/db";
import { getServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function loadStory(slug: string) {
  if (!getServerEnv().DATABASE_URL) {
    return null;
  }

  const sql = getSql();
  try {
    return await getPublishedStoryBySlug(sql, slug);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await loadStory(slug);

  if (!story) {
    return { title: "Story not found" };
  }

  return {
    title: `${story.title} · From Washington To You`,
    description: story.hook,
    alternates: {
      canonical: `/story/${story.slug}`,
    },
    openGraph: {
      title: story.title,
      description: story.hook,
      type: "article",
      images: story.media[0]
        ? [{ url: story.media[0].url, alt: story.media[0].altText }]
        : undefined,
    },
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;
  const story = await loadStory(slug);

  if (!story) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="min-h-dvh">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <nav aria-label="Story" className="flex flex-wrap gap-2 text-sm">
            <Link
              href={`/?story=${story.slug}`}
              className="btn btn-quiet text-sm"
            >
              Open on the map
            </Link>
            <Link href="/stories" className="btn btn-quiet text-sm">
              All stories
            </Link>
          </nav>
          <div className="card plaque mt-6 p-6 md:p-8">
            <StoryViewed slug={story.slug} />
            <PostcardCard story={story} showPermalink={false} />
          </div>
        </div>
      </main>
    </>
  );
}

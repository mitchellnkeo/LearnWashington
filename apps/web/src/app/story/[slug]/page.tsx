import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedStoryBySlug } from "@fwty/database";
import { PostcardCard } from "@/components/postcard/PostcardCard";
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
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-10">
      <p className="text-sm">
        <Link href={`/?story=${story.slug}`} className="underline underline-offset-2">
          Back to the map
        </Link>
      </p>
      <div className="mt-8">
        <PostcardCard story={story} showPermalink={false} />
      </div>
    </main>
  );
}

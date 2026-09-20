import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type postgres from "postgres";
import { createSqlClient } from "./client";
import {
  getRandomPublishedStory,
  listNearbyPublishedStories,
  listRelatedPublishedStories,
  searchPublishedContent,
} from "./discovery";
import { loadRepoEnv } from "./env";
import { listPublishedStories } from "./queries";

const runSpatial = process.env.RUN_SPATIAL_TESTS === "1";
if (runSpatial) {
  loadRepoEnv();
}

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

describe.skipIf(!runSpatial || !databaseUrl)("discovery queries", () => {
  let sql: postgres.Sql;

  beforeAll(() => {
    sql = createSqlClient(databaseUrl as string);
  });

  afterAll(async () => {
    await sql.end({ timeout: 5 });
  });

  it("finds Rainier by title search", async () => {
    const results = await searchPublishedContent(sql, "rainier");
    expect(results.stories.map((story) => story.slug)).toContain("mount-rainier");
  });

  it("groups place, tag, and category matches", async () => {
    const hendrix = await searchPublishedContent(sql, "hendrix");
    expect(hendrix.places.some((place) => place.slug === "jimi-hendrix-park")).toBe(true);

    const seattle = await searchPublishedContent(sql, "seattle");
    expect(seattle.tags.some((tag) => tag.slug === "seattle")).toBe(true);
    expect(seattle.stories.map((story) => story.slug)).toContain("jimi-hendrix-seattle");

    const music = await searchPublishedContent(sql, "music");
    expect(music.categories.map((category) => category.slug)).toContain("music-culture");
  });

  it("returns a published story and honors excludes", async () => {
    const first = await getRandomPublishedStory(sql);
    expect(first?.slug).toBeTruthy();

    const published = await sql<{ slug: string }[]>`
      select slug from stories
      where status = 'PUBLISHED'
        and verification_status in ('VERIFIED', 'DISPUTED')
    `;
    const slugs = published.map((row) => row.slug);
    const leftover = slugs.filter((slug) => slug !== first?.slug);
    if (leftover.length === 0) {
      return;
    }

    const second = await getRandomPublishedStory(sql, [first!.slug]);
    expect(second?.slug).not.toBe(first?.slug);
    expect(slugs).toContain(second?.slug);
  });

  it("returns curated related stories", async () => {
    const related = await listRelatedPublishedStories(sql, "grand-coulee-dam");
    expect(related.map((story) => story.slug)).toContain("dry-falls");
  });

  it("ranks nearby published stories by distance", async () => {
    const nearby = await listNearbyPublishedStories(sql, {
      latitude: 47.606,
      longitude: -122.332,
      radiusKm: 30,
    });

    expect(nearby[0]?.slug).toBe("jimi-hendrix-seattle");
    expect(nearby.some((story) => story.slug === "dry-falls")).toBe(false);
  });

  it("lists published stories by category and region", async () => {
    const music = await listPublishedStories(sql, { category: "music-culture" });
    expect(music.map((story) => story.slug)).toEqual(["jimi-hendrix-seattle"]);

    const basin = await listPublishedStories(sql, { region: "Columbia Basin" });
    expect(basin.map((story) => story.slug).sort()).toEqual([
      "dry-falls",
      "grand-coulee-dam",
      "hanford-b-reactor",
    ]);
  });
});

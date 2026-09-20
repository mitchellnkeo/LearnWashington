import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type postgres from "postgres";
import { createSqlClient } from "./client";
import { loadRepoEnv } from "./env";
import { listPublishedMapStories } from "./queries";

const runSpatial = process.env.RUN_SPATIAL_TESTS === "1";
if (runSpatial) {
  loadRepoEnv();
}

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

describe.skipIf(!runSpatial || !databaseUrl)("spatial map queries", () => {
  let sql: postgres.Sql;

  beforeAll(() => {
    sql = createSqlClient(databaseUrl as string);
  });

  afterAll(async () => {
    await sql.end({ timeout: 5 });
  });

  it("keeps GiST indexes on story and place geometry", async () => {
    const indexes = await sql<{ indexname: string }[]>`
      select indexname
      from pg_indexes
      where indexname in ('stories_geometry_gix', 'places_geometry_gix')
    `;

    expect(indexes.map((row) => row.indexname).sort()).toEqual([
      "places_geometry_gix",
      "stories_geometry_gix",
    ]);
  });

  it("round-trips official line and polygon geometries", async () => {
    const rows = await sql<{ slug: string; geometry_type: string }[]>`
      select slug, GeometryType(geometry) as geometry_type
      from stories
      where slug in ('elwha-river-restoration', 'fort-vancouver')
      order by slug
    `;

    expect(rows).toEqual([
      { slug: "elwha-river-restoration", geometry_type: "LINESTRING" },
      { slug: "fort-vancouver", geometry_type: "MULTIPOLYGON" },
    ]);
  });

  it("filters published markers with ST_Intersects", async () => {
    const seattle = await listPublishedMapStories(sql, {
      bbox: { west: -122.5, south: 47.4, east: -122.1, north: 47.8 },
    });
    const slugs = seattle.map((feature) => feature.properties.slug);

    expect(slugs).toContain("jimi-hendrix-seattle");
    expect(slugs).not.toContain("dry-falls");
    expect(slugs).not.toContain("fort-vancouver");
  });

  it("includes the Elwha line when only the mouth is in view", async () => {
    const mouth = await listPublishedMapStories(sql, {
      bbox: { west: -123.58, south: 48.13, east: -123.54, north: 48.16 },
    });

    expect(mouth.map((feature) => feature.properties.slug)).toContain(
      "elwha-river-restoration",
    );
    expect(mouth[0]?.properties.geometryType).toBe("LINESTRING");
  });

  it("filters by category slug", async () => {
    const music = await listPublishedMapStories(sql, {
      categories: ["music-culture"],
    });

    expect(music.map((feature) => feature.properties.slug)).toEqual([
      "jimi-hendrix-seattle",
    ]);
  });

  it("can explain the bbox query", async () => {
    const plan = await sql<[{ "QUERY PLAN": Array<{ Plan: { "Node Type": string } }> }]>`
      explain (format json)
      select s.slug
      from stories s
      left join places p on p.id = s.primary_place_id
      where s.status = 'PUBLISHED'
        and ST_Intersects(
          coalesce(s.geometry, p.geometry),
          ST_MakeEnvelope(-122.5, 47.4, -122.1, 47.8, 4326)
        )
    `;

    expect(plan[0]?.["QUERY PLAN"]?.[0]?.Plan?.["Node Type"]).toBeTruthy();
  });
});

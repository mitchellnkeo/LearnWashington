import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { MVP_CATEGORIES, seedStorySchema, slugify } from "@fwty/shared";
import { createSqlClient } from "./client";
import { requireDatabaseUrl } from "./env";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");
const storiesDir = resolve(repoRoot, "data/stories");

const sql = createSqlClient(requireDatabaseUrl());

await sql.begin(async (tx) => {
  for (const [index, category] of MVP_CATEGORIES.entries()) {
    await tx`
      insert into categories (slug, name, sort_order)
      values (${category.slug}, ${category.name}, ${index})
      on conflict (slug) do update
      set name = excluded.name,
          sort_order = excluded.sort_order
    `;
  }

  const files = (await readdir(storiesDir))
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .sort();

  for (const file of files) {
    const raw = await readFile(resolve(storiesDir, file), "utf8");
    const story = seedStorySchema.parse(parse(raw));

    await tx`
      insert into places (slug, name, place_type, geometry, county, region)
      values (
        ${story.location.slug},
        ${story.location.name},
        ${story.location.placeType},
        ST_SetSRID(ST_MakePoint(${story.location.longitude}, ${story.location.latitude}), 4326),
        ${story.location.county ?? null},
        ${story.location.region ?? null}
      )
      on conflict (slug) do update
      set name = excluded.name,
          place_type = excluded.place_type,
          geometry = excluded.geometry,
          county = excluded.county,
          region = excluded.region,
          updated_at = now()
    `;

    const [place] = await tx<{ id: string }[]>`
      select id from places where slug = ${story.location.slug}
    `;

    await tx`
      insert into stories (
        slug, title, hook, body_md, status, verification_status,
        primary_place_id, start_date, date_precision, date_label,
        geometry, featured, published_at, last_reviewed_at
      )
      values (
        ${story.slug},
        ${story.title},
        ${story.hook},
        ${story.body},
        ${story.status},
        ${story.verificationStatus},
        ${place.id},
        ${story.startDate ?? null},
        ${story.datePrecision ?? null},
        ${story.dateLabel ?? null},
        ST_SetSRID(ST_MakePoint(${story.location.longitude}, ${story.location.latitude}), 4326),
        ${story.featured ?? false},
        ${story.status === "PUBLISHED" ? new Date().toISOString() : null},
        ${story.lastReviewedAt ?? null}
      )
      on conflict (slug) do update
      set title = excluded.title,
          hook = excluded.hook,
          body_md = excluded.body_md,
          status = excluded.status,
          verification_status = excluded.verification_status,
          primary_place_id = excluded.primary_place_id,
          start_date = excluded.start_date,
          date_precision = excluded.date_precision,
          date_label = excluded.date_label,
          geometry = excluded.geometry,
          featured = excluded.featured,
          last_reviewed_at = excluded.last_reviewed_at,
          updated_at = now()
    `;

    const [saved] = await tx<{ id: string }[]>`
      select id from stories where slug = ${story.slug}
    `;

    await tx`delete from story_categories where story_id = ${saved.id}`;
    await tx`delete from story_tags where story_id = ${saved.id}`;
    await tx`delete from story_sources where story_id = ${saved.id}`;
    await tx`delete from claims where story_id = ${saved.id}`;

    for (const categorySlug of story.categories) {
      const [category] = await tx<{ id: string }[]>`
        select id from categories where slug = ${categorySlug}
      `;
      if (!category) {
        throw new Error(`Unknown category: ${categorySlug}`);
      }
      await tx`
        insert into story_categories (story_id, category_id)
        values (${saved.id}, ${category.id})
      `;
    }

    for (const tagName of story.tags) {
      const tagSlug = slugify(tagName);
      await tx`
        insert into tags (slug, name)
        values (${tagSlug}, ${tagName})
        on conflict (slug) do update set name = excluded.name
      `;
      const [tag] = await tx<{ id: string }[]>`
        select id from tags where slug = ${tagSlug}
      `;
      await tx`
        insert into story_tags (story_id, tag_id)
        values (${saved.id}, ${tag.id})
      `;
    }

    const sourceIds = new Map<string, string>();
    for (const source of story.sources) {
      await tx`
        insert into sources (
          slug, title, publisher, author, url, source_type, tier,
          publication_date, accessed_at, notes
        )
        values (
          ${source.id},
          ${source.title},
          ${source.publisher},
          ${source.author ?? null},
          ${source.url},
          ${source.sourceType},
          ${source.tier},
          ${source.publicationDate ?? null},
          ${source.accessedAt},
          ${source.notes ?? null}
        )
        on conflict (slug) do update
        set title = excluded.title,
            publisher = excluded.publisher,
            author = excluded.author,
            url = excluded.url,
            source_type = excluded.source_type,
            tier = excluded.tier,
            publication_date = excluded.publication_date,
            accessed_at = excluded.accessed_at,
            notes = excluded.notes
      `;
      const [savedSource] = await tx<{ id: string }[]>`
        select id from sources where slug = ${source.id}
      `;
      sourceIds.set(source.id, savedSource.id);
      await tx`
        insert into story_sources (story_id, source_id)
        values (${saved.id}, ${savedSource.id})
        on conflict do nothing
      `;
    }

    for (const [index, claim] of story.claims.entries()) {
      const [savedClaim] = await tx<{ id: string }[]>`
        insert into claims (story_id, text, claim_type, confidence, sort_order)
        values (
          ${saved.id},
          ${claim.text.trim()},
          ${claim.claimType},
          ${claim.confidence},
          ${index}
        )
        returning id
      `;
      for (const sourceSlug of claim.sources) {
        const sourceId = sourceIds.get(sourceSlug);
        if (!sourceId) {
          throw new Error(`Claim source not in story: ${sourceSlug}`);
        }
        await tx`
          insert into claim_sources (claim_id, source_id)
          values (${savedClaim.id}, ${sourceId})
        `;
      }
    }

    console.log(`Seeded ${story.slug}`);
  }
});

await sql.end({ timeout: 5 });
console.log("Seed complete.");

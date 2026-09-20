import type postgres from "postgres";

const PUBLISHED = sqlFragment();

function sqlFragment() {
  return {
    status: "PUBLISHED",
    verification: ["VERIFIED", "DISPUTED"],
  };
}

export type SearchStoryHit = {
  slug: string;
  title: string;
  hook: string;
  category: string | null;
};

export type SearchPlaceHit = {
  slug: string;
  name: string;
  storySlug: string;
};

export type SearchTagHit = {
  slug: string;
  name: string;
  storySlug: string;
};

export type SearchCategoryHit = {
  slug: string;
  name: string;
};

export type SearchResults = {
  stories: SearchStoryHit[];
  places: SearchPlaceHit[];
  tags: SearchTagHit[];
  categories: SearchCategoryHit[];
};

export type RelatedStory = {
  slug: string;
  title: string;
  hook: string;
  relationshipType: string | null;
};

export type NearbyStory = {
  slug: string;
  title: string;
  distanceKm: number;
};

export async function searchPublishedContent(
  sql: postgres.Sql,
  q: string,
): Promise<SearchResults> {
  const stories = await sql<SearchStoryHit[]>`
    select
      s.slug,
      s.title,
      s.hook,
      (
        select c.slug
        from story_categories sc
        join categories c on c.id = sc.category_id
        where sc.story_id = s.id
        order by c.sort_order
        limit 1
      ) as category
    from stories s
    where s.status = ${PUBLISHED.status}
      and s.verification_status in ${sql(PUBLISHED.verification)}
      and (
        to_tsvector('english', s.title || ' ' || s.hook)
          @@ websearch_to_tsquery('english', ${q})
        or s.title % ${q}
        or s.hook % ${q}
      )
    order by
      ts_rank(
        to_tsvector('english', s.title || ' ' || s.hook),
        websearch_to_tsquery('english', ${q})
      ) + similarity(s.title, ${q}) desc,
      s.title
    limit 8
  `;

  const places = await sql<SearchPlaceHit[]>`
    select distinct on (p.slug)
      p.slug,
      p.name,
      s.slug as "storySlug"
    from places p
    join stories s on s.primary_place_id = p.id
    where s.status = ${PUBLISHED.status}
      and s.verification_status in ${sql(PUBLISHED.verification)}
      and (
        to_tsvector('english', p.name) @@ websearch_to_tsquery('english', ${q})
        or p.name % ${q}
      )
    order by p.slug, similarity(p.name, ${q}) desc
    limit 6
  `;

  const tags = await sql<SearchTagHit[]>`
    select distinct on (t.slug)
      t.slug,
      t.name,
      s.slug as "storySlug"
    from tags t
    join story_tags st on st.tag_id = t.id
    join stories s on s.id = st.story_id
    where s.status = ${PUBLISHED.status}
      and s.verification_status in ${sql(PUBLISHED.verification)}
      and (t.name % ${q} or t.slug % ${q})
    order by t.slug, similarity(t.name, ${q}) desc
    limit 6
  `;

  const categories = await sql<SearchCategoryHit[]>`
    select c.slug, c.name
    from categories c
    where exists (
      select 1
      from story_categories sc
      join stories s on s.id = sc.story_id
      where sc.category_id = c.id
        and s.status = ${PUBLISHED.status}
        and s.verification_status in ${sql(PUBLISHED.verification)}
    )
      and (c.name % ${q} or c.slug % ${q})
    order by similarity(c.name, ${q}) desc
    limit 4
  `;

  return { stories, places, tags, categories };
}

export async function getRandomPublishedStory(
  sql: postgres.Sql,
  excludeSlugs: string[] = [],
  category?: string,
): Promise<{ slug: string } | null> {
  const categoryFilter = category
    ? sql`and exists (
        select 1
        from story_categories sc
        join categories c on c.id = sc.category_id
        where sc.story_id = s.id
          and c.slug = ${category}
      )`
    : sql``;

  const picked = await sql<{ slug: string }[]>`
    select s.slug
    from stories s
    where s.status = ${PUBLISHED.status}
      and s.verification_status in ${sql(PUBLISHED.verification)}
      ${
        excludeSlugs.length > 0
          ? sql`and not (s.slug = any(${excludeSlugs}))`
          : sql``
      }
      ${categoryFilter}
    order by random()
    limit 1
  `;

  if (picked[0]) {
    return picked[0];
  }

  if (excludeSlugs.length === 0) {
    return null;
  }

  const fallback = await sql<{ slug: string }[]>`
    select s.slug
    from stories s
    where s.status = ${PUBLISHED.status}
      and s.verification_status in ${sql(PUBLISHED.verification)}
      ${categoryFilter}
    order by random()
    limit 1
  `;

  return fallback[0] ?? null;
}

export async function listRelatedPublishedStories(
  sql: postgres.Sql,
  slug: string,
): Promise<RelatedStory[]> {
  return sql<RelatedStory[]>`
    select
      related.slug,
      related.title,
      related.hook,
      link.relationship_type as "relationshipType"
    from stories origin
    join related_stories link on link.story_id = origin.id
    join stories related on related.id = link.related_story_id
    where origin.slug = ${slug}
      and related.status = ${PUBLISHED.status}
      and related.verification_status in ${sql(PUBLISHED.verification)}
    order by link.weight desc nulls last, related.title
  `;
}

export async function listNearbyPublishedStories(
  sql: postgres.Sql,
  input: {
    latitude: number;
    longitude: number;
    radiusKm: number;
    category?: string;
  },
): Promise<NearbyStory[]> {
  const radiusM = input.radiusKm * 1000;
  const categoryFilter = input.category
    ? sql`and exists (
        select 1
        from story_categories sc
        join categories c on c.id = sc.category_id
        where sc.story_id = s.id
          and c.slug = ${input.category}
      )`
    : sql``;

  const rows = await sql<{ slug: string; title: string; distance_m: number }[]>`
    select
      s.slug,
      s.title,
      ST_Distance(
        ST_PointOnSurface(coalesce(s.geometry, p.geometry))::geography,
        ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography
      ) as distance_m
    from stories s
    left join places p on p.id = s.primary_place_id
    where s.status = ${PUBLISHED.status}
      and s.verification_status in ${sql(PUBLISHED.verification)}
      and coalesce(s.geometry, p.geometry) is not null
      and ST_DWithin(
        ST_PointOnSurface(coalesce(s.geometry, p.geometry))::geography,
        ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography,
        ${radiusM}
      )
      ${categoryFilter}
    order by distance_m
    limit 20
  `;

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    distanceKm: Math.round((row.distance_m / 1000) * 10) / 10,
  }));
}

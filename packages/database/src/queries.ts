import type postgres from "postgres";

export type MapStoryFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: string;
    slug: string;
    title: string;
    category: string | null;
  };
};

export type StorySource = {
  title: string;
  publisher: string;
  url: string;
  tier: string;
  sourceType: string;
  publicationDate: string | null;
};

export type StoryPostcard = {
  slug: string;
  title: string;
  hook: string;
  bodyMd: string;
  locationLabel: string;
  dateLabel: string | null;
  lastReviewedAt: string | null;
  latitude: number;
  longitude: number;
  categories: { slug: string; name: string }[];
  sources: StorySource[];
};

type GeoJsonPoint = {
  type: "Point";
  coordinates: [number, number];
};

function asPoint(value: GeoJsonPoint | string): GeoJsonPoint {
  return typeof value === "string" ? (JSON.parse(value) as GeoJsonPoint) : value;
}

export async function listPublishedMapStories(
  sql: postgres.Sql,
): Promise<MapStoryFeature[]> {
  const rows = await sql<
    {
      id: string;
      slug: string;
      title: string;
      category: string | null;
      geometry: GeoJsonPoint;
    }[]
  >`
    select
      s.id,
      s.slug,
      s.title,
      (
        select c.slug
        from story_categories sc
        join categories c on c.id = sc.category_id
        where sc.story_id = s.id
        order by c.sort_order
        limit 1
      ) as category,
      ST_AsGeoJSON(
        ST_PointOnSurface(coalesce(s.geometry, p.geometry))
      )::json as geometry
    from stories s
    left join places p on p.id = s.primary_place_id
    where s.status = 'PUBLISHED'
      and s.verification_status in ('VERIFIED', 'DISPUTED')
      and coalesce(s.geometry, p.geometry) is not null
  `;

  return rows.map((row) => ({
    type: "Feature",
    geometry: asPoint(row.geometry),
    properties: {
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: row.category,
    },
  }));
}

export async function getPublishedStoryBySlug(
  sql: postgres.Sql,
  slug: string,
): Promise<StoryPostcard | null> {
  const stories = await sql<
    {
      slug: string;
      title: string;
      hook: string;
      body_md: string;
      date_label: string | null;
      last_reviewed_at: Date | null;
      place_name: string | null;
      county: string | null;
      geometry: GeoJsonPoint;
    }[]
  >`
    select
      s.slug,
      s.title,
      s.hook,
      s.body_md,
      s.date_label,
      s.last_reviewed_at,
      p.name as place_name,
      p.county,
      ST_AsGeoJSON(
        ST_PointOnSurface(coalesce(s.geometry, p.geometry))
      )::json as geometry
    from stories s
    left join places p on p.id = s.primary_place_id
    where s.slug = ${slug}
      and s.status = 'PUBLISHED'
      and s.verification_status in ('VERIFIED', 'DISPUTED')
    limit 1
  `;

  const story = stories[0];
  if (!story) {
    return null;
  }

  const categories = await sql<{ slug: string; name: string }[]>`
    select c.slug, c.name
    from story_categories sc
    join categories c on c.id = sc.category_id
    join stories s on s.id = sc.story_id
    where s.slug = ${slug}
    order by c.sort_order
  `;

  const sources = await sql<
    {
      title: string;
      publisher: string;
      url: string;
      tier: string;
      source_type: string;
      publication_date: string | null;
    }[]
  >`
    select distinct on (src.id)
      src.title,
      src.publisher,
      src.url,
      src.tier,
      src.source_type,
      src.publication_date::text
    from stories s
    join story_sources ss on ss.story_id = s.id
    join sources src on src.id = ss.source_id
    where s.slug = ${slug}
    order by src.id, src.tier
  `;

  const [longitude, latitude] = asPoint(story.geometry).coordinates;
  const locationParts = [story.place_name, story.county].filter(Boolean);

  return {
    slug: story.slug,
    title: story.title,
    hook: story.hook,
    bodyMd: story.body_md,
    locationLabel: locationParts.join(" · ") || "Washington",
    dateLabel: story.date_label,
    lastReviewedAt: story.last_reviewed_at
      ? story.last_reviewed_at.toISOString()
      : null,
    latitude,
    longitude,
    categories,
    sources: sources.map((source) => ({
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      tier: source.tier,
      sourceType: source.source_type,
      publicationDate: source.publication_date,
    })),
  };
}

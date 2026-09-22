import type postgres from "postgres";
import { listRelatedPublishedStories, type RelatedStory } from "./discovery";

export type GeoJsonPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type GeoJsonShape =
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "MultiLineString"; coordinates: [number, number][][] }
  | { type: "Polygon"; coordinates: [number, number][][] }
  | { type: "MultiPolygon"; coordinates: [number, number][][][] };

export type GeoJsonGeometry = GeoJsonPoint | GeoJsonShape;

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
    hook: string;
    category: string | null;
    icon: string | null;
    geometryType: string;
    shape: GeoJsonShape | null;
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

export type StoryMedia = {
  url: string;
  title: string | null;
  creator: string | null;
  sourceUrl: string | null;
  license: string | null;
  licenseUrl: string | null;
  altText: string;
  creditLine: string | null;
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
  related: RelatedStory[];
  media: StoryMedia[];
};

export type MapStoriesFilter = {
  bbox?: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
  categories?: string[];
};

export type StoriesBrowseFilter = {
  q?: string;
  category?: string;
  region?: string;
};

export type PublishedStorySummary = {
  slug: string;
  title: string;
  hook: string;
  locationLabel: string;
  dateLabel: string | null;
  region: string | null;
  categories: { slug: string; name: string }[];
  image: { url: string; altText: string } | null;
};

function asGeometry<T extends GeoJsonGeometry>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function asPoint(value: GeoJsonPoint | string): GeoJsonPoint {
  return asGeometry(value);
}

function normalizeGeometryType(value: string): string {
  return value.replace(/^ST_/, "");
}

export async function listPublishedMapStories(
  sql: postgres.Sql,
  filter: MapStoriesFilter = {},
): Promise<MapStoryFeature[]> {
  const categoryFilter =
    filter.categories && filter.categories.length > 0
      ? sql`and exists (
          select 1
          from story_categories sc
          join categories c on c.id = sc.category_id
          where sc.story_id = s.id
            and c.slug = any(${filter.categories})
        )`
      : sql``;

  const bboxFilter = filter.bbox
    ? sql`and ST_Intersects(
        coalesce(s.geometry, p.geometry),
        ST_MakeEnvelope(
          ${filter.bbox.west},
          ${filter.bbox.south},
          ${filter.bbox.east},
          ${filter.bbox.north},
          4326
        )
      )`
    : sql``;

  const rows = await sql<
    {
      id: string;
      slug: string;
      title: string;
      hook: string;
      category: string | null;
      icon: string | null;
      geometry: GeoJsonPoint;
      shape: GeoJsonGeometry | GeoJsonShape;
      geometry_type: string;
    }[]
  >`
    select
      s.id,
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
      ) as category,
      (
        select c.icon
        from story_categories sc
        join categories c on c.id = sc.category_id
        where sc.story_id = s.id
        order by c.sort_order
        limit 1
      ) as icon,
      ST_AsGeoJSON(
        ST_PointOnSurface(coalesce(s.geometry, p.geometry))
      )::json as geometry,
      ST_AsGeoJSON(coalesce(s.geometry, p.geometry))::json as shape,
      GeometryType(coalesce(s.geometry, p.geometry)) as geometry_type
    from stories s
    left join places p on p.id = s.primary_place_id
    where s.status = 'PUBLISHED'
      and s.verification_status in ('VERIFIED', 'DISPUTED')
      and coalesce(s.geometry, p.geometry) is not null
      ${categoryFilter}
      ${bboxFilter}
  `;

  return rows.map((row) => {
    const geometryType = normalizeGeometryType(row.geometry_type);
    return {
      type: "Feature",
      geometry: asPoint(row.geometry),
      properties: {
        id: row.id,
        slug: row.slug,
        title: row.title,
        hook: row.hook,
        category: row.category,
        icon: row.icon,
        geometryType,
        shape: geometryType === "Point" ? null : asGeometry<GeoJsonShape>(row.shape as GeoJsonShape),
      },
    };
  });
}

export async function listPublishedStories(
  sql: postgres.Sql,
  filter: StoriesBrowseFilter = {},
): Promise<PublishedStorySummary[]> {
  const categoryFilter = filter.category
    ? sql`and exists (
        select 1
        from story_categories sc
        join categories c on c.id = sc.category_id
        where sc.story_id = s.id
          and c.slug = ${filter.category}
      )`
    : sql``;

  const regionFilter = filter.region ? sql`and p.region = ${filter.region}` : sql``;

  const searchFilter = filter.q
    ? sql`and (
        s.title % ${filter.q}
        or s.hook % ${filter.q}
        or p.name % ${filter.q}
        or to_tsvector('english', s.title || ' ' || s.hook)
          @@ websearch_to_tsquery('english', ${filter.q})
      )`
    : sql``;

  const rows = await sql<
    {
      slug: string;
      title: string;
      hook: string;
      date_label: string | null;
      place_name: string | null;
      county: string | null;
      region: string | null;
      categories: { slug: string; name: string }[] | string;
      image: { url: string; altText: string } | string | null;
    }[]
  >`
    select
      s.slug,
      s.title,
      s.hook,
      s.date_label,
      p.name as place_name,
      p.county,
      p.region,
      coalesce(
        (
          select json_agg(json_build_object('slug', c.slug, 'name', c.name) order by c.sort_order)
          from story_categories sc
          join categories c on c.id = sc.category_id
          where sc.story_id = s.id
        ),
        '[]'::json
      ) as categories,
      (
        select json_build_object('url', m.url, 'altText', m.alt_text)
        from media_assets m
        where m.story_id = s.id
          and m.media_type = 'image'
        order by m.id
        limit 1
      ) as image
    from stories s
    left join places p on p.id = s.primary_place_id
    where s.status = 'PUBLISHED'
      and s.verification_status in ('VERIFIED', 'DISPUTED')
      ${categoryFilter}
      ${regionFilter}
      ${searchFilter}
    order by s.title
  `;

  return rows.map((row) => {
    const categories =
      typeof row.categories === "string"
        ? (JSON.parse(row.categories) as { slug: string; name: string }[])
        : row.categories;
    const image =
      typeof row.image === "string"
        ? (JSON.parse(row.image) as { url: string; altText: string })
        : row.image;
    const locationParts = [row.place_name, row.county].filter(Boolean);

    return {
      slug: row.slug,
      title: row.title,
      hook: row.hook,
      locationLabel: locationParts.join(" · ") || "Washington",
      dateLabel: row.date_label,
      region: row.region,
      categories,
      image,
    };
  });
}

export async function listPublishedRegions(sql: postgres.Sql): Promise<string[]> {
  const rows = await sql<{ region: string }[]>`
    select distinct p.region
    from places p
    join stories s on s.primary_place_id = p.id
    where s.status = 'PUBLISHED'
      and s.verification_status in ('VERIFIED', 'DISPUTED')
      and p.region is not null
    order by p.region
  `;

  return rows.map((row) => row.region);
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

  const related = await listRelatedPublishedStories(sql, slug);
  const media = await sql<
    {
      url: string;
      title: string | null;
      creator: string | null;
      source_url: string | null;
      license: string | null;
      license_url: string | null;
      alt_text: string;
      credit_line: string | null;
    }[]
  >`
    select
      m.url,
      m.title,
      m.creator,
      m.source_url,
      m.license,
      m.license_url,
      m.alt_text,
      m.credit_line
    from media_assets m
    join stories s on s.id = m.story_id
    where s.slug = ${slug}
      and m.media_type = 'image'
    order by m.id
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
    related,
    sources: sources.map((source) => ({
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      tier: source.tier,
      sourceType: source.source_type,
      publicationDate: source.publication_date,
    })),
    media: media.map((item) => ({
      url: item.url,
      title: item.title,
      creator: item.creator,
      sourceUrl: item.source_url,
      license: item.license,
      licenseUrl: item.license_url,
      altText: item.alt_text,
      creditLine: item.credit_line,
    })),
  };
}

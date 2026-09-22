export type StorySource = {
  title: string;
  publisher: string;
  url: string;
  tier: string;
  sourceType: string;
  publicationDate: string | null;
};

export type RelatedStory = {
  slug: string;
  title: string;
  hook: string;
  relationshipType: string | null;
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

export type SearchResults = {
  stories: { slug: string; title: string; hook: string; category: string | null }[];
  places: { slug: string; name: string; storySlug: string }[];
  tags: { slug: string; name: string; storySlug: string }[];
  categories: { slug: string; name: string }[];
};

export type MapShapeGeometry =
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "MultiLineString"; coordinates: [number, number][][] }
  | { type: "Polygon"; coordinates: [number, number][][] }
  | { type: "MultiPolygon"; coordinates: [number, number][][][] };

export type MapStoryFeature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    id: string;
    slug: string;
    title: string;
    hook: string;
    category: string | null;
    icon: string | null;
    geometryType: string;
    shape: MapShapeGeometry | null;
  };
};

export type MapStoriesResponse = {
  type: "FeatureCollection";
  features: MapStoryFeature[];
};

export type StorySummary = {
  slug: string;
  title: string;
  hook: string;
  locationLabel: string;
  dateLabel: string | null;
  region: string | null;
  categories: { slug: string; name: string }[];
  image: { url: string; altText: string } | null;
};

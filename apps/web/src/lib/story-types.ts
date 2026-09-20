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

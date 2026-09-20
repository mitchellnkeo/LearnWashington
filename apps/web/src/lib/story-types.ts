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

export type MapStoriesResponse = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: {
      id: string;
      slug: string;
      title: string;
      category: string | null;
    };
  }>;
};

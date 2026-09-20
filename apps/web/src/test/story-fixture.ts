import type { StoryPostcard } from "@/lib/story-types";

export const rainierPostcard: StoryPostcard = {
  slug: "mount-rainier",
  title: "Mount Rainier",
  hook: "The highest Cascade peak is also the most threatening volcano in the range.",
  bodyMd: "USGS places Mount Rainier in Pierce County.",
  locationLabel: "Mount Rainier · Pierce County",
  dateLabel: "last eruption about 1,000 years ago",
  lastReviewedAt: "2026-09-20T00:00:00.000Z",
  latitude: 46.853,
  longitude: -121.76,
  categories: [{ slug: "geography-geology", name: "Geography & Geology" }],
  sources: [
    {
      title: "Mount Rainier",
      publisher: "U.S. Geological Survey",
      url: "https://www.usgs.gov/volcanoes/mount-rainier",
      tier: "S",
      sourceType: "government",
      publicationDate: null,
    },
  ],
  related: [
    {
      slug: "mount-st-helens-1980-eruption",
      title: "Mount St. Helens",
      hook: "On a clear May morning, the north side of the mountain gave way.",
      relationshipType: "same-arc",
    },
  ],
};

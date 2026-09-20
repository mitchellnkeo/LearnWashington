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
  media: [
    {
      url: "/media/mount-rainier-bench-lake.jpg",
      title: "Mount Rainier reflecting in Bench Lake",
      creator: "Steve Redman, National Park Service",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Mt_Rainier_reflecting_in_Bench_Lake._Early_September_2015._(d69f6e3857a44dfc91cc332c1ea5077a).JPG",
      license: "Public domain (U.S. government work)",
      licenseUrl: "https://www.nps.gov/aboutus/disclaimer.htm",
      altText:
        "Snow-covered Mount Rainier reflected in the still water of Bench Lake.",
      creditLine:
        "Photograph by Steve Redman, National Park Service. Public domain.",
    },
  ],
};

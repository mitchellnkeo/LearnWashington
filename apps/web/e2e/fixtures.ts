import { rainierPostcard } from "../src/test/story-fixture";

export const mapStories = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-121.76, 46.853] },
      properties: {
        id: "rainier",
        slug: "mount-rainier",
        title: "Mount Rainier",
        hook: rainierPostcard.hook,
        category: "geography-geology",
        icon: "mountain",
        geometryType: "Point",
        shape: null,
      },
    },
  ],
};

export const searchResults = {
  stories: [
    {
      slug: "mount-rainier",
      title: "Mount Rainier",
      hook: rainierPostcard.hook,
      category: "geography-geology",
    },
  ],
  places: [],
  tags: [],
  categories: [],
};

export { rainierPostcard };

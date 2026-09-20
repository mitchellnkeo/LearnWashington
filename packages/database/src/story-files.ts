import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import type { SeedStory } from "@fwty/shared";

const geometryTypes = new Set([
  "LineString",
  "MultiLineString",
  "Polygon",
  "MultiPolygon",
]);

export async function resolveStoryGeometry(
  story: SeedStory,
  geometriesDir: string,
): Promise<SeedStory> {
  if (story.geometry || !story.geometryFile) {
    return story;
  }

  const filename = basename(story.geometryFile);
  if (filename !== story.geometryFile) {
    throw new Error(`Geometry file must be a basename: ${story.geometryFile}`);
  }

  const raw = JSON.parse(await readFile(resolve(geometriesDir, filename), "utf8")) as {
    type?: string;
    coordinates?: unknown;
  };

  if (!raw.type || !geometryTypes.has(raw.type) || !Array.isArray(raw.coordinates)) {
    throw new Error(`Invalid geometry file: ${filename}`);
  }

  return {
    ...story,
    geometry: {
      type: raw.type as NonNullable<SeedStory["geometry"]>["type"],
      coordinates: raw.coordinates,
    },
  };
}

export function storyGeometryJson(story: SeedStory): string | null {
  if (!story.geometry) {
    return null;
  }

  return JSON.stringify({
    type: story.geometry.type,
    coordinates: story.geometry.coordinates,
  });
}

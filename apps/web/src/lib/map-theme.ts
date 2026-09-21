import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";

/** Fog, fir, and Puget Sound — same family as the postcard tokens. */
export const PNW_MAP = {
  background: "#e3efe6",
  water: "#6fa8bc",
  waterway: "#7eb6c8",
  waterLabel: "#3d6b80",
  park: "#b7d2a6",
  wood: "#8faf78",
  grass: "#c6d9a8",
  sand: "#efe3b8",
  ice: "#dce8ea",
  wetland: "#9ec4b0",
  residential: "#e7efe4",
  building: "#e6d8c4",
  road: "#fffaf2",
  roadCasing: "#d2c3a6",
  highway: "#f3d39a",
  highwayCasing: "#d4a86a",
  rail: "#c4b8a8",
  label: "#355244",
  labelHalo: "#f4f8f4",
  placeLabel: "#24312c",
  boundary: "#7d9484",
} as const;

export type BasemapLayerHint = {
  id: string;
  type: string;
  sourceLayer?: string;
};

export type BasemapPaint = Record<string, string>;

function includesAny(value: string, parts: string[]) {
  return parts.some((part) => value.includes(part));
}

export function basemapPaintForLayer(layer: BasemapLayerHint): BasemapPaint | null {
  const id = layer.id.toLowerCase();
  const source = (layer.sourceLayer ?? "").toLowerCase();
  const key = `${source} ${id}`;

  if (layer.type === "background" || id === "background") {
    return { "background-color": PNW_MAP.background };
  }

  if (layer.type === "fill") {
    if (source === "water" || id === "water") {
      return { "fill-color": PNW_MAP.water };
    }
    if (includesAny(key, ["wood", "forest"])) {
      return { "fill-color": PNW_MAP.wood };
    }
    if (includesAny(key, ["park", "national_park", "garden"])) {
      return { "fill-color": PNW_MAP.park, "fill-outline-color": PNW_MAP.wood };
    }
    if (includesAny(key, ["grass", "meadow", "scrub"])) {
      return { "fill-color": PNW_MAP.grass };
    }
    if (includesAny(key, ["wetland", "marsh"])) {
      return { "fill-color": PNW_MAP.wetland };
    }
    if (includesAny(key, ["sand", "beach"])) {
      return { "fill-color": PNW_MAP.sand };
    }
    if (includesAny(key, ["ice", "glacier", "snow"])) {
      return { "fill-color": PNW_MAP.ice };
    }
    if (includesAny(key, ["building"])) {
      return { "fill-color": PNW_MAP.building };
    }
    if (includesAny(key, ["residential", "landuse", "suburb", "pitch", "track", "cemetery", "school"])) {
      return { "fill-color": PNW_MAP.residential };
    }
    if (includesAny(key, ["aeroway"])) {
      return { "fill-color": PNW_MAP.residential };
    }
  }

  if (layer.type === "fill-extrusion" && includesAny(key, ["building"])) {
    return { "fill-extrusion-color": PNW_MAP.building };
  }

  if (layer.type === "line") {
    if (source === "waterway" || includesAny(id, ["waterway"])) {
      return { "line-color": PNW_MAP.waterway };
    }
    if (source === "boundary" || includesAny(id, ["boundary"])) {
      return { "line-color": PNW_MAP.boundary };
    }
    if (includesAny(key, ["rail"])) {
      return { "line-color": PNW_MAP.rail };
    }
    if (includesAny(id, ["casing"])) {
      if (includesAny(id, ["motorway", "trunk"])) {
        return { "line-color": PNW_MAP.highwayCasing };
      }
      return { "line-color": PNW_MAP.roadCasing };
    }
    if (includesAny(key, ["motorway", "trunk"])) {
      return { "line-color": PNW_MAP.highway };
    }
    if (includesAny(key, ["road", "street", "path", "link", "secondary", "tertiary", "primary", "bridge", "tunnel", "aeroway"])) {
      return { "line-color": includesAny(id, ["path", "pedestrian"]) ? PNW_MAP.sand : PNW_MAP.road };
    }
  }

  if (layer.type === "symbol") {
    if (includesAny(key, ["water"])) {
      return { "text-color": PNW_MAP.waterLabel, "text-halo-color": PNW_MAP.labelHalo };
    }
    if (includesAny(key, ["place", "label_city", "label_town", "label_village", "label_state", "label_country"])) {
      return { "text-color": PNW_MAP.placeLabel, "text-halo-color": PNW_MAP.labelHalo };
    }
    return { "text-color": PNW_MAP.label, "text-halo-color": PNW_MAP.labelHalo };
  }

  return null;
}

function isStoryLayer(id: string) {
  return id.startsWith("story-");
}

export function applyPacificNorthwestBasemap(map: MapLibreMap) {
  const style = map.getStyle() as StyleSpecification | undefined;
  if (!style?.layers) {
    return;
  }

  for (const layer of style.layers) {
    if (isStoryLayer(layer.id)) {
      continue;
    }

    const paint = basemapPaintForLayer({
      id: layer.id,
      type: layer.type,
      sourceLayer: "source-layer" in layer ? layer["source-layer"] : undefined,
    });
    if (!paint) {
      continue;
    }

    for (const [property, value] of Object.entries(paint)) {
      try {
        map.setPaintProperty(layer.id, property, value);
      } catch {
        // Layer type may not accept this paint property.
      }
    }
  }
}

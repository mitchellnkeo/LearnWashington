import { MVP_CATEGORIES } from "./enums";

const knownCategories = new Set<string>(
  MVP_CATEGORIES.map((category) => category.slug),
);

export type MapBBox = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type MapStoriesQuery = {
  bbox?: MapBBox;
  categories: string[];
  zoom?: number;
};

export type MapQueryIssue = {
  field: string;
  message: string;
};

const MAX_BBOX_SPAN = 20;

export function parseBBox(value: string | null | undefined): MapBBox | MapQueryIssue {
  if (!value?.trim()) {
    return { field: "bbox", message: "bbox is required." };
  }

  const parts = value.split(",").map((part) => Number(part.trim()));
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return { field: "bbox", message: "bbox must be west,south,east,north." };
  }

  const [west, south, east, north] = parts;
  if (west < -180 || east > 180 || south < -90 || north > 90) {
    return { field: "bbox", message: "bbox values are outside valid longitude/latitude." };
  }
  if (west >= east || south >= north) {
    return { field: "bbox", message: "bbox must have west < east and south < north." };
  }
  if (east - west > MAX_BBOX_SPAN || north - south > MAX_BBOX_SPAN) {
    return { field: "bbox", message: "bbox is larger than the supported map window." };
  }

  return { west, south, east, north };
}

export function parseCategories(
  value: string | null | undefined,
): string[] | MapQueryIssue {
  if (!value?.trim()) {
    return [];
  }

  const categories = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const unknown = categories.find((category) => !knownCategories.has(category));
  if (unknown) {
    return { field: "categories", message: `Unknown category: ${unknown}` };
  }

  return [...new Set(categories)];
}

export function parseZoom(value: string | null | undefined): number | undefined | MapQueryIssue {
  if (!value?.trim()) {
    return undefined;
  }

  const zoom = Number(value);
  if (!Number.isFinite(zoom) || zoom < 0 || zoom > 22) {
    return { field: "zoom", message: "zoom must be a number between 0 and 22." };
  }

  return zoom;
}

export function isMapQueryIssue(value: unknown): value is MapQueryIssue {
  return Boolean(value && typeof value === "object" && "field" in value && "message" in value);
}

export function parseMapStoriesQuery(searchParams: URLSearchParams): MapStoriesQuery | MapQueryIssue {
  const bboxValue = searchParams.get("bbox");
  const bbox = bboxValue ? parseBBox(bboxValue) : undefined;
  if (bbox && isMapQueryIssue(bbox)) {
    return bbox;
  }

  const categories = parseCategories(searchParams.get("categories"));
  if (isMapQueryIssue(categories)) {
    return categories;
  }

  const zoom = parseZoom(searchParams.get("zoom"));
  if (isMapQueryIssue(zoom)) {
    return zoom;
  }

  return {
    bbox,
    categories,
    zoom,
  };
}

export function formatBBox(bbox: MapBBox): string {
  return `${bbox.west.toFixed(5)},${bbox.south.toFixed(5)},${bbox.east.toFixed(5)},${bbox.north.toFixed(5)}`;
}

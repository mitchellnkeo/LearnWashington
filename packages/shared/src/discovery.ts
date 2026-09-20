export type SearchQuery = {
  q: string;
};

export type NearbyQuery = {
  latitude: number;
  longitude: number;
  radiusKm: number;
  category?: string;
};

export type DiscoveryIssue = {
  field: string;
  message: string;
};

const MIN_SEARCH = 2;
const MAX_SEARCH = 80;
const DEFAULT_RADIUS_KM = 50;
const MAX_RADIUS_KM = 250;
const MAX_EXCLUDES = 20;

export function isDiscoveryIssue(value: unknown): value is DiscoveryIssue {
  return Boolean(value && typeof value === "object" && "field" in value && "message" in value);
}

export function parseSearchQuery(value: string | null | undefined): SearchQuery | DiscoveryIssue {
  const q = value?.trim() ?? "";
  if (q.length < MIN_SEARCH) {
    return { field: "q", message: "Search needs at least two characters." };
  }
  if (q.length > MAX_SEARCH) {
    return { field: "q", message: "Search is too long." };
  }
  return { q };
}

export function parseExcludeStoryIds(value: string | null | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }

  return [
    ...new Set(
      value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  ].slice(0, MAX_EXCLUDES);
}

export function parseNearbyQuery(searchParams: URLSearchParams): NearbyQuery | DiscoveryIssue {
  const latValue = searchParams.get("lat");
  const lngValue = searchParams.get("lng");
  const latitude = Number(latValue);
  const longitude = Number(lngValue);
  if (latValue === null || latValue.trim() === "" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return { field: "lat", message: "lat must be a valid latitude." };
  }
  if (lngValue === null || lngValue.trim() === "" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { field: "lng", message: "lng must be a valid longitude." };
  }

  const radiusValue = searchParams.get("radiusKm");
  const radiusKm = radiusValue ? Number(radiusValue) : DEFAULT_RADIUS_KM;
  if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > MAX_RADIUS_KM) {
    return { field: "radiusKm", message: `radiusKm must be between 0 and ${MAX_RADIUS_KM}.` };
  }

  const category = searchParams.get("category")?.trim() || undefined;

  return { latitude, longitude, radiusKm, category };
}

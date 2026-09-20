import { formatBBox, type MapBBox } from "@fwty/shared";

export type MapViewState = {
  lat?: number;
  lng?: number;
  zoom?: number;
  story?: string | null;
  category?: string | null;
};

export function readMapView(searchParams: URLSearchParams): MapViewState {
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const zoom = Number(searchParams.get("zoom"));

  return {
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
    zoom: Number.isFinite(zoom) ? zoom : undefined,
    story: searchParams.get("story"),
    category: searchParams.get("category"),
  };
}

export function writeMapView(
  current: URLSearchParams,
  next: MapViewState,
): string {
  const params = new URLSearchParams(current.toString());

  if (next.lat !== undefined && next.lng !== undefined) {
    params.set("lat", next.lat.toFixed(5));
    params.set("lng", next.lng.toFixed(5));
  }
  if (next.zoom !== undefined) {
    params.set("zoom", next.zoom.toFixed(2));
  }
  if (next.story) {
    params.set("story", next.story);
  } else if (next.story === null) {
    params.delete("story");
  }
  if (next.category) {
    params.set("category", next.category);
  } else if (next.category === null) {
    params.delete("category");
  }

  return params.toString();
}

export function mapStoriesUrl(input: {
  bbox?: MapBBox;
  category?: string | null;
  zoom?: number;
}): string {
  const params = new URLSearchParams();
  if (input.bbox) {
    params.set("bbox", formatBBox(input.bbox));
  }
  if (input.category) {
    params.set("categories", input.category);
  }
  if (input.zoom !== undefined) {
    params.set("zoom", String(input.zoom));
  }
  const query = params.toString();
  return query ? `/api/map/stories?${query}` : "/api/map/stories";
}

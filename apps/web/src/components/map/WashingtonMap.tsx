"use client";

import {
  DEFAULT_CATEGORY_COLOR,
  MVP_CATEGORIES,
  type MapBBox,
} from "@fwty/shared";
import maplibregl, { type GeoJSONSource, type MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useRef } from "react";
import { debounce } from "@/lib/debounce";
import {
  DEFAULT_MAP_STYLE,
  WASHINGTON_BOUNDS,
  WASHINGTON_CENTER,
} from "@/lib/geo";
import type { MapStoriesResponse, MapStoryFeature } from "@/lib/story-types";
import "maplibre-gl/dist/maplibre-gl.css";

type WashingtonMapProps = {
  stories: MapStoriesResponse;
  selectedSlug: string | null;
  selectedCenter?: [number, number];
  initialView?: { center: [number, number]; zoom: number };
  onSelectSlug: (slug: string) => void;
  onViewChange?: (view: {
    center: [number, number];
    zoom: number;
    bbox: MapBBox;
  }) => void;
};

const MARKER_SOURCE = "stories";
const SHAPE_SOURCE = "story-shapes";

function categoryColorExpression() {
  const expression: Array<string | string[]> = ["match", ["get", "category"]];
  for (const category of MVP_CATEGORIES) {
    expression.push(category.slug, category.color);
  }
  expression.push(DEFAULT_CATEGORY_COLOR);
  return expression;
}

function toShapeCollection(stories: MapStoriesResponse) {
  return {
    type: "FeatureCollection" as const,
    features: stories.features
      .filter((feature) => feature.properties.shape)
      .map((feature) => ({
        type: "Feature" as const,
        id: feature.properties.slug,
        geometry: feature.properties.shape,
        properties: {
          id: feature.properties.id,
          slug: feature.properties.slug,
          category: feature.properties.category,
        },
      })),
  };
}

function markerCollection(stories: MapStoriesResponse) {
  return {
    type: "FeatureCollection" as const,
    features: stories.features.map((feature: MapStoryFeature) => ({
      ...feature,
      id: feature.properties.slug,
    })),
  };
}

export function WashingtonMap({
  stories,
  selectedSlug,
  selectedCenter,
  initialView,
  onSelectSlug,
  onViewChange,
}: WashingtonMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onSelectRef = useRef(onSelectSlug);
  const onViewChangeRef = useRef(onViewChange);
  const initialViewRef = useRef(initialView);
  const storiesRef = useRef(stories);
  const selectedOnMount = useRef(selectedSlug);
  const skipInitialFly = useRef(Boolean(selectedSlug));

  useEffect(() => {
    onSelectRef.current = onSelectSlug;
  }, [onSelectSlug]);

  useEffect(() => {
    onViewChangeRef.current = onViewChange;
  }, [onViewChange]);

  useEffect(() => {
    storiesRef.current = stories;
  }, [stories]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) {
      return;
    }

    const startingView = initialViewRef.current;
    const map = new maplibregl.Map({
      container,
      style: process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_MAP_STYLE,
      center: startingView?.center ?? WASHINGTON_CENTER,
      zoom: startingView?.zoom ?? 6.1,
      maxBounds: [
        [WASHINGTON_BOUNDS[0][0] - 1.2, WASHINGTON_BOUNDS[0][1] - 0.8],
        [WASHINGTON_BOUNDS[1][0] + 1.2, WASHINGTON_BOUNDS[1][1] + 0.6],
      ],
      attributionControl: { compact: true },
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );
    mapRef.current = map;

    map.on("load", () => {
      if (startingView) {
        return;
      }

      const openingSlug = selectedOnMount.current;
      const openingFeature = openingSlug
        ? storiesRef.current.features.find(
            (item) => item.properties.slug === openingSlug,
          )
        : undefined;

      if (openingFeature) {
        map.jumpTo({
          center: openingFeature.geometry.coordinates,
          zoom: Math.max(map.getZoom(), 8.5),
        });
        return;
      }

      map.fitBounds(WASHINGTON_BOUNDS, { padding: 48, duration: 0 });
    });

    const emitView = debounce(() => {
      const bounds = map.getBounds();
      const center = map.getCenter();
      onViewChangeRef.current?.({
        center: [center.lng, center.lat],
        zoom: map.getZoom(),
        bbox: {
          west: bounds.getWest(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          north: bounds.getNorth(),
        },
      });
    }, 350);
    map.on("moveend", emitView);

    return () => {
      emitView.cancel();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    function applyStories(nextMap: maplibregl.Map) {
      const markers = markerCollection(stories);
      const shapes = toShapeCollection(stories);
      const existingMarkers = nextMap.getSource(MARKER_SOURCE);
      const existingShapes = nextMap.getSource(SHAPE_SOURCE);

      if (existingMarkers && existingShapes) {
        (existingMarkers as GeoJSONSource).setData(markers);
        (existingShapes as GeoJSONSource).setData(shapes);
        return;
      }

      nextMap.addSource(SHAPE_SOURCE, {
        type: "geojson",
        data: shapes,
        promoteId: "slug",
      });
      nextMap.addSource(MARKER_SOURCE, {
        type: "geojson",
        data: markers,
        cluster: true,
        clusterRadius: 42,
        promoteId: "slug",
      });

      nextMap.addLayer({
        id: "story-polygons-fill",
        type: "fill",
        source: SHAPE_SOURCE,
        filter: ["match", ["geometry-type"], ["Polygon", "MultiPolygon"], true, false],
        paint: {
          "fill-color": categoryColorExpression() as never,
          "fill-opacity": 0.22,
        },
      });

      nextMap.addLayer({
        id: "story-shapes-line",
        type: "line",
        source: SHAPE_SOURCE,
        paint: {
          "line-color": categoryColorExpression() as never,
          "line-width": 3,
        },
      });

      nextMap.addLayer({
        id: "story-clusters",
        type: "circle",
        source: MARKER_SOURCE,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#4d6f5c",
          "circle-radius": 16,
          "circle-stroke-width": 3,
          "circle-stroke-color": "#fbfcfb",
        },
      });

      nextMap.addLayer({
        id: "story-cluster-count",
        type: "symbol",
        source: MARKER_SOURCE,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#fbfcfb",
        },
      });

      nextMap.addLayer({
        id: "story-points",
        type: "circle",
        source: MARKER_SOURCE,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": categoryColorExpression() as never,
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            12,
            8,
          ],
          "circle-stroke-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            4,
            2.5,
          ],
          "circle-stroke-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#3d6b80",
            "#fbfcfb",
          ],
        },
      });

      nextMap.on("click", "story-clusters", (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== "Point") {
          return;
        }

        const source = nextMap.getSource(MARKER_SOURCE) as GeoJSONSource | undefined;
        const clusterId = feature.properties?.cluster_id;
        if (!source || typeof clusterId !== "number") {
          return;
        }

        void source.getClusterExpansionZoom(clusterId).then((zoom: number) => {
          nextMap.easeTo({
            center: feature.geometry.coordinates as [number, number],
            zoom,
          });
        });
      });

      function selectFromEvent(event: MapLayerMouseEvent) {
        const slug = event.features?.[0]?.properties?.slug;
        if (typeof slug === "string") {
          onSelectRef.current(slug);
        }
      }

      nextMap.on("click", "story-points", selectFromEvent);
      nextMap.on("click", "story-shapes-line", selectFromEvent);
      nextMap.on("click", "story-polygons-fill", selectFromEvent);

      for (const layer of ["story-points", "story-shapes-line", "story-polygons-fill"]) {
        nextMap.on("mouseenter", layer, () => {
          nextMap.getCanvas().style.cursor = "pointer";
        });
        nextMap.on("mouseleave", layer, () => {
          nextMap.getCanvas().style.cursor = "";
        });
      }
    }

    if (map.isStyleLoaded()) {
      applyStories(map);
    } else {
      map.once("load", () => applyStories(map));
    }
  }, [stories]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource(MARKER_SOURCE)) {
      return;
    }

    for (const feature of stories.features) {
      map.setFeatureState(
        { source: MARKER_SOURCE, id: feature.properties.slug },
        { selected: feature.properties.slug === selectedSlug },
      );
    }
  }, [selectedSlug, stories]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSlug) {
      return;
    }
    if (skipInitialFly.current) {
      skipInitialFly.current = false;
      return;
    }

    const feature = storiesRef.current.features.find(
      (item) => item.properties.slug === selectedSlug,
    );
    const center = feature?.geometry.coordinates ?? selectedCenter;
    if (!center) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.easeTo({
      center,
      zoom: Math.max(map.getZoom(), 8.5),
      duration: reduceMotion ? 0 : 800,
    });
  }, [selectedCenter, selectedSlug]);

  return <div ref={containerRef} className="h-full w-full touch-none" />;
}

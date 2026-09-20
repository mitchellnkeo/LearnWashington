"use client";

import maplibregl, { type GeoJSONSource } from "maplibre-gl";
import { useEffect, useRef } from "react";
import {
  DEFAULT_MAP_STYLE,
  WASHINGTON_BOUNDS,
  WASHINGTON_CENTER,
} from "@/lib/geo";
import type { MapStoriesResponse } from "@/lib/story-types";
import "maplibre-gl/dist/maplibre-gl.css";

type WashingtonMapProps = {
  stories: MapStoriesResponse;
  selectedSlug: string | null;
  onSelectSlug: (slug: string) => void;
};

const SOURCE_ID = "stories";

export function WashingtonMap({
  stories,
  selectedSlug,
  onSelectSlug,
}: WashingtonMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onSelectRef = useRef(onSelectSlug);

  useEffect(() => {
    onSelectRef.current = onSelectSlug;
  }, [onSelectSlug]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container,
      style: process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_MAP_STYLE,
      center: WASHINGTON_CENTER,
      zoom: 6.1,
      maxBounds: [
        [WASHINGTON_BOUNDS[0][0] - 1.2, WASHINGTON_BOUNDS[0][1] - 0.8],
        [WASHINGTON_BOUNDS[1][0] + 1.2, WASHINGTON_BOUNDS[1][1] + 0.6],
      ],
      attributionControl: { compact: true },
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-left",
    );
    mapRef.current = map;

    map.on("load", () => {
      map.fitBounds(WASHINGTON_BOUNDS, { padding: 48, duration: 0 });
    });

    return () => {
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
      const existing = nextMap.getSource(SOURCE_ID);
      if (existing) {
        (existing as GeoJSONSource).setData(stories);
        return;
      }

      nextMap.addSource(SOURCE_ID, {
        type: "geojson",
        data: stories,
        cluster: true,
        clusterRadius: 42,
      });

      nextMap.addLayer({
        id: "story-clusters",
        type: "circle",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#6b4f3a",
          "circle-radius": 16,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#f4efe6",
        },
      });

      nextMap.addLayer({
        id: "story-cluster-count",
        type: "symbol",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#f4efe6",
        },
      });

      nextMap.addLayer({
        id: "story-points",
        type: "circle",
        source: SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#8a3b2a",
          "circle-radius": 7,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#f4efe6",
        },
      });

      nextMap.on("click", "story-clusters", (event) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== "Point") {
          return;
        }

        const source = nextMap.getSource(SOURCE_ID) as GeoJSONSource | undefined;
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

      nextMap.on("click", "story-points", (event) => {
        const slug = event.features?.[0]?.properties?.slug;
        if (typeof slug === "string") {
          onSelectRef.current(slug);
        }
      });

      nextMap.on("mouseenter", "story-points", () => {
        nextMap.getCanvas().style.cursor = "pointer";
      });
      nextMap.on("mouseleave", "story-points", () => {
        nextMap.getCanvas().style.cursor = "";
      });
    }

    if (map.isStyleLoaded()) {
      applyStories(map);
    } else {
      map.once("load", () => applyStories(map));
    }
  }, [stories]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSlug) {
      return;
    }

    const feature = stories.features.find(
      (item) => item.properties.slug === selectedSlug,
    );
    if (!feature) {
      return;
    }

    map.easeTo({
      center: feature.geometry.coordinates,
      zoom: Math.max(map.getZoom(), 8.5),
    });
  }, [selectedSlug, stories]);

  return <div ref={containerRef} className="h-full w-full" />;
}

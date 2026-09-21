import {
  DEFAULT_CATEGORY_COLOR,
  MVP_CATEGORIES,
} from "@fwty/shared";
import type { Map as MapLibreMap } from "maplibre-gl";
import { categoryIconMarkup } from "./category-icons";

export const CATEGORY_MARKER_PIXEL_RATIO = 2;

const MARKER_CREAM = "#fffaf2";

function darkenHex(hex: string, amount = 0.16) {
  const value = hex.replace("#", "");
  const channel = (start: number) => {
    const raw = Number.parseInt(value.slice(start, start + 2), 16);
    return Math.max(0, Math.round(raw * (1 - amount)));
  };
  return `rgb(${channel(0)}, ${channel(2)}, ${channel(4)})`;
}

export function categoryMarkerImageId(category: string | null | undefined) {
  const match = MVP_CATEGORIES.find((item) => item.slug === category);
  return `category-${match?.slug ?? "default"}`;
}

export function categoryIconImageExpression() {
  const expression: Array<string | string[]> = ["match", ["get", "category"]];
  for (const category of MVP_CATEGORIES) {
    expression.push(category.slug, categoryMarkerImageId(category.slug));
  }
  expression.push(categoryMarkerImageId(null));
  return expression;
}

export function categoryMarkerSvg(icon: string, color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <circle cx="40" cy="40" r="31" fill="${color}" stroke="${MARKER_CREAM}" stroke-width="5"/>
  <g fill="${MARKER_CREAM}" transform="translate(20 20) scale(1.67)">
    ${categoryIconMarkup(icon, color)}
  </g>
</svg>`;
}

function loadSvgImage(svg: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load category marker"));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

export async function addCategoryMarkerImages(map: MapLibreMap) {
  const markers = [
    ...MVP_CATEGORIES,
    {
      slug: "default",
      icon: "leaf",
      color: DEFAULT_CATEGORY_COLOR,
    },
  ];

  await Promise.all(
    markers.map(async (category) => {
      const id = `category-${category.slug}`;
      if (map.hasImage(id)) {
        return;
      }

      const image = await loadSvgImage(
        categoryMarkerSvg(category.icon, darkenHex(category.color)),
      );
      if (!map.getStyle() || map.hasImage(id)) {
        return;
      }

      map.addImage(id, image, { pixelRatio: CATEGORY_MARKER_PIXEL_RATIO });
    }),
  );
}

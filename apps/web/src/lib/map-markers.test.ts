import { MVP_CATEGORIES } from "@fwty/shared";
import { describe, expect, it } from "vitest";
import { categoryIconMarkup } from "./category-icons";
import {
  categoryIconImageExpression,
  categoryMarkerImageId,
  categoryMarkerSvg,
} from "./map-markers";

describe("map category markers", () => {
  it("gives each category its own image id", () => {
    expect(categoryMarkerImageId("wildlife-ecology")).toBe(
      "category-wildlife-ecology",
    );
    expect(categoryMarkerImageId("unknown")).toBe("category-default");
    expect(categoryMarkerImageId(null)).toBe("category-default");
  });

  it("matches GeoJSON category values to marker images", () => {
    const expression = categoryIconImageExpression();
    expect(expression[0]).toBe("match");
    expect(expression).toContain("wildlife-ecology");
    expect(expression).toContain("category-wildlife-ecology");
    expect(expression.at(-1)).toBe("category-default");
  });

  it("paints wildlife markers with a fish on the category color", () => {
    const wildlife = MVP_CATEGORIES.find((item) => item.slug === "wildlife-ecology");
    expect(wildlife?.icon).toBe("fish");
    expect(wildlife).toBeDefined();

    const svg = categoryMarkerSvg(wildlife!.icon, wildlife!.color);
    expect(svg).toContain(wildlife!.color);
    expect(svg).toContain(categoryIconMarkup("fish"));
  });
});

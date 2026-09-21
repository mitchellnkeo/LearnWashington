import { describe, expect, it } from "vitest";
import { PNW_MAP, basemapPaintForLayer } from "./map-theme";

describe("basemapPaintForLayer", () => {
  it("paints land as moss and water as Puget Sound teal", () => {
    expect(basemapPaintForLayer({ id: "background", type: "background" })).toEqual({
      "background-color": PNW_MAP.background,
    });
    expect(
      basemapPaintForLayer({ id: "water", type: "fill", sourceLayer: "water" }),
    ).toEqual({ "fill-color": PNW_MAP.water });
    expect(
      basemapPaintForLayer({
        id: "landcover_wood",
        type: "fill",
        sourceLayer: "landcover",
      }),
    ).toEqual({ "fill-color": PNW_MAP.wood });
  });

  it("keeps highways cream-gold and labels fir-green", () => {
    expect(
      basemapPaintForLayer({
        id: "road_motorway",
        type: "line",
        sourceLayer: "transportation",
      }),
    ).toEqual({ "line-color": PNW_MAP.highway });
    expect(
      basemapPaintForLayer({
        id: "label_city",
        type: "symbol",
        sourceLayer: "place",
      }),
    ).toEqual({
      "text-color": PNW_MAP.placeLabel,
      "text-halo-color": PNW_MAP.labelHalo,
    });
  });
});

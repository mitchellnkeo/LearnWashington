import { describe, expect, it } from "vitest";
import {
  isDiscoveryIssue,
  parseExcludeStoryIds,
  parseNearbyQuery,
  parseSearchQuery,
} from "./discovery";

describe("parseSearchQuery", () => {
  it("accepts a short place name", () => {
    expect(parseSearchQuery("  rainier ")).toEqual({ q: "rainier" });
  });

  it("rejects empty or one-character queries", () => {
    expect(isDiscoveryIssue(parseSearchQuery(""))).toBe(true);
    expect(isDiscoveryIssue(parseSearchQuery("r"))).toBe(true);
  });
});

describe("parseExcludeStoryIds", () => {
  it("dedupes and caps the recent list", () => {
    expect(parseExcludeStoryIds("elwha-river-restoration,elwha-river-restoration,")).toEqual([
      "elwha-river-restoration",
    ]);
  });
});

describe("parseNearbyQuery", () => {
  it("defaults the radius", () => {
    expect(parseNearbyQuery(new URLSearchParams("lat=47.6&lng=-122.3"))).toEqual({
      latitude: 47.6,
      longitude: -122.3,
      radiusKm: 50,
      category: undefined,
    });
  });

  it("rejects a missing coordinate", () => {
    expect(isDiscoveryIssue(parseNearbyQuery(new URLSearchParams("lng=-122.3")))).toBe(
      true,
    );
  });
});

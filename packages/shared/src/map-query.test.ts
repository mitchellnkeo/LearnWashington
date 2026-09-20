import { describe, expect, it } from "vitest";
import {
  formatBBox,
  isMapQueryIssue,
  parseBBox,
  parseMapStoriesQuery,
} from "./map-query";

describe("parseBBox", () => {
  it("accepts a Washington window", () => {
    expect(parseBBox("-124.9,45.5,-116.7,49.05")).toEqual({
      west: -124.9,
      south: 45.5,
      east: -116.7,
      north: 49.05,
    });
  });

  it("rejects inverted or malformed envelopes", () => {
    expect(isMapQueryIssue(parseBBox("-116.7,45.5,-124.9,49.05"))).toBe(true);
    expect(isMapQueryIssue(parseBBox("not-a-bbox"))).toBe(true);
  });
});

describe("parseMapStoriesQuery", () => {
  it("allows an unfiltered payload", () => {
    expect(parseMapStoriesQuery(new URLSearchParams())).toEqual({
      bbox: undefined,
      categories: [],
      zoom: undefined,
    });
  });

  it("parses bbox, categories, and zoom together", () => {
    const query = parseMapStoriesQuery(
      new URLSearchParams(
        "bbox=-123.8,47.7,-123.3,48.2&categories=wildlife-ecology,history&zoom=9",
      ),
    );

    expect(query).toEqual({
      bbox: {
        west: -123.8,
        south: 47.7,
        east: -123.3,
        north: 48.2,
      },
      categories: ["wildlife-ecology", "history"],
      zoom: 9,
    });
  });

  it("rejects an unknown category", () => {
    const query = parseMapStoriesQuery(new URLSearchParams("categories=not-real"));
    expect(isMapQueryIssue(query)).toBe(true);
  });
});

describe("formatBBox", () => {
  it("round-trips a compact envelope", () => {
    expect(
      formatBBox({ west: -122.1, south: 46.2, east: -121.9, north: 46.4 }),
    ).toBe("-122.10000,46.20000,-121.90000,46.40000");
  });
});

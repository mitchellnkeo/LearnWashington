import { describe, expect, it } from "vitest";
import { parseStoriesBrowseQuery } from "./browse";

describe("parseStoriesBrowseQuery", () => {
  it("keeps a known category and a long enough query", () => {
    expect(
      parseStoriesBrowseQuery(
        new URLSearchParams("q=rainier&category=geography-geology&region=Cascades"),
      ),
    ).toEqual({
      q: "rainier",
      category: "geography-geology",
      region: "Cascades",
    });
  });

  it("drops one-character queries and unknown categories", () => {
    expect(parseStoriesBrowseQuery(new URLSearchParams("q=r&category=not-real"))).toEqual({
      q: undefined,
      category: undefined,
      region: undefined,
    });
  });
});

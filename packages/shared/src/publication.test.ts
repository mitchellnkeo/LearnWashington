import { describe, expect, it } from "vitest";
import { checkPublicationGates, checkSeedStory, isPubliclyQueryable } from "./publication";
import type { SeedStory } from "./seed-schema";

function story(overrides: Partial<SeedStory> = {}): SeedStory {
  return {
    slug: "mount-st-helens-1980-eruption",
    title: "Mount St. Helens",
    hook: "The north side of the mountain gave way.",
    body: "A sourced body.",
    status: "PUBLISHED",
    verificationStatus: "VERIFIED",
    startDate: "1980-05-18",
    datePrecision: "day",
    location: {
      name: "Mount St. Helens",
      slug: "mount-st-helens",
      placeType: "volcano",
      latitude: 46.2,
      longitude: -122.18,
      county: "Skamania County",
    },
    categories: ["geography-geology"],
    tags: [],
    claims: [
      {
        text: "The eruption was on May 18, 1980.",
        claimType: "historical",
        confidence: "verified",
        sources: ["usgs-msh"],
      },
    ],
    sources: [
      {
        id: "usgs-msh",
        title: "Mount St. Helens",
        publisher: "U.S. Geological Survey",
        url: "https://www.usgs.gov/volcanoes/mount-st.-helens",
        sourceType: "government",
        tier: "S",
        accessedAt: "2026-09-20",
      },
    ],
    media: [],
    relatedStories: [],
    ...overrides,
  };
}

describe("isPubliclyQueryable", () => {
  it("allows published verified stories", () => {
    expect(isPubliclyQueryable(story())).toBe(true);
  });

  it("allows published disputed stories", () => {
    expect(
      isPubliclyQueryable(story({ verificationStatus: "DISPUTED" })),
    ).toBe(true);
  });

  it("hides drafts and unverified published rows", () => {
    expect(isPubliclyQueryable(story({ status: "DRAFT" }))).toBe(false);
    expect(
      isPubliclyQueryable(story({ verificationStatus: "UNVERIFIED" })),
    ).toBe(false);
  });
});

describe("checkPublicationGates", () => {
  it("accepts a complete published story", () => {
    expect(checkPublicationGates(story()).filter((issue) => issue.level === "error")).toEqual(
      [],
    );
  });

  it("requires a qualifying source for publication", () => {
    const issues = checkPublicationGates(
      story({
        sources: [
          {
            id: "wiki",
            title: "Wikipedia",
            publisher: "Wikimedia",
            url: "https://en.wikipedia.org/wiki/Mount_St._Helens",
            sourceType: "other",
            tier: "D",
            accessedAt: "2026-09-20",
          },
        ],
      }),
    );

    expect(issues.some((issue) => issue.code === "no-qualifying-source")).toBe(true);
  });

  it("rejects a story that relates to itself", () => {
    const issues = checkPublicationGates(
      story({
        relatedStories: [{ slug: "mount-st-helens-1980-eruption" }],
      }),
    );

    expect(issues.some((issue) => issue.code === "self-related")).toBe(true);
  });
});

describe("checkSeedStory", () => {
  it("flags coordinates outside Washington", () => {
    const issues = checkSeedStory(
      story({
        location: {
          name: "Portland",
          slug: "portland",
          placeType: "city",
          latitude: 45.4,
          longitude: -122.678,
        },
      }),
    );

    expect(issues.some((issue) => issue.code === "outside-washington")).toBe(true);
  });

  it("warns on Tier D sources", () => {
    const issues = checkSeedStory(
      story({
        sources: [
          {
            id: "usgs-msh",
            title: "Mount St. Helens",
            publisher: "U.S. Geological Survey",
            url: "https://www.usgs.gov/volcanoes/mount-st.-helens",
            sourceType: "government",
            tier: "S",
            accessedAt: "2026-09-20",
          },
          {
            id: "blog",
            title: "A blog",
            publisher: "Example",
            url: "https://example.com/post",
            sourceType: "other",
            tier: "D",
            accessedAt: "2026-09-20",
          },
        ],
      }),
    );

    expect(issues.some((issue) => issue.code === "tier-d-source")).toBe(true);
  });

  it("rejects unknown claim sources and duplicate links", () => {
    const issues = checkSeedStory(
      story({
        claims: [
          {
            text: "A claim.",
            claimType: "factual",
            confidence: "verified",
            sources: ["missing-source", "usgs-msh", "usgs-msh"],
          },
        ],
      }),
    );

    expect(issues.some((issue) => issue.code === "unknown-claim-source")).toBe(true);
    expect(issues.some((issue) => issue.code === "duplicate-claim-source")).toBe(true);
  });

  it("warns when media alt text is only a label", () => {
    const issues = checkSeedStory(
      story({
        media: [
          {
            url: "https://example.com/photo.jpg",
            mediaType: "image",
            creator: "USGS",
            sourceUrl: "https://www.usgs.gov/",
            license: "public-domain",
            altText: "Volcano",
            creditLine: "USGS",
          },
        ],
      }),
    );

    expect(issues.some((issue) => issue.code === "thin-alt-text")).toBe(true);
  });
});

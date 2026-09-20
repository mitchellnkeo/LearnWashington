import { MVP_CATEGORIES, QUALIFYING_SOURCE_TIERS } from "./enums";
import { dateMatchesPrecision } from "./date-label";
import { isInsideWashington } from "./geo";
import { claimSourceId, type SeedStory } from "./seed-schema";

export type ContentIssue = {
  code: string;
  message: string;
  level: "error" | "warning";
};

const knownCategorySlugs = new Set(MVP_CATEGORIES.map((category) => category.slug));

export function isPubliclyQueryable(story: {
  status: string;
  verificationStatus: string;
}): boolean {
  return (
    story.status === "PUBLISHED" &&
    (story.verificationStatus === "VERIFIED" ||
      story.verificationStatus === "DISPUTED")
  );
}

export function checkPublicationGates(story: SeedStory): ContentIssue[] {
  const issues: ContentIssue[] = [];

  if (!story.title.trim()) {
    issues.push({
      code: "missing-title",
      message: "Published stories need a title.",
      level: "error",
    });
  }

  if (!story.location) {
    issues.push({
      code: "missing-place",
      message: "Published stories need a place or geometry.",
      level: "error",
    });
  }

  if (story.sources.length < 1) {
    issues.push({
      code: "missing-source",
      message: "Published stories need at least one source.",
      level: "error",
    });
  }

  const hasQualifyingSource = story.sources.some((source) =>
    (QUALIFYING_SOURCE_TIERS as readonly string[]).includes(source.tier),
  );
  if (story.status === "PUBLISHED" && !hasQualifyingSource) {
    issues.push({
      code: "no-qualifying-source",
      message: "A published story needs at least one Tier S, A, or B source.",
      level: "error",
    });
  }

  if (story.status === "PUBLISHED" && !isPubliclyQueryable(story)) {
    issues.push({
      code: "not-publicly-queryable",
      message:
        "PUBLISHED stories must be VERIFIED or deliberately labeled DISPUTED to appear publicly.",
      level: "error",
    });
  }

  if (!dateMatchesPrecision(story.startDate, story.datePrecision)) {
    issues.push({
      code: "date-precision-mismatch",
      message: `startDate ${story.startDate} does not carry enough parts for precision ${story.datePrecision}.`,
      level: "error",
    });
  }

  if (story.relatedStories.some((related) => related.slug === story.slug)) {
    issues.push({
      code: "self-related",
      message: "A story cannot relate to itself.",
      level: "error",
    });
  }

  return issues;
}

export function checkSeedStory(story: SeedStory): ContentIssue[] {
  const issues = checkPublicationGates(story);
  const sourceIds = new Set(story.sources.map((source) => source.id));

  for (const category of story.categories) {
    if (!knownCategorySlugs.has(category)) {
      issues.push({
        code: "unknown-category",
        message: `Unknown category slug: ${category}`,
        level: "error",
      });
    }
  }

  if (
    !story.allowOutsideWashington &&
    !isInsideWashington(story.location.latitude, story.location.longitude)
  ) {
    issues.push({
      code: "outside-washington",
      message: `${story.location.name} is outside the Washington bounding box. Set allowOutsideWashington if that is intentional.`,
      level: "error",
    });
  }

  for (const source of story.sources) {
    if (source.tier === "D") {
      issues.push({
        code: "tier-d-source",
        message: `${source.id} is Tier D (discovery only) and should be replaced before publication.`,
        level: "warning",
      });
    }
  }

  const seenClaimLinks = new Set<string>();
  for (const [index, claim] of story.claims.entries()) {
    for (const source of claim.sources) {
      const sourceId = claimSourceId(source);
      if (!sourceIds.has(sourceId)) {
        issues.push({
          code: "unknown-claim-source",
          message: `Claim ${index + 1} cites missing source ${sourceId}.`,
          level: "error",
        });
      }

      const linkKey = `${index}:${sourceId}`;
      if (seenClaimLinks.has(linkKey)) {
        issues.push({
          code: "duplicate-claim-source",
          message: `Claim ${index + 1} links to ${sourceId} more than once.`,
          level: "error",
        });
      }
      seenClaimLinks.add(linkKey);
    }
  }

  for (const [index, media] of story.media.entries()) {
    if (!media.altText.trim()) {
      issues.push({
        code: "missing-alt-text",
        message: `Media ${index + 1} is missing alt text.`,
        level: "error",
      });
    }
  }

  return issues;
}

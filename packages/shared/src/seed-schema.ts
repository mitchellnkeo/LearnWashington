import { z } from "zod";
import {
  claimTypeSchema,
  confidenceLevelSchema,
  datePrecisionSchema,
  slugSchema,
  sourceTierSchema,
  sourceTypeSchema,
  storyStatusSchema,
  verificationStatusSchema,
} from "./schemas";

export const seedSourceSchema = z.object({
  id: slugSchema,
  title: z.string().min(1),
  publisher: z.string().min(1),
  author: z.string().optional(),
  url: z.string().url(),
  sourceType: sourceTypeSchema,
  tier: sourceTierSchema,
  publicationDate: z.string().optional(),
  accessedAt: z.string().min(1),
  notes: z.string().optional(),
});

export const seedClaimSourceSchema = z.union([
  slugSchema,
  z.object({
    id: slugSchema,
    locator: z.string().min(1).optional(),
  }),
]);

export const seedClaimSchema = z.object({
  text: z.string().min(1),
  claimType: claimTypeSchema,
  confidence: confidenceLevelSchema,
  sources: z.array(seedClaimSourceSchema).min(1),
});

export const seedMediaSchema = z.object({
  url: z.string().url(),
  mediaType: z.enum(["image", "audio", "video"]),
  title: z.string().min(1).optional(),
  creator: z.string().min(1),
  sourceUrl: z.string().url(),
  license: z.string().min(1),
  licenseUrl: z.string().url().optional(),
  altText: z.string().min(1),
  creditLine: z.string().min(1),
});

export const seedStorySchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  hook: z.string().min(1),
  body: z.string().min(1),
  status: storyStatusSchema,
  verificationStatus: verificationStatusSchema,
  featured: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  datePrecision: datePrecisionSchema.optional(),
  dateLabel: z.string().optional(),
  lastReviewedAt: z.string().optional(),
  allowOutsideWashington: z.boolean().optional(),
  location: z.object({
    name: z.string().min(1),
    slug: slugSchema,
    placeType: z.string().min(1),
    latitude: z.number().gte(-90).lte(90),
    longitude: z.number().gte(-180).lte(180),
    county: z.string().optional(),
    region: z.string().optional(),
  }),
  categories: z.array(slugSchema).min(1),
  tags: z.array(z.string().min(1)).default([]),
  claims: z.array(seedClaimSchema).min(1),
  sources: z.array(seedSourceSchema).min(1),
  media: z.array(seedMediaSchema).default([]),
  relatedStories: z
    .array(
      z.object({
        slug: slugSchema,
        relationshipType: z.string().min(1).optional(),
      }),
    )
    .default([]),
  geometryFile: z.string().min(1).optional(),
  geometry: z
    .object({
      type: z.enum([
        "LineString",
        "MultiLineString",
        "Polygon",
        "MultiPolygon",
      ]),
      coordinates: z.array(z.unknown()).min(1),
    })
    .optional(),
});

export type SeedStory = z.infer<typeof seedStorySchema>;
export type SeedClaimSource = z.infer<typeof seedClaimSourceSchema>;

export function claimSourceId(source: SeedClaimSource): string {
  return typeof source === "string" ? source : source.id;
}

export function claimSourceLocator(source: SeedClaimSource): string | null {
  return typeof source === "string" ? null : (source.locator ?? null);
}

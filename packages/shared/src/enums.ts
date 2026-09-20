export const STORY_STATUSES = [
  "IDEA",
  "RESEARCHING",
  "DRAFT",
  "FACT_CHECK",
  "READY",
  "PUBLISHED",
  "NEEDS_REVIEW",
  "ARCHIVED",
] as const;

export type StoryStatus = (typeof STORY_STATUSES)[number];

export const VERIFICATION_STATUSES = [
  "UNVERIFIED",
  "PARTIALLY_VERIFIED",
  "VERIFIED",
  "DISPUTED",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const SOURCE_TIERS = ["S", "A", "B", "C", "D"] as const;

export type SourceTier = (typeof SOURCE_TIERS)[number];

export const SOURCE_TYPES = [
  "government",
  "tribal",
  "academic",
  "archive",
  "museum",
  "book",
  "journalism",
  "dataset",
  "primary_document",
  "other",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export const CLAIM_TYPES = [
  "factual",
  "historical",
  "scientific",
  "interpretive",
] as const;

export type ClaimType = (typeof CLAIM_TYPES)[number];

export const CONFIDENCE_LEVELS = [
  "verified",
  "strongly_supported",
  "uncertain",
  "disputed",
  "approximate",
] as const;

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const DATE_PRECISIONS = [
  "day",
  "month",
  "year",
  "decade",
  "century",
  "approximate",
  "geologic",
  "unknown",
] as const;

export type DatePrecision = (typeof DATE_PRECISIONS)[number];

export const MVP_CATEGORIES = [
  {
    slug: "geography-geology",
    name: "Geography & Geology",
    icon: "mountain",
    color: "#6b4f3a",
  },
  {
    slug: "wildlife-ecology",
    name: "Wildlife & Ecology",
    icon: "leaf",
    color: "#3f5d3f",
  },
  { slug: "history", name: "History", icon: "landmark", color: "#8a3b2a" },
  {
    slug: "indigenous-history-place",
    name: "Indigenous History & Place",
    icon: "sun",
    color: "#a35a2a",
  },
  { slug: "music-culture", name: "Music & Culture", icon: "music", color: "#4a3d63" },
  {
    slug: "science-strange",
    name: "Science / Strange Washington",
    icon: "flask",
    color: "#3d4f63",
  },
] as const;

export const DEFAULT_CATEGORY_COLOR = "#8a3b2a";

export const QUALIFYING_SOURCE_TIERS = ["S", "A", "B"] as const;

export type QualifyingSourceTier = (typeof QUALIFYING_SOURCE_TIERS)[number];

export const WASHINGTON_BOUNDS = {
  west: -124.9,
  south: 45.5,
  east: -116.7,
  north: 49.05,
} as const;

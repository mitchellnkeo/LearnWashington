import { z } from "zod";
import {
  CLAIM_TYPES,
  CONFIDENCE_LEVELS,
  DATE_PRECISIONS,
  SOURCE_TIERS,
  SOURCE_TYPES,
  STORY_STATUSES,
  VERIFICATION_STATUSES,
} from "./enums";

export const storyStatusSchema = z.enum(STORY_STATUSES);
export const verificationStatusSchema = z.enum(VERIFICATION_STATUSES);
export const sourceTierSchema = z.enum(SOURCE_TIERS);
export const sourceTypeSchema = z.enum(SOURCE_TYPES);
export const claimTypeSchema = z.enum(CLAIM_TYPES);
export const confidenceLevelSchema = z.enum(CONFIDENCE_LEVELS);
export const datePrecisionSchema = z.enum(DATE_PRECISIONS);

export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case");

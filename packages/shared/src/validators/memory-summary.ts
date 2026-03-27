import { z } from "zod";
import {
  MEMORY_SUMMARY_ACTOR_TYPES,
  MEMORY_SUMMARY_ENTITY_TYPES,
  MEMORY_SUMMARY_STATUSES,
  MEMORY_SUMMARY_TYPES,
} from "../constants.js";

export const memorySummaryEntityTypeSchema = z.enum(MEMORY_SUMMARY_ENTITY_TYPES);
export const memorySummaryTypeSchema = z.enum(MEMORY_SUMMARY_TYPES);
export const memorySummaryStatusSchema = z.enum(MEMORY_SUMMARY_STATUSES);
export const memorySummaryActorTypeSchema = z.enum(MEMORY_SUMMARY_ACTOR_TYPES);

export const createMemorySummarySchema = z.object({
  entityType: memorySummaryEntityTypeSchema,
  entityId: z.string().trim().min(1),
  summaryType: memorySummaryTypeSchema,
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(524288),
  structuredData: z.record(z.unknown()).nullable().optional(),
  sourceRunId: z.string().uuid().nullable().optional(),
  createdByType: memorySummaryActorTypeSchema.optional().default("system"),
  createdById: z.string().trim().min(1),
  status: memorySummaryStatusSchema.optional().default("active"),
  supersedesSummaryId: z.string().uuid().nullable().optional(),
});

export const updateMemorySummarySchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    body: z.string().trim().min(1).max(524288).optional(),
    structuredData: z.record(z.unknown()).nullable().optional(),
    status: memorySummaryStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const supersedeMemorySummarySchema = z.object({
  replacementSummaryId: z.string().uuid().nullable().optional(),
});

export type CreateMemorySummary = z.infer<typeof createMemorySummarySchema>;
export type UpdateMemorySummary = z.infer<typeof updateMemorySummarySchema>;
export type SupersedeMemorySummary = z.infer<typeof supersedeMemorySummarySchema>;

import { z } from "zod";
import { BRIEF_SOURCES, BRIEF_STATUSES } from "../constants.js";

export const briefStatusSchema = z.enum(BRIEF_STATUSES);
export const briefSourceSchema = z.enum(BRIEF_SOURCES);

export const briefConstraintsSchema = z
  .object({
    time_horizon: z.string().trim().min(1).nullable().optional(),
    must_not: z.array(z.string().trim().min(1)).optional(),
    must_do: z.array(z.string().trim().min(1)).optional(),
    dependencies: z.array(z.string().trim().min(1)).optional(),
    artifacts: z.array(z.string().trim().min(1)).optional(),
  })
  .catchall(z.unknown());

export const createBriefSchema = z.object({
  assignedAgentId: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(524288),
  constraints: briefConstraintsSchema.nullable().optional(),
  expectedOutput: z.string().trim().max(4000).nullable().optional(),
  status: briefStatusSchema.optional().default("draft"),
  source: briefSourceSchema.optional().default("manual"),
  supersedesBriefId: z.string().uuid().nullable().optional(),
});

export const updateBriefSchema = z
  .object({
    assignedAgentId: z.string().uuid().nullable().optional(),
    title: z.string().trim().min(1).max(200).optional(),
    body: z.string().trim().min(1).max(524288).optional(),
    constraints: briefConstraintsSchema.nullable().optional(),
    expectedOutput: z.string().trim().max(4000).nullable().optional(),
    status: briefStatusSchema.optional(),
    source: briefSourceSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const activateBriefSchema = z.object({
  status: z.literal("active").optional().default("active"),
});

export const supersedeBriefSchema = z.object({
  replacementBriefId: z.string().uuid().nullable().optional(),
});

export const completeBriefSchema = z.object({
  status: z.literal("completed").optional().default("completed"),
});

export type CreateBrief = z.infer<typeof createBriefSchema>;
export type UpdateBrief = z.infer<typeof updateBriefSchema>;
export type ActivateBrief = z.infer<typeof activateBriefSchema>;
export type SupersedeBrief = z.infer<typeof supersedeBriefSchema>;
export type CompleteBrief = z.infer<typeof completeBriefSchema>;

import { and, desc, eq } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import { issues, memorySummaries } from "@paperclipai/db";
import { conflict, notFound } from "../errors.js";

function mapMemorySummaryRow(row: typeof memorySummaries.$inferSelect) {
  return {
    id: row.id,
    companyId: row.companyId,
    entityType: row.entityType,
    entityId: row.entityId,
    summaryType: row.summaryType,
    title: row.title,
    body: row.body,
    structuredData: (row.structuredDataJson as Record<string, unknown> | null) ?? null,
    sourceRunId: row.sourceRunId,
    createdByType: row.createdByType,
    createdById: row.createdById,
    status: row.status,
    supersedesSummaryId: row.supersedesSummaryId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function memorySummaryService(db: Db) {
  return {
    getById: async (id: string) => {
      const row = await db
        .select()
        .from(memorySummaries)
        .where(eq(memorySummaries.id, id))
        .then((rows) => rows[0] ?? null);
      return row ? mapMemorySummaryRow(row) : null;
    },

    listForEntity: async (companyId: string, entityType: string, entityId: string) => {
      const rows = await db
        .select()
        .from(memorySummaries)
        .where(
          and(
            eq(memorySummaries.companyId, companyId),
            eq(memorySummaries.entityType, entityType),
            eq(memorySummaries.entityId, entityId),
          ),
        )
        .orderBy(desc(memorySummaries.updatedAt), desc(memorySummaries.createdAt));
      return rows.map(mapMemorySummaryRow);
    },

    createForIssue: async (input: {
      issueId: string;
      summaryType: string;
      title: string;
      body: string;
      structuredData?: Record<string, unknown> | null;
      sourceRunId?: string | null;
      createdByType: string;
      createdById: string;
      status: string;
      supersedesSummaryId?: string | null;
    }) => {
      const issue = await db
        .select({ id: issues.id, companyId: issues.companyId })
        .from(issues)
        .where(eq(issues.id, input.issueId))
        .then((rows) => rows[0] ?? null);
      if (!issue) throw notFound("Issue not found");

      try {
        const [row] = await db
          .insert(memorySummaries)
          .values({
            companyId: issue.companyId,
            entityType: "issue",
            entityId: issue.id,
            summaryType: input.summaryType,
            title: input.title,
            body: input.body,
            structuredDataJson: input.structuredData ?? null,
            sourceRunId: input.sourceRunId ?? null,
            createdByType: input.createdByType,
            createdById: input.createdById,
            status: input.status,
            supersedesSummaryId: input.supersedesSummaryId ?? null,
          })
          .returning();
        return mapMemorySummaryRow(row);
      } catch (error) {
        if (input.status === "active") {
          throw conflict("An active memory summary already exists for this entity and summary type");
        }
        throw error;
      }
    },

    update: async (id: string, input: {
      title?: string;
      body?: string;
      structuredData?: Record<string, unknown> | null;
      status?: string;
    }) => {
      const existing = await db
        .select()
        .from(memorySummaries)
        .where(eq(memorySummaries.id, id))
        .then((rows) => rows[0] ?? null);
      if (!existing) throw notFound("Memory summary not found");

      const [row] = await db
        .update(memorySummaries)
        .set({
          title: input.title ?? existing.title,
          body: input.body ?? existing.body,
          structuredDataJson: input.structuredData === undefined ? existing.structuredDataJson : input.structuredData,
          status: input.status ?? existing.status,
          updatedAt: new Date(),
        })
        .where(eq(memorySummaries.id, id))
        .returning();
      return mapMemorySummaryRow(row);
    },

    supersede: async (id: string, replacementSummaryId?: string | null) => {
      const existing = await db
        .select()
        .from(memorySummaries)
        .where(eq(memorySummaries.id, id))
        .then((rows) => rows[0] ?? null);
      if (!existing) throw notFound("Memory summary not found");

      const [row] = await db
        .update(memorySummaries)
        .set({
          status: "superseded",
          supersedesSummaryId: replacementSummaryId ?? existing.supersedesSummaryId,
          updatedAt: new Date(),
        })
        .where(eq(memorySummaries.id, id))
        .returning();
      return mapMemorySummaryRow(row);
    },
  };
}

import { and, desc, eq } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import { briefs, issues } from "@paperclipai/db";
import { conflict, notFound } from "../errors.js";

function mapBriefRow(row: typeof briefs.$inferSelect) {
  return {
    id: row.id,
    companyId: row.companyId,
    issueId: row.issueId,
    assignedAgentId: row.assignedAgentId,
    createdByAgentId: row.createdByAgentId,
    createdByUserId: row.createdByUserId,
    title: row.title,
    body: row.body,
    constraints: (row.constraintsJson as Record<string, unknown> | null) ?? null,
    expectedOutput: row.expectedOutput,
    status: row.status,
    source: row.source,
    version: row.version,
    supersedesBriefId: row.supersedesBriefId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    completedAt: row.completedAt,
  };
}

function nextVersion(currentVersion: string) {
  const parsed = Number.parseInt(currentVersion, 10);
  if (Number.isNaN(parsed) || parsed < 1) return "1";
  return String(parsed + 1);
}

export function briefService(db: Db) {
  return {
    listForIssue: async (issueId: string) => {
      const rows = await db
        .select()
        .from(briefs)
        .where(eq(briefs.issueId, issueId))
        .orderBy(desc(briefs.updatedAt), desc(briefs.createdAt));
      return rows.map(mapBriefRow);
    },

    getById: async (id: string) => {
      const row = await db
        .select()
        .from(briefs)
        .where(eq(briefs.id, id))
        .then((rows) => rows[0] ?? null);
      return row ? mapBriefRow(row) : null;
    },

    getActiveForIssue: async (issueId: string) => {
      const row = await db
        .select()
        .from(briefs)
        .where(and(eq(briefs.issueId, issueId), eq(briefs.status, "active")))
        .orderBy(desc(briefs.updatedAt), desc(briefs.createdAt))
        .then((rows) => rows[0] ?? null);
      return row ? mapBriefRow(row) : null;
    },

    create: async (input: {
      issueId: string;
      assignedAgentId?: string | null;
      createdByAgentId?: string | null;
      createdByUserId?: string | null;
      title: string;
      body: string;
      constraints?: Record<string, unknown> | null;
      expectedOutput?: string | null;
      status: string;
      source: string;
      supersedesBriefId?: string | null;
    }) => {
      const issue = await db
        .select({ id: issues.id, companyId: issues.companyId })
        .from(issues)
        .where(eq(issues.id, input.issueId))
        .then((rows) => rows[0] ?? null);
      if (!issue) throw notFound("Issue not found");

      try {
        const [row] = await db
          .insert(briefs)
          .values({
            companyId: issue.companyId,
            issueId: issue.id,
            assignedAgentId: input.assignedAgentId ?? null,
            createdByAgentId: input.createdByAgentId ?? null,
            createdByUserId: input.createdByUserId ?? null,
            title: input.title,
            body: input.body,
            constraintsJson: input.constraints ?? null,
            expectedOutput: input.expectedOutput ?? null,
            status: input.status,
            source: input.source,
            version: "1",
            supersedesBriefId: input.supersedesBriefId ?? null,
          })
          .returning();
        return mapBriefRow(row);
      } catch (error) {
        if (input.status === "active") {
          throw conflict("An active brief already exists for this issue and assignee");
        }
        throw error;
      }
    },

    update: async (id: string, input: {
      assignedAgentId?: string | null;
      title?: string;
      body?: string;
      constraints?: Record<string, unknown> | null;
      expectedOutput?: string | null;
      status?: string;
      source?: string;
    }) => {
      const existing = await db
        .select()
        .from(briefs)
        .where(eq(briefs.id, id))
        .then((rows) => rows[0] ?? null);
      if (!existing) throw notFound("Brief not found");

      const [row] = await db
        .update(briefs)
        .set({
          assignedAgentId: input.assignedAgentId ?? existing.assignedAgentId,
          title: input.title ?? existing.title,
          body: input.body ?? existing.body,
          constraintsJson: input.constraints === undefined ? existing.constraintsJson : input.constraints,
          expectedOutput: input.expectedOutput === undefined ? existing.expectedOutput : input.expectedOutput,
          status: input.status ?? existing.status,
          source: input.source ?? existing.source,
          updatedAt: new Date(),
        })
        .where(eq(briefs.id, id))
        .returning();
      return mapBriefRow(row);
    },

    activate: async (id: string) => {
      const existing = await db
        .select()
        .from(briefs)
        .where(eq(briefs.id, id))
        .then((rows) => rows[0] ?? null);
      if (!existing) throw notFound("Brief not found");

      try {
        const [row] = await db
          .update(briefs)
          .set({
            status: "active",
            updatedAt: new Date(),
          })
          .where(eq(briefs.id, id))
          .returning();
        return mapBriefRow(row);
      } catch (error) {
        throw conflict("An active brief already exists for this issue and assignee");
      }
    },

    supersede: async (id: string, replacementBriefId?: string | null) => {
      const existing = await db
        .select()
        .from(briefs)
        .where(eq(briefs.id, id))
        .then((rows) => rows[0] ?? null);
      if (!existing) throw notFound("Brief not found");

      const [row] = await db
        .update(briefs)
        .set({
          status: "superseded",
          supersedesBriefId: replacementBriefId ?? existing.supersedesBriefId,
          version: nextVersion(existing.version),
          updatedAt: new Date(),
        })
        .where(eq(briefs.id, id))
        .returning();
      return mapBriefRow(row);
    },

    complete: async (id: string) => {
      const existing = await db
        .select()
        .from(briefs)
        .where(eq(briefs.id, id))
        .then((rows) => rows[0] ?? null);
      if (!existing) throw notFound("Brief not found");

      const now = new Date();
      const [row] = await db
        .update(briefs)
        .set({
          status: "completed",
          completedAt: now,
          updatedAt: now,
        })
        .where(eq(briefs.id, id))
        .returning();
      return mapBriefRow(row);
    },
  };
}

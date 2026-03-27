import { sql } from "drizzle-orm";
import { type AnyPgColumn, index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { agents } from "./agents.js";
import { companies } from "./companies.js";
import { issues } from "./issues.js";

export const briefs = pgTable(
  "briefs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    issueId: uuid("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
    assignedAgentId: uuid("assigned_agent_id").references(() => agents.id, { onDelete: "set null" }),
    createdByAgentId: uuid("created_by_agent_id").references(() => agents.id, { onDelete: "set null" }),
    createdByUserId: text("created_by_user_id"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    constraintsJson: jsonb("constraints_json").$type<Record<string, unknown> | null>(),
    expectedOutput: text("expected_output"),
    status: text("status").notNull().default("draft"),
    source: text("source").notNull().default("manual"),
    version: text("version").notNull().default("1"),
    supersedesBriefId: uuid("supersedes_brief_id").references((): AnyPgColumn => briefs.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    companyIssueUpdatedIdx: index("briefs_company_issue_updated_idx").on(table.companyId, table.issueId, table.updatedAt),
    companyAssignedStatusIdx: index("briefs_company_assigned_status_idx").on(
      table.companyId,
      table.assignedAgentId,
      table.status,
    ),
    companyStatusIdx: index("briefs_company_status_idx").on(table.companyId, table.status),
    companySupersedesIdx: index("briefs_company_supersedes_idx").on(table.companyId, table.supersedesBriefId),
    activeIssueAssigneeUq: uniqueIndex("briefs_active_issue_assignee_uq")
      .on(table.companyId, table.issueId, table.assignedAgentId)
      .where(sql`${table.status} = 'active'`),
  }),
);

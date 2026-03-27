import { sql } from "drizzle-orm";
import { type AnyPgColumn, index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { heartbeatRuns } from "./heartbeat_runs.js";

export const memorySummaries = pgTable(
  "memory_summaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    summaryType: text("summary_type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    structuredDataJson: jsonb("structured_data_json").$type<Record<string, unknown> | null>(),
    sourceRunId: uuid("source_run_id").references(() => heartbeatRuns.id, { onDelete: "set null" }),
    createdByType: text("created_by_type").notNull().default("system"),
    createdById: text("created_by_id").notNull(),
    status: text("status").notNull().default("active"),
    supersedesSummaryId: uuid("supersedes_summary_id").references((): AnyPgColumn => memorySummaries.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyEntitySummaryIdx: index("memory_summaries_company_entity_summary_idx").on(
      table.companyId,
      table.entityType,
      table.entityId,
      table.summaryType,
    ),
    companyCreatedIdx: index("memory_summaries_company_created_idx").on(table.companyId, table.createdAt),
    sourceRunIdx: index("memory_summaries_source_run_idx").on(table.sourceRunId),
    supersedesIdx: index("memory_summaries_supersedes_idx").on(table.companyId, table.supersedesSummaryId),
    activePerEntitySummaryUq: uniqueIndex("memory_summaries_active_per_entity_summary_uq")
      .on(table.companyId, table.entityType, table.entityId, table.summaryType)
      .where(sql`${table.status} = 'active'`),
  }),
);

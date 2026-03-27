CREATE TABLE "memory_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"summary_type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"structured_data_json" jsonb,
	"source_run_id" uuid,
	"created_by_type" text DEFAULT 'system' NOT NULL,
	"created_by_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"supersedes_summary_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memory_summaries" ADD CONSTRAINT "memory_summaries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_summaries" ADD CONSTRAINT "memory_summaries_source_run_id_heartbeat_runs_id_fk" FOREIGN KEY ("source_run_id") REFERENCES "public"."heartbeat_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_summaries" ADD CONSTRAINT "memory_summaries_supersedes_summary_id_memory_summaries_id_fk" FOREIGN KEY ("supersedes_summary_id") REFERENCES "public"."memory_summaries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "memory_summaries_company_entity_summary_idx" ON "memory_summaries" USING btree ("company_id","entity_type","entity_id","summary_type");--> statement-breakpoint
CREATE INDEX "memory_summaries_company_created_idx" ON "memory_summaries" USING btree ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "memory_summaries_source_run_idx" ON "memory_summaries" USING btree ("source_run_id");--> statement-breakpoint
CREATE INDEX "memory_summaries_supersedes_idx" ON "memory_summaries" USING btree ("company_id","supersedes_summary_id");--> statement-breakpoint
CREATE UNIQUE INDEX "memory_summaries_active_per_entity_summary_uq" ON "memory_summaries" USING btree ("company_id","entity_type","entity_id","summary_type") WHERE "memory_summaries"."status" = 'active';

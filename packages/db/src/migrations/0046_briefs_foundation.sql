CREATE TABLE "briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"issue_id" uuid NOT NULL,
	"assigned_agent_id" uuid,
	"created_by_agent_id" uuid,
	"created_by_user_id" text,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"constraints_json" jsonb,
	"expected_output" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"version" text DEFAULT '1' NOT NULL,
	"supersedes_brief_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_assigned_agent_id_agents_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_created_by_agent_id_agents_id_fk" FOREIGN KEY ("created_by_agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_supersedes_brief_id_briefs_id_fk" FOREIGN KEY ("supersedes_brief_id") REFERENCES "public"."briefs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "briefs_company_issue_updated_idx" ON "briefs" USING btree ("company_id","issue_id","updated_at");--> statement-breakpoint
CREATE INDEX "briefs_company_assigned_status_idx" ON "briefs" USING btree ("company_id","assigned_agent_id","status");--> statement-breakpoint
CREATE INDEX "briefs_company_status_idx" ON "briefs" USING btree ("company_id","status");--> statement-breakpoint
CREATE INDEX "briefs_company_supersedes_idx" ON "briefs" USING btree ("company_id","supersedes_brief_id");--> statement-breakpoint
CREATE UNIQUE INDEX "briefs_active_issue_assignee_uq" ON "briefs" USING btree ("company_id","issue_id","assigned_agent_id") WHERE "briefs"."status" = 'active';

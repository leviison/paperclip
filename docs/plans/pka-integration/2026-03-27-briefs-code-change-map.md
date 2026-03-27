# Briefs Code Change Map

Status: Draft  
Owner: Backend + UI + Agent Protocol  
Date: 2026-03-27

## Purpose

Translate the `briefs` product spec into concrete implementation targets in the current Paperclip codebase.

This document is the execution bridge between:

- [implementation milestones](/home/bzadmin/Documents/paperclip/docs/plans/pka-integration/2026-03-27-implementation-milestones.md)
- [briefs spec](/home/bzadmin/Documents/paperclip/docs/plans/pka-integration/2026-03-27-briefs-spec.md)

## High-Level Recommendation

Implement `briefs` as a dedicated first-class entity, not as a specialization of issue documents.

Reason:

- issue documents are revisioned text artifacts keyed by document name
- briefs are assignment-state entities with lifecycle semantics such as `active`, `superseded`, and `completed`
- briefs need direct links to assignees, status transitions, and later context assembly

Paperclip's document system is still a useful pattern reference for:

- payload shapes
- route layout under issues
- activity logging integration

## Existing Extension Seams

The most relevant current files are:

- [packages/db/src/schema/issues.ts](/home/bzadmin/Documents/paperclip/packages/db/src/schema/issues.ts)
- [packages/db/src/schema/documents.ts](/home/bzadmin/Documents/paperclip/packages/db/src/schema/documents.ts)
- [packages/db/src/schema/issue_documents.ts](/home/bzadmin/Documents/paperclip/packages/db/src/schema/issue_documents.ts)
- [packages/shared/src/types/issue.ts](/home/bzadmin/Documents/paperclip/packages/shared/src/types/issue.ts)
- [packages/shared/src/validators/issue.ts](/home/bzadmin/Documents/paperclip/packages/shared/src/validators/issue.ts)
- [server/src/services/issues.ts](/home/bzadmin/Documents/paperclip/server/src/services/issues.ts)
- [server/src/services/documents.ts](/home/bzadmin/Documents/paperclip/server/src/services/documents.ts)
- [server/src/routes/issues.ts](/home/bzadmin/Documents/paperclip/server/src/routes/issues.ts)

## Recommended New Backend Files

Add new schema and service surfaces:

- `packages/db/src/schema/briefs.ts`
- export from `packages/db/src/schema/index.ts`
- export from `packages/db/src/index.ts` if needed
- new service module:
  - `server/src/services/briefs.ts`
- wire into:
  - `server/src/services/index.ts`

Optional later:

- dedicated type file:
  - `packages/shared/src/types/brief.ts`
- dedicated validator file:
  - `packages/shared/src/validators/brief.ts`

If the repo prefers issue-adjacent placement, these could still be re-exported via issue types and validators, but a separate `brief` module will scale better.

## Database Work

### New table

Add `briefs` table in:

- [packages/db/src/schema/briefs.ts](/home/bzadmin/Documents/paperclip/packages/db/src/schema/briefs.ts)

Suggested columns:

- `id`
- `company_id`
- `issue_id`
- `assigned_agent_id`
- `created_by_agent_id`
- `created_by_user_id`
- `title`
- `body`
- `constraints_json`
- `expected_output`
- `status`
- `source`
- `version`
- `supersedes_brief_id`
- `created_at`
- `updated_at`
- `completed_at`

Suggested indexes:

- `(company_id, issue_id, updated_at)`
- `(company_id, assigned_agent_id, status)`
- unique partial index for one active brief per issue and assignee pair if supported cleanly

### Migration work

Add a new Drizzle migration under:

- `packages/db/src/migrations/`

Update migration metadata snapshots as required by the repo's Drizzle workflow.

## Shared Types

### New brief types

Recommended new file:

- `packages/shared/src/types/brief.ts`

Add:

- `Brief`
- `BriefStatus`
- `BriefSource`
- `BriefConstraints`
- request and response payload types as needed

Then re-export through:

- `packages/shared/src/types/index.ts`

### Issue payload integration

Update:

- [packages/shared/src/types/issue.ts](/home/bzadmin/Documents/paperclip/packages/shared/src/types/issue.ts)

Likely additions:

- `activeBrief?: Brief | null`
- `briefSummaries?: BriefSummary[]`

Phase 1 can keep issue payload changes minimal if list/detail endpoints for briefs are separate.

## Shared Validators

Recommended new file:

- `packages/shared/src/validators/brief.ts`

Add schemas for:

- `createBriefSchema`
- `updateBriefSchema`
- `activateBriefSchema`
- `supersedeBriefSchema`
- `completeBriefSchema`

Then re-export through:

- `packages/shared/src/validators/index.ts`

Phase 1 can avoid over-modeling and keep the payloads tight.

## Service Layer

### New service module

Add:

- `server/src/services/briefs.ts`

Primary responsibilities:

- create brief
- list briefs for issue
- get brief by id
- activate brief
- supersede brief
- complete brief
- enforce company and issue linkage
- enforce active-brief invariants

### Issue integration points

Update:

- [server/src/services/issues.ts](/home/bzadmin/Documents/paperclip/server/src/services/issues.ts)

Likely changes:

- optionally enrich issue detail payload with `activeBrief`
- later expose brief-aware context assembly helpers

Important:

Do not overload the main issue service with full brief lifecycle logic. Keep that in the dedicated `briefs` service and call into it from routes or selective issue read paths.

### Service index

Update:

- `server/src/services/index.ts`

Add export for `briefService`.

## Routes

### Primary route file

Extend:

- [server/src/routes/issues.ts](/home/bzadmin/Documents/paperclip/server/src/routes/issues.ts)

Recommended phase-1 endpoints:

- `GET /issues/:id/briefs`
- `POST /issues/:id/briefs`
- `GET /briefs/:briefId`
- `PATCH /briefs/:briefId`
- `POST /briefs/:briefId/activate`
- `POST /briefs/:briefId/supersede`
- `POST /briefs/:briefId/complete`

Why `issues.ts` first:

- this file already owns issue-adjacent child resources such as issue documents and attachments
- it already has actor and company authorization patterns needed for board and agent access

### Route concerns

Use existing route patterns for:

- `assertCompanyAccess`
- actor extraction via `getActorInfo`
- `validate(...)`
- activity logging through `logActivity(...)`

## Activity Log

Add activity events for:

- `brief.created`
- `brief.updated`
- `brief.activated`
- `brief.superseded`
- `brief.completed`

Primary wiring point:

- [server/src/routes/issues.ts](/home/bzadmin/Documents/paperclip/server/src/routes/issues.ts)

Potential entity type:

- `brief`

## UI Surfaces To Inspect Next

Likely frontend implementation areas:

- issue detail page
- issue creation / assignment flow
- API client layer for issues
- shared query keys and types

Likely file groups:

- `ui/src/pages/IssueDetail*.tsx`
- `ui/src/api/issue*.ts`
- `ui/src/components/*Issue*`

Exact file map should be captured in a follow-on UI slice doc after reading those files.

## Recommended Implementation Slices

### Slice 1: Schema and shared contracts

Files:

- new `briefs` schema
- migration
- shared `brief` types
- shared validators

Deliverable:

- compile-time model for briefs exists

### Slice 2: Service and route basics

Files:

- `server/src/services/briefs.ts`
- `server/src/services/index.ts`
- `server/src/routes/issues.ts`

Deliverable:

- create and list briefs through API

### Slice 3: Activity log and lifecycle transitions

Files:

- `server/src/routes/issues.ts`
- possibly service helpers if lifecycle state transitions need centralization

Deliverable:

- activate, supersede, and complete actions work and are auditable

### Slice 4: Issue detail read integration

Files:

- `server/src/services/issues.ts`
- `packages/shared/src/types/issue.ts`
- issue detail endpoint responses

Deliverable:

- issue detail can surface current active brief

### Slice 5: UI support

Files:

- issue API client
- issue detail page/components

Deliverable:

- board user can view and create briefs in UI

### Slice 6: Assignment flow shortcut

Files:

- issue create/update UI
- relevant route/update logic

Deliverable:

- optional `create brief now` flow during assignment

## Not Recommended For Milestone 1

Do not include these yet:

- automatic brief generation by agents
- full brief revision history like issue documents
- deep heartbeat-context integration
- agent detail brief dashboard

Those should come after the core entity and operator-facing flow are stable.

## Immediate Next Code Reading

Before implementation starts, inspect:

- frontend issue detail files in `ui/src`
- server service index exports
- current activity log entity typing if it constrains new `brief` entity types
- DB schema index exports to confirm migration wiring pattern

## Recommendation

Start Milestone 1 with:

1. new `briefs` schema + migration
2. shared `brief` types and validators
3. `server/src/services/briefs.ts`
4. issue-adjacent brief routes in `server/src/routes/issues.ts`

That is the cleanest vertical slice with the least risk of architectural drift.

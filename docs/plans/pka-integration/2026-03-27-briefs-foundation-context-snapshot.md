# Briefs Foundation Context Snapshot

Status: Active Snapshot  
Owner: Backend + UI + Agent Protocol  
Date: 2026-03-27
Branch: `feature/briefs-foundation`

## Purpose

Compact the current implementation state for the `briefs` feature so the next slice can begin without reconstructing prior planning and code changes from scratch.

This is a working-context checkpoint, not the primary spec.

Primary references:

- [implementation milestones](/home/bzadmin/Documents/paperclip/docs/plans/pka-integration/2026-03-27-implementation-milestones.md)
- [briefs spec](/home/bzadmin/Documents/paperclip/docs/plans/pka-integration/2026-03-27-briefs-spec.md)
- [briefs code change map](/home/bzadmin/Documents/paperclip/docs/plans/pka-integration/2026-03-27-briefs-code-change-map.md)

## Current Branch State

Branch:

- `feature/briefs-foundation`

Recent commits on this branch:

- `07e64760` `Add briefs backend foundation`
- `f3209e31` `Add briefs issue detail UI`
- `9951e875` `Update fork sync workflow for origin-only tracking`
- `b593cd69` `Fix tsx CLI resolution in dev watch`
- `ca14a8e3` `Add brief lifecycle controls`

Remote:

- `origin` only
- no permanent `upstream` remote configured

## What Is Implemented

### Backend foundation

Implemented:

- `briefs` DB schema
- raw SQL migration
- shared constants, types, validators, and exports
- backend service for brief CRUD and lifecycle transitions
- issue-adjacent routes for:
  - list
  - create
  - fetch
  - update
  - activate
  - supersede
  - complete

Primary files:

- [packages/db/src/schema/briefs.ts](/home/bzadmin/Documents/paperclip/packages/db/src/schema/briefs.ts)
- [packages/db/src/migrations/0046_briefs_foundation.sql](/home/bzadmin/Documents/paperclip/packages/db/src/migrations/0046_briefs_foundation.sql)
- [packages/shared/src/types/brief.ts](/home/bzadmin/Documents/paperclip/packages/shared/src/types/brief.ts)
- [packages/shared/src/validators/brief.ts](/home/bzadmin/Documents/paperclip/packages/shared/src/validators/brief.ts)
- [server/src/services/briefs.ts](/home/bzadmin/Documents/paperclip/server/src/services/briefs.ts)
- [server/src/routes/issues.ts](/home/bzadmin/Documents/paperclip/server/src/routes/issues.ts)

### Issue detail integration

Implemented:

- `activeBrief` included in issue detail payload
- issue detail page shows:
  - active brief
  - brief list
  - compact create form
  - activate / complete / supersede controls

Primary files:

- [packages/shared/src/types/issue.ts](/home/bzadmin/Documents/paperclip/packages/shared/src/types/issue.ts)
- [ui/src/api/issues.ts](/home/bzadmin/Documents/paperclip/ui/src/api/issues.ts)
- [ui/src/lib/queryKeys.ts](/home/bzadmin/Documents/paperclip/ui/src/lib/queryKeys.ts)
- [ui/src/pages/IssueDetail.tsx](/home/bzadmin/Documents/paperclip/ui/src/pages/IssueDetail.tsx)

### Live invalidation

Implemented:

- brief activity events now invalidate issue detail / briefs / activity caches via live updates

Primary file:

- [ui/src/context/LiveUpdatesProvider.tsx](/home/bzadmin/Documents/paperclip/ui/src/context/LiveUpdatesProvider.tsx)

### Agent-facing context

Implemented:

- `activeBrief` is already included in `GET /issues/:id/heartbeat-context`

Primary file:

- [server/src/routes/issues.ts](/home/bzadmin/Documents/paperclip/server/src/routes/issues.ts)

## What Has Been Verified

Verified successfully after the current slices:

- `@paperclipai/shared` build
- `@paperclipai/ui` build
- `@paperclipai/server` typecheck

## Known Limitations

The current `briefs` implementation is intentionally incomplete.

Not done yet:

- dedicated brief history UI beyond simple list rendering
- strong operator review flow for draft vs active replacement
- automatic brief generation during assignment
- richer conflict handling in UI when active-brief uniqueness blocks activation
- heartbeat-context prioritization logic beyond raw inclusion of `activeBrief`
- agent detail views for active briefs
- tests for the new routes and UI behavior

## Behavioral Notes

- first created brief becomes `active` only when there is no existing active brief
- if an active brief already exists, newly created briefs are currently intended to be drafts from the UI flow
- brief lifecycle currently relies on explicit operator actions in the issue detail page
- brief activity uses `entityType: "brief"` and includes `issueId` in activity details for cache invalidation

## Recommended Next Step

The next clean slice is:

### Option A: Start `memory_summaries`

Reason:

- `briefs` now exist as assignment intent
- the next high-value addition is compacted durable memory

Suggested first sub-slice:

- DB schema
- shared types / validators
- automatic `run_summary`
- automatic `approval_summary`
- read-only display surfaces before full generation complexity

### Option B: Tighten `briefs` before moving on

Only do this if brief UX problems are discovered during use.

Candidate refinements:

- better supersede flow that creates a replacement brief in one action
- clearer draft/active visual distinction
- better error handling for active-brief uniqueness conflicts
- tests

## Recommendation

Prefer Option A now.

The feature has crossed the threshold where more work on `briefs` alone risks local optimization. The more valuable move is to pair `briefs` with `memory_summaries` so the system gains both:

- intended work
- compacted outcomes

## Repo Policy Reminder

This checkout tracks only:

- `origin = leviison/paperclip`

To pull future updates from the original Paperclip repo, use the origin-only workflow documented in:

- [2026-03-27-fork-sync-workflow.md](/home/bzadmin/Documents/paperclip/docs/plans/pka-integration/2026-03-27-fork-sync-workflow.md)

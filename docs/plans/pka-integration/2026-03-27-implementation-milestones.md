# PKA Integration Implementation Milestones

Status: Draft  
Owner: Product + Backend + UI + Agent Protocol  
Date: 2026-03-27

## Summary

This document converts the PKA-inspired integration plans into a practical execution order for Paperclip.

The sequence is designed to:

- maximize early product value
- avoid schema churn
- preserve Paperclip's current issue and approval model
- build later workflow surfaces on top of earlier foundational data structures

## Guiding Principles

- keep `issues` as the core unit of work
- keep approvals first-class
- keep activity log authoritative
- prefer additive schema changes
- implement read models after the underlying data model is stable

## Milestone 0: Fork and Baseline

Goal:

- establish a safe product branch away from upstream

Tasks:

- fork `paperclipai/paperclip` into `leviison/paperclip`
- keep current upstream repo as `upstream`
- set personal fork as `origin`
- commit the planning docs in `docs/plans/pka-integration/`
- create an initial feature branch for the first implementation slice

Exit criteria:

- fork exists
- remotes are configured cleanly
- planning docs are committed to the fork

## Milestone 1: Briefs Foundation

Goal:

- add first-class briefs to improve delegation clarity

Tasks:

- add `briefs` schema and shared types
- add API routes and validation
- add activity log events for brief lifecycle
- add issue-detail UI for viewing and creating briefs
- optionally add brief creation during assignment

Exit criteria:

- an issue can have an active brief
- brief lifecycle is visible in UI and audit trail
- no existing issue workflows are broken

Reason for ordering:

- highest leverage feature
- foundation for later context assembly

## Milestone 2: Memory Summaries Foundation

Goal:

- add compact durable memory on top of issues, approvals, and runs

Tasks:

- add `memory_summaries` schema and shared types
- implement `run_summary` and `approval_summary` first
- add display surfaces in run and approval views
- add issue-summary support behind explicit triggers
- add activity log events for summary lifecycle

Exit criteria:

- runs and approvals can generate summaries
- summaries are queryable and visible in UI
- summary lifecycle is auditable

Reason for ordering:

- this creates the memory substrate needed by later UX improvements

## Milestone 3: Context Assembly Integration

Goal:

- use briefs and summaries to improve agent working context

Tasks:

- update agent-facing issue/context payload assembly
- prioritize active brief, issue summary, approval summary, and agent context summary
- add freshness and bounded-size guardrails
- expose which context artifacts were used in run metadata if practical

Exit criteria:

- agents can receive compact context before long issue history
- context assembly remains deterministic and inspectable

Reason for ordering:

- converts the new data model into operational value

## Milestone 4: Operator Session Workflow

Goal:

- productize PKA-style open/close rituals for Paperclip board users

Tasks:

- define start-session and close-session read models
- add optional `operator_sessions` persistence if needed
- add dashboard entry point
- implement pending approvals, stalled work, blockers, and recent outcomes views
- integrate summaries into session workflow

Exit criteria:

- board users can start a session and quickly see what matters
- close-session produces a usable summary of outcomes and unresolved items

Reason for ordering:

- now the system has enough durable memory to support good operator UX

## Milestone 5: Knowledge Browser

Goal:

- expose Paperclip company memory through a dedicated readable search surface

Tasks:

- define memory-browser read model
- add search and recent-memory endpoints
- add sidebar navigation and search UI
- support browsing briefs, summaries, approvals, and outcomes
- add entity-linked detail panel

Exit criteria:

- operators can search and browse durable company memory effectively

Reason for ordering:

- this is primarily a read-model/UI layer that depends on prior memory features

## Milestone 6: Evidence-Driven Agent Evolution

Goal:

- add a governed loop for improving agents over time

Tasks:

- add structured agent feedback
- add agent reviews
- add change proposals tied to approvals
- log applied changes
- add post-change evaluation

Exit criteria:

- agent improvements are evidence-backed, reviewable, and measurable

Reason for ordering:

- highest conceptual complexity
- depends on stable memory, review UX, and operator workflows

## Cross-Cutting Workstreams

These should be tracked through all milestones:

### Migrations and compatibility

- keep all new features additive
- avoid required backfills in early phases
- preserve compatibility for companies that do not use the new features yet

### Auditability

- every new entity lifecycle should emit meaningful activity log entries
- operator-visible history should remain reconstructable

### Company isolation

- every query and relation must remain company-scoped

### Documentation

- update operator docs as each feature stabilizes
- document how new entities interact with issues and approvals

## Suggested Branching Plan

After the fork is in place, use feature branches such as:

- `feature/briefs-foundation`
- `feature/memory-summaries-foundation`
- `feature/context-assembly-integration`
- `feature/operator-session-workflow`
- `feature/knowledge-browser`
- `feature/agent-evolution`

## Suggested Commit Strategy

Prefer small, reviewable slices:

1. schema and shared types
2. server routes and validation
3. UI read surfaces
4. workflow integration
5. docs and cleanup

## Risks and Controls

### Risk: overlapping schema changes

Control:

- do foundational entity work first
- avoid parallel schema redesign across milestones

### Risk: too much product surface too soon

Control:

- keep early milestones focused on data model plus minimal useful UI

### Risk: feature bloat without operator value

Control:

- require each milestone to improve either delegation clarity, durable memory, or operator understanding

## Recommended Immediate Next Actions

1. Re-authenticate GitHub CLI for `leviison`.
2. Create the fork.
3. Commit the planning docs.
4. Start Milestone 1 with a concrete code-change map for `briefs`.

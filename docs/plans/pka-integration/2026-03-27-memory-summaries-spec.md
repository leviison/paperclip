# Memory Summaries Spec

Status: Draft  
Owner: Backend + UI + Agent Protocol  
Date: 2026-03-27

## Feature Goal

Add first-class `memory summaries` to Paperclip so important operational context can be compacted into durable, structured records.

This feature should reduce context sprawl, improve heartbeat recovery, and give operators a clearer understanding of what actually happened without requiring them to reconstruct events from raw logs and comments.

## Non-Goals

Do not:

- replace issues, comments, approvals, or activity logs
- make summaries the source of truth
- auto-summarize everything indiscriminately
- rely on freeform markdown files or external storage as canonical memory
- let summaries silently overwrite underlying state

Memory summaries are a secondary layer that distills state and outcomes from authoritative entities.

## Product Model

Paperclip already records:

- work units as issues
- mutations in the activity log
- execution as runs
- governance via approvals

What it lacks is a durable compaction layer for:

- what matters now
- what changed materially
- what an agent should remember next

Memory summaries fill that gap.

## Core Summary Types

Phase 1 should support four summary types:

- `run_summary`
- `issue_summary`
- `approval_summary`
- `agent_context_summary`

Possible later types:

- `session_summary`
- `project_summary`
- `goal_summary`

## User Stories

1. As a board operator, I want a concise summary of a run so I can understand outcomes without replaying the full log.
2. As an agent, I want the latest compact issue context before reading long issue history.
3. As a manager agent, I want to see the current summarized state of child work before delegating or intervening.
4. As an operator, I want approvals to retain a concise rationale and consequence summary after decision.
5. As the system, I want to reuse compact memory during heartbeats to reduce context load.

## Proposed Data Model

Add a `memory_summaries` table with fields along these lines:

- `id`
- `company_id`
- `entity_type`
- `entity_id`
- `summary_type`
- `title`
- `body`
- `structured_data_json`
- `source_run_id`
- `created_by_type`
- `created_by_id`
- `status`
- `supersedes_summary_id`
- `created_at`

Suggested enums:

- `entity_type`: `issue`, `approval`, `agent`, `run`, later others as needed
- `summary_type`: `run_summary`, `issue_summary`, `approval_summary`, `agent_context_summary`
- `status`: `active`, `superseded`, `archived`

Suggested `structured_data_json` patterns:

For `run_summary`:

```json
{
  "outcome": "completed",
  "issues_touched": ["ISS-123"],
  "approvals_created": [],
  "approvals_resolved": ["APR-44"],
  "risks": ["waiting on operator decision"],
  "next_actions": ["resume implementation after approval"]
}
```

For `issue_summary`:

```json
{
  "current_state": "implementation started",
  "blockers": [],
  "decisions": ["use existing adapter interface"],
  "next_actions": ["add schema migration", "update API contract"]
}
```

For `approval_summary`:

```json
{
  "decision": "approved",
  "decision_reason": "scope and budget acceptable",
  "impact": ["agent may proceed", "issue moved out of blocked state"]
}
```

For `agent_context_summary`:

```json
{
  "focus_areas": ["briefs", "memory summaries"],
  "open_items": ["define UI placement"],
  "constraints": ["keep issues as source of truth"],
  "recent_progress": ["briefs spec drafted"]
}
```

## Relational Rules

- every summary belongs to one company
- every summary is attached to one primary entity type and entity id
- summaries may optionally reference a source run
- multiple summaries may exist for the same entity over time
- only one `active` summary should exist for a given `(entity_type, entity_id, summary_type)` in the common case
- replacement summaries supersede previous ones rather than mutating them in place

## Summary Lifecycle

1. A system event occurs: a run completes, an issue materially changes, an approval is resolved, or an agent context needs refresh.
2. A summary is generated as `active`.
3. If a new summary of the same type replaces it, the prior summary becomes `superseded`.
4. Old summaries remain queryable for history, but only the current active one is used for normal context assembly.

## Generation Model

Phase 1 should favor deterministic or reviewable generation.

Recommended generation triggers:

- `run_summary`: automatically on run completion
- `approval_summary`: automatically on approval resolution
- `issue_summary`: generated when material issue milestones occur or manually invoked by operator/manager
- `agent_context_summary`: generated periodically or after meaningful work changes

Phase 1 generation sources:

- system-generated from metadata and event traces
- operator-generated or operator-edited
- manager-generated in limited cases

Phase 1 should avoid allowing arbitrary autonomous agent rewriting of active summaries.

## Generation Rules

### Run summary

Should capture:

- what the run attempted
- what changed
- what was completed
- what blocked progress
- what should happen next

Should not capture:

- verbose terminal transcript
- redundant raw events already visible in the run viewer

### Issue summary

Should capture:

- current state of the issue
- important decisions made
- current blockers
- next likely actions

Should update only when something materially changes.

### Approval summary

Should capture:

- the decision
- the reasoning
- the practical consequences for work

### Agent context summary

Should capture:

- what the agent is currently focused on
- key constraints
- active blockers
- recent progress worth carrying forward

## API

Suggested endpoints:

- `GET /api/memory-summaries/:id`
- `GET /api/issues/:issueId/memory-summaries`
- `GET /api/agents/:agentId/memory-summaries`
- `GET /api/approvals/:approvalId/memory-summaries`
- `POST /api/issues/:issueId/memory-summaries`
- `POST /api/agents/:agentId/memory-summaries`
- `POST /api/approvals/:approvalId/memory-summaries`
- `PATCH /api/memory-summaries/:id`
- `POST /api/memory-summaries/:id/supersede`

Optional convenience endpoints:

- `GET /api/issues/:issueId/memory-summaries/active`
- `GET /api/agents/:agentId/memory-summaries/active`

## Permissions

Board operator:

- full read and write access

Assigned or related agents:

- read access to summaries relevant to issues and approvals they can already access

Manager agents:

- may create proposed issue or agent summaries later if policy permits

System:

- may create run and approval summaries automatically

## UI Changes

### Run Viewer

Add a `Summary` section near the top of the run detail view:

- outcome
- key changes
- blockers
- next actions

### Issue Detail

Add a `Latest Summary` panel:

- current state
- decisions
- blockers
- next actions
- history of prior issue summaries

This should sit near the `Brief` section once briefs exist.

### Approval Detail

Show the decision summary directly in the approval detail view after resolution.

### Agent Detail

Add a `Current Context` block:

- focus areas
- constraints
- open items
- recent progress

### Memory Browser

Later, summaries should feed a dedicated searchable memory page.

## Activity Log Integration

Log the following:

- memory summary created
- memory summary updated
- memory summary superseded

The activity log remains authoritative for the full event timeline. Summaries are derived memory, not replacements.

## Heartbeat Integration

This is the main protocol payoff.

Future context assembly for an agent working an issue should prefer:

1. active brief
2. latest issue summary
3. latest relevant approval summary
4. latest agent context summary
5. current issue description
6. recent comments and activity excerpts

Guardrails:

- summaries must be bounded in size
- summaries should include freshness metadata
- stale summaries should be detectable
- underlying entities remain the source of truth

## Validation Rules

Require:

- non-empty title
- non-empty body
- valid company and entity linkage
- summary type consistent with entity type

Warn if:

- summary is older than major changes to the linked entity
- linked run or approval no longer reflects the summarized state
- multiple active summaries exist for the same entity and type

## Migration Strategy

Phase 1 migration:

- add `memory_summaries` table only
- do not require backfill
- existing runs, issues, and approvals remain fully usable without summaries

Optional later backfill:

- generate summaries for currently active issues
- generate approval summaries for recent unresolved or newly resolved approvals

## Implementation Sequence

1. Add DB schema and shared types.
2. Add server write/read APIs and validation.
3. Add automatic creation of `run_summary` and `approval_summary`.
4. Add issue and run UI sections for latest summary display.
5. Add context assembly support for issue and agent summaries.
6. Add history views and filtering.
7. Later add manager/operator-assisted summary refresh flows.

## Success Criteria

The feature is successful if:

- operators can understand recent work state faster than with raw logs alone
- agents resume work with less repeated context gathering
- heartbeat contexts become smaller and more stable
- approvals and issues retain readable durable memory

## Risks

Main risks:

- summaries drifting away from actual system state
- overproduction of low-value summaries
- turning summaries into another noisy log stream
- letting agent-written summaries become self-serving or unreliable

Mitigations:

- keep summaries secondary to authoritative entities
- favor one active summary per entity and type
- focus first on high-value summary types only
- allow review or deterministic generation in phase 1

## Relationship To Briefs

`briefs` define intended work.

`memory summaries` capture compacted state and outcomes.

These two features should reinforce one another:

- the brief tells the assignee what matters
- the summary records what happened and what matters next

## Next Follow-On Docs

After `briefs` and `memory_summaries`, the next logical planning documents are:

- operator session workflow
- knowledge browser
- evidence-driven agent evolution

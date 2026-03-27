# Briefs Spec

Status: Draft  
Owner: Backend + UI + Agent Protocol  
Date: 2026-03-27

## Feature Goal

Add a first-class `brief` entity that captures compact assignment intent for an issue.

A brief should improve delegation quality, reduce context sprawl, and create a durable handoff artifact for both agents and operators.

## Non-Goals

Do not:

- replace `issues`
- replace comments or activity logs
- introduce filesystem-based briefs
- make freeform persona prompts the source of truth
- require briefs for every issue on day one

A brief is an augmentation layer on top of the current issue model.

## Product Model

An `issue` remains the unit of work.

A `brief` becomes the assignment contract for a specific issue at a specific point in time.

A brief should answer:

- what exactly is being asked
- why it matters
- constraints
- expected output
- who it is for
- whether it is still current

## User Stories

1. As a board operator, when I assign or approve work, I want to provide a compact brief so the assignee has a clear working contract.
2. As a manager agent, when I delegate, I want the child assignee to receive a concise brief rather than infer intent from scattered issue history.
3. As an agent, I want to see the active brief first so I can act without rereading the entire thread.
4. As an operator, I want to see whether a brief is stale, superseded, or completed.

## Proposed Data Model

Add a `briefs` table with fields along these lines:

- `id`
- `company_id`
- `issue_id`
- `assigned_agent_id`
- `created_by_type`
- `created_by_id`
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

Suggested enums:

- `status`: `draft`, `active`, `superseded`, `completed`
- `source`: `manual`, `operator_generated`, `agent_generated`, `system_generated`

Suggested `constraints_json` shape:

```json
{
  "time_horizon": "this run",
  "must_not": ["change auth flow", "touch billing"],
  "must_do": ["produce implementation plan", "write tests if code changes"],
  "dependencies": ["approval #123"],
  "artifacts": ["PR summary", "design note"]
}
```

## Relational Rules

- every brief belongs to one company
- every brief belongs to one issue
- a brief may target one assigned agent
- an issue can have multiple briefs over time
- only one `active` brief per issue and assigned agent combination
- a new major delegation can supersede the previous brief
- brief history must be preserved

## Lifecycle

1. An issue exists.
2. Assignment or delegation happens.
3. A brief is created manually or auto-generated as `draft`.
4. On publish, the brief becomes `active`.
5. If assignment or scope materially changes, the prior brief becomes `superseded` and a new one is created.
6. When the issue is done or no longer relevant, the brief becomes `completed`.

## Creation Triggers

Phase 1:

- operator creates brief from issue page
- optional `create brief now` flow during assignment
- manager agents may create draft briefs through API later, but not replace active briefs autonomously in phase 1

Phase 2:

- auto-draft brief on reassignment
- CEO/manager agents can create briefs during delegation
- operators can mark auto-generated briefs as approved/current

## API

Suggested endpoints:

- `GET /api/issues/:issueId/briefs`
- `POST /api/issues/:issueId/briefs`
- `GET /api/briefs/:briefId`
- `PATCH /api/briefs/:briefId`
- `POST /api/briefs/:briefId/activate`
- `POST /api/briefs/:briefId/supersede`
- `POST /api/briefs/:briefId/complete`

Optional convenience endpoint:

- `GET /api/agents/:agentId/briefs?status=active`

## Permissions

Board operator:

- full create, update, activate, supersede, and complete permissions

Assigned agent:

- read access to active brief
- edit proposals later, but not in phase 1

Manager agent:

- may create draft briefs for delegated child work if that assignment flow already exists

## UI Changes

### Issue Detail

Add a `Brief` section near assignment and status context.

Show:

- active brief title
- body
- constraints
- expected output
- creator
- created time
- version and status
- brief history

Actions:

- create brief
- edit draft
- activate
- supersede
- complete

### Assignment Flow

When assigning an issue, optionally allow:

- checkbox: `Create brief now`
- lightweight form:
  - title
  - instructions/body
  - constraints
  - expected output

### Agent Detail

Add an `Active Briefs` list:

- issue title
- brief title
- age
- status

### Run Viewer

If a run is associated with an issue that has an active brief, show which brief version was in effect.

## Activity Log

Log the following:

- brief created
- brief activated
- brief updated
- brief superseded
- brief completed

## Agent Experience

When an agent works an issue, the active brief should be included in working context before the longer issue history.

Future context priority order:

1. active brief
2. latest issue summary
3. current issue description
4. recent relevant comments and events

## Validation Rules

Require:

- non-empty title
- non-empty body for active briefs
- issue and company consistency
- assigned agent belongs to the same company
- only one active brief per issue and assigned agent pair

Warn if:

- brief is older than the latest major issue description update
- brief assignee does not match the current issue assignee
- brief references obsolete dependencies or closed approvals

## Migration Strategy

Phase 1 migration:

- add `briefs` table only
- do not require changes to existing issue flows
- existing issues remain valid without briefs

Backfill:

- none required initially
- optional later creation of draft briefs for currently active issues

## Implementation Sequence

1. Add DB schema and shared types.
2. Add server routes and validation.
3. Add issue detail UI for viewing and creating briefs.
4. Add activity log integration.
5. Add assignment flow shortcut.
6. Add active brief inclusion in agent-facing issue payloads or context assembly.
7. Later add manager-generated draft briefs.

## Success Criteria

The feature is successful if:

- operators use briefs for non-trivial assignments
- agents require fewer clarification comments
- issue handoffs become easier to understand
- operators can see scope drift through brief history
- active issue context becomes smaller and clearer

## Risks

Main risks:

- briefs becoming redundant copies of issue descriptions
- overcomplicating assignment flow
- agents overwriting operator intent too easily
- making briefs mandatory too early

Mitigations:

- keep phase 1 manual and optional
- keep brief UI compact
- preserve issue as the source of truth
- treat briefs as assignment overlays rather than issue replacements

## Next Spec

After `briefs`, the next planning document should define `memory_summaries` so intended work and compacted outcomes can reinforce each other.

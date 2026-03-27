# Operator Session Workflow Spec

Status: Draft  
Owner: Product + UI + Backend  
Date: 2026-03-27

## Feature Goal

Add a first-class operator session workflow to Paperclip so board users can start and end working sessions with a clear, system-generated understanding of:

- what needs attention now
- what changed since their last review
- what is blocked on human action
- what was accomplished during the session

This should adapt the strongest aspects of PKA's session open and close rituals into Paperclip's existing dashboard and activity model.

## Non-Goals

Do not:

- introduce a mandatory daily ritual before Paperclip can be used
- require manual markdown summaries as the source of truth
- create a second workflow system outside issues, approvals, runs, and activity
- block work if an operator does not explicitly "start" or "close" a session

This is a workflow assistance layer, not a gate.

## Product Model

Paperclip already knows:

- pending approvals
- stalled or blocked work
- recent runs and outcomes
- budget pressure
- recent mutations in the activity log

What it lacks is a focused operator view that composes these signals into a coherent "what should I pay attention to right now?" experience.

The operator session workflow should provide that composition.

## Primary User Stories

1. As a board operator, when I open Paperclip, I want a concise start-session view so I know what needs intervention first.
2. As a board operator, I want to see what changed since my last visit without scanning the whole activity log.
3. As a board operator, I want to end a session with a generated summary of outcomes, blockers, and pending actions.
4. As a board operator, I want these views to be derived from system state, not dependent on manual note-taking.

## Core Concepts

Phase 1 should define two derived workflow surfaces:

- `Start Session`
- `Close Session`

These are UI and API read models generated from existing entities plus new summaries where available.

## Start Session

The start-session experience should answer:

- what is waiting on me
- what is newly blocked
- what changed since my last review
- where risk is accumulating

### Recommended Sections

#### 1. Pending approvals

Highest priority section.

Show:

- approval title
- type
- requesting agent
- age
- linked issue or company context

#### 2. Stalled active work

Show issues that are active but have not progressed recently.

Candidate heuristics:

- issue is `in_progress` or equivalent active state
- no successful relevant run in the last defined window
- no material update since last operator review

#### 3. Newly blocked work

Show:

- issues that entered blocked state since the last operator session
- issues awaiting approval resolution
- issues with explicit blocker comments or summary flags

#### 4. Budget and risk warnings

Show:

- agents over 80% budget
- paused agents with assigned work
- agents in error state

#### 5. Recent outcomes

Show a concise list of:

- newly completed issues
- approvals resolved
- significant runs with high-impact outcomes

#### 6. New memory since last review

When `memory summaries` exist, show:

- new issue summaries
- new run summaries
- new approval summaries

This gives the operator a faster on-ramp than raw activity alone.

## Close Session

The close-session experience should answer:

- what changed while I was engaged
- what remains unresolved
- what will need attention next

### Recommended Sections

#### 1. Completed work

Show:

- issues completed during the session
- important approvals resolved
- notable agent changes

#### 2. Work still blocked

Show:

- blocked issues not resolved during the session
- approvals still pending
- agents still paused or errored

#### 3. Follow-up required

Show:

- issues waiting on human decision
- agents needing reassignment or intervention
- budget items requiring action soon

#### 4. Session timeline summary

Compact list of the most important events during the current session window:

- assignments
- completions
- approvals
- status changes
- critical errors

#### 5. Optional operator note

Allow the operator to add a short optional note for future context.

This note should be additive metadata, not the main session record.

## Data Model

Phase 1 can likely be implemented with a small operator-session tracking table plus read models.

Suggested table:

- `operator_sessions`
  - `id`
  - `company_id`
  - `user_id`
  - `started_at`
  - `ended_at`
  - `last_seen_activity_at`
  - `operator_note`
  - `created_at`
  - `updated_at`

This table is not the source of system truth. It only anchors the session window for queries and summaries.

## Derived Read Model Inputs

The session workflow should compose from:

- approvals
- issues
- activity log
- agent status
- budgets and costs
- runs
- briefs
- memory summaries

## API

Suggested endpoints:

- `POST /api/companies/:companyId/operator-sessions`
- `GET /api/companies/:companyId/operator-sessions/current`
- `POST /api/operator-sessions/:sessionId/close`
- `GET /api/operator-sessions/:sessionId/start-view`
- `GET /api/operator-sessions/:sessionId/close-view`

Optional convenience:

- `GET /api/companies/:companyId/operator-session-overview`

That endpoint could return a derived start-session view even without an explicit active session.

## UI Changes

### Dashboard Entry Point

Add a `Start Session` card or entry panel on the board dashboard.

If no current session exists:

- show a one-click `Start session` action

If a current session exists:

- show current session age
- show unresolved items count
- offer `View session` and `Close session`

### Start Session View

This can be a dedicated dashboard surface or modal/page.

Show:

- pending approvals
- stalled work
- newly blocked work
- risk warnings
- recent outcomes
- new summaries since last review

### Close Session View

Show:

- completed work during session
- unresolved blockers
- follow-up required
- session timeline summary
- optional note field

## Interaction Model

Recommended behavior:

- starting a session records a time anchor
- the session remains active until explicitly closed or implicitly expired
- close-session summary is generated from data during that window

Reasonable expiry rules:

- auto-expire after long inactivity window
- allow reopening or starting a fresh session cleanly

## Relationship To Activity Log

The activity log remains the complete mutation trail.

Operator session workflow is a filtered and prioritized view over:

- activity
- approvals
- issues
- runs
- summaries

It should never replace the activity log.

## Relationship To Memory Summaries

Session workflow should consume memory summaries where available:

- run summaries for recent outcomes
- issue summaries for current state
- approval summaries for resolved decisions

A later phase may add `session_summary`, but phase 1 does not require a separate summary type.

## Permissions

Board users:

- full access to create, view, and close their own operator sessions

Company admins or equivalent board roles:

- may view session-derived summaries

Agents:

- no direct operator-session controls in phase 1

## Validation Rules

Require:

- session linked to a valid company and user
- only one active session per user and company in the common case

Warn if:

- close-session is requested with no material activity
- overlapping active sessions exist for the same user and company

## Migration Strategy

Phase 1 migration:

- add `operator_sessions` table if needed
- no backfill required
- system remains fully usable without explicit operator sessions

Fallback behavior:

- if no session exists, start-session overview can still be generated from recent state

## Implementation Sequence

1. Define the derived start-session and close-session read models.
2. Add minimal `operator_sessions` persistence if needed for session windows.
3. Add dashboard start-session entry point.
4. Add close-session summary view.
5. Integrate memory summaries and briefs into the session read models.
6. Refine heuristics for stalled work, new blockers, and high-priority outcomes.

## Success Criteria

The feature is successful if:

- operators reach pending approvals and blocked work faster
- operators need less manual scanning of activity history
- session close gives a reliable understanding of unresolved next actions
- operators can understand "what changed since I last looked" quickly

## Risks

Main risks:

- duplicating the dashboard with another noisy overview
- poor heuristics causing irrelevant alerts
- creating a ritual that feels mandatory without adding value

Mitigations:

- keep the session surfaces focused and concise
- prioritize approvals, blockers, and risk over generic activity
- make session workflow optional but useful

## Follow-On Work

After this spec, the next planning docs should likely be:

- knowledge browser
- evidence-driven agent evolution

# Evidence-Driven Agent Evolution Spec

Status: Draft  
Owner: Product + Backend + UI + Agent Protocol  
Date: 2026-03-27

## Feature Goal

Add a governed, evidence-driven mechanism for improving agent instructions and configuration over time based on observed performance.

This should adapt the strongest part of PKA's feedback-to-persona loop into a Paperclip-native system that is auditable, reviewable, and tied to real work outcomes.

## Non-Goals

Do not:

- allow agents to rewrite their own instructions without review
- treat anecdotal impressions as sufficient evidence
- replace existing agent configuration with a freeform persona file workflow
- make continuous self-modification mandatory for every agent

This feature should improve agents carefully, not create uncontrolled prompt drift.

## Product Model

Paperclip already has:

- agents with instructions and configuration
- runs and outcomes
- approvals
- activity history
- budgets and status

What it lacks is a structured path from:

- observed performance
- recurring strengths or failures
- feedback on outcomes

to:

- proposed improvements in instructions or configuration
- reviewed and approved changes
- measurable before/after evaluation

## Primary User Stories

1. As a board operator, I want to improve an agent based on evidence from real work rather than rewriting instructions ad hoc.
2. As a manager, I want to see patterns in an agent's performance before proposing changes.
3. As the system, I want instruction/config changes to be reviewable and auditable.
4. As an operator, I want to know whether a change actually improved results.

## Core Concepts

Phase 1 should introduce four linked concepts:

- `agent_feedback`
- `agent_review`
- `agent_change_proposal`
- `agent_change_evaluation`

These can be implemented incrementally, but the full model should be planned together.

## Agent Feedback

Feedback is the smallest evidence unit.

It should be attached to concrete work:

- issue outcome
- run
- approval result
- manual operator assessment

Suggested fields:

- `id`
- `company_id`
- `agent_id`
- `issue_id`
- `run_id`
- `approval_id`
- `feedback_type`
- `rating`
- `notes`
- `tags_json`
- `created_by_user_id`
- `created_at`

Possible `feedback_type` values:

- `quality`
- `clarity`
- `speed`
- `judgment`
- `coordination`
- `reliability`

Feedback should be optional but structured.

## Agent Review

An agent review synthesizes evidence over time.

It should answer:

- what the agent consistently does well
- where the agent struggles
- what evidence supports those conclusions
- whether a change should be proposed

Suggested fields:

- `id`
- `company_id`
- `agent_id`
- `title`
- `body`
- `structured_findings_json`
- `review_window_start`
- `review_window_end`
- `created_by_type`
- `created_by_id`
- `created_at`

Suggested `structured_findings_json` shape:

```json
{
  "strengths": ["good delegation clarity", "strong implementation follow-through"],
  "weaknesses": ["misses approval dependencies", "over-reads issue history"],
  "evidence_refs": ["run:123", "issue:456", "feedback:789"],
  "recommended_actions": ["tighten instruction section on approval handling"]
}
```

## Agent Change Proposal

A change proposal is the governed mechanism for modifying an agent.

It should support changes to:

- instructions text
- selected config values
- workflow hints
- context assembly policy

Suggested fields:

- `id`
- `company_id`
- `agent_id`
- `review_id`
- `proposal_type`
- `title`
- `summary`
- `before_state_json`
- `proposed_state_json`
- `rationale`
- `expected_improvement`
- `status`
- `created_by_type`
- `created_by_id`
- `approved_by_user_id`
- `created_at`
- `resolved_at`

Possible `proposal_type` values:

- `instructions_update`
- `config_update`
- `policy_update`

Possible `status` values:

- `draft`
- `pending_approval`
- `approved`
- `rejected`
- `applied`
- `superseded`

## Agent Change Evaluation

After a change is applied, the system should evaluate whether it helped.

Suggested fields:

- `id`
- `company_id`
- `agent_id`
- `change_proposal_id`
- `evaluation_window_start`
- `evaluation_window_end`
- `body`
- `metrics_json`
- `conclusion`
- `created_by_type`
- `created_by_id`
- `created_at`

Suggested `metrics_json` might include:

- issue completion rate
- average clarification count
- blocked-by-approval mistakes
- operator feedback trend
- success/failure rate of relevant runs

## Workflow

Recommended phase-1 workflow:

1. Operator or manager records structured feedback tied to concrete work.
2. A review is created from accumulated evidence.
3. A change proposal is drafted based on the review.
4. The proposal goes through approval.
5. If approved, the instructions/config change is applied.
6. After a defined window, the system or operator records an evaluation.

This keeps the loop rigorous and observable.

## Governance Rules

Require:

- proposals must reference supporting evidence
- instruction/config changes require explicit approval
- applied changes must be logged in activity history

Strong recommendation:

- do not allow self-approval by the agent being modified
- do not auto-apply proposals in phase 1

## API

Suggested endpoints:

- `POST /api/agents/:agentId/feedback`
- `GET /api/agents/:agentId/feedback`
- `POST /api/agents/:agentId/reviews`
- `GET /api/agents/:agentId/reviews`
- `POST /api/agents/:agentId/change-proposals`
- `GET /api/agents/:agentId/change-proposals`
- `POST /api/agent-change-proposals/:id/submit`
- `POST /api/agent-change-proposals/:id/approve`
- `POST /api/agent-change-proposals/:id/reject`
- `POST /api/agent-change-proposals/:id/apply`
- `POST /api/agent-change-proposals/:id/evaluations`

## UI Changes

### Agent Detail

Add an `Evolution` section with:

- recent feedback
- latest reviews
- active change proposals
- applied changes
- evaluation history

### Feedback Capture

Allow lightweight operator feedback from:

- issue completion flow
- run detail view
- agent detail page

Keep phase 1 feedback compact and structured.

### Review View

Show:

- findings summary
- linked evidence
- recommended actions

### Proposal View

Show:

- current instructions/config excerpt
- proposed change
- evidence summary
- expected improvement
- approval status

### Evaluation View

Show:

- what changed
- what period was measured
- whether the change helped

## Relationship To Existing Systems

This feature should integrate with:

- approvals for governance
- activity log for audit trail
- runs and issues as evidence sources
- memory summaries for context and later synthesis

It should not bypass existing approval or audit models.

## Relationship To PKA

PKA's useful idea is that team members should evolve based on accumulated evidence, not whim.

Paperclip should retain that principle while changing the mechanism:

- from persona-file editing
- to structured review, proposal, approval, and evaluation

## Permissions

Board operators:

- full feedback, review, proposal, approval, and evaluation control

Manager agents:

- may eventually draft reviews or proposals if policy allows

Agents:

- may view their own applied changes and relevant feedback later if useful
- should not control approval of their own modifications

## Validation Rules

Require:

- feedback linked to valid company and agent
- proposals linked to evidence or review
- before/after state captured for applied changes

Warn if:

- proposal lacks meaningful evidence
- multiple unresolved change proposals exist for the same agent and same change area
- evaluation window is too short to infer anything useful

## Migration Strategy

Phase 1 migration:

- add `agent_feedback`
- add `agent_reviews`
- add `agent_change_proposals`
- defer `agent_change_evaluations` if needed, but keep it in the design

No backfill required initially.

## Implementation Sequence

1. Add structured feedback capture.
2. Add review model and UI.
3. Add change proposal model tied to approvals.
4. Add application logging for approved changes.
5. Add post-change evaluation.
6. Refine metrics and evidence ranking.

## Success Criteria

The feature is successful if:

- instruction changes become evidence-backed rather than ad hoc
- operators can see why an agent was changed
- applied changes are measurable over time
- agents improve without uncontrolled drift

## Risks

Main risks:

- creating bureaucratic overhead for simple agent tuning
- low-quality feedback leading to noisy proposals
- treating small data as if it were strong evidence

Mitigations:

- start with lightweight structured feedback
- reserve proposals for repeated or meaningful patterns
- require evidence references and approval

## Follow-On Work

After this spec, the plan set is sufficient to prioritize implementation order and start breaking work into actual code milestones.

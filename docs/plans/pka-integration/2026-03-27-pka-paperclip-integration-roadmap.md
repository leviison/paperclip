# PKA-Inspired Integration Roadmap

Status: Draft  
Owner: Product + Backend + UI + Agent Protocol  
Date: 2026-03-27

## Summary

Use Paperclip as the system of record and execution plane. Treat PKA as a source of product patterns to selectively absorb where they improve clarity, delegation quality, durable memory, or local-first usability.

The intent is not to merge architectures. The intent is to strengthen Paperclip with the best parts of PKA's information architecture while preserving Paperclip's stronger orchestration model.

## Selection Criteria

Only adopt a PKA-inspired idea if it does at least one of the following:

- improves operator clarity
- reduces agent context drift
- creates better durable memory
- improves delegation quality
- adds local-first value without weakening the control plane
- can be enforced by the system rather than relying on manual ritual

Do not adopt a PKA-inspired idea if it:

- duplicates existing Paperclip capability without meaningful improvement
- pushes behavior back into manual file conventions
- weakens approvals, auditability, or multi-company boundaries
- makes markdown or persona theater the source of truth

## Recommended Features

### 1. Briefs as a first-class object

Why:

- PKA's briefing model is clearer than relying on issue description plus comment drift.
- Agents benefit from a compact assignment artifact.

What to add:

- a `briefs` entity linked to issue, assignee, creator, and company
- brief history and status transitions
- optional brief creation during assignment/delegation

Expected value:

- better delegation quality
- less ambiguity during handoff
- cleaner agent context assembly

### 2. Compaction summaries as first-class memory

Why:

- PKA is correct that operational context should be compacted into durable memory.
- Paperclip has strong logs and runs, but weaker distillation.

What to add:

- run summaries
- issue summaries
- approval summaries
- agent context summaries

Expected value:

- faster recovery between heartbeats
- lower context and prompt cost
- better operator understanding of what happened

### 3. Operator session workflow

Why:

- PKA's open/close rituals are good operator UX patterns.
- They should be implemented as derived product workflow, not manual procedure.

What to add:

- start-session dashboard panel for approvals, stalled work, budget warnings, and recent outcomes
- close-session summary for completed work, blockers, and items requiring human attention

Expected value:

- tighter board-operator workflow
- better daily oversight

### 4. Knowledge browser / memory view

Why:

- PKA's local viewer points to a useful model for readable system memory.

What to add:

- searchable memory page for briefs, summaries, approvals, and deliverable-linked outcomes
- filters by company, agent, project, and issue

Expected value:

- improved explainability
- easier post hoc review of company memory

### 5. Evidence-driven agent evolution

Why:

- PKA's feedback-to-persona loop is useful if grounded in audit and approval.

What to add:

- structured performance feedback tied to runs/issues
- instruction or configuration change proposals based on evidence
- approval gate before applying material changes

Expected value:

- agents improve over time
- instruction sets become less static

## Do Not Port Directly

Do not import these PKA patterns in their original form:

- folder-based inbox workflow as the primary control mechanism
- filesystem-deliverable protocols as canonical state
- markdown files as the source of truth
- manual scripts as core orchestration primitives
- single-machine SQLite as a replacement for Paperclip's backend model
- hard persona constraints that substitute for explicit system behavior

These may be useful prototypes, but the Paperclip implementation should express their intent through structured data, APIs, and UI.

## Implementation Order

1. Briefs
2. Compaction summaries
3. Operator session workflow
4. Knowledge browser
5. Evidence-driven agent evolution

## Phase Plan

### Phase 1: Briefs

- design schema and shared types
- add API routes and validation
- add issue detail UI
- add activity log integration
- optionally create briefs during assignment

### Phase 2: Compaction summaries

- define summary types and generation triggers
- store structured summaries
- surface latest summaries in UI
- integrate summaries into agent context assembly

### Phase 3: Operator workflow

- add start-session dashboard panel
- add close-session summary generation
- highlight stalled and approval-blocked work

### Phase 4: Knowledge browser

- add searchable memory browser
- expose briefs, summaries, decisions, and outcomes
- consider later export or local snapshot modes

### Phase 5: Agent improvement loop

- collect structured feedback
- propose instruction/config changes from evidence
- require approval before application
- measure before/after performance

## Architecture Guardrails

While integrating:

- keep `issues` as the backbone of work
- keep approvals first-class
- keep activity logs authoritative
- keep company isolation strict
- keep adapters/runtime separate from memory UX
- prefer structured entities over freeform markdown

## Success Metrics

A PKA-inspired feature is worth keeping if it measurably:

- reduces task clarification churn
- reduces prompt/context size per run
- improves operator understanding of work state
- shortens recovery time for paused/resumed agents
- improves quality of delegated work

## Recommended Branching Model

If this work becomes product differentiation rather than an upstream contribution path:

- fork `paperclipai/paperclip`
- treat upstream as a tracked source rather than the primary home
- keep `origin` as the fork and `upstream` as the original repo
- land work on focused feature branches such as:
  - `feature/briefs`
  - `feature/memory-summaries`
  - `feature/operator-session-workflow`

## Immediate Next Spec

The first implementation spec should be `briefs`, followed by `memory_summaries`.

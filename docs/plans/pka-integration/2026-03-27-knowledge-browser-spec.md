# Knowledge Browser Spec

Status: Draft  
Owner: Product + UI + Backend  
Date: 2026-03-27

## Feature Goal

Add a dedicated knowledge browser to Paperclip so operators can review, search, and understand company memory through a readable, compact interface instead of relying only on operational screens and raw activity logs.

This should adapt the strongest aspect of PKA's local viewer concept into a Paperclip-native product surface.

## Non-Goals

Do not:

- replace the main dashboard, issue views, or activity log
- create a second canonical storage model outside Paperclip's database
- make the browser an editor-first workspace in phase 1
- turn the feature into a generic document-management system

This is a read-first memory surface over structured Paperclip entities.

## Product Model

Paperclip is already strong at:

- current operational state
- orchestration controls
- approvals and activity
- agent runs

It is weaker at:

- historical legibility
- durable narrative memory
- operator understanding of "what this company has learned and done"

The knowledge browser should be the place where Paperclip's durable memory becomes readable.

## Primary User Stories

1. As a board operator, I want to search company memory by topic, project, issue, or agent.
2. As a board operator, I want to review summaries, briefs, approvals, and outcomes without reconstructing them from low-level events.
3. As an operator returning after time away, I want a readable memory view that explains the company's recent work and decisions.
4. As a future manager agent or system workflow, I want structured memory to be queryable in a coherent way.

## Scope

Phase 1 should focus on browsing and searching these memory objects:

- briefs
- memory summaries
- approvals and approval summaries
- issue outcomes and completions

Later phases may include:

- issue documents
- deliverables or artifacts
- project-level and goal-level summaries
- agent review history

## Product Surface

Add a dedicated `Knowledge` or `Memory` section in the Paperclip UI.

This surface should be optimized for:

- search
- filtering
- browsing recent or important memory
- understanding relationships between entities

It should not initially be optimized for heavy editing.

## Core Views

### 1. Search view

Primary interface for targeted retrieval.

Searchable across:

- brief title and body
- memory summary title and body
- approval titles and summaries
- issue titles and outcome summaries

Filters:

- company
- project
- issue
- agent
- summary type
- date range
- status
- entity type

### 2. Recent memory view

Show the most recent durable memory objects:

- newly created briefs
- latest issue summaries
- recent run summaries
- recent approval decisions
- newly completed issues

### 3. By entity view

Allow browsing memory clustered by:

- issue
- agent
- project
- approval

This should help operators understand continuity rather than isolated entries.

### 4. Important decisions view

Highlight:

- resolved approvals
- issue summaries with major decisions
- notable architectural or workflow changes

This is especially useful for long-lived companies where decision history matters.

## Read Model

The browser should be backed by a memory-oriented read model rather than raw joins in the UI.

Suggested response shape:

- `id`
- `company_id`
- `memory_kind`
- `entity_type`
- `entity_id`
- `title`
- `body_excerpt`
- `status`
- `created_at`
- `created_by`
- `related_issue`
- `related_agent`
- `related_project`
- `tags` or typed facets

Possible `memory_kind` values:

- `brief`
- `run_summary`
- `issue_summary`
- `approval_summary`
- `issue_outcome`
- later `document`, `artifact`, `agent_review`

## Search Strategy

Phase 1 search does not need full semantic retrieval.

Recommended baseline:

- structured SQL search with indexed text fields
- prefix and substring matching where appropriate
- filter-first narrowing

If needed later:

- weighted ranking by memory kind, freshness, and operator relevance
- semantic retrieval or embeddings

## API

Suggested endpoints:

- `GET /api/companies/:companyId/knowledge`
- `GET /api/companies/:companyId/knowledge/search`
- `GET /api/companies/:companyId/knowledge/recent`
- `GET /api/companies/:companyId/knowledge/important-decisions`
- `GET /api/companies/:companyId/knowledge/by-entity`

Example query parameters:

- `q`
- `memoryKind`
- `entityType`
- `issueId`
- `agentId`
- `projectId`
- `status`
- `dateFrom`
- `dateTo`
- `limit`
- `cursor`

## UI Changes

### Navigation

Add a `Knowledge` or `Memory` item in the main sidebar.

### Search Results Layout

Use readable cards or rows with:

- title
- memory kind badge
- related entity labels
- short excerpt
- timestamp
- links back to issue, approval, or agent detail

### Detail Drawer or Panel

When opening a memory item, show:

- full title
- full body
- structured metadata
- links to related issue, agent, project, approval, or run
- prior or superseded versions when relevant

### Empty State

If little memory exists yet, explain what will populate this view:

- briefs
- summaries
- approvals
- completed work

## Relationship To Existing Screens

The knowledge browser should complement existing screens:

- issue pages remain the best place for operational work on one issue
- approval pages remain the best place for governance actions
- run viewer remains the best place for detailed execution review
- activity log remains the complete mutation timeline

The knowledge browser becomes the best place for durable understanding across all of them.

## Relationship To Briefs and Memory Summaries

This feature depends heavily on prior work:

- `briefs` provide assignment intent
- `memory summaries` provide compacted state and outcomes

The knowledge browser is where those memory objects become explorable at company level.

## Permissions

Board users:

- full read access within company scope

Agents:

- phase 1 likely no browser UI access
- API-level access later only if needed and policy-safe

Company isolation:

- all memory queries must remain company-scoped

## Validation Rules

Require:

- all results filtered by company scope
- memory items reference valid underlying entities where applicable

Warn if:

- browser shows stale summaries without indicating freshness
- superseded memory is shown as current without clear labeling

## Migration Strategy

Phase 1 migration:

- no separate data table required if browser is built from existing entities and memory-summary tables
- optional search indexes or materialized read models may be added if performance requires it

The feature should degrade gracefully if only some memory types exist.

## Implementation Sequence

1. Define memory-browser read model.
2. Add company-scoped search and recent-memory endpoints.
3. Add sidebar entry and search UI.
4. Add detail panel with links to source entities.
5. Add filters and important-decisions view.
6. Refine ranking, performance, and grouping behavior.

## Success Criteria

The feature is successful if:

- operators can find relevant company memory quickly
- operators understand past work and decisions with less activity-log scanning
- returning users can reconstruct context faster
- the browser becomes the natural place to review durable company knowledge

## Risks

Main risks:

- building a generic search page with little product value
- exposing too many low-value memory objects
- weak ranking making search feel noisy

Mitigations:

- start with a small set of high-value memory kinds
- prioritize readable excerpts and good filters
- keep links back to authoritative source entities obvious

## Follow-On Work

After this spec, the next logical planning document is:

- evidence-driven agent evolution

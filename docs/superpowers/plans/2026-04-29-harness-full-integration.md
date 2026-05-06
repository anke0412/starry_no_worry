# Star Project Harness Full Integration Plan

## Goal

Fully integrate the Codex harness structure into the existing `star` project without replacing the current product plan or discarding the existing Phase 2 orchestration work.

## Existing Project Reality

The project is not greenfield. It already contains:

- a long-form product and implementation plan in `/Users/lianke/PycharmProjects/star/plan.md`
- stable memory docs in `/Users/lianke/PycharmProjects/star/docs/project-memory-zh.md` and `/Users/lianke/PycharmProjects/star/docs/project-memory-brief-zh.md`
- a shared API contract doc in `/Users/lianke/PycharmProjects/star/docs/api-contracts.md`
- several design and implementation plan artifacts under `/Users/lianke/PycharmProjects/star/docs/superpowers/`
- an existing Phase 2 subagent orchestration runbook at `/Users/lianke/PycharmProjects/star/docs/superpowers/plans/2026-04-28-phase2-subagent-orchestration.md`
- in-progress code and unstaged changes that must not be overwritten

This means the harness should be integrated as a new control surface layered on top of the current documentation, not as a replacement.

## Integration Strategy

### Stable truth layer

Create a formal split under `docs/`:

- `docs/product/`
- `docs/architecture/`
- `docs/engineering/`
- `docs/harness/`

Use these to promote durable truths out of the current monolithic docs and plan.

### Runtime layer

Create `work/` for execution-state artifacts:

- `work/backlog/`
- `work/plans/`
- `work/runs/`
- `work/decisions/`

### Root control layer

Create `/Users/lianke/PycharmProjects/star/AGENTS.md` to define:

- read order
- stable-vs-runtime doc boundaries
- how `plan.md` should be used
- how Phase 2 should proceed under the harness

## File Map

### Root

- `/Users/lianke/PycharmProjects/star/AGENTS.md`
  - primary entry point for the main agent

### Product

- `/Users/lianke/PycharmProjects/star/docs/product/vision.md`
- `/Users/lianke/PycharmProjects/star/docs/product/scope.md`
- `/Users/lianke/PycharmProjects/star/docs/product/ux-principles.md`
- `/Users/lianke/PycharmProjects/star/docs/product/glossary.md`

These should summarize and normalize durable product truths already present in `plan.md` and project memory.

### Architecture

- `/Users/lianke/PycharmProjects/star/docs/architecture/system-overview.md`
- `/Users/lianke/PycharmProjects/star/docs/architecture/frontend-boundaries.md`
- `/Users/lianke/PycharmProjects/star/docs/architecture/backend-boundaries.md`
- `/Users/lianke/PycharmProjects/star/docs/architecture/data-contracts.md`
- `/Users/lianke/PycharmProjects/star/docs/architecture/integration-rules.md`

These should extract the durable structure from `plan.md`, `docs/api-contracts.md`, and current backend/frontend layout.

### Engineering

- `/Users/lianke/PycharmProjects/star/docs/engineering/stack-rules.md`
- `/Users/lianke/PycharmProjects/star/docs/engineering/coding-rules.md`
- `/Users/lianke/PycharmProjects/star/docs/engineering/testing-strategy.md`
- `/Users/lianke/PycharmProjects/star/docs/engineering/release-checklist.md`
- `/Users/lianke/PycharmProjects/star/docs/engineering/definition-of-done.md`

These should codify what the main agent already needs to know about the mixed React/FastAPI repo and the verify expectations in Phase 2.

### Harness

- `/Users/lianke/PycharmProjects/star/docs/harness/project-bootstrap.md`
- `/Users/lianke/PycharmProjects/star/docs/harness/operating-model.md`
- `/Users/lianke/PycharmProjects/star/docs/harness/delegation-rules.md`
- `/Users/lianke/PycharmProjects/star/docs/harness/gates.md`
- `/Users/lianke/PycharmProjects/star/docs/harness/recovery-playbook.md`
- `/Users/lianke/PycharmProjects/star/docs/harness/human-escalation.md`
- `/Users/lianke/PycharmProjects/star/docs/harness/task-plan-template.md`
- `/Users/lianke/PycharmProjects/star/docs/harness/runbook.md`
- `/Users/lianke/PycharmProjects/star/docs/harness/reuse-guide.md`

These should formalize the main-agent/subagent workflow while explicitly linking to the already-written Phase 2 subagent orchestration runbook instead of duplicating it.

### Runtime

- `/Users/lianke/PycharmProjects/star/work/README.md`
- `/Users/lianke/PycharmProjects/star/work/backlog/README.md`
- `/Users/lianke/PycharmProjects/star/work/plans/README.md`
- `/Users/lianke/PycharmProjects/star/work/runs/README.md`
- `/Users/lianke/PycharmProjects/star/work/decisions/README.md`
- `/Users/lianke/PycharmProjects/star/work/plans/phase2-harness-adoption.md`

The last file should become the concrete execution-ready plan for adopting the harness during the current Phase 2.

## Task Breakdown

### Task 1: Create root and harness entrypoints

Add `AGENTS.md` and harness docs that explain how to read the repo and how the existing Phase 2 runbook plugs into the formal harness.

### Task 2: Promote current truths into stable layered docs

Create product, architecture, and engineering docs by distilling current truths from:

- `plan.md`
- `docs/project-memory-zh.md`
- `docs/project-memory-brief-zh.md`
- `docs/api-contracts.md`

Do not copy large bodies verbatim. Normalize and condense.

### Task 3: Create runtime workspace docs

Add `work/` READMEs that define where active plans, run logs, and temporary decisions now live.

### Task 4: Create a Phase 2 adoption plan

Write `work/plans/phase2-harness-adoption.md` to convert the current "we are in Phase 2 and new chart types are underway" state into a harness-driven execution plan with:

- task brief
- scope
- acceptance criteria
- delegation structure
- verification expectations
- recovery rules

### Task 5: Review consistency

Check that:

- `AGENTS.md` points to real files
- the harness docs do not contradict the existing Phase 2 orchestration runbook
- stable docs reuse current truths instead of inventing a new project direction
- runtime docs clearly separate ongoing execution from stable project memory

## Verification

Run lightweight verification suitable for this docs integration:

1. `find /Users/lianke/PycharmProjects/star/docs -maxdepth 3 -type f | sort`
2. `find /Users/lianke/PycharmProjects/star/work -maxdepth 3 -type f | sort`
3. manual read-through of `AGENTS.md` and `work/plans/phase2-harness-adoption.md`

## Risks

- Duplicating truth between old and new docs
- Contradicting the existing Phase 2 runbook
- Accidentally writing "template" guidance that ignores the already-implemented chart types

## Mitigations

- treat `plan.md` as the top-level product roadmap
- treat project memory docs as source inputs for promoted truths
- point harness execution rules at the existing Phase 2 runbook where it is already more specific
- write the first runtime plan specifically for current Phase 2 adoption rather than pretending the repo is new

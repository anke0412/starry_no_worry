# Phase 2 Harness Adoption

## Header

- Task name: Phase 2 harness adoption
- Date: 2026-04-29
- Status: completed
- Phase: Phase 2

## 1. Task Brief

Integrate the Codex harness into the existing Starry No Worry repository so the current Phase 2 work can continue under a stable main-agent and subagent control model.

## 2. Product Intent

The user should not need to repeatedly restate the project frame while advanced chart-family work continues. The harness should let the main agent resume, delegate, review, verify, and record progress with less drift.

## 3. Scope

### In Scope

- add `AGENTS.md`
- add layered stable docs under `docs/product/`, `docs/architecture/`, `docs/engineering/`, and `docs/harness/`
- add runtime `work/` structure
- define how the existing Phase 2 runbook and future execution plans fit together

### Out Of Scope

- rewriting the existing roadmap in `plan.md`
- changing current chart implementation behavior
- cleaning up unrelated in-progress code edits

### Protected Areas

- existing in-progress implementation files with unstaged changes
- existing Phase 2 plan files unless a future task explicitly updates them

## 4. Acceptance Criteria

- the repo has one clear main-agent entrypoint
- stable docs and runtime docs are separated
- the existing Phase 2 orchestration runbook is referenced as the detailed stage protocol
- a future Phase 2 feature task can start from `work/plans/` without inventing new control docs

## 5. Constraints

- preserve current product direction
- preserve current Phase 2 execution rules
- avoid touching unrelated implementation work

## 6. Execution Graph

### Main-Agent Work

- inspect current docs
- create the harness integration plan
- write the stable and runtime control docs
- review consistency

### Future `impl` Tasks

- specific new chart-family backend work
- frontend chart-type integrations
- contract evolution slices

### Future `review` Tasks

- correctness and regression review per feature task

### Future `verify` Tasks

- backend pytest
- frontend tests
- frontend build
- task-specific targeted checks

## 7. Verification Plan

- inspect created docs with `find` and targeted reads
- on future feature tasks, use the repo baseline:
  - `cd backend && ../.venv312/bin/python -m pytest tests`
  - `npm test`
  - `npm run build`

## 8. Risks

- duplicated truth across old and new docs
- agents continuing to use chat instead of the new `work/plans/` entrypoint
- Phase 2 runbook and new harness docs drifting apart later

## 9. Recovery Rules

- if stable docs drift from the roadmap, update the stable docs rather than creating new parallel summaries
- if a feature task lacks a clear plan, stop and create a proper `work/plans/` entry first
- if Phase 2 execution rules evolve, update the specialized runbook and keep harness docs aligned

## 10. Decision Capture

- future changes to subagent stage rules should update `docs/harness/` and the specialized Phase 2 runbook
- future durable architecture learnings should be promoted into `docs/architecture/`

## Completion Note

Completed on 2026-04-29 by adding:

- `AGENTS.md`
- layered stable docs under `docs/product/`, `docs/architecture/`, `docs/engineering/`, and `docs/harness/`
- runtime execution structure under `work/`

The next active task should move from harness adoption into a concrete Phase 2 feature plan.

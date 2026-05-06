# Starry No Worry Harness

This repository uses a documentation-first harness for long-running Codex work.

## Read Order

When starting a new session, read in this order:

1. `AGENTS.md`
2. `docs/harness/project-bootstrap.md`
3. `plan.md`
4. `docs/project-memory-brief-zh.md`
5. `docs/project-memory-zh.md`
6. `docs/product/`
7. `docs/architecture/`
8. `docs/engineering/`
9. `docs/harness/`
10. `work/plans/` for the active task
11. `work/runs/` and `work/decisions/` only if relevant

## Source Of Truth

- `plan.md` is the long-range roadmap.
- `docs/` holds stable product, architecture, engineering, and harness truth.
- `work/` holds runtime task state.

Do not create parallel roadmap or todo systems outside these areas.

## Main Agent Responsibilities

- restore context from the read order before changing code
- keep exactly one execution-ready active plan in `work/plans/`
- advance one bounded step or slide at a time
- use `impl -> review -> verify` as the default execution shape
- update plans, docs, and decisions as reality changes

## Continuous Execution Default

The default mode is continuous execution.

- completing one step or slide does not end the session
- completing one active plan does not end the phase
- after local completion, continue unless a real blocker, escalation condition, or explicit user pause exists

## Git Lifecycle Default

Code changes must be managed through branches.

- each bounded step or slide should use its own branch
- after verify passes, update the plan, commit, push, merge into `main`, pull latest `main`, and only then continue
- if push, merge, or pull fails, stop and report

## Phase 2 Operating Rule

This repo is currently inside Phase 2.

- treat `plan.md` as the product roadmap
- treat `work/plans/phase2-full-rollout.md` as the current active execution ledger unless a newer active plan replaces it
- treat `docs/superpowers/plans/2026-04-28-phase2-subagent-orchestration.md` as the specialized Phase 2 subagent protocol when it exists and is relevant

## Escalate To The Human When

- product direction forks materially
- roadmap order in `plan.md` should change
- architecture constraints block correctness
- destructive or risky migration work is required
- repeated failures show the current plan is wrong
- push, merge, or pull cannot be completed safely

## Key Files

- `docs/harness/runbook.md`
- `docs/harness/gates.md`
- `docs/harness/continuous-execution.md`
- `docs/harness/git-lifecycle.md`
- `work/plans/phase2-full-rollout.md`

# Starry No Worry Harness

This repository uses a documentation-first Codex harness for long-running work.

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
11. `work/runs/` and `work/decisions/` only if they are relevant

## Source-Of-Truth Boundaries

- `plan.md` is the long-range product and implementation roadmap.
- `docs/product/`, `docs/architecture/`, and `docs/engineering/` hold stable truths promoted from the roadmap and project memory.
- `docs/harness/` defines how the main agent and subagents should operate.
- `work/` holds runtime artifacts for active execution.

Do not create parallel roadmap files outside these areas.

## Main Agent Responsibilities

- restore context from the read order before making changes
- keep the active task represented by one execution-ready plan in `work/plans/`
- delegate only bounded work
- reconcile subagent output into one coherent result
- run verification before completion claims
- record durable decisions in the right place

## Continuous Execution Default

The default mode in this repo is continuous execution, not one-task-then-stop.

- When an active task reaches completion, the main agent must not stop just because one plan is done.
- Within an active rollout plan, the main agent should immediately choose the next unfinished step or slide and continue.
- If the active rollout plan is fully completed, the main agent should immediately choose the next coherent task from the current phase queue, create or activate the next execution-ready plan in `work/plans/`, and continue.
- The main agent should stop only for a real escalation condition, a hard blocker, or an explicit user pause.
- "Task complete" is not the same as "session complete."

## Git Lifecycle Default

Code changes must be managed through branches as the default operational unit.

- Each bounded step or slide should run on its own branch.
- After a step or slide passes `impl -> review -> verify`, the main agent should update the plan, commit the scoped changes, push the branch, merge into `main`, pull the latest `main`, and only then start the next step or slide.
- The main agent must not carry unfinished code from one completed step into the next step without closing the branch lifecycle first.
- If push, merge, or pull fails, treat that as a real blocker and stop to report the issue.

## Phase 2 Operating Rule

The repo is already inside Phase 2. Harness adoption should not reset the current direction.

- Treat `plan.md` as the product roadmap.
- Treat `docs/superpowers/plans/2026-04-28-phase2-subagent-orchestration.md` as the specialized Phase 2 execution runbook.
- Treat the newest non-completed Phase 2 file in `work/plans/` as the current harness-controlled task entrypoint.

## Subagent Rule

Subagents may implement, review, or verify bounded tasks, but they must not:

- redefine Phase 2 priorities
- rewrite stable truths without main-agent review
- create shadow task trackers

## Escalate To The Human When

- product scope changes materially
- a new chart family changes the roadmap order or value proposition
- architecture constraints conflict with chart correctness or UX requirements
- repeated failures show the plan should be rewritten
- risky migration or destructive changes are required

## Key Files

- `docs/harness/operating-model.md`
- `docs/harness/delegation-rules.md`
- `docs/harness/gates.md`
- `docs/harness/git-lifecycle.md`
- `docs/harness/runbook.md`
- `work/plans/phase2-full-rollout.md`
- `docs/superpowers/plans/2026-04-28-phase2-subagent-orchestration.md`

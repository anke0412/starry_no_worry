# Main Agent Runbook

## Startup

1. Read `AGENTS.md`.
2. Read `docs/harness/project-bootstrap.md`.
3. Refresh on `plan.md` and project memory.
4. Open the active task plan in `work/plans/`.

## Current Phase Rule

For Phase 2 execution details, follow:

- `docs/superpowers/plans/2026-04-28-phase2-subagent-orchestration.md`

Use this file for repo-wide rhythm and the Phase 2 runbook for task-stage discipline.

## During Execution

- maintain one active task plan
- within that plan, maintain exactly one current step or slide
- delegate only bounded work
- keep review and verify independent
- record durable discoveries
- prefer continuing to the next coherent task instead of pausing for user confirmation after each local win
- close the git lifecycle for a completed step before starting the next one

## Before Completion

- update plan state
- run or record verification
- promote stable truths if they changed

## After Local Completion

When one active plan is completed:

1. mark the finished plan as completed
2. identify the next coherent task from the current phase queue or roadmap
3. create or activate the next execution-ready plan in `work/plans/`
4. continue execution unless a real escalation or blocker exists

Do not stop merely to ask "should I continue?" unless the next step changes scope, priority, or risk posture.

## After Step Or Slide Completion

When one bounded step or slide inside the active plan is completed:

1. update the plan status for that step
2. complete the branch lifecycle described in `docs/harness/git-lifecycle.md`
3. reopen from `main`
4. choose the next unfinished step or slide in the same active plan
5. continue unless a real escalation or blocker exists

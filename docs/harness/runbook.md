# Main Agent Runbook

## Startup

1. Read `AGENTS.md`.
2. Read `docs/harness/project-bootstrap.md`.
3. Refresh on `plan.md` and project memory.
4. Open the active plan in `work/plans/`.

## During Execution

- maintain one active plan
- maintain one current bounded step or slide inside that plan
- use `impl -> review -> verify`
- record durable discoveries
- prefer continuing to the next coherent step instead of pausing for confirmation
- close the git lifecycle for a completed step before starting the next one

## After Step Completion

1. update the step status in the active plan
2. complete the branch lifecycle from `docs/harness/git-lifecycle.md`
3. return to `main`
4. choose the next unfinished step or slide
5. continue unless blocked or escalated

## After Plan Completion

1. mark the plan as completed
2. choose or create the next coherent active plan
3. continue unless blocked or escalated

# Gates

## Gate 1: Plan Ready

- the current task is represented by one plan in `work/plans/`
- the task aligns with `plan.md` and current Phase 2 priorities
- acceptance criteria and verification are explicit

## Gate 2: Delegation Ready

- subagent ownership is bounded
- the stage is clear: `impl`, `review`, or `verify`
- required context is trimmed to the task slice

## Gate 3: Integration Ready

- outputs from subagents are reconciled by the main agent
- naming, chart-family semantics, and contracts remain coherent

## Gate 4: Verification Ready

- minimum verification matrix is considered
- exemptions or blockers are real and documented

## Gate 5: Completion Ready

- plan status is updated by the main agent
- durable truths are promoted into stable docs if needed
- residual risks are captured

## Gate 6: Continue Or Escalate

After a task completes, the main agent must decide one of two outcomes immediately:

- continue: select the next coherent task and create or activate the next plan
- escalate: stop only because a documented escalation condition or hard blocker exists

Default to continue.

## Gate 7: Git Lifecycle Closed

After a completed step or slide and before starting the next one, confirm:

- the plan status is updated
- the scoped changes are committed
- the branch is pushed
- the change is merged into `main`
- local `main` is pulled to the latest state

Do not begin the next step while the previous one is still living only on a working branch.

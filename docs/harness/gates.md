# Gates

## Gate 1: Plan Ready

- exactly one active execution-ready plan exists
- the current step or slide is explicit
- acceptance criteria and verification are explicit

## Gate 2: Delegation Ready

- subagent ownership is bounded
- stage is explicit: `impl`, `review`, or `verify`
- context is trimmed to the current step

## Gate 3: Integration Ready

- subagent outputs are reconciled
- naming, semantics, and contracts remain coherent

## Gate 4: Verification Ready

- targeted checks are defined
- the default matrix is considered

## Gate 5: Completion Ready

- plan status is updated
- durable truths are promoted if needed
- residual risks are captured

## Gate 6: Continue Or Escalate

After a step, slide, or plan completes, default to continue unless a real blocker or escalation condition exists.

## Gate 7: Git Lifecycle Closed

Before starting the next step:

- the scoped changes are committed
- the branch is pushed
- the change is merged into `main`
- local `main` is pulled to the latest state

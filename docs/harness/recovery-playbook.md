# Recovery Playbook

## Scope Drift

- stop implementation
- compare the change against `plan.md` and the active plan
- rewrite the boundary before continuing

## Verification Failure

- determine whether the break is local, contract-level, or systemic
- fix within the current step if possible
- replan if the current step is too broad

## Git Lifecycle Failure

- stop before starting the next step
- report whether push, merge, or pull failed
- do not carry unfinished branch state into the next step

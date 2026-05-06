# Recovery Playbook

## Scope Drift

- stop implementation
- compare the change against `plan.md` and the active `work/plans/` entry
- rewrite the task boundary before continuing

## Subagent Conflict

- keep the main agent as the only integration authority
- choose one canonical direction
- update the active plan before redispatch

## Verification Failure

- determine whether the break is local, contract-level, or systemic
- fix local issues inside the task scope
- escalate or replan if the failure exposes a wrong architectural assumption

## Context Drift

- trust stable docs before transient notes
- promote new durable truth from `work/decisions/` into the proper stable doc

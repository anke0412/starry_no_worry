# Human Escalation

Escalate only when the main agent cannot safely continue inside current product and architecture bounds.

## Escalate When

- the roadmap order in `plan.md` should change
- a new chart family introduces a meaningful product tradeoff
- architecture constraints block correctness
- destructive or risky migration work is required
- repeated task failures show the current plan is wrong

## Do Not Escalate For

- ordinary implementation choices inside an approved task
- small naming or structure decisions that do not change product direction
- the mere fact that one plan finished and another can be started
- recoverable test failures that belong to the current task boundary

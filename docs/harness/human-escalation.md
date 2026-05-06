# Human Escalation

Escalate only when the main agent cannot safely continue within current product and architecture bounds.

## Escalate When

- roadmap order should change
- product direction forks materially
- architecture constraints block correctness
- destructive or risky migration is required
- repeated failures show the plan is wrong
- push, merge, or pull cannot be completed safely

## Do Not Escalate For

- ordinary implementation choices inside an approved step
- finishing one step and moving to the next
- recoverable test failures inside the current task boundary

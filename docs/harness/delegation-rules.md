# Delegation Rules

## Safe Delegation Targets

- one backend chart-family service slice
- one API contract update plus tests
- one frontend integration slice for a specific chart type
- one isolated review pass
- one isolated verification pass

## Unsafe Delegation Targets

- rewriting Phase 2 priorities
- broad cross-layer scope changes without an updated plan
- hidden contract changes without explicit ownership

## Phase 2 Rule

When the active task is under the current Phase 2 runbook, use the required three-stage flow:

- `impl`
- `review`
- `verify`

Do not skip or merge those roles into one stage.

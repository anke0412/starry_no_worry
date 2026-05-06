# Git Lifecycle

This repo uses branch-based step management by default.

## Default Unit

The default git unit is one bounded step or slide from the active plan.

## Required Lifecycle

For each completed step or slide:

1. start from up-to-date `main`
2. create a new scoped branch
3. implement the step
4. complete `review`
5. complete `verify`
6. update the active plan status
7. commit the scoped changes
8. push the branch
9. merge the branch into `main`
10. pull the latest `main`
11. create the next scoped branch for the next step or slide

## Branch Naming

Use a deterministic branch name that includes the plan and the current step or slide identifier.

Recommended pattern:

- `codex/<plan-slug>-<step-slug>`

Examples:

- `codex/phase2-full-rollout-slice1-2-visibility-toggles`
- `codex/phase2-full-rollout-slice2-1-linked-highlighting`

## Stop Conditions

Stop and report instead of continuing when:

- push fails
- merge into `main` fails
- pull from `main` fails
- the working tree is not in a safe state for the next branch lifecycle

## Non-Interactive Preference

Prefer non-interactive git commands. Do not depend on interactive consoles to complete the lifecycle.

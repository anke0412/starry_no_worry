# Git Lifecycle

This repo uses branch-based step management by default.

## Default Unit

The default git unit is one bounded step or slide from the active plan.

## Required Lifecycle

For each completed step or slide:

1. start from up-to-date `main`
2. create a scoped branch
3. implement the step
4. complete `review`
5. complete `verify`
6. update the plan status
7. commit the scoped changes
8. push the branch
9. merge the branch into `main`
10. pull the latest `main`
11. create the next scoped branch for the next step

## Branch Naming

Recommended format:

- `codex/<plan-slug>-<step-slug>`

## Stop Conditions

Stop and report instead of continuing when:

- push fails
- merge into `main` fails
- pull from `main` fails
- the working tree is not safe for the next branch lifecycle

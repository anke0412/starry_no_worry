# Harness Bootstrap

This document explains how the repository harness is expected to behave.

## Current Operating Model

- The repository separates stable truth from runtime state.
- Stable truth lives in `docs/`.
- Runtime state lives in `work/`.
- The main agent should resume from the current active file in `work/plans/`.

## Active Plan Rules

- A plan is active when its status is marked `Active`.
- Only one plan should be `Active` at a time.
- Plans should be execution-ready and use explicit step checklists.
- Multi-step plans should advance one current step at a time.

## Step Lifecycle

Each step should normally include:

1. `impl`
2. `review`
3. `verify`

When a step completes:

1. update the step state in `work/plans/`
2. commit the scoped change
3. push the branch
4. merge into `main`
5. pull latest `main`
6. create the next step branch
7. continue unless a real blocker is hit

## Default Verification Matrix

- backend: `cd backend && ../.venv312/bin/python -m pytest tests`
- frontend: `npm test`
- build: `npm run build`

If a check is skipped, the reason must be written in the active plan.

## Current Bootstrap Gap

This harness was added after earlier work landed in `docs/superpowers/`.
Existing historical plans there should be treated as reference history, while all new execution state must live under `work/`.

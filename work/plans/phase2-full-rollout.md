# Phase 2 Full Rollout

Status: `Active`
Plan Slug: `phase2-full-rollout`
Current Step: `step-02-restore-derived-services`
Last Updated: `2026-05-06`

## Goal

Restore a recoverable harness-driven execution flow and complete the next coherent Phase 2 backend rollout for chart types already exposed by the frontend and API contracts.

## Context

- The repository did not contain `AGENTS.md`, `docs/harness/`, or `work/` at session start.
- Historical planning artifacts exist under `docs/superpowers/plans/`, but they are completed reference history rather than runtime state.
- Current backend test collection already fails because route imports reference missing service modules such as `app.services.lunar_return`.
- Frontend and contract tests already reference `composite`, `davison`, `relationship-transit`, `progression`, `solar-return`, and `lunar-return`, so the next coherent rollout is service restoration and contract reconciliation rather than introducing a brand-new product direction.

## Step Status

### Step 01: Harness bootstrap

Status: `Completed`
Branch: `codex/phase2-full-rollout-harness-bootstrap`
Goal: establish the required harness files and active-plan entrypoint.

- [x] `impl` Create `AGENTS.md` with startup-order and harness rules.
- [x] `impl` Create `docs/harness/project-bootstrap.md`.
- [x] `impl` Create `docs/product/`, `docs/architecture/`, and `docs/engineering/` indexes.
- [x] `impl` Create `work/plans/phase2-full-rollout.md` as the active runtime plan.
- [x] `review` Review the bootstrap files for consistency with current repository layout.
- [x] `verify` Confirm the new startup paths exist and are readable.

### Step 02: Restore derived chart service modules

Status: `In Progress`
Branch: `codex/phase2-full-rollout-restore-derived-services`
Goal: restore missing backend source modules required by existing routes for `lunar-return`, `progression`, and `relationship-transit`.

- [ ] `impl` add failing targeted backend tests for the missing service paths or imports as needed.
- [ ] `impl` implement the missing service modules and wire them to existing generator patterns.
- [ ] `review` inspect contract compatibility against current frontend expectations.
- [ ] `verify` run targeted backend tests, then `cd backend && ../.venv312/bin/python -m pytest tests`.

### Step 03: Restore fused relationship chart service modules

Status: `Pending`
Branch: `codex/phase2-full-rollout-restore-fused-services`
Goal: restore backend source modules for `composite` and `davison` using the shared fusion-generator contract already referenced by docs and tests.

- [ ] `impl` add or refresh failing backend tests for composite and davison behaviors.
- [ ] `impl` implement `CompositeChartService` and `DavisonChartService`.
- [ ] `review` inspect response-shape parity with `docs/api-contracts.md` and frontend consumers.
- [ ] `verify` run targeted backend tests plus frontend contract tests that exercise these chart types.

### Step 04: Matrix verification and doc reconciliation

Status: `Pending`
Branch: `codex/phase2-full-rollout-verify-matrix`
Goal: reconcile stable docs with the restored codebase and complete the default verification matrix.

- [ ] `impl` update stable docs only where restored behavior changes durable truth.
- [ ] `review` confirm `docs/` vs `work/` separation stayed intact.
- [ ] `verify` run backend, frontend, and build verification matrix or document any justified exemption.

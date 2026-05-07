# Step 2 Verification Snapshot

- date: `2026-05-07`
- plan: `work/plans/phase2-full-rollout.md`
- slice: `restore frontend reading helpers`
- branch: `codex/phase2-full-rollout-step-2-reading-helpers`

## Default Matrix

### Frontend Tests

- command: `cd /Users/lianke/PycharmProjects/star && npm test`
- result: pass
- note: `79` frontend tests passed after adding the reading-helper modules and tightening overlay hover matching

### Frontend Build

- command: `cd /Users/lianke/PycharmProjects/star && npm run build`
- result: pass

### Backend Tests

- command: `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests`
- result: fail during collection
- blocker: unchanged pre-existing import failure from `app.api.charts` -> missing `app.services.lunar_return`

## Review Summary

- the first implementation over-highlighted overlay rows across multiple same-named bodies
- the slice was corrected to prefer `overlayChartId`-scoped matching and the focused helper test was updated accordingly

## Outcome

This bounded slice is complete for its frontend scope:

- `src/lib/chartSelection.js` now provides explicit placement, aspect, and overlay selection keys
- `src/lib/chartVisibility.js` restores the declared visibility filtering flow
- the app builds again and the overlay hover path no longer fans out to unrelated groups

The backend test failure remains a separate chart-family blocker and should be handled in a later slice.

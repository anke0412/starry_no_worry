# 2026-05-07 Step 2D Verification

- active plan: `work/plans/phase2-full-rollout.md`
- slice: `2026-05-07 Slice D`
- branch: `codex/phase2-full-rollout-step-2-retrograde-status`
- scope: retrograde calculation, frontend mapping, result-table rendering

## Targeted Red -> Green Checks

- backend targeted:
  - command: `cd /Users/lianke/PycharmProjects/star && .venv312/bin/python -m pytest backend/tests/test_ephemeris.py backend/tests/test_overlay_chart.py -q`
  - result: pass
- frontend targeted:
  - command: `cd /Users/lianke/PycharmProjects/star && node --test tests/chartApiClient.test.js tests/appInitialState.test.js`
  - result: pass

## Default Verification Matrix

- backend:
  - command: `cd /Users/lianke/PycharmProjects/star && .venv312/bin/python -m pytest backend/tests`
  - result: pass
- frontend:
  - command: `cd /Users/lianke/PycharmProjects/star && npm test`
  - result: pass
- build:
  - command: `cd /Users/lianke/PycharmProjects/star && npm run build`
  - result: pass

## Notes

- retrograde status is now computed from a short forward longitude delta in the ephemeris service and surfaced as a boolean on placements
- overlay placements preserve the same motion flag so linked reading tables stay contract-consistent

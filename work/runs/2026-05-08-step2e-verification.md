# 2026-05-08 Step 2E Verification

- active plan: `work/plans/phase2-full-rollout.md`
- slice: `2026-05-08 Slice E`
- branch: `codex/phase2-full-rollout-step-2-midpoint-composite`
- scope: midpoint-composite request contract, backend service, frontend category and mapping

## Targeted Red -> Green Checks

- backend targeted:
  - command: `cd /Users/lianke/PycharmProjects/star && .venv312/bin/python -m pytest backend/tests/test_chart_contracts.py backend/tests/test_midpoint_composite_chart.py -q`
  - result: pass
- frontend targeted:
  - command: `cd /Users/lianke/PycharmProjects/star && node --test tests/chartApiClient.test.js`
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

- midpoint-composite uses pairwise longitude midpoints for shared placements while reusing midpoint-event houses and angles as the reading scaffold
- a dedicated backend assertion now checks that midpoint-composite and Davison do not collapse to the same solar longitude output

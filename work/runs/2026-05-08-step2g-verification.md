# 2026-05-08 Step 2G Verification

- active plan: `work/plans/phase2-full-rollout.md`
- slice: `2026-05-08 Slice G`
- branch: `codex/phase2-full-rollout-step-2-tertiary-progression`
- scope: tertiary-progression request contract, backend service, frontend forecast category and mapping

## Targeted Red -> Green Checks

- backend targeted:
  - command: `cd /Users/lianke/PycharmProjects/star && .venv312/bin/python -m pytest backend/tests/test_chart_contracts.py backend/tests/test_tertiary_progression_chart.py -q`
  - result: pass
- frontend targeted:
  - command: `cd /Users/lianke/PycharmProjects/star && node --test tests/chartApiContracts.test.js tests/chartApiClient.test.js tests/chartEngine.test.js`
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

- tertiary progression uses a lunar-month scaling rule to translate elapsed life days into the progressed datetime before generating the derived chart
- the frontend maps tertiary progression through the same linked table and overlay pattern already used by other derived timing charts

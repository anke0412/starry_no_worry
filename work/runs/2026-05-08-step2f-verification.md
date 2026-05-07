# 2026-05-08 Step 2F Verification

- active plan: `work/plans/phase2-full-rollout.md`
- slice: `2026-05-08 Slice F`
- branch: `codex/phase2-full-rollout-step-2-solar-arc-directions`
- scope: solar-arc request contract, backend service, frontend forecast category and mapping

## Targeted Red -> Green Checks

- backend targeted:
  - command: `cd /Users/lianke/PycharmProjects/star && .venv312/bin/python -m pytest backend/tests/test_chart_contracts.py backend/tests/test_solar_arc_chart.py -q`
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

- solar-arc directions are implemented as a natal chart shifted by the target Sun delta, with directed houses and placements preserved as a coherent chart scaffold
- the frontend maps solar-arc results through the same linked table and overlay pattern already used by other derived timing charts

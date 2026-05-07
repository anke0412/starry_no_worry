# Phase 2 Gap Reconciliation

- date: `2026-05-06`
- active plan: `work/plans/phase2-full-rollout.md`
- completed step: `Step 1`

## Summary

This reconciliation compared the current repository against the Phase 2 additions and success criteria in `plan.md`.

## Confirmed Implemented

- optional points: North Node, South Node, Chiron, Lilith, Part of Fortune, Vertex
- multiple house systems: `placidus`, `whole-sign`, `equal`
- configurable aspect sets and orb profiles
- element / modality / polarity / hemisphere statistics
- source-complete chart families: `natal`, `synastry`, `transit`, `solar-return`

## Partial Or Broken

- retrograde status is only modeled in backend schemas; current ephemeris calculation does not populate it and the frontend does not render it
- point visibility toggles and linked wheel/table reading surfaces are wired in `src/App.jsx`, but `src/lib/chartVisibility.js` and `src/lib/chartSelection.js` are missing from the repository
- the interpretation layer is still a deterministic frontend stub in `src/lib/interpretationAgent.js`, not a chart-aware LLM-backed agent

## Declared But Not Source-Complete

- `composite`
- `davison`
- `relationship-transit`
- `progression`
- `lunar-return`

These chart families appear in one or more of the frontend catalog, API contracts, tests, or backend request models, but the current backend service modules are not present.

## Not Started In Current Source

- midpoint composite workflows
- solar arc directions
- tertiary progression variants

## Verification Notes

- `npm test` passes in the current repository
- `npm run build` is currently blocked by missing `src/lib/chartSelection.js`
- backend pytest collection is currently blocked by `backend/app/api/charts.py` importing the missing `app.services.lunar_return`

## Next Slice Recommendation

The next bounded implementation slice should restore the missing frontend interaction helpers so the existing Phase 2 visibility and linked-reading surfaces can actually build:

- create `src/lib/chartSelection.js`
- create `src/lib/chartVisibility.js`
- verify the existing `src/App.jsx` and `src/components/chart/ChartWheel.jsx` interaction flow against those helpers

## Activated Slice

On `2026-05-07`, this recommendation became the active Step 2 slice on branch `codex/phase2-full-rollout-step-2-reading-helpers`.

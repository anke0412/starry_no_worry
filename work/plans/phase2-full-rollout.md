# Phase 2 Full Rollout

## Header

- Task name: Phase 2 success-criteria rollout
- Date: 2026-04-29
- Status: active
- Phase: Phase 2

## 1. Task Brief

Build the remaining Phase 2 capabilities in plan-ordered slices until the repository satisfies the full Phase 2 success criteria from `plan.md`.

Why now:

- the harness baseline and current composite / Davison / solar-return foundation are already stabilized
- the repo now needs one active execution plan for the full remaining Phase 2 scope instead of isolated feature-by-feature recovery work
- the user explicitly wants a step-by-step execution path that covers the whole remaining Phase 2 target

## 2. Product Intent

The product should graduate from “several advanced charts exist” to “advanced users can reliably customize settings, inspect linked chart details, generate multiple serious chart families, and receive category-specific AI interpretation on top of real chart data.”

## 3. Scope

### In Scope

- finish the remaining Phase 2 requirements from `plan.md`
- use one ordered execution queue in this plan as the only task entrypoint
- advance one bounded slice at a time through `impl -> review -> verify`
- promote durable product / architecture truth into `docs/` when the code makes that truth real

### Out Of Scope

- reordering `plan.md`
- starting Phase 3 platform work
- broad account, payments, export, sharing, or cloud-asset features
- replacing calculation behavior with LLM logic

### Protected Areas

- `plan.md`
- already-stable Phase 2 chart contracts unless the active slice intentionally evolves them
- unrelated in-progress user changes outside the chosen slice

## 4. Acceptance Criteria

- the repo has one active plan that covers the remaining Phase 2 path end-to-end
- every remaining Phase 2 capability is assigned to an ordered execution slice in this plan
- each slice is completed only after independent `impl`, `review`, and `verify`
- the final completed state of this plan satisfies all Phase 2 success criteria:
  - users can customize chart settings and regenerate charts predictably
  - users can inspect chart details through linked visual and tabular views
  - users can generate and read multiple advanced relationship and predictive chart types from the same calculation platform
  - the AI agent receives real chart data and produces category-specific interpretation reports
  - calculation and interpretation boundaries remain separate

## 5. Constraints

- preserve the current recommended Phase 2 order: chart-platform expansion before analysis interaction before AI interpretation
- reuse the shared chart generation framework for every new chart family
- keep Chinese terminology, wheel/table readability, and tooltip precision at a professional level
- do not create parallel roadmap, todo, or plan files outside `work/plans/`
- use the default verification matrix unless a real exemption is documented

## 6. Execution Graph

### Main-Agent Work

- keep this file as the only active Phase 2 execution ledger
- choose exactly one current slice from the ordered queue below
- dispatch bounded `impl`, `review`, and `verify` subagents with trimmed context
- integrate results, update statuses, and decide when to advance the queue

### `impl` Subagent Work

- implement only the current slice
- update the smallest necessary tests and contracts with the code change
- surface risks and follow-up edges for review

### `review` Subagent Work

- independently audit correctness, regressions, contract drift, terminology quality, and plan compliance
- block advancement if the slice is incomplete or too broad

### `verify` Subagent Work

- run targeted checks for the current slice
- run the default backend / frontend / build matrix unless a documented exemption applies
- report actual command results and blockers

## 7. Verification Plan

### Default Matrix For Every Slice

- `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests`
- `cd /Users/lianke/PycharmProjects/star && npm test`
- `cd /Users/lianke/PycharmProjects/star && npm run build`

### Slice-Specific Targeted Verification Rule

- each slice must add targeted backend and/or frontend commands before `verify`
- targeted commands are additive, not replacements for the default matrix
- if a slice is genuinely backend-only or frontend-only, the exemption must be written into this plan when that slice is closed

## 8. Risks

### Product Risks

- trying to land too many chart families before linked inspection UX is stable could make the product powerful but hard to read
- shipping AI interpretation before chart contracts stabilize could lock in fragile prompt assumptions

### Technical Risks

- new predictive families may tempt one-off orchestration instead of shared-generator reuse
- frontend chart result mapping can drift if category-specific display branches multiply without contract discipline
- category-specific AI prompts may accidentally leak calculation logic into the interpretation layer

### Coordination Risks

- Phase 2 is large enough that “just continue coding” can easily cause scope drift without this queue
- skipping queue order could create unstable dependencies between chart families, interactions, and AI interpretation

## 9. Recovery Rules

- if the active slice grows beyond one coherent bounded task, split it inside this plan before further implementation
- if a slice reveals a roadmap-level conflict, escalate to the human instead of silently reprioritizing
- if repeated failures show the queue order is wrong, pause execution and rewrite this plan deliberately
- if stable truth changes, update the relevant `docs/product/`, `docs/architecture/`, or `docs/engineering/` files before closing the slice

## 10. Decision Capture

- temporary sequencing or slice-boundary reasoning belongs in `work/decisions/` if it needs to survive the session
- durable chart-contract or architecture changes belong in `docs/api-contracts.md` and relevant architecture docs
- completion notes, residual risks, and next-slice handoff stay in this plan file

## 11. Ordered Execution Queue

Only one slice should be active at a time. A later slice does not start until the previous one reaches completion-ready and its status is updated here by the main agent.

- [x] **Slice 1: Settings predictability and advanced-setting completeness**  
Status: `completed`  
Goal: fully satisfy the “customize chart settings and regenerate predictably” success criterion on top of the current backend/frontend baseline.  
Includes:
  - audit current chart settings coverage across natal, synastry, transit, composite, Davison, and solar return
  - close missing settings propagation for categories already exposed in the UI
  - land planet / point visibility toggles where still missing
  - land element / modality / polarity / hemisphere statistics if not already available in result surfaces
  - make regenerate behavior deterministic and test-covered for settings changes
Primary files likely involved:
  - `src/App.jsx`
  - `src/lib/api/chartApi.js`
  - `src/lib/api/chartContracts.js`
  - `src/lib/chartEngine.js`
  - `backend/app/models/chart.py`
  - `backend/app/services/natal.py`
  - `backend/app/services/synastry.py`
  - `backend/app/services/transit.py`
  - `backend/app/services/composite.py`
  - `backend/app/services/davison.py`
  - `backend/app/services/solar_return.py`
  - relevant backend/frontend tests
Targeted verify expectation:
  - settings-contract backend tests
  - frontend request/result mapping tests
  - app-level regenerate interaction tests where behavior changes

- [x] **Slice 2: Linked visual and tabular inspection interactions**  
Status: `completed`  
Goal: satisfy the “inspect chart details through linked visual and tabular views” success criterion.  
Includes:
  - wheel hover and selected-aspect highlighting
  - placement-list linking to chart marks
  - filtered overlays and tighter cross-highlighting between wheel, aspect list, and tables
  - UX polish for tooltip precision and dense-table readability

- [x] **Slice 3: Lunar return rollout**  
Status: `completed`  
Goal: add lunar return as the next derived predictive chart family on the shared generator path.  
Includes backend service, API contract, frontend category wiring, result mapping, tests, and docs.

- [ ] **Slice 4: Progressed chart completion**  
Status: `completed`  
Goal: turn the existing `progression` catalog placeholder into a real advanced timing chart.  
Includes backend calculation path, API route/contract, frontend integration, and tests.

- [x] **Slice 5: Relationship transit rollout**  
Status: `completed`  
Goal: support relationship transit as a real dual-subject timing workflow rather than a catalog placeholder.  
Includes combined relationship-reference semantics, overlays/result mapping, contract design, and tests.

- [ ] **Slice 6: Midpoint composite workflows**  
Status: `active`  
Goal: expand the fusion-family relationship toolkit beyond base composite and Davison into explicit midpoint-composite workflows selected by product scope.  
Includes workflow definition, contract shape, frontend category exposure, and tests.

- [ ] **Slice 7: Solar arc directions**  
Status: `pending`  
Goal: add solar arc directions through the shared derived-chart architecture without breaking existing predictive contracts.

- [ ] **Slice 8: Tertiary progression variants**  
Status: `pending`  
Goal: add the selected tertiary progression variants promised by Phase 2 with bounded scope and explicit contract behavior.

- [ ] **Slice 9: Phase 2 AI interpretation agent**  
Status: `pending`  
Goal: satisfy the “AI agent receives real chart data and produces category-specific interpretation reports” success criterion while preserving calculation / interpretation separation.  
Includes:
  - explicit chart-to-prompt data contract
  - category-specific interpretation prompt routing
  - report section structure and follow-up question handling
  - tests ensuring interpretation consumes chart outputs without owning chart math

## 12. Current Slice Notes

The current active slice is **Slice 6: Midpoint composite workflows**.
The current active sub-step is **Slice 6.1: Midpoint-composite scope and existing fusion-path audit**.

Why this slice goes now:

- the predictive expansion slices through relationship transit are now closed, so the next coherent Phase 2 queue item is the remaining fusion-family expansion work
- midpoint-composite scope needs to be made explicit before solar-arc and tertiary-variant slices add more predictive breadth
- the repo already has stable composite and Davison baselines, which makes this the right moment to audit the smallest additional fusion workflow

Exit condition for moving beyond Slice 6:

- midpoint composite is defined as a real fusion-family workflow rather than an ambiguous placeholder label
- backend contract and frontend result mapping stay coherent with existing composite and Davison semantics
- targeted midpoint-composite checks and the default verification matrix pass

Completed Slice 2 progress so far:

- [x] **Slice 1.1: Settings inventory and contract closure**  
Goal: reconcile the current settings contract across frontend request builders, backend request models, and currently supported chart families.  
Known starting observations:
  - current UI exposes `houseSystem`, `aspectSet`, and `orbProfile`
  - these three settings already flow through the API contract for the currently supported real chart endpoints
  - the slice still needs an explicit gap audit for all current categories and request builders before new settings are added
Progress:
  - completed one bounded cleanup step: forecast catalog now exposes only live backend-supported chart types (`transit`, `solar-return`), so unsupported `progression` and `relationship-transit` placeholders no longer break predictability in the active UI
  - completed one bounded request-contract step: `createChartRequest` now always emits explicit default settings instead of `settings: null`, making default chart configuration visible and deterministic at the request layer
  - completed one bounded coverage step: current real chart types now have explicit frontend request-level settings propagation tests for `synastry`, `composite`, `davison`, `transit`, and `solar-return`

- [x] **Slice 1.2: Visibility toggles**  
Status: `completed`  
Goal: add planet / point visibility toggles in a way that does not fork calculation correctness from display behavior unless a slice explicitly documents that split.
Progress:
  - completed one bounded frontend visibility-layer step: users can now toggle nodes, supplemental points, and angles from advanced settings
  - completed one bounded geometry-safety fix: wheel orientation now continues to use the unfiltered chart as its geometry source, so hiding angles no longer breaks ascendant-based layout
  - completed one bounded result-cleanup step: visibility filtering now drops empty placement groups and overlays, preventing empty tables from leaking into the result surface after filtering

- [x] **Slice 1.3: Phase 2 statistics surfaces**  
Status: `completed`  
Goal: expose element / modality / polarity / hemisphere statistics through the chart result flow and render them readably in the frontend.
Progress:
  - completed one bounded contract step: every backend `ChartResult` now auto-populates `statistics` using 10 planets plus `Ascendant` and `Midheaven`, and nested related charts carry their own statistics snapshots as well
  - completed one bounded frontend mapping step: workspace placement groups now map per-group `statistics` into localized four-element / modality / polarity / hemisphere sections
  - completed one bounded result-surface step: chart result tables now render a compact statistics summary above each placement group
  - completed one bounded verification step: targeted backend and frontend tests passed, then the full backend `pytest`, frontend `npm test`, and `npm run build` matrix passed

- [x] **Slice 1.4: Predictable regenerate behavior**  
Status: `completed`  
Goal: ensure settings changes lead to deterministic regeneration behavior with explicit tests for request composition, result refresh, and view consistency.
Progress:
  - completed one bounded request-identity step: frontend now derives a deterministic `requestKey` from calculation inputs only, excluding runtime-only metadata such as `createdAt`
  - completed one bounded stale-result step: generated workspace results now clear automatically when calculation inputs change, preventing old charts from lingering under edited settings or profile data
  - completed one bounded test step: request-key stability and stale-result invalidation are now covered by frontend tests
  - completed one bounded verification step: frontend `npm test` and `npm run build` passed; backend matrix was exempt because this bounded step changed only frontend request/view state without touching backend contracts or services

## 13. Slice 2 Working Notes

- [ ] **Slice 2.1: Wheel-to-table linked highlighting foundation**  
Status: `completed`  
Goal: establish shared selection state so wheel placements and tabular rows can reference the same active planet / point without changing calculation output.
Progress:
  - completed one bounded selection-identity step: workspace now uses a shared placement selection key derived from group id, localized planet name, and longitude
  - completed one bounded wheel/table-linking step: chart wheel placements and placement-table rows now reference the same `selectedPlacementKey`
  - completed one bounded visual-feedback step: active wheel glyphs and active table rows now receive lightweight highlight styling without changing chart data
  - completed one bounded verification step: frontend `npm test` and `npm run build` passed; backend matrix was exempt because this bounded step only added frontend interaction state and styling

- [ ] **Slice 2.2: Aspect-list linked highlighting**  
Status: `completed`  
Goal: extend the shared selection model so aspect rows can activate the two referenced placements and reflect wheel focus consistently.
Progress:
  - completed one bounded aspect-resolution step: frontend now resolves aspect rows into one or two placement selection keys depending on whether the chart uses one or two placement groups
  - completed one bounded interaction step: hovering aspect rows now highlights the linked placements on the wheel and in placement tables without changing chart output
  - completed one bounded visual step: active aspect rows now receive separate styling from direct placement-row selection
  - completed one bounded verification step: frontend `npm test` and `npm run build` passed; backend matrix was exempt because this bounded step only changed frontend interaction state and helper logic

- [ ] **Slice 2.3: Overlay-table linked highlighting**  
Status: `completed`  
Goal: extend linked highlighting into overlay / house-placement tables so relationship and timing charts keep one coherent focus model across wheel, placement table, aspect table, and overlay table.
Progress:
  - completed one bounded overlay-resolution step: overlay rows now resolve back to matching placement-group entries through localized planet name plus longitude identity
  - completed one bounded interaction step: hovering overlay / house-placement rows now highlights the linked wheel placement and placement-table row through the shared key model
  - completed one bounded visual step: overlay rows now have their own active-state styling distinct from direct placements and aspects
  - completed one bounded verification step: frontend `npm test` and `npm run build` passed; backend matrix was exempt because this bounded step only changed frontend interaction state and helper logic

- [ ] **Slice 2.4: Tooltip / hover consistency**  
Status: `completed`  
Goal: make hover-driven linked inspection feel coherent by aligning wheel tooltip, row hover, and active-highlight reset behavior across placements, aspects, and overlays.
Progress:
  - completed one bounded TDD step: source-level hover-reset expectations now explicitly require wheel, placement rows, aspect rows, and overlay rows to clear transient focus on pointer leave
  - completed one bounded interaction step: wheel leave now clears both tooltip state and shared placement selection, preventing stale hover highlights from persisting after leaving the chart
  - completed one bounded regression fix: aspect-row and overlay-row leave handlers now clear both temporary highlight keys and the inherited `selectedPlacementKey`, so linked focus no longer falls back to an older placement hover
  - completed one bounded review step: independent review first caught the stale-selection fallback risk, then re-review reported no findings after the fix
  - completed one bounded verification step: targeted frontend tests passed, then backend `pytest`, frontend `npm test`, and `npm run build` all passed without blockers

- [ ] **Slice 2.5: Dense-table readability polish**  
Status: `completed`  
Goal: improve dense result-table scanning so advanced users can follow linked highlights, statistics blocks, and overlay rows without losing row context on long result pages.
Progress:
  - completed one bounded structure step: result focus, placement groups, aspect table, and overlay tables now render inside a shared `chart-data-section` card pattern instead of loose ungrouped blocks
  - completed one bounded scanning step: table headers now stay sticky inside horizontally scrollable table containers, reducing column-label loss on long result sections
  - completed one bounded test step: frontend source-level tests now assert both the section-card structure and sticky-header styling
  - completed one bounded review step: independent review reported no findings, with only browser-level sticky behavior left as a residual manual-check risk
  - completed one bounded verification step: targeted frontend tests, full frontend tests, frontend build, and backend `pytest` all passed

## 14. Slice 3 Working Notes

- [ ] **Slice 3.1: Existing solar-return derived-chart path audit**  
Status: `completed`  
Goal: inspect the current solar-return derived-chart implementation and use it to define the exact reusable path for lunar return rollout before changing code.
Progress:
  - confirmed the backend reference path is `SolarReturnGenerator`, which already extends `SingleSubjectDerivedGenerator` and therefore provides the intended reusable derived-chart orchestration model for lunar return
  - confirmed the backend request / route surface is localized to `SolarReturnChartRequest` plus `/api/charts/solar-return`, making the expected lunar-return delta a parallel request model, service, and route rather than a contract redesign
  - confirmed the frontend reference path already spans catalog exposure, request payload construction, API routing, result mapping, and tests for `solar-return`, giving Slice 3 a concrete template in `src/data/chartCatalog.js`, `src/lib/api/chartContracts.js`, `src/lib/api/chartApi.js`, `src/lib/chartEngine.js`, and the existing solar-return test set
  - completed one bounded rollout step: `lunar-return` is now a real chart family across backend route/service/model, frontend category/payload/API/result mapping, targeted tests, and stable docs
  - completed one bounded regression fix: return-chart request bodies and regeneration keys now ignore stale hidden `forecastDate` / `forecastTime` values and only use explicit return anchors
  - completed one bounded verification step: targeted frontend tests, targeted backend lunar/solar return tests, backend `pytest`, frontend `npm test`, and `npm run build` all passed

## 15. Slice 4 Working Notes

- [ ] **Slice 4.1: Progression placeholder and backend path audit**  
Status: `completed`  
Goal: inspect the current progression placeholder and derive the smallest real backend/frontend rollout path for converting it into an actual advanced timing chart.
Progress:
  - confirmed the current active UI no longer exposes `progression`; earlier placeholder exposure was intentionally removed during Slice 1 predictability cleanup, so Slice 4 must restore it as a real chart family rather than “turn on” an existing mock
  - confirmed the backend currently has no `progression` request model, route, or service, so this slice starts from a clean derived-chart rollout rather than patching half-landed code
  - confirmed the closest reusable implementation path is `transit`, not return charts: progression wants a single-subject derived chart keyed by forecast date/time and overlaid back into natal houses without a second profile or return-location search
  - completed one bounded rollout step: `progression` is now a real forecast chart family across frontend catalog/payload/API/result mapping and backend model/route/service integration
  - completed one bounded review fix: progressed datetime conversion now writes back in `primary.timezone`, preventing UTC timestamps from being reinterpreted as local clock time in non-UTC profiles
  - completed one bounded verification step: targeted frontend tests, targeted backend progression tests, backend `pytest`, frontend `npm test`, and `npm run build` all passed

## 16. Slice 5 Working Notes

- [x] **Slice 5.1: Relationship-transit placeholder and contract audit**  
Status: `completed`  
Goal: inspect the removed relationship-transit placeholder and define the minimum real dual-subject timing workflow needed before writing implementation code.
Progress:
  - confirmed the earlier placeholder had been fully removed from the live catalog, so Slice 5 needed to restore `relationship-transit` as a real chart family rather than re-enable a dormant mock
  - confirmed the frontend already supported the combined requirement pattern of `requiresSecondPerson` plus `requiresForecastDate`, so no new workspace form architecture was needed before rollout
  - confirmed the correct reusable backend abstraction was neither `DualSubjectComparisonGenerator` nor `SingleSubjectDerivedGenerator` alone, but a new dual-subject derived path that calculates one shared transit sky and overlays it into two natal references
  - completed one bounded rollout step: `relationship-transit` is now a real dual-subject timing chart across frontend catalog/payload/API/result mapping and backend model/route/service integration
  - completed one bounded review fix: relationship-transit no longer flattens ambiguous top-level aspects; the UI now rebuilds owner-aware aspect rows from explicit overlay channels and aligns hover/highlight selection to the real natal/transit groups
  - completed one bounded semantics fix: the secondary relationship-transit overlay now suppresses misleading `sourceHouse` output and labels the remaining source-house column as primary-reference transit context
  - completed one bounded verification step: targeted frontend tests, targeted backend relationship-transit tests, backend `pytest`, frontend `npm test`, and `npm run build` all passed

## 17. Slice 6 Working Notes

- [ ] **Slice 6.1: Midpoint-composite scope and existing fusion-path audit**  
Status: `active`  
Goal: inspect current composite and Davison fusion behavior, then define the smallest explicit midpoint-composite workflow that can be added without roadmap drift before writing code.
Planned focus:
  - audit how current `composite` and `davison` contracts differ in fused-chart semantics, chart ids, and related-chart structure
  - determine whether “midpoint composite” should mean a new category or a scoped variant of the existing fusion family under current product wording
  - define the minimum request contract, frontend exposure point, and verification surface needed before implementation
Progress:
  - confirmed the current live `composite` implementation already is the midpoint-composite baseline: top-level placements are midpoint planetary positions, while houses / angles come from a synthetic midpoint profile
  - confirmed the current `davison` implementation is the distinct time-space midpoint baseline: top-level placements, houses, and aspects all come from the midpoint event chart rather than midpoint longitudes
  - confirmed older composite specs explicitly described “professional midpoint composite chart” under the existing `组合盘` label, which means Slice 6 should not rename or replace the current category without a product-direction escalation
  - confirmed there is no separate midpoint-composite placeholder left in the live frontend catalog, so Slice 6 likely needs either a scoped fusion variant under the current couple flow or a genuinely new bounded category with explicit product wording before code changes begin

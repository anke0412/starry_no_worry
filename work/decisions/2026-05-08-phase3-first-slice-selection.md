# Phase 3 First Slice Selection

## Date

- 2026-05-08

## Decision

Choose `expanded built-in location coverage` as the first bounded Phase 3 implementation slice.

## Why This Slice

- it is explicitly listed in the Phase 3 additions in `plan.md`
- the current location catalog is still narrowly scoped to China, the United States, and a custom fallback
- it does not require roadmap reshuffling
- it does not force destructive migrations
- it can be implemented as a bounded frontend data-and-form slice with targeted tests

## Deferred For Later

These remain valid Phase 3 themes but are riskier or less bounded as the first slice:

- accounts and cloud assets
- sharing and export
- payments or membership
- admin and operations tooling
- privacy, consent, deletion, and data export workflows
- additional timing systems that would require fresh product-scope decisions

## Step 3 Target

The implementation branch for Step 3 should expand `src/data/locationCatalog.js` and any dependent workspace/form tests so the built-in preset coverage extends beyond the Phase 1 China and United States baseline while preserving manual custom-location fallback.

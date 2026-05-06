# Data Contracts

## Canonical Contract Source

The stable API contract lives in `docs/api-contracts.md`. This file records the rules around it.

## Contract Rules

- frontend and backend must share the same request and response expectations
- contract changes require updating both implementation and tests
- higher-order chart families may change payload details only through explicit contract evolution

## Current Contract Expectations

- `ChartResult` is the primary chart response shape
- natal, synastry, transit, relationship-transit, progression, composite, solar-return, and lunar-return flows should remain structurally coherent
- related chart payloads should stay explicit rather than inferred
- relationship-transit aspect ownership must remain overlay-scoped rather than flattened into an ambiguous top-level pair

## Change Discipline

- do not merge contract-affecting changes without test updates
- do not let frontend rendering logic depend on undocumented backend quirks

# Astrology Site Framework Design

## Direction

Use the hybrid direction selected by the user: a spring-inspired public landing page that guides visitors into a professional astrology workspace. The UI should feel soft, fresh, and approachable, while the inner workflow remains structured enough to support natal, relationship, and transit/progression chart work.

## MVP Scope

- Support single-person and two-person input forms.
- Support chart categories for natal, synastry, composite, transit, progression, and relationship transit.
- Generate a structured chart request and a placeholder chart result.
- Provide an interpretation agent interface that changes prompts and report sections by reading mode and chart category.
- Render an initial chart visualization placeholder and interpretation report preview.

## Architecture

- `src/App.jsx` owns page-level state and route-like workspace sections.
- `src/lib/chartEngine.js` normalizes form input and returns deterministic placeholder chart data. This is intentionally isolated so a real ephemeris provider can replace it later.
- `src/lib/interpretationAgent.js` builds interpretation contexts and report sections based on chart mode and category.
- `src/data/chartCatalog.js` defines chart modes, categories, form requirements, and user-facing copy in one place.
- `src/styles.css` defines the spring visual system, responsive layout, and interaction states.

## Data Flow

1. User chooses a reading mode: single, couple, or forecast.
2. User chooses a chart category.
3. User enters birth data for one or two people plus optional forecast date.
4. The chart engine returns normalized chart metadata, placeholder placements, aspects, and house notes.
5. The interpretation agent receives the chart result and returns a structured report with overview, focus areas, timing, and suggested questions.

## Agent Boundary

The first version ships with a deterministic local agent stub. It does not call an LLM yet. The stub exposes the same shape a future API route or OpenAI integration can use:

- `buildInterpretationContext(chartResult)`
- `createInterpretationReport(context)`

This keeps the UI usable now and makes the future LLM integration a drop-in replacement.

## Visual System

The product uses a spring palette: sage green, blossom pink, cream, warm gold, and ink green. The homepage should have a full-width atmospheric hero with botanical/orbital shapes, then transition into a calmer workspace with clear mode tabs, form panels, chart preview, and report sections.

## Verification

Core behavior should be covered by Node's built-in test runner so the project has a dependency-light verification path before frontend dependencies are installed.

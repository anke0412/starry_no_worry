# Starry No Worry Product Implementation Plan

## 1. Product Vision

Starry No Worry is planned as a full-featured astrology charting platform. The long-term goal is to support professional-grade chart calculation, readable chart visualization, structured chart interpretation, saved chart assets, and later account-based reports, sharing, payment, and operations workflows.

The first product direction is an astrology tool MVP. The priority is calculation accuracy, reliable chart data, and clear chart reading surfaces. AI interpretation remains a structured template layer in the first stage so the calculation foundation can become trustworthy before a full interpretation agent is introduced.

## 2. Current Repository State

The current app is a React/Vite prototype with a spring visual direction and a working placeholder flow.

- Frontend entry: `src/App.jsx`
- Chart category catalog: `src/data/chartCatalog.js`
- Placeholder chart engine: `src/lib/chartEngine.js`
- Chart-aware local interpretation agent: `src/lib/interpretationAgent.js`
- Existing tests: `tests/chartEngine.test.js`, `tests/interpretationAgent.test.js`
- Existing design note: `docs/superpowers/specs/2026-04-20-astrology-site-design.md`

Current implemented chart categories:

- Single-person natal chart
- Couple synastry chart
- Couple composite chart placeholder
- Forecast transit chart
- Forecast progression chart placeholder
- Relationship transit chart placeholder

Current limitations:

- Chart calculation is deterministic placeholder data, not real ephemeris output.
- There is no backend service yet.
- Location and timezone handling are not implemented.
- The chart wheel is a visual placeholder.
- Interpretation is template-based and local only.
- There is no persistence beyond React component state.

## 3. Product Strategy

The platform will grow in three professional-depth stages.

### Phase 1: Astrology Tool MVP

Goal: ship a deployable, accurate, readable astrology tool covering the three core product lanes: single-person, two-person, and timing.

Supported chart types:

- Natal chart
- Synastry chart
- Transit chart

Core capabilities:

- FastAPI backend calculation service
- Accurate planet positions from a professional ephemeris library
- Birth datetime, timezone, and location normalization
- Built-in location presets for China and the United States, with custom location fallback for manual coordinates and timezone entry
- Ascendant, Midheaven, twelve houses, and major aspects
- Clear readable chart wheel
- Chart data tables for placements, houses, and aspects
- Local browser profile storage
- Template-based interpretation reports
- Deployable frontend and backend

Phase 1 success criteria:

- A user can enter a birth profile and generate a natal chart with real placements, houses, and aspects.
- A user can enter two birth profiles and generate a synastry chart with inter-chart aspects.
- A user can enter a natal profile and a target date/time and generate a transit chart.
- The chart result is readable without expert configuration.
- Recent profiles and recent chart inputs can be stored locally.
- The app can be deployed as an MVP with health checks, environment variables, and basic error handling.

### Phase 2: Advanced Astrologer Tools

Goal: expand the MVP into a more serious working tool for astrologers and advanced users.

Additions:

- Optional points: North Node, South Node, Chiron, Lilith, Part of Fortune, Vertex, selected asteroids
- Retrograde status
- Multiple house systems
- Configurable aspect orbs
- Planet and point visibility toggles
- Element, modality, polarity, and hemisphere statistics
- Chart wheel interactions: hover, selected aspect highlighting, placement list linking, and filtered overlays
- Expanded chart families for relationship and predictive work:
  - Composite chart
  - Davison relationship chart
  - Midpoint composite workflows
  - Solar return chart
  - Lunar return chart
  - Solar arc directions
  - Tertiary progression variants, including solar-arc-style and composite timing extensions as selected by product scope
- Progressed chart
- Relationship transit chart
- Full AI interpretation agent with chart-aware prompts, report sections, and follow-up questions

Phase 2 success criteria:

- Users can customize chart settings and regenerate charts predictably.
- Users can inspect chart details through linked visual and tabular views.
- Users can generate and read multiple advanced relationship and predictive chart types from the same calculation platform.
- The AI agent receives real chart data and produces category-specific interpretation reports.
- The app still keeps calculation and interpretation boundaries separate.

### Phase 3: Full Charting Platform

Goal: become a full-featured astrology platform with advanced timing systems, saved assets, and commercial product surfaces.

Additions:

- Solar return and lunar return charts
- Solar arc directions
- Secondary progressions expansion
- Midpoint charts
- Advanced relationship techniques
- Additional timing systems such as profections, zodiacal releasing, firdaria, or other selected systems
- Expanded built-in location coverage for additional commonly used countries and cities beyond the Phase 1 China and United States presets
- User accounts
- Cloud-saved birth profiles, chart history, and generated reports
- Shareable chart and report links
- PDF or image export
- Payment, credits, or membership
- Admin and operations tools for prompt versions, report templates, and calculation settings
- Privacy, consent, deletion, and data export flows

Phase 3 success criteria:

- Users can manage long-term chart assets across devices.
- Advanced users can perform a broad set of professional chart workflows.
- Reports can be generated, saved, shared, and monetized.
- Calculation versions and interpretation template versions are auditable.

## 4. Architecture

### Frontend

Framework: React + Vite.

Responsibilities:

- Chart mode and chart type selection
- Birth profile input and validation
- Local profile and recent chart storage
- API calls to backend chart calculation service
- Chart wheel rendering
- Chart data tables
- Template report rendering
- Error, loading, and empty states

Recommended frontend module structure:

```text
src/
  components/
    chart/
    forms/
    reports/
    layout/
  data/
  lib/
    api/
    storage/
    validation/
  pages/
  styles/
```

### Backend

Framework: Python/FastAPI.

Responsibilities:

- API request validation
- Datetime and timezone normalization
- Location resolution strategy
- Ephemeris calculation
- House calculation
- Aspect calculation
- Chart response formatting
- Health checks
- Error responses
- Calculation version metadata

Recommended backend module structure:

```text
backend/
  app/
    main.py
    api/
      charts.py
      health.py
    core/
      config.py
      errors.py
    models/
      chart.py
      profile.py
    services/
      ephemeris.py
      houses.py
      aspects.py
      natal.py
      synastry.py
      transit.py
    tests/
```

### Calculation Service Boundary

The calculation service should return structured chart data only. It should not generate long-form interpretation text. This keeps the calculation layer testable and prevents future AI behavior from changing the chart math.

### Interpretation Boundary

Phase 1 interpretation is template-based and deterministic. It consumes chart results and produces sectioned report data.

Phase 2 can replace or extend this layer with an LLM-backed interpretation agent, while preserving the same report contract.

## 5. Phase 1 MVP Scope

### In Scope

- FastAPI backend scaffold
- Health endpoint
- Shared API contract for chart requests and responses
- Natal chart endpoint
- Synastry chart endpoint
- Transit chart endpoint
- Birth profile form upgrades
- Local profile storage
- Recent chart storage
- Chart wheel renderer that is clear and readable
- Placement table
- House table
- Aspect table
- Template interpretation sections
- Frontend API integration
- Deployable configuration
- Basic tests and smoke checks

### Out of Scope

- User accounts
- Cloud persistence
- Payment or membership
- Community features
- Full AI chat agent
- PDF export
- Admin dashboard
- Composite chart implementation
- Progressions implementation
- Return charts
- Advanced timing systems
- Exhaustive astrologer settings

## 6. Phase 1 Chart Requirements

### Natal Chart

Inputs:

- Name
- Birth date
- Birth time
- Birth location
- Timezone, either resolved automatically or selected manually
- Optional house system, defaulting to Placidus if supported

Outputs:

- Planet and point placements
- Ascendant and Midheaven
- Twelve house cusps
- Major aspects
- Retrograde status if available from the ephemeris library
- Calculation metadata

Minimum bodies:

- Sun
- Moon
- Mercury
- Venus
- Mars
- Jupiter
- Saturn
- Uranus
- Neptune
- Pluto
- Ascendant
- Midheaven

Minimum aspects:

- Conjunction
- Sextile
- Square
- Trine
- Opposition

### Synastry Chart

Inputs:

- Person A birth profile
- Person B birth profile
- Shared chart settings

Outputs:

- Both natal placement sets
- Inter-chart aspects
- Relationship focus summary data for template interpretation

Minimum synastry behavior:

- Calculate each person's natal chart independently.
- Compare selected bodies between both charts.
- Return strongest inter-chart aspects sorted by orb.

### Transit Chart

Inputs:

- Natal birth profile
- Transit date
- Transit time
- Transit location or timezone strategy

Outputs:

- Natal placements
- Transit placements
- Transit-to-natal aspects
- Current house activation if supported

Minimum transit behavior:

- Calculate natal chart.
- Calculate transit sky for the target datetime.
- Return major transit-to-natal aspects sorted by orb and importance.

## 7. Data Models

### BirthProfile

```ts
type BirthProfile = {
  id?: string;
  name: string;
  date: string;
  time: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
};
```

### ChartRequest

```ts
type ChartRequest = {
  chartType: "natal" | "synastry" | "transit";
  primary: BirthProfile;
  secondary?: BirthProfile;
  transitDate?: string;
  transitTime?: string;
  settings: ChartSettings;
};
```

### ChartSettings

```ts
type ChartSettings = {
  houseSystem: "placidus";
  zodiac: "tropical";
  aspectSet: "major";
  orbProfile: "default";
};
```

### ChartResult

```ts
type ChartResult = {
  chartId: string;
  chartType: string;
  title: string;
  profiles: BirthProfile[];
  calculation: CalculationMetadata;
  placements: Placement[];
  houses: HouseCusp[];
  aspects: Aspect[];
  relatedCharts?: Record<string, unknown>;
};
```

### Placement

```ts
type Placement = {
  body: string;
  longitude: number;
  sign: string;
  degree: number;
  minute: number;
  house?: number;
  retrograde?: boolean;
};
```

### Aspect

```ts
type Aspect = {
  from: string;
  to: string;
  type: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  angle: number;
  orb: number;
  applying?: boolean;
  weight?: number;
};
```

### InterpretationReport

```ts
type InterpretationReport = {
  reportId: string;
  chartId: string;
  mode: "template" | "agent";
  title: string;
  summary: string;
  sections: ReportSection[];
  recommendedQuestions: string[];
};
```

## 8. API Spec

### GET /api/health

Purpose: verify backend availability.

Response:

```json
{
  "status": "ok",
  "service": "astrology-calculation-api",
  "version": "0.1.0"
}
```

### POST /api/charts/natal

Purpose: generate a natal chart.

Request:

```json
{
  "primary": {
    "name": "Luna",
    "date": "1996-04-12",
    "time": "08:30",
    "locationName": "Shanghai",
    "timezone": "Asia/Shanghai"
  },
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

Response: `ChartResult`.

### POST /api/charts/synastry

Purpose: generate a synastry chart.

Request:

```json
{
  "primary": {
    "name": "Luna",
    "date": "1996-04-12",
    "time": "08:30",
    "locationName": "Shanghai",
    "timezone": "Asia/Shanghai"
  },
  "secondary": {
    "name": "Sol",
    "date": "1993-09-07",
    "time": "21:10",
    "locationName": "Beijing",
    "timezone": "Asia/Shanghai"
  },
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

Response: `ChartResult`.

### POST /api/charts/transit

Purpose: generate a transit chart against a natal profile.

Request:

```json
{
  "primary": {
    "name": "Luna",
    "date": "1996-04-12",
    "time": "08:30",
    "locationName": "Shanghai",
    "timezone": "Asia/Shanghai"
  },
  "transitDate": "2026-05-01",
  "transitTime": "12:00",
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```

Response: `ChartResult`.

## 9. Local Storage Strategy

Phase 1 uses browser local storage only.

Local storage keys:

- `starry.birthProfiles.v1`
- `starry.recentCharts.v1`
- `starry.chartSettings.v1`

Rules:

- Store only user-entered birth profile data and recent request metadata.
- Do not store full generated reports longer than needed in Phase 1.
- Version keys so future migrations are possible.
- Provide a clear "clear local data" action before public launch.

## 10. Chart Wheel Requirements

Phase 1 chart wheel should be clear and readable, not feature-complete.

Minimum requirements:

- Twelve zodiac divisions
- Twelve house divisions
- Planet glyph or text labels
- Aspect lines for major aspects
- Hover or focus tooltip for placements
- Mobile-safe layout
- Separate data tables for precision values

Phase 2 upgrades:

- Planet visibility toggles
- Aspect filtering
- Orb configuration
- Linked hover between table and wheel
- Multi-chart overlays
- Professional display settings

## 11. Template Interpretation Requirements

Phase 1 templates should create useful structure without pretending to be a full AI agent.

Report sections:

- Overview
- Key placements
- Key aspects
- House emphasis
- Relationship dynamics for synastry
- Timing windows for transits
- Suggested follow-up questions

Rules:

- Templates must consume real chart data.
- Templates should clearly reflect chart type.
- Templates should avoid unsupported deterministic claims.
- Template output should use the same report structure planned for the future AI agent.

## 12. Deployment Plan

Phase 1 should be deployable.

Frontend:

- Vite production build
- Environment variable for backend API base URL
- Static hosting such as Vercel, Netlify, or equivalent

Backend:

- FastAPI app
- Python dependency lock file
- Environment variables for configuration
- Health endpoint
- CORS allowlist
- Structured error responses
- Basic request logging
- Deployment target such as Render, Fly.io, Railway, or another Python-capable host

Required environment variables:

- `APP_ENV`
- `API_CORS_ORIGINS`
- `EPHEMERIS_DATA_PATH`
- `LOG_LEVEL`

Smoke checks:

- Frontend loads production build.
- Backend `/api/health` returns ok.
- Frontend can call natal, synastry, and transit endpoints.
- Error states display readable messages.

## 13. Testing Strategy

Frontend:

- Unit tests for request builders and local storage helpers
- Component tests for profile form behavior
- Component tests for chart mode selection
- Smoke test for chart result rendering

Backend:

- Unit tests for datetime normalization
- Unit tests for aspect calculation
- Golden tests for known natal chart outputs
- API contract tests for all Phase 1 endpoints
- Error tests for missing birth data, missing timezone, and invalid dates

Manual verification:

- Desktop chart generation
- Mobile chart generation
- Local profile save/load
- Backend unavailable state
- Production deployment smoke check

## 14. Development Branch Workflow

Every future change should use this workflow:

1. Start from latest `main`.
2. Create a dedicated branch named `dev_[detailed_functionname]`.
3. Commit only files related to that change.
4. Push the branch to GitHub.
5. Wait for human confirmation.
6. Merge into `main` only after explicit human approval.

Example branches:

- `dev_add_fastapi_chart_service`
- `dev_add_natal_chart_calculation`
- `dev_add_synastry_chart_api`
- `dev_add_transit_chart_api`
- `dev_add_birth_profile_local_storage`
- `dev_add_chart_wheel_renderer`
- `dev_add_template_interpretation_reports`
- `dev_add_mvp_deployment_config`

## 15. Recommended Implementation Sequence

### Module 1: Backend Scaffold

Branch: `dev_add_fastapi_chart_service`

Deliverables:

- `backend/` FastAPI app
- `/api/health`
- Config module
- Error response structure
- Backend test runner
- Local development instructions

### Module 2: API Contracts

Branch: `dev_define_chart_api_contracts`

Deliverables:

- Pydantic request and response models
- Shared API documentation
- Frontend API client types or JS model helpers
- Contract tests

### Module 3: Ephemeris Foundation

Branch: `dev_add_ephemeris_calculation_core`

Deliverables:

- Ephemeris library integration
- Planet position service
- Datetime and timezone normalization
- Golden tests for known dates

### Module 4: Natal Chart Calculation

Branch: `dev_add_natal_chart_calculation`

Deliverables:

- Natal endpoint
- House calculation
- Aspect calculation
- Calculation metadata
- Frontend integration replacing placeholder natal data

### Module 5: Synastry Chart Calculation

Branch: `dev_add_synastry_chart_api`

Deliverables:

- Synastry endpoint
- Dual natal calculation
- Inter-chart aspect calculation
- Synastry data table UI

### Module 6: Transit Chart Calculation

Branch: `dev_add_transit_chart_api`

Deliverables:

- Transit endpoint
- Transit sky calculation
- Transit-to-natal aspects
- Transit table UI

### Module 7: Local Profile Storage

Branch: `dev_add_birth_profile_local_storage`

Deliverables:

- Saved local profiles
- Recent chart inputs
- Settings persistence
- Clear local data control

### Module 8: Chart Wheel Renderer

Branch: `dev_add_readable_chart_wheel_renderer`

Deliverables:

- Readable natal chart wheel
- House and zodiac divisions
- Planet labels
- Major aspect lines
- Responsive layout

### Module 9: Template Reports

Branch: `dev_add_template_interpretation_reports`

Deliverables:

- Template report generation from real chart data
- Natal, synastry, and transit report sections
- Frontend report renderer
- Tests for report section selection

### Module 10: MVP Deployment

Branch: `dev_add_mvp_deployment_config`

Deliverables:

- Frontend API environment configuration
- Backend deployment configuration
- CORS configuration
- Production smoke checklist
- README launch instructions

## 16. Open Decisions

These decisions should be resolved before or during Phase 1 implementation:

- Which ephemeris library to use for the Python service.
- Whether geocoding is manual in Phase 1 or backed by a location API.
- Whether timezone is manually selected in Phase 1 or inferred from coordinates.
- Which deployment host to use for the FastAPI backend.
- Whether chart wheel rendering should be SVG-first or Canvas-first.
- Whether the first public MVP needs bilingual Chinese/English labels.

## 17. Immediate Next Step

Start with `dev_add_fastapi_chart_service`.

This module creates the backend service boundary without changing chart math yet. Once the API service is running and testable, subsequent modules can replace placeholder frontend chart data with real backend calculation results in smaller, reviewable branches.

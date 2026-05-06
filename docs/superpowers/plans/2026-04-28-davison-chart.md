# Davison Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `davison` as the next dual-subject fusion chart family, with a real backend endpoint and a fused time-space-midpoint relationship-chart result in the existing workspace.

**Architecture:** Reuse the shared `DualSubjectFusionGenerator` flow completed for composite, but implement Davison as a true midpoint time/place chart rather than midpoint planetary longitudes. Keep the request shape aligned with other dual-profile chart families, return a fused `ChartResult` with supporting natal charts in `relatedCharts`, and wire the frontend to treat `davison` as a live backend-backed couple category.

**Tech Stack:** Python 3.12, FastAPI, Pydantic, `pyswisseph`, pytest, React, Vite, node:test.

---

## File Structure

- Create: `backend/app/services/davison.py`
- Create: `backend/tests/test_davison_chart.py`
- Modify: `backend/app/models/chart.py`
- Modify: `backend/app/api/charts.py`
- Modify: `backend/tests/test_chart_contracts.py`
- Modify: `src/data/chartCatalog.js`
- Modify: `src/lib/api/chartApi.js`
- Modify: `src/lib/api/chartContracts.js`
- Modify: `tests/chartApiContracts.test.js`
- Modify: `tests/chartApiClient.test.js`
- Modify: `docs/api-contracts.md`

### Task 1: Backend Request Contract And Route

**Files:**
- Modify: `backend/app/models/chart.py`
- Modify: `backend/app/api/charts.py`
- Modify: `backend/tests/test_chart_contracts.py`

- [x] **Step 1: Write the failing backend contract tests**

Add tests that prove the new request model and endpoint do not exist yet:

```python
def test_davison_request_uses_default_chart_settings():
    request = DavisonChartRequest(
        primary=birth_profile_payload("Luna"),
        secondary=birth_profile_payload("Sol"),
    )

    assert request.chart_type == "davison"
    assert request.settings == ChartSettings()
    assert request.model_dump(by_alias=True)["chartType"] == "davison"


def test_chart_endpoints_are_registered_in_openapi_schema():
    schema = client.get("/openapi.json").json()

    assert "/api/charts/davison" in schema["paths"]


def test_davison_endpoint_requires_secondary_profile():
    response = client.post("/api/charts/davison", json={"primary": birth_profile_payload()})

    assert response.status_code == 422
```

- [x] **Step 2: Run the failing backend contract tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_chart_contracts.py -q
```

Expected: FAIL because `DavisonChartRequest` and `/api/charts/davison` do not exist yet.

- [x] **Step 3: Add the minimal request model and route skeleton**

Implement:

```python
class DavisonChartRequest(BaseChartRequest):
    chart_type: Literal["davison"] = Field(default="davison", alias="chartType")
    secondary: BirthProfile
```

and:

```python
@router.post("/davison", response_model=ChartResult, response_model_by_alias=True)
def create_davison_chart(request: DavisonChartRequest) -> ChartResult:
    try:
        return DavisonChartService().calculate(request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_chart_request",
                "message": str(error),
            },
        ) from error
```

- [x] **Step 4: Run the backend contract tests again**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_chart_contracts.py -q
```

Expected: route and request tests pass, even though service-level behavior is still pending.

- [ ] **Step 5: Commit**
Main-agent note: implementation, review, and verify are complete; commit intentionally deferred until the Davison backend service lands.

```bash
git add backend/app/models/chart.py backend/app/api/charts.py backend/tests/test_chart_contracts.py
git commit -m "test: add davison chart request and route contract"
```

### Task 2: Backend Davison Fusion Service

**Files:**
- Create: `backend/app/services/davison.py`
- Create: `backend/tests/test_davison_chart.py`
- Modify: `backend/tests/test_chart_contracts.py`

- [ ] **Step 1: Write the failing Davison behavior tests**

Add tests for:

```python
def test_midpoint_instant_uses_utc_midpoint():
    ...


def test_davison_service_delegates_to_fusion_generator(monkeypatch):
    ...


def test_davison_endpoint_returns_fused_chart_and_related_natals():
    response = client.post(
        "/api/charts/davison",
        json={
            "primary": birth_profile_payload("Luna"),
            "secondary": birth_profile_payload("Sol"),
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["chartType"] == "davison"
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "davisonChart",
    }
```

- [ ] **Step 2: Run the failing Davison tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_davison_chart.py -q
```

Expected: FAIL because the Davison service does not exist yet.

- [ ] **Step 3: Implement the Davison generator and service**

Create `backend/app/services/davison.py` with:

```python
class DavisonGenerator(DualSubjectFusionGenerator):
    def build_fused_chart(self, primary_chart, secondary_chart, settings) -> ChartResult:
        davison_profile = build_davison_profile(
            primary_chart.profiles[0],
            secondary_chart.profiles[0],
            self.context.ephemeris,
        )
        return self.context.natal.calculate_from_profile(davison_profile, settings)

    def build_chart_result(self, *, primary_chart, secondary_chart, fused_chart, settings) -> ChartResult:
        primary_profile = primary_chart.profiles[0]
        secondary_profile = secondary_chart.profiles[0]
        return ChartResult(
            chartId=build_davison_chart_id_from_profiles(primary_profile, secondary_profile),
            chartType="davison",
            title=f"{primary_profile.name} × {secondary_profile.name} Davison Chart",
            profiles=[primary_profile, secondary_profile],
            calculation=self.build_calculation_metadata(),
            placements=fused_chart.placements,
            houses=fused_chart.houses,
            aspects=fused_chart.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "secondaryNatal": secondary_chart.model_dump(by_alias=True),
                "davisonChart": fused_chart.model_dump(by_alias=True),
            },
        )
```

with helpers for:

- midpoint UTC instant
- arithmetic midpoint coordinates
- synthetic UTC `BirthProfile`

- [ ] **Step 4: Run the Davison backend tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_davison_chart.py tests/test_chart_contracts.py -q
```

Expected: PASS for the Davison suite.

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/davison.py backend/tests/test_davison_chart.py backend/tests/test_chart_contracts.py
git commit -m "feat: add davison chart backend service"
```

### Task 3: Frontend Catalog, API Routing, And Fused Result Mapping

**Files:**
- Modify: `src/data/chartCatalog.js`
- Modify: `src/lib/api/chartContracts.js`
- Modify: `src/lib/api/chartApi.js`
- Modify: `tests/chartApiContracts.test.js`
- Modify: `tests/chartApiClient.test.js`

- [ ] **Step 1: Write the failing frontend tests**

Add tests that assert:

```javascript
test("chart catalog includes davison under couple mode", () => {
  ...
});

test("calculateChart routes davison requests to the davison endpoint", async () => {
  ...
});

test("maps davison results as a fused relationship chart", async () => {
  assert.equal(chart.placementGroups[0].title, "时空中点盘星体");
  assert.equal(chart.overlays.length, 0);
});
```

- [ ] **Step 2: Run the failing frontend tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star && npm test -- --run tests/chartApiContracts.test.js tests/chartApiClient.test.js
```

Expected: FAIL because `davison` is not yet a real frontend category or API route.

- [ ] **Step 3: Add Davison catalog and API support**

Implement:

```javascript
{
  id: "davison",
  mode: "couple",
  label: "时空中点盘",
  outputTitle: "时空中点盘",
  requiresSecondPerson: true,
  requiresForecastDate: false,
  focus: ["关系结构", "共同命题", "时空交会", "关系发展"],
}
```

and:

```javascript
const SUPPORTED_ENDPOINTS = {
  natal: "/api/charts/natal",
  synastry: "/api/charts/synastry",
  composite: "/api/charts/composite",
  davison: "/api/charts/davison",
  transit: "/api/charts/transit",
  "solar-return": "/api/charts/solar-return",
};
```

- [ ] **Step 4: Map Davison as a fused chart**

Add a Davison-specific mapping branch:

```javascript
if (input.category === "davison" && relatedCharts?.davisonChart) {
  return [mapPlacementGroup(relatedCharts.davisonChart, "时空中点盘星体")];
}
```

and keep:

```javascript
if (input.category === "davison") {
  return [];
}
```

for overlay mapping.

- [ ] **Step 5: Run the frontend tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star && npm test -- --run tests/chartApiContracts.test.js tests/chartApiClient.test.js
```

Expected: PASS for Davison routing and fused result mapping.

- [ ] **Step 6: Commit**

```bash
git add src/data/chartCatalog.js src/lib/api/chartContracts.js src/lib/api/chartApi.js tests/chartApiContracts.test.js tests/chartApiClient.test.js
git commit -m "feat: wire davison chart frontend api flow"
```

### Task 4: Public Contract Docs And Verification

**Files:**
- Modify: `docs/api-contracts.md`

- [ ] **Step 1: Add the Davison API contract section**

Document:

```markdown
### POST /api/charts/davison

Request:

{
  "primary": { ... },
  "secondary": { ... },
  "settings": { ... }
}

Response: `ChartResult`.

`relatedCharts` includes:

- `primaryNatal`
- `secondaryNatal`
- `davisonChart`
```

- [ ] **Step 2: Run the backend verification**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests
```

Expected: full backend suite passes.

- [ ] **Step 3: Run the frontend verification**

Run:

```bash
cd /Users/lianke/PycharmProjects/star && npm test -- --run
```

Expected: frontend tests pass.

- [ ] **Step 4: Run the production build verification**

Run:

```bash
cd /Users/lianke/PycharmProjects/star && npm run build
```

Expected: Vite production build succeeds.

- [ ] **Step 5: Commit**

```bash
git add docs/api-contracts.md
git commit -m "docs: add davison chart api contract"
```

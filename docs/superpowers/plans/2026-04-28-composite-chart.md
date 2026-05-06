# Composite Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `composite` as the first dual-subject fusion chart family, with a real backend endpoint and a fused relationship-chart result in the existing workspace.

**Architecture:** Reuse the shared chart-generation framework by turning `DualSubjectFusionGenerator` into a real base flow, then implement a dedicated composite generator/service on top. Keep the request shape close to `synastry`, return a fused `ChartResult` with supporting natal charts in `relatedCharts`, and wire the frontend to treat `composite` as a live backend-backed category instead of a placeholder.

**Tech Stack:** Python 3.12, FastAPI, Pydantic, `pyswisseph`, pytest, React, Vite, node:test.

---

## File Structure

- Create: `backend/app/services/composite.py`
- Create: `backend/tests/test_composite_chart.py`
- Modify: `backend/app/models/chart.py`
- Modify: `backend/app/api/charts.py`
- Modify: `backend/app/services/chart_generators.py`
- Modify: `backend/tests/test_chart_contracts.py`
- Modify: `src/lib/api/chartApi.js`
- Modify: `src/lib/api/chartContracts.js`
- Modify: `tests/chartApiClient.test.js`
- Modify: `tests/chartApiContracts.test.js`
- Modify: `docs/api-contracts.md`

### Task 1: Backend Request Contract And Route

**Files:**
- Modify: `backend/app/models/chart.py`
- Modify: `backend/app/api/charts.py`
- Modify: `backend/tests/test_chart_contracts.py`

- [x] **Step 1: Write the failing backend contract tests**

Add tests that prove the new request model and endpoint do not exist yet:

```python
def test_composite_request_uses_default_chart_settings():
    request = CompositeChartRequest(
        primary=birth_profile_payload("Luna"),
        secondary=birth_profile_payload("Sol"),
    )

    assert request.chart_type == "composite"
    assert request.settings == ChartSettings()
    assert request.model_dump(by_alias=True)["chartType"] == "composite"


def test_chart_endpoints_are_registered_in_openapi_schema():
    schema = client.get("/openapi.json").json()

    assert "/api/charts/composite" in schema["paths"]


def test_composite_endpoint_requires_secondary_profile():
    response = client.post("/api/charts/composite", json={"primary": birth_profile_payload()})

    assert response.status_code == 422
```

- [x] **Step 2: Run the failing backend contract tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_chart_contracts.py -q
```

Expected: FAIL because `CompositeChartRequest` and `/api/charts/composite` do not exist yet.

- [x] **Step 3: Add the minimal request model and route skeleton**

Implement the smallest contract-compatible backend shape:

```python
class CompositeChartRequest(BaseChartRequest):
    chart_type: Literal["composite"] = Field(default="composite", alias="chartType")
    secondary: BirthProfile
```

and

```python
@router.post("/composite", response_model=ChartResult, response_model_by_alias=True)
def create_composite_chart(request: CompositeChartRequest) -> ChartResult:
    try:
        return CompositeChartService().calculate(request)
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

Expected: route and request tests now pass. The final Task 1 shape includes a minimal `CompositeChartService` stub so valid requests fail as explicit `422 invalid_chart_request` rather than import-time or 500 failures.

- [ ] **Step 5: Commit**
Main-agent note: implementation, review, and verify are complete; commit intentionally deferred until more of the composite plan lands.

```bash
git add backend/app/models/chart.py backend/app/api/charts.py backend/tests/test_chart_contracts.py
git commit -m "test: add composite chart request and route contract"
```

### Task 2: Backend Fusion Generator And Composite Service

**Files:**
- Modify: `backend/app/services/chart_generators.py`
- Create: `backend/app/services/composite.py`
- Create: `backend/tests/test_composite_chart.py`

- [x] **Step 1: Write the failing fusion and endpoint behavior tests**

Add tests for:

```python
def test_midpoint_longitude_wraps_across_zero_aries():
    assert midpoint_longitude(350.0, 10.0) == 0.0


def test_composite_service_delegates_to_fusion_generator(monkeypatch):
    ...
    assert captured["primary"].name == "Luna"
    assert captured["secondary"].name == "Sol"


def test_composite_endpoint_returns_fused_chart_and_related_natals():
    response = client.post(
        "/api/charts/composite",
        json={
            "primary": birth_profile_payload("Luna"),
            "secondary": birth_profile_payload("Sol"),
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["chartType"] == "composite"
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "compositeChart",
    }
```

- [x] **Step 2: Run the failing composite tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_composite_chart.py -q
```

Expected: FAIL because the fusion flow and composite service do not exist yet.

- [x] **Step 3: Implement the reusable fusion generator base flow**

Turn `DualSubjectFusionGenerator` into a real base class with narrow hooks:

```python
class DualSubjectFusionGenerator(BaseChartGenerator):
    def build_fused_chart(
        self,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        raise NotImplementedError

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        fused_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        raise NotImplementedError

    def generate(
        self,
        primary_profile: BirthProfile,
        secondary_profile: BirthProfile,
        settings: ChartSettings,
    ) -> ChartResult:
        primary_chart = self.context.natal.calculate_from_profile(primary_profile, settings)
        secondary_chart = self.context.natal.calculate_from_profile(secondary_profile, settings)
        fused_chart = self.build_fused_chart(primary_chart, secondary_chart, settings)
        return self.build_chart_result(
            primary_chart=primary_chart,
            secondary_chart=secondary_chart,
            fused_chart=fused_chart,
            settings=settings,
        )
```

- [x] **Step 4: Implement the composite generator and service**

Create `backend/app/services/composite.py` with:

```python
class CompositeGenerator(DualSubjectFusionGenerator):
    def build_fused_chart(self, primary_chart, secondary_chart, settings) -> ChartResult:
        composite_profile = build_composite_profile(primary_chart, secondary_chart)
        return self.context.natal.calculate_from_profile(composite_profile, settings)

    def build_chart_result(self, *, primary_chart, secondary_chart, fused_chart, settings) -> ChartResult:
        primary_profile = primary_chart.profiles[0]
        secondary_profile = secondary_chart.profiles[0]
        return ChartResult(
            chartId=build_composite_chart_id_from_profiles(primary_profile, secondary_profile),
            chartType="composite",
            title=f"{primary_profile.name} × {secondary_profile.name} Composite Chart",
            profiles=[primary_profile, secondary_profile],
            calculation=self.build_calculation_metadata(),
            placements=fused_chart.placements,
            houses=fused_chart.houses,
            aspects=fused_chart.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "secondaryNatal": secondary_chart.model_dump(by_alias=True),
                "compositeChart": fused_chart.model_dump(by_alias=True),
            },
        )
```

and helpers for:

- midpoint longitude with wraparound support
- midpoint UTC instant
- midpoint coordinates
- synthetic composite `BirthProfile`

- [x] **Step 5: Run the composite backend tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_composite_chart.py tests/test_chart_generators.py tests/test_chart_contracts.py -q
```

Expected: PASS for the composite suite and no regression in generator contract tests.

- [ ] **Step 6: Commit**
Main-agent note: implementation, review, and verify are complete; commit intentionally deferred until the frontend composite flow lands.

```bash
git add backend/app/services/chart_generators.py backend/app/services/composite.py backend/tests/test_composite_chart.py backend/tests/test_chart_contracts.py
git commit -m "feat: add composite chart fusion generator"
```

### Task 3: Frontend API Routing And Composite Result Mapping

**Files:**
- Modify: `src/lib/api/chartContracts.js`
- Modify: `src/lib/api/chartApi.js`
- Modify: `tests/chartApiContracts.test.js`
- Modify: `tests/chartApiClient.test.js`

- [x] **Step 1: Write the failing frontend contract and client tests**

Add tests that assert:

```javascript
test("builds composite payload from two birth profiles", () => {
  assert.deepEqual(buildCompositeChartPayload(primary, secondary), {
    primary: { ... },
    secondary: { ... },
    settings: defaultChartSettings,
  });
});

test("calculateChart routes composite requests to the composite endpoint", async () => {
  ...
  assert.equal(capturedUrl, "http://localhost:8000/api/charts/composite");
});

test("maps composite results as a fused relationship chart", async () => {
  assert.equal(chart.placementGroups[0].title, "组合盘星体");
  assert.equal(chart.overlays.length, 0);
});
```

- [x] **Step 2: Run the failing frontend tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star && npm test -- --run tests/chartApiContracts.test.js tests/chartApiClient.test.js
```

Expected: FAIL because `composite` is still rejected as unsupported.

- [x] **Step 3: Add composite payload and endpoint support**

Implement either a dedicated builder or an intentional alias:

```javascript
export function buildCompositeChartPayload(primary, secondary, settings = defaultChartSettings) {
  return buildSynastryChartPayload(primary, secondary, settings);
}
```

and:

```javascript
const SUPPORTED_ENDPOINTS = {
  natal: "/api/charts/natal",
  synastry: "/api/charts/synastry",
  composite: "/api/charts/composite",
  transit: "/api/charts/transit",
  "solar-return": "/api/charts/solar-return",
};
```

- [x] **Step 4: Map composite results as a fused chart**

Add a composite-specific result mapping branch:

```javascript
if (input.category === "composite" && relatedCharts?.compositeChart) {
  return [
    mapPlacementGroup(relatedCharts.compositeChart, "组合盘星体"),
  ];
}
```

and keep:

```javascript
if (input.category === "composite") {
  return [];
}
```

for overlay mapping unless a real overlay contract is added later.

- [x] **Step 5: Run the frontend tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star && npm test -- --run tests/chartApiContracts.test.js tests/chartApiClient.test.js
```

Expected: PASS for composite routing and fused result mapping.

- [ ] **Step 6: Commit**
Main-agent note: implementation, review, and verify are complete; commit intentionally deferred until docs are updated.

```bash
git add src/lib/api/chartContracts.js src/lib/api/chartApi.js tests/chartApiContracts.test.js tests/chartApiClient.test.js
git commit -m "feat: wire composite chart frontend api flow"
```

### Task 4: Public Contract Docs And End-To-End Verification

**Files:**
- Modify: `docs/api-contracts.md`

- [x] **Step 1: Add the composite API contract section**

Document:

```markdown
### POST /api/charts/composite

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
- `compositeChart`
```

- [x] **Step 2: Run the backend verification**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests
```

Expected: full backend suite passes.

- [x] **Step 3: Run the frontend verification**

Run:

```bash
cd /Users/lianke/PycharmProjects/star && npm test -- --run
```

Expected: frontend tests pass.

- [x] **Step 4: Run the production build verification**

Run:

```bash
cd /Users/lianke/PycharmProjects/star && npm run build
```

Expected: Vite production build succeeds.

- [ ] **Step 5: Commit**
Main-agent note: docs, review, and final verification are complete; commit intentionally deferred while continuing Phase 2 development in the same working set.

```bash
git add docs/api-contracts.md
git commit -m "docs: add composite chart api contract"
```

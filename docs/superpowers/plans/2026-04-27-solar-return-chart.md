# Solar Return Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `solar-return` chart family with a dedicated backend API, precise return-time search around a user-provided anchor datetime, and frontend entry/result wiring that reuses the current forecast workspace and dual-wheel result flow.

**Architecture:** The backend extends the shared `SingleSubjectDerivedGenerator` family with a `SolarReturnGenerator` and a focused time-search helper that finds the exact moment the transiting Sun returns to the natal Sun longitude near a local anchor time. The frontend adds `solar-return` as a `forecast` category, collects anchor datetime plus return location, sends a dedicated payload to `/api/charts/solar-return`, and maps the result using the existing transit-like rendering path with solar-return-specific labels.

**Tech Stack:** Python, FastAPI, Pydantic, Swiss Ephemeris (`pyswisseph`), React, Vite, Node test runner, pytest

---

## File Structure

### Backend

- Create: `backend/app/services/solar_return.py`
  - Owns the solar return generator, request-to-generator service, chart ids, derived chart assembly, and overlay/result packaging.
- Create: `backend/tests/test_solar_return_chart.py`
  - Owns request validation, service delegation, endpoint contract, and related chart assertions.
- Modify: `backend/app/models/chart.py`
  - Add request models for `ReturnLocation` and `SolarReturnChartRequest`.
- Modify: `backend/app/api/charts.py`
  - Add `/api/charts/solar-return`.
- Modify: `backend/app/services/ephemeris.py`
  - Add a focused helper for solar return search or the minimum longitude/time utilities needed by that helper.
- Optionally create: `backend/app/services/return_search.py`
  - Only if the search logic would make `ephemeris.py` too broad; keep it single-purpose.

### Frontend

- Modify: `src/data/chartCatalog.js`
  - Register `solar-return` under `forecast`.
- Modify: `src/lib/chartEngine.js`
  - Carry solar-return-specific request fields through workspace request creation.
- Modify: `src/lib/api/chartContracts.js`
  - Add solar return payload builder and return-location normalization helpers.
- Modify: `src/lib/api/chartApi.js`
  - Route solar return requests to `/api/charts/solar-return` and map result labels/titles.
- Modify: `src/App.jsx`
  - Add UI fields for `日返参考时间` and `日返发生地`, and include them in chart generation requests.
- Modify or add tests:
  - `tests/chartEngine.test.js`
  - `tests/chartApi.test.js` if it exists; otherwise create it
  - `tests/appInitialState.test.js`

### Docs

- Modify: `docs/api-contracts.md`
  - Document the new endpoint and request/response shape.

---

### Task 1: Add Failing Backend Request and Endpoint Tests

**Files:**
- Modify: `backend/tests/test_solar_return_chart.py`
- Modify: `backend/app/models/chart.py`
- Modify: `backend/app/api/charts.py`

- [ ] **Step 1: Write the failing request/model and endpoint tests**

```python
from fastapi.testclient import TestClient

from app.main import app
from app.models.chart import SolarReturnChartRequest


client = TestClient(app)


def solar_return_payload() -> dict:
    return {
        "primary": {
            "name": "Luna",
            "date": "1996-04-12",
            "time": "08:30",
            "locationName": "Shanghai",
            "latitude": 31.2304,
            "longitude": 121.4737,
            "timezone": "Asia/Shanghai",
        },
        "anchorDate": "2026-04-27",
        "anchorTime": "18:00",
        "returnLocation": {
            "locationName": "Tokyo",
            "latitude": 35.6762,
            "longitude": 139.6503,
            "timezone": "Asia/Tokyo",
        },
    }


def test_solar_return_request_parses_anchor_and_return_location():
    request = SolarReturnChartRequest.model_validate(solar_return_payload())

    assert request.anchor_date == "2026-04-27"
    assert request.anchor_time == "18:00"
    assert request.return_location.location_name == "Tokyo"
    assert request.return_location.timezone == "Asia/Tokyo"


def test_solar_return_endpoint_rejects_missing_return_timezone():
    payload = solar_return_payload()
    del payload["returnLocation"]["timezone"]

    response = client.post("/api/charts/solar-return", json=payload)

    assert response.status_code == 422
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_solar_return_chart.py -q`

Expected: FAIL because `SolarReturnChartRequest` and `/api/charts/solar-return` do not exist yet.

- [ ] **Step 3: Add minimal request models and route skeleton**

```python
class ReturnLocation(BaseModel):
    location_name: str = Field(alias="locationName")
    latitude: float
    longitude: float
    timezone: str

    model_config = ConfigDict(populate_by_name=True)


class SolarReturnChartRequest(BaseChartRequest):
    chart_type: Literal["solarReturn"] = Field(default="solarReturn", alias="chartType")
    anchor_date: str = Field(alias="anchorDate")
    anchor_time: str = Field(alias="anchorTime")
    return_location: ReturnLocation = Field(alias="returnLocation")
```

```python
@router.post("/solar-return", response_model=ChartResult, response_model_by_alias=True)
def create_solar_return_chart(request: SolarReturnChartRequest) -> ChartResult:
    try:
        return SolarReturnChartService().calculate(request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_chart_request",
                "message": str(error),
            },
        ) from error
```

- [ ] **Step 4: Run test to verify partial green / next expected failure**

Run: `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_solar_return_chart.py -q`

Expected: route now exists, but service/import behavior still fails.

- [ ] **Step 5: Commit**

```bash
git add backend/app/models/chart.py backend/app/api/charts.py backend/tests/test_solar_return_chart.py
git commit -m "test: add solar return request and route coverage"
```

---

### Task 2: Add Failing Solar Return Search Tests

**Files:**
- Modify: `backend/tests/test_solar_return_chart.py`
- Modify: `backend/app/services/ephemeris.py`
- Create or Modify: `backend/app/services/solar_return.py`

- [ ] **Step 1: Write the failing search behavior tests**

```python
from datetime import datetime

from app.models.chart import BirthProfile
from app.services.solar_return import (
    SolarReturnSearchInput,
    find_solar_return_datetime,
)


def build_profile() -> BirthProfile:
    return BirthProfile(
        name="Luna",
        date="1996-04-12",
        time="08:30",
        locationName="Shanghai",
        latitude=31.2304,
        longitude=121.4737,
        timezone="Asia/Shanghai",
    )


def test_find_solar_return_datetime_returns_exact_time_near_anchor():
    result = find_solar_return_datetime(
        SolarReturnSearchInput(
            natal_profile=build_profile(),
            anchor_date="2026-04-27",
            anchor_time="18:00",
            anchor_timezone="Asia/Tokyo",
        )
    )

    assert isinstance(result, datetime)


def test_find_solar_return_datetime_uses_anchor_timezone():
    result = find_solar_return_datetime(
        SolarReturnSearchInput(
            natal_profile=build_profile(),
            anchor_date="2026-04-27",
            anchor_time="18:00",
            anchor_timezone="Asia/Tokyo",
        )
    )

    assert result.tzinfo is not None
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_solar_return_chart.py -q`

Expected: FAIL because the search input/helper does not exist yet.

- [ ] **Step 3: Write the minimal search helper**

```python
@dataclass(frozen=True)
class SolarReturnSearchInput:
    natal_profile: BirthProfile
    anchor_date: str
    anchor_time: str
    anchor_timezone: str


def find_solar_return_datetime(search_input: SolarReturnSearchInput) -> datetime:
    anchor = local_datetime_to_utc(
        date=search_input.anchor_date,
        time=search_input.anchor_time,
        timezone_name=search_input.anchor_timezone,
    )
    natal_sun_longitude = natal_sun_longitude_for_profile(search_input.natal_profile)
    return refine_solar_return_near_anchor(anchor, natal_sun_longitude)
```

- [ ] **Step 4: Add bounded coarse-to-fine search**

```python
SEARCH_WINDOW_HOURS = 36
COARSE_STEP_MINUTES = 30


def refine_solar_return_near_anchor(anchor: datetime, natal_sun_longitude: float) -> datetime:
    lower, upper = bracket_solar_return(anchor, natal_sun_longitude)
    return bisect_solar_return(lower, upper, natal_sun_longitude)
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_solar_return_chart.py -q`

Expected: PASS for the new search tests, with other solar-return tests still pending.

- [ ] **Step 6: Commit**

```bash
git add backend/app/services/solar_return.py backend/app/services/ephemeris.py backend/tests/test_solar_return_chart.py
git commit -m "feat: add solar return time search helper"
```

---

### Task 3: Implement the Solar Return Generator and Service

**Files:**
- Create: `backend/app/services/solar_return.py`
- Modify: `backend/app/services/chart_generators.py`
- Modify: `backend/tests/test_solar_return_chart.py`

- [ ] **Step 1: Write the failing generator/service delegation tests**

```python
from app.models.chart import SolarReturnChartRequest
from app.services.solar_return import SolarReturnChartService, SolarReturnTargetContext


def test_solar_return_service_delegates_to_generator(monkeypatch):
    request = SolarReturnChartRequest.model_validate(solar_return_payload())
    service = SolarReturnChartService()
    delegated_result = object()
    captured: dict[str, object] = {}

    def fake_generate(primary, settings, target_context):
        captured["primary"] = primary
        captured["settings"] = settings
        captured["target_context"] = target_context
        return delegated_result

    monkeypatch.setattr(service.generator, "generate", fake_generate)

    result = service.calculate(request)

    assert result is delegated_result
    assert captured["primary"] == request.primary
    assert captured["target_context"] == SolarReturnTargetContext(
        anchor_date=request.anchor_date,
        anchor_time=request.anchor_time,
        return_location=request.return_location.model_dump(by_alias=True),
    )
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_solar_return_chart.py -q`

Expected: FAIL because the service/generator target context does not exist yet.

- [ ] **Step 3: Implement the generator target context and derived-chart flow**

```python
class SolarReturnTargetContext(TypedDict):
    anchor_date: str
    anchor_time: str
    return_location: dict[str, object]


class SolarReturnGenerator(SingleSubjectDerivedGenerator[SolarReturnTargetContext]):
    overlay_id = "solar-return-in-natal"

    def build_derived_chart(self, primary_profile, settings, target_context) -> ChartResult:
        exact_return = find_solar_return_datetime(
            SolarReturnSearchInput(
                natal_profile=primary_profile,
                anchor_date=target_context["anchor_date"],
                anchor_time=target_context["anchor_time"],
                anchor_timezone=str(target_context["return_location"]["timezone"]),
            )
        )
        profile = build_solar_return_profile(primary_profile, exact_return, target_context["return_location"])
        solar_return = self.context.natal.calculate_from_profile(profile, settings)
        solar_return.chart_id = build_solar_return_chart_id(primary_profile, exact_return)
        solar_return.chart_type = "solarReturn"
        solar_return.title = f"{primary_profile.name} Solar Return"
        return solar_return
```

- [ ] **Step 4: Implement result packaging to match the transit-style contract**

```python
    def build_chart_result(self, *, primary_chart, derived_chart, overlay, settings, target_context) -> ChartResult:
        _ = settings, target_context
        primary_profile = primary_chart.profiles[0]
        return ChartResult(
            chartId=build_solar_return_result_id(primary_profile, derived_chart.profiles[0]),
            chartType="solarReturn",
            title=f"{primary_profile.name} Solar Return Chart",
            profiles=[primary_profile],
            calculation=self.build_calculation_metadata(),
            placements=[*planetary_placements(primary_chart.placements), *planetary_placements(derived_chart.placements)],
            houses=[],
            aspects=overlay.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "solarReturn": derived_chart.model_dump(by_alias=True),
                "solarReturnOverlay": overlay.model_dump(by_alias=True),
            },
        )
```

- [ ] **Step 5: Run tests to verify it passes**

Run: `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_solar_return_chart.py -q`

Expected: service delegation tests pass and endpoint contract tests become the next failing edge if labels/shape differ.

- [ ] **Step 6: Commit**

```bash
git add backend/app/services/solar_return.py backend/tests/test_solar_return_chart.py
git commit -m "feat: add solar return generator and service"
```

---

### Task 4: Complete Endpoint Contract and Error Handling

**Files:**
- Modify: `backend/tests/test_solar_return_chart.py`
- Modify: `backend/app/api/charts.py`
- Modify: `backend/app/services/solar_return.py`

- [ ] **Step 1: Write the failing endpoint contract test**

```python
def test_solar_return_endpoint_returns_natal_return_chart_and_overlay():
    response = client.post("/api/charts/solar-return", json=solar_return_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["chartType"] == "solarReturn"
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "solarReturn",
        "solarReturnOverlay",
    }
    assert data["relatedCharts"]["primaryNatal"]["chartType"] == "natal"
    assert data["relatedCharts"]["solarReturn"]["chartType"] == "solarReturn"
    assert data["relatedCharts"]["solarReturnOverlay"]["referenceName"] == "Luna"
    assert data["relatedCharts"]["solarReturnOverlay"]["overlayName"] == "Luna Solar Return"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_solar_return_chart.py::test_solar_return_endpoint_returns_natal_return_chart_and_overlay -q`

Expected: FAIL on chart type, overlay naming, or related chart content until contract is aligned.

- [ ] **Step 3: Align endpoint response and error semantics**

```python
def build_overlay_label(self, primary_chart: ChartResult, _derived_chart: ChartResult) -> str:
    return f"Solar Return in {primary_chart.profiles[0].name} houses"


def build_solar_return_profile(primary_profile, exact_return, return_location):
    return BirthProfile(
        name=f"{primary_profile.name} Solar Return",
        date=exact_return.astimezone(ZoneInfo(str(return_location['timezone']))).strftime("%Y-%m-%d"),
        time=exact_return.astimezone(ZoneInfo(str(return_location['timezone']))).strftime("%H:%M"),
        locationName=str(return_location["locationName"]),
        latitude=float(return_location["latitude"]),
        longitude=float(return_location["longitude"]),
        timezone=str(return_location["timezone"]),
    )
```

- [ ] **Step 4: Run targeted and full backend chart tests**

Run: `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_solar_return_chart.py tests/test_transit_chart.py tests/test_synastry_chart.py tests/test_chart_generators.py -q`

Expected: PASS for the chart family suite.

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/charts.py backend/app/services/solar_return.py backend/tests/test_solar_return_chart.py
git commit -m "feat: finalize solar return API contract"
```

---

### Task 5: Add Failing Frontend Request and Catalog Tests

**Files:**
- Modify: `src/data/chartCatalog.js`
- Modify: `src/lib/chartEngine.js`
- Modify: `tests/chartEngine.test.js`
- Modify: `tests/appInitialState.test.js`

- [ ] **Step 1: Write the failing frontend request tests**

```javascript
import test from "node:test";
import assert from "node:assert/strict";

import { createChartRequest } from "../src/lib/chartEngine.js";

test("createChartRequest carries solar return anchor and return location", () => {
  const request = createChartRequest({
    mode: "forecast",
    category: "solar-return",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
      latitude: "31.2304",
      longitude: "121.4737",
      timezone: "Asia/Shanghai",
    },
    solarReturnAnchorDate: "2026-04-27",
    solarReturnAnchorTime: "18:00",
    solarReturnLocation: {
      locationName: "Tokyo",
      latitude: "35.6762",
      longitude: "139.6503",
      timezone: "Asia/Tokyo",
    },
  });

  assert.equal(request.category, "solar-return");
  assert.equal(request.forecastDate, "2026-04-27");
  assert.equal(request.solarReturnLocation.locationName, "Tokyo");
});
```

```javascript
test("forecast category list includes solar return", () => {
  const catalogSource = readFileSync(new URL("../src/data/chartCatalog.js", import.meta.url), "utf8");

  assert.match(catalogSource, /id: "solar-return"/);
  assert.match(catalogSource, /label: "日返盘"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/lianke/PycharmProjects/star && npm test -- --run`

Expected: FAIL because the category and request fields do not exist yet.

- [ ] **Step 3: Add minimal chart catalog and request wiring**

```javascript
{
  id: "solar-return",
  mode: "forecast",
  label: "日返盘",
  outputTitle: "日返推运盘",
  requiresSecondPerson: false,
  requiresForecastDate: true,
  focus: ["年度主题", "自我更新", "关系焦点", "行动窗口"],
}
```

```javascript
if (input.category === "solar-return") {
  return {
    ...baseRequest,
    forecastDate: input.solarReturnAnchorDate || "",
    forecastTime: input.solarReturnAnchorTime || "12:00",
    solarReturnLocation: normalizeSolarReturnLocation(input.solarReturnLocation),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/lianke/PycharmProjects/star && npm test -- --run`

Expected: PASS for the new request tests, with API/presentation tests still pending.

- [ ] **Step 5: Commit**

```bash
git add src/data/chartCatalog.js src/lib/chartEngine.js tests/chartEngine.test.js tests/appInitialState.test.js
git commit -m "feat: add solar return workspace request fields"
```

---

### Task 6: Implement Frontend Payload Builder, API Routing, and Result Mapping

**Files:**
- Modify: `src/lib/api/chartContracts.js`
- Modify: `src/lib/api/chartApi.js`
- Create or Modify: `tests/chartApi.test.js`

- [ ] **Step 1: Write the failing API helper tests**

```javascript
import test from "node:test";
import assert from "node:assert/strict";

import { buildSolarReturnChartPayload } from "../src/lib/api/chartContracts.js";

test("buildSolarReturnChartPayload serializes anchor and return location", () => {
  const payload = buildSolarReturnChartPayload(
    {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      locationName: "Shanghai",
      latitude: "31.2304",
      longitude: "121.4737",
      timezone: "Asia/Shanghai",
    },
    {
      anchorDate: "2026-04-27",
      anchorTime: "18:00",
      returnLocation: {
        locationName: "Tokyo",
        latitude: "35.6762",
        longitude: "139.6503",
        timezone: "Asia/Tokyo",
      },
    }
  );

  assert.equal(payload.anchorDate, "2026-04-27");
  assert.equal(payload.returnLocation.locationName, "Tokyo");
  assert.equal(payload.returnLocation.latitude, 35.6762);
});
```

```javascript
test("calculateChart routes solar return requests to the solar-return endpoint", async () => {
  let requestedUrl = "";

  const fetcher = async (url) => {
    requestedUrl = url;
    return {
      ok: true,
      json: async () => ({
        chartId: "solar-return-luna-2026",
        chartType: "solarReturn",
        title: "Luna Solar Return Chart",
        profiles: [{ name: "Luna" }],
        calculation: {},
        placements: [],
        houses: [],
        aspects: [],
        relatedCharts: {
          primaryNatal: { placements: [], houses: [], profiles: [{ name: "Luna" }] },
          solarReturn: { placements: [], houses: [], profiles: [{ name: "Luna Solar Return" }] },
          solarReturnOverlay: { overlayId: "solar-return-in-natal", referenceName: "Luna", overlayName: "Luna Solar Return", placements: [], houses: [], aspects: [] },
        },
      }),
    };
  };

  await calculateChart({
    category: "solar-return",
    mode: "forecast",
    primary: { name: "Luna" },
    settings: null,
    solarReturnAnchorDate: "2026-04-27",
    solarReturnAnchorTime: "18:00",
    solarReturnLocation: {
      locationName: "Tokyo",
      latitude: "35.6762",
      longitude: "139.6503",
      timezone: "Asia/Tokyo",
    },
  }, fetcher);

  assert.match(requestedUrl, /\/api\/charts\/solar-return$/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/lianke/PycharmProjects/star && npm test -- --run`

Expected: FAIL because the payload builder and endpoint route do not exist yet.

- [ ] **Step 3: Add the payload builder and API route**

```javascript
export function buildSolarReturnChartPayload(primary, solarReturn, settings = defaultChartSettings) {
  return {
    primary: normalizeBirthProfile(primary),
    anchorDate: solarReturn.anchorDate,
    anchorTime: solarReturn.anchorTime,
    returnLocation: normalizeReturnLocation(solarReturn.returnLocation),
    settings: normalizeSettings(settings),
  };
}
```

```javascript
const SUPPORTED_ENDPOINTS = {
  natal: "/api/charts/natal",
  synastry: "/api/charts/synastry",
  transit: "/api/charts/transit",
  "solar-return": "/api/charts/solar-return",
};
```

- [ ] **Step 4: Update result mapping labels**

```javascript
if (input.category === "solar-return" && relatedCharts?.primaryNatal && relatedCharts?.solarReturn) {
  return [
    mapPlacementGroup(relatedCharts.primaryNatal, `${chartProfileName(relatedCharts.primaryNatal, input.primary.name)} 的本命星体`),
    mapPlacementGroup(relatedCharts.solarReturn, "日返星体"),
  ];
}
```

```javascript
if (relatedCharts?.solarReturnOverlay) {
  return {
    from: relatedCharts.solarReturnOverlay.referenceName,
    to: "日返",
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /Users/lianke/PycharmProjects/star && npm test -- --run`

Expected: PASS for the frontend API helper suite.

- [ ] **Step 6: Commit**

```bash
git add src/lib/api/chartContracts.js src/lib/api/chartApi.js tests/chartApi.test.js
git commit -m "feat: wire frontend solar return API helpers"
```

---

### Task 7: Add the Solar Return Form UI and Result Entry Flow

**Files:**
- Modify: `src/App.jsx`
- Modify: `tests/appInitialState.test.js`

- [ ] **Step 1: Write the failing UI source assertions**

```javascript
test("workspace exposes solar return anchor and location fields", () => {
  assert.match(appSource, /日返参考时间/);
  assert.match(appSource, /日返发生地/);
  assert.match(appSource, /solarReturnLocation/);
  assert.match(appSource, /solarReturnAnchorDate/);
  assert.match(appSource, /solarReturnAnchorTime/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/lianke/PycharmProjects/star && npm test -- --run`

Expected: FAIL because the form fields do not exist yet.

- [ ] **Step 3: Add the new local state and conditional form sections**

```javascript
const [solarReturnAnchorDate, setSolarReturnAnchorDate] = useState("2026-04-27");
const [solarReturnAnchorTime, setSolarReturnAnchorTime] = useState("18:00");
const [solarReturnLocation, setSolarReturnLocation] = useState({
  locationName: "东京",
  latitude: "35.6762",
  longitude: "139.6503",
  timezone: "Asia/Tokyo",
});
```

```jsx
{activeCategory === "solar-return" ? (
  <>
    <fieldset className="person-fields">
      <legend>日返参考时间</legend>
      <label>
        参考日期
        <input type="date" value={solarReturnAnchorDate} onChange={(event) => setSolarReturnAnchorDate(event.target.value)} />
      </label>
      <label>
        参考时间
        <input type="time" value={solarReturnAnchorTime} onChange={(event) => setSolarReturnAnchorTime(event.target.value)} />
      </label>
    </fieldset>
    <ReturnLocationFields location={solarReturnLocation} onChange={updateSolarReturnLocation} />
  </>
) : null}
```

- [ ] **Step 4: Include the new data in `createChartRequest()` input**

```javascript
const request = createChartRequest({
  mode: activeMode,
  category: activeCategory,
  primary: people.primary,
  secondary: people.secondary,
  settings,
  forecastDate,
  forecastTime,
  solarReturnAnchorDate,
  solarReturnAnchorTime,
  solarReturnLocation,
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /Users/lianke/PycharmProjects/star && npm test -- --run`

Expected: PASS for the new UI source assertions.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx tests/appInitialState.test.js
git commit -m "feat: add solar return form fields"
```

---

### Task 8: Update API Docs and Run Full Verification

**Files:**
- Modify: `docs/api-contracts.md`

- [ ] **Step 1: Write the failing doc expectation test or checklist assertion**

Use an explicit review checklist in the task notes:

```text
Confirm docs/api-contracts.md includes:
- POST /api/charts/solar-return
- anchorDate
- anchorTime
- returnLocation
- relatedCharts primaryNatal / solarReturn / solarReturnOverlay
```

- [ ] **Step 2: Update the contract doc**

```markdown
### POST /api/charts/solar-return

Request:

```json
{
  "primary": { "...": "..." },
  "anchorDate": "2026-04-27",
  "anchorTime": "18:00",
  "returnLocation": {
    "locationName": "Tokyo",
    "latitude": 35.6762,
    "longitude": 139.6503,
    "timezone": "Asia/Tokyo"
  },
  "settings": {
    "houseSystem": "placidus",
    "zodiac": "tropical",
    "aspectSet": "major",
    "orbProfile": "default"
  }
}
```
```

- [ ] **Step 3: Run backend verification**

Run: `cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest`

Expected: full backend suite passes.

- [ ] **Step 4: Run frontend verification**

Run: `cd /Users/lianke/PycharmProjects/star && npm test`

Expected: frontend tests pass.

- [ ] **Step 5: Run production build verification**

Run: `cd /Users/lianke/PycharmProjects/star && npm run build`

Expected: Vite production build succeeds.

- [ ] **Step 6: Commit**

```bash
git add docs/api-contracts.md
git commit -m "docs: add solar return api contract"
```

---

## Self-Review

- Spec coverage: backend request model, endpoint, search algorithm, generator, frontend category, form inputs, API routing, result mapping, docs, and verification are all represented by dedicated tasks.
- Placeholder scan: no `TODO`/`TBD` placeholders remain in task steps; every task includes concrete files, commands, and code examples.
- Type consistency: uses `solar-return` on the frontend category id, `/api/charts/solar-return` as the endpoint, `SolarReturnChartRequest` on the backend request layer, and `solarReturn` / `solarReturnOverlay` in response mapping throughout the plan.

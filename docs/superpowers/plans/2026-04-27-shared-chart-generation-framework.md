# Shared Chart Generation Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared backend chart-generation framework that unifies derived, comparison, and future fusion chart orchestration while keeping the existing `transit` and `synastry` API responses unchanged.

**Architecture:** Introduce a lightweight generator layer above `NatalChartService` and `ChartOverlayService`, then migrate `TransitChartService` and `SynastryChartService` into thin adapters over that layer. Keep `ChartResult` and `relatedCharts` backward compatible so the frontend does not need to change.

**Tech Stack:** Python 3.12, FastAPI, Pydantic, `ephem`, `pyswisseph`, pytest.

---

## File Structure

- Create: `backend/app/services/chart_generators.py`
  - Shared orchestration primitives and generator families.
- Modify: `backend/app/services/transit.py`
  - Migrate transit to the shared single-subject derived flow.
- Modify: `backend/app/services/synastry.py`
  - Migrate synastry to the shared dual-subject comparison flow.
- Modify: `backend/app/services/__init__.py`
  - Export the new generator layer if this package already re-exports service units.
- Create: `backend/tests/test_chart_generators.py`
  - Framework-level unit tests for derived/comparison/fusion extension behavior.
- Modify: `backend/tests/test_transit_chart.py`
  - Compatibility assertions after migration.
- Modify: `backend/tests/test_synastry_chart.py`
  - Compatibility assertions after migration.
- Modify: `docs/api-contracts.md`
  - Document that `transit` and `synastry` responses are unchanged while the backend now uses a shared orchestration layer.

## Tasks

### Task 1: Add failing framework tests first

**Files:**
- Create: `backend/tests/test_chart_generators.py`
- Test: `backend/tests/test_transit_chart.py`
- Test: `backend/tests/test_synastry_chart.py`

- [ ] **Step 1: Write a failing unit test for the single-subject derived generator contract**

```python
from app.models.chart import BirthProfile, ChartSettings, ChartResult
from app.services.chart_generators import SingleSubjectDerivedGenerator


class StubDerivedGenerator(SingleSubjectDerivedGenerator):
    def build_derived_chart(self, primary_profile, settings, target_context):
        return self.context.natal.calculate_from_profile(target_context["derived_profile"], settings)

    def build_chart_result(self, *, primary_chart, derived_chart, overlay, settings, target_context):
        return ChartResult(
            chartId="stub-derived",
            chartType="stubDerived",
            title="Stub Derived Chart",
            profiles=primary_chart.profiles,
            calculation=self.build_calculation_metadata(),
            placements=[*primary_chart.placements, *derived_chart.placements],
            houses=[],
            aspects=overlay.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "derivedChart": derived_chart.model_dump(by_alias=True),
                "derivedOverlay": overlay.model_dump(by_alias=True),
            },
        )


def test_single_subject_generator_builds_primary_derived_and_overlay():
    primary = BirthProfile(
        name="Luna",
        date="2000-01-01",
        time="20:00",
        locationName="Shanghai",
        latitude=31.2304,
        longitude=121.4737,
        timezone="Asia/Shanghai",
    )
    derived = BirthProfile(
        name="Derived Sky",
        date="2026-05-01",
        time="12:00",
        locationName="Shanghai",
        latitude=31.2304,
        longitude=121.4737,
        timezone="Asia/Shanghai",
    )

    generator = StubDerivedGenerator()
    result = generator.generate(primary, ChartSettings(), {"derived_profile": derived})

    assert result.chart_type == "stubDerived"
    assert result.related_charts["primaryNatal"]["chartType"] == "natal"
    assert result.related_charts["derivedChart"]["chartType"] == "natal"
    assert result.related_charts["derivedOverlay"]["referenceName"] == "Luna"
```

- [ ] **Step 2: Write a failing unit test for the dual-subject comparison generator contract**

```python
from app.models.chart import BirthProfile, ChartResult, ChartSettings
from app.services.chart_generators import DualSubjectComparisonGenerator


class StubComparisonGenerator(DualSubjectComparisonGenerator):
    def build_chart_result(
        self,
        *,
        primary_chart,
        secondary_chart,
        primary_overlay,
        secondary_overlay,
        settings,
    ):
        return ChartResult(
            chartId="stub-comparison",
            chartType="stubComparison",
            title="Stub Comparison Chart",
            profiles=[*primary_chart.profiles, *secondary_chart.profiles],
            calculation=self.build_calculation_metadata(),
            placements=[*primary_chart.placements, *secondary_chart.placements],
            houses=[],
            aspects=primary_overlay.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "secondaryNatal": secondary_chart.model_dump(by_alias=True),
                "primaryOverlay": primary_overlay.model_dump(by_alias=True),
                "secondaryOverlay": secondary_overlay.model_dump(by_alias=True),
            },
        )


def test_dual_subject_generator_builds_two_natals_and_directional_overlays():
    primary = BirthProfile(
        name="Luna",
        date="2000-01-01",
        time="20:00",
        locationName="Shanghai",
        latitude=31.2304,
        longitude=121.4737,
        timezone="Asia/Shanghai",
    )
    secondary = BirthProfile(
        name="Sol",
        date="1993-09-07",
        time="21:10",
        locationName="Beijing",
        latitude=39.9042,
        longitude=116.4074,
        timezone="Asia/Shanghai",
    )

    generator = StubComparisonGenerator()
    result = generator.generate(primary, secondary, ChartSettings())

    assert result.chart_type == "stubComparison"
    assert result.related_charts["primaryOverlay"]["referenceName"] == "Luna"
    assert result.related_charts["primaryOverlay"]["overlayName"] == "Sol"
    assert result.related_charts["secondaryOverlay"]["referenceName"] == "Sol"
```

- [ ] **Step 3: Write a failing unit test for the dual-subject fusion extension point**

```python
import pytest

from app.models.chart import BirthProfile, ChartSettings
from app.services.chart_generators import DualSubjectFusionGenerator


class IncompleteFusionGenerator(DualSubjectFusionGenerator):
    pass


def test_dual_subject_fusion_requires_subclass_implementation():
    primary = BirthProfile(
        name="Luna",
        date="2000-01-01",
        time="20:00",
        locationName="Shanghai",
        latitude=31.2304,
        longitude=121.4737,
        timezone="Asia/Shanghai",
    )
    secondary = BirthProfile(
        name="Sol",
        date="1993-09-07",
        time="21:10",
        locationName="Beijing",
        latitude=39.9042,
        longitude=116.4074,
        timezone="Asia/Shanghai",
    )

    generator = IncompleteFusionGenerator()

    with pytest.raises(NotImplementedError):
        generator.generate(primary, secondary, ChartSettings())
```

- [ ] **Step 4: Run the new tests to confirm the framework does not exist yet**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_chart_generators.py -q
```

Expected: FAIL with import or attribute errors because `chart_generators.py` and the generator classes do not exist yet.

- [ ] **Step 5: Add narrow compatibility assertions to existing API tests**

```python
assert set(data["relatedCharts"].keys()) == {
    "primaryNatal",
    "secondaryNatal",
    "primaryOverlay",
    "secondaryOverlay",
}
```

```python
assert set(data["relatedCharts"].keys()) == {
    "primaryNatal",
    "transitSky",
    "transitOverlay",
}
```

- [ ] **Step 6: Run the targeted endpoint tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_synastry_chart.py tests/test_transit_chart.py -q
```

Expected: PASS before the refactor, proving the compatibility baseline is stable.

### Task 2: Implement the shared generator layer

**Files:**
- Create: `backend/app/services/chart_generators.py`
- Modify: `backend/app/services/__init__.py`
- Test: `backend/tests/test_chart_generators.py`

- [ ] **Step 1: Add a lightweight shared context and base generator**

```python
from dataclasses import dataclass
from datetime import UTC, datetime

from app.models.chart import BirthProfile, CalculationMetadata, ChartOverlay, ChartResult, ChartSettings
from app.services.ephemeris import EphemerisService
from app.services.natal import NatalChartService
from app.services.overlay import ChartOverlayService


@dataclass(slots=True)
class ChartGenerationContext:
    ephemeris: EphemerisService
    natal: NatalChartService
    overlay: ChartOverlayService

    @classmethod
    def create(cls, ephemeris: EphemerisService | None = None) -> "ChartGenerationContext":
        shared_ephemeris = ephemeris or EphemerisService()
        return cls(
            ephemeris=shared_ephemeris,
            natal=NatalChartService(shared_ephemeris),
            overlay=ChartOverlayService(),
        )


class BaseChartGenerator:
    def __init__(self, context: ChartGenerationContext | None = None) -> None:
        self.context = context or ChartGenerationContext.create()

    def build_calculation_metadata(self) -> CalculationMetadata:
        return CalculationMetadata(
            engine=self.context.ephemeris.engine_name,
            engineVersion=self.context.ephemeris.engine_version,
            calculatedAt=datetime.now(UTC).isoformat(),
        )
```

- [ ] **Step 2: Add the single-subject derived flow**

```python
class SingleSubjectDerivedGenerator(BaseChartGenerator):
    overlay_id = "derived-in-primary"

    def build_overlay_label(self, primary_chart: ChartResult, derived_chart: ChartResult) -> str:
        return f"{derived_chart.title} in {primary_chart.profiles[0].name} houses"

    def build_derived_chart(self, primary_profile: BirthProfile, settings: ChartSettings, target_context: dict[str, object]) -> ChartResult:
        raise NotImplementedError

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        derived_chart: ChartResult,
        overlay: ChartOverlay,
        settings: ChartSettings,
        target_context: dict[str, object],
    ) -> ChartResult:
        raise NotImplementedError

    def generate(self, primary_profile: BirthProfile, settings: ChartSettings, target_context: dict[str, object]) -> ChartResult:
        primary_chart = self.context.natal.calculate_from_profile(primary_profile, settings)
        derived_chart = self.build_derived_chart(primary_profile, settings, target_context)
        overlay = self.context.overlay.build(
            overlay_id=self.overlay_id,
            label=self.build_overlay_label(primary_chart, derived_chart),
            reference_chart=primary_chart,
            overlay_chart=derived_chart,
            aspect_set=settings.aspect_set,
            orb_profile=settings.orb_profile,
        )
        return self.build_chart_result(
            primary_chart=primary_chart,
            derived_chart=derived_chart,
            overlay=overlay,
            settings=settings,
            target_context=target_context,
        )
```

- [ ] **Step 3: Add the dual-subject comparison and fusion flows**

```python
class DualSubjectComparisonGenerator(BaseChartGenerator):
    primary_overlay_id = "secondary-in-primary"
    secondary_overlay_id = "primary-in-secondary"

    def build_primary_overlay_label(self, primary_chart: ChartResult, secondary_chart: ChartResult) -> str:
        return f"{secondary_chart.profiles[0].name} in {primary_chart.profiles[0].name} houses"

    def build_secondary_overlay_label(self, primary_chart: ChartResult, secondary_chart: ChartResult) -> str:
        return f"{primary_chart.profiles[0].name} in {secondary_chart.profiles[0].name} houses"

    def build_chart_result(self, *, primary_chart, secondary_chart, primary_overlay, secondary_overlay, settings) -> ChartResult:
        raise NotImplementedError

    def generate(self, primary_profile: BirthProfile, secondary_profile: BirthProfile, settings: ChartSettings) -> ChartResult:
        primary_chart = self.context.natal.calculate_from_profile(primary_profile, settings)
        secondary_chart = self.context.natal.calculate_from_profile(secondary_profile, settings)
        primary_overlay = self.context.overlay.build(
            overlay_id=self.primary_overlay_id,
            label=self.build_primary_overlay_label(primary_chart, secondary_chart),
            reference_chart=primary_chart,
            overlay_chart=secondary_chart,
            aspect_set=settings.aspect_set,
            orb_profile=settings.orb_profile,
        )
        secondary_overlay = self.context.overlay.build(
            overlay_id=self.secondary_overlay_id,
            label=self.build_secondary_overlay_label(primary_chart, secondary_chart),
            reference_chart=secondary_chart,
            overlay_chart=primary_chart,
            aspect_set=settings.aspect_set,
            orb_profile=settings.orb_profile,
        )
        return self.build_chart_result(
            primary_chart=primary_chart,
            secondary_chart=secondary_chart,
            primary_overlay=primary_overlay,
            secondary_overlay=secondary_overlay,
            settings=settings,
        )


class DualSubjectFusionGenerator(BaseChartGenerator):
    def generate(self, primary_profile: BirthProfile, secondary_profile: BirthProfile, settings: ChartSettings) -> ChartResult:
        raise NotImplementedError
```

- [ ] **Step 4: Export the new module if package exports are used**

```python
from app.services.chart_generators import (
    BaseChartGenerator,
    ChartGenerationContext,
    DualSubjectComparisonGenerator,
    DualSubjectFusionGenerator,
    SingleSubjectDerivedGenerator,
)
```

- [ ] **Step 5: Run the framework tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_chart_generators.py -q
```

Expected: PASS.

### Task 3: Migrate transit onto the single-subject derived generator

**Files:**
- Modify: `backend/app/services/transit.py`
- Test: `backend/tests/test_transit_chart.py`

- [ ] **Step 1: Replace the current transit orchestration with a dedicated generator subclass**

```python
from app.models.chart import BirthProfile, ChartResult, TransitChartRequest
from app.services.chart_generators import SingleSubjectDerivedGenerator
from app.services.synastry import planetary_placements


class TransitGenerator(SingleSubjectDerivedGenerator):
    overlay_id = "transit-in-natal"

    def build_derived_chart(self, primary_profile, settings, target_context) -> ChartResult:
        request = target_context["request"]
        profile = build_transit_profile(request)
        transit_sky = self.context.natal.calculate_from_profile(profile, settings)
        transit_sky.chart_id = build_transit_sky_chart_id(request)
        transit_sky.chart_type = "transitSky"
        transit_sky.title = f"Transit Sky {request.transit_date} {request.transit_time}"
        return transit_sky

    def build_overlay_label(self, primary_chart, derived_chart) -> str:
        return f"Transit sky in {primary_chart.profiles[0].name} houses"

    def build_chart_result(self, *, primary_chart, derived_chart, overlay, settings, target_context) -> ChartResult:
        request = target_context["request"]
        return ChartResult(
            chartId=build_transit_chart_id(request),
            chartType="transit",
            title=f"{request.primary.name} Transit Chart",
            profiles=[request.primary],
            calculation=self.build_calculation_metadata(),
            placements=[*planetary_placements(primary_chart.placements), *planetary_placements(derived_chart.placements)],
            houses=[],
            aspects=overlay.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "transitSky": derived_chart.model_dump(by_alias=True),
                "transitOverlay": overlay.model_dump(by_alias=True),
            },
        )
```

- [ ] **Step 2: Make `TransitChartService` a thin adapter**

```python
class TransitChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = TransitGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: TransitChartRequest) -> ChartResult:
        return self.generator.generate(request.primary, request.settings, {"request": request})
```

- [ ] **Step 3: Remove now-duplicated helper methods only if the test suite still stays green**

```python
def build_transit_profile(request: TransitChartRequest) -> BirthProfile:
    ...
```

Keep only the helpers still used by the generator subclass.

- [ ] **Step 4: Run the transit tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_transit_chart.py -q
```

Expected: PASS with no response-shape change.

### Task 4: Migrate synastry onto the dual-subject comparison generator

**Files:**
- Modify: `backend/app/services/synastry.py`
- Test: `backend/tests/test_synastry_chart.py`

- [ ] **Step 1: Preserve the placement filtering helper as a reusable chart-family rule**

```python
def planetary_placements(placements: list[Placement]) -> list[Placement]:
    return [
        placement
        for placement in placements
        if placement.body not in {"Ascendant", "Midheaven"}
    ]
```

- [ ] **Step 2: Replace the current orchestration with a dedicated comparison generator subclass**

```python
from app.models.chart import ChartResult, SynastryChartRequest
from app.services.chart_generators import DualSubjectComparisonGenerator


class SynastryGenerator(DualSubjectComparisonGenerator):
    primary_overlay_id = "secondary-in-primary"
    secondary_overlay_id = "primary-in-secondary"

    def build_chart_result(self, *, primary_chart, secondary_chart, primary_overlay, secondary_overlay, settings) -> ChartResult:
        return ChartResult(
            chartId=build_synastry_chart_id_from_profiles(primary_chart.profiles[0], secondary_chart.profiles[0]),
            chartType="synastry",
            title=f"{primary_chart.profiles[0].name} × {secondary_chart.profiles[0].name} Synastry Chart",
            profiles=[primary_chart.profiles[0], secondary_chart.profiles[0]],
            calculation=self.build_calculation_metadata(),
            placements=[*planetary_placements(primary_chart.placements), *planetary_placements(secondary_chart.placements)],
            houses=[],
            aspects=primary_overlay.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "secondaryNatal": secondary_chart.model_dump(by_alias=True),
                "primaryOverlay": primary_overlay.model_dump(by_alias=True),
                "secondaryOverlay": secondary_overlay.model_dump(by_alias=True),
            },
        )
```

- [ ] **Step 3: Make `SynastryChartService` a thin adapter**

```python
class SynastryChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = SynastryGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: SynastryChartRequest) -> ChartResult:
        return self.generator.generate(request.primary, request.secondary, request.settings)
```

- [ ] **Step 4: Keep the public helper `calculate_inter_chart_aspects` only if tests or other modules still use it**

```python
def calculate_inter_chart_aspects(...):
    ...
```

If it is only test scaffolding now, either leave it in place for compatibility or move the tests to `ChartOverlayService` behavior intentionally before deleting it.

- [ ] **Step 5: Run the synastry tests**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_synastry_chart.py -q
```

Expected: PASS with no response-shape change.

### Task 5: Documentation, full verification, and publish

**Files:**
- Modify: `docs/api-contracts.md`
- Test: `backend/tests/test_chart_generators.py`
- Test: `backend/tests/test_synastry_chart.py`
- Test: `backend/tests/test_transit_chart.py`

- [ ] **Step 1: Update the API contract notes**

```md
## Shared Generation Layer

Phase 2 introduces a shared backend generation framework for higher-order chart families.
This is an internal orchestration change only.

- `/api/charts/transit` response shape is unchanged
- `/api/charts/synastry` response shape is unchanged
- future derived and fusion chart families should reuse the same service layer
```

- [ ] **Step 2: Run the focused backend suite**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest tests/test_chart_generators.py tests/test_synastry_chart.py tests/test_transit_chart.py -q
```

Expected: PASS.

- [ ] **Step 3: Run the full backend suite**

Run:

```bash
cd /Users/lianke/PycharmProjects/star/backend && ../.venv312/bin/python -m pytest
```

Expected: PASS.

- [ ] **Step 4: Commit the implementation**

```bash
git add backend/app/services/chart_generators.py \
  backend/app/services/synastry.py \
  backend/app/services/transit.py \
  backend/app/services/__init__.py \
  backend/tests/test_chart_generators.py \
  backend/tests/test_synastry_chart.py \
  backend/tests/test_transit_chart.py \
  docs/api-contracts.md
git commit -m "refactor: add shared chart generation framework"
```

- [ ] **Step 5: Push the working branch**

```bash
git push origin dev_add_shared_chart_generation_framework
```

## Self-Review

- Spec coverage: this plan covers the new generator families, migration of `transit` and `synastry`, fusion extension scaffolding, compatibility tests, and docs updates. It intentionally excludes new endpoints and frontend changes per the approved spec.
- Placeholder scan: every task names exact files, commands, and expected outputs; there are no `TODO` or `TBD` markers.
- Type consistency: the plan keeps `ChartResult`, `ChartOverlay`, `BirthProfile`, and `ChartSettings` as the shared data contracts and reuses current request models instead of inventing a second request layer.

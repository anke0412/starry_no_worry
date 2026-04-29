import pytest
from typing import TypedDict, get_type_hints

from app.models.chart import BirthProfile, ChartOverlay, ChartResult, ChartSettings
from app.services.chart_generators import (
    DualSubjectComparisonGenerator,
    DualSubjectFusionGenerator,
    SingleSubjectDerivedGenerator,
)


class StubDerivedContext(TypedDict):
    derived_profile: BirthProfile


class StubDerivedGenerator(SingleSubjectDerivedGenerator[StubDerivedContext]):
    def build_derived_chart(
        self,
        primary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: StubDerivedContext,
    ) -> ChartResult:
        return self.context.natal.calculate_from_profile(target_context["derived_profile"], settings)

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        derived_chart: ChartResult,
        overlay: ChartOverlay,
        settings: ChartSettings,
        target_context: StubDerivedContext,
    ) -> ChartResult:
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


class StubComparisonGenerator(DualSubjectComparisonGenerator):
    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        primary_overlay: ChartOverlay,
        secondary_overlay: ChartOverlay,
        settings: ChartSettings,
    ) -> ChartResult:
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


class StubFusionGenerator(DualSubjectFusionGenerator):
    def __init__(self):
        super().__init__()
        self.captured: dict[str, object] = {}

    def build_fused_chart(
        self,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        self.captured["build_fused_chart"] = {
            "primary_chart": primary_chart,
            "secondary_chart": secondary_chart,
            "settings": settings,
        }
        return primary_chart

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        fused_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        self.captured["build_chart_result"] = {
            "primary_chart": primary_chart,
            "secondary_chart": secondary_chart,
            "fused_chart": fused_chart,
            "settings": settings,
        }
        return ChartResult(
            chartId="stub-fusion",
            chartType="stubFusion",
            title="Stub Fusion Chart",
            profiles=[*primary_chart.profiles, *secondary_chart.profiles],
            calculation=self.build_calculation_metadata(),
            placements=fused_chart.placements,
            houses=fused_chart.houses,
            aspects=fused_chart.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "secondaryNatal": secondary_chart.model_dump(by_alias=True),
                "fusedChart": fused_chart.model_dump(by_alias=True),
            },
        )


class IncompleteFusionGenerator(DualSubjectFusionGenerator):
    pass


def build_profile(
    name: str,
    date: str,
    time: str,
    location_name: str,
    latitude: float,
    longitude: float,
) -> BirthProfile:
    return BirthProfile(
        name=name,
        date=date,
        time=time,
        locationName=location_name,
        latitude=latitude,
        longitude=longitude,
        timezone="Asia/Shanghai",
    )


def build_settings() -> ChartSettings:
    return ChartSettings(
        houseSystem="whole-sign",
        aspectSet="major_extended",
        orbProfile="wide",
    )


def build_target_context(derived_profile: BirthProfile) -> StubDerivedContext:
    return {"derived_profile": derived_profile}


def test_single_subject_generator_contract_annotations_are_explicit():
    chart_result_hints = get_type_hints(SingleSubjectDerivedGenerator.build_chart_result)
    stub_derived_hints = get_type_hints(StubDerivedGenerator.build_derived_chart)
    stub_chart_result_hints = get_type_hints(StubDerivedGenerator.build_chart_result)

    assert chart_result_hints["overlay"] is ChartOverlay
    assert stub_derived_hints["target_context"] is StubDerivedContext
    assert stub_chart_result_hints["target_context"] is StubDerivedContext


def test_single_subject_generator_builds_primary_derived_and_overlay():
    primary = build_profile("Luna", "2000-01-01", "20:00", "Shanghai", 31.2304, 121.4737)
    derived = build_profile("Derived Sky", "2026-05-01", "12:00", "Shanghai", 31.2304, 121.4737)
    settings = build_settings()

    generator = StubDerivedGenerator()
    result = generator.generate(primary, settings, build_target_context(derived))
    primary_natal = result.related_charts["primaryNatal"]
    derived_overlay = result.related_charts["derivedOverlay"]
    ascendant = next(
        placement for placement in primary_natal["placements"] if placement["body"] == "Ascendant"
    )
    expected_first_house = int(ascendant["longitude"] // 30) * 30

    assert result.chart_type == "stubDerived"
    assert primary_natal["chartType"] == "natal"
    assert primary_natal["houses"][0]["longitude"] == expected_first_house
    assert result.related_charts["derivedChart"]["chartType"] == "natal"
    assert derived_overlay["overlayId"] == "derived-in-primary"
    assert derived_overlay["label"] == "Derived Sky Natal Chart in Luna houses"
    assert derived_overlay["referenceName"] == "Luna"
    assert derived_overlay["overlayName"] == "Derived Sky"
    assert derived_overlay["houses"][0]["longitude"] == expected_first_house
    assert any(aspect["type"] == "quincunx" for aspect in derived_overlay["aspects"])
    assert any(aspect["orb"] > 6 for aspect in derived_overlay["aspects"])


def test_dual_subject_generator_builds_two_natals_and_directional_overlays():
    primary = build_profile("Luna", "2000-01-01", "20:00", "Shanghai", 31.2304, 121.4737)
    secondary = build_profile("Sol", "1993-09-07", "21:10", "Beijing", 39.9042, 116.4074)
    settings = build_settings()

    generator = StubComparisonGenerator()
    result = generator.generate(primary, secondary, settings)
    primary_overlay = result.related_charts["primaryOverlay"]
    secondary_overlay = result.related_charts["secondaryOverlay"]

    assert result.chart_type == "stubComparison"
    assert primary_overlay["overlayId"] == "secondary-in-primary"
    assert primary_overlay["label"] == "Sol in Luna houses"
    assert primary_overlay["referenceName"] == "Luna"
    assert primary_overlay["overlayName"] == "Sol"
    assert secondary_overlay["overlayId"] == "primary-in-secondary"
    assert secondary_overlay["label"] == "Luna in Sol houses"
    assert secondary_overlay["referenceName"] == "Sol"
    assert secondary_overlay["overlayName"] == "Luna"
    assert any(aspect["type"] == "quincunx" for aspect in primary_overlay["aspects"])
    assert any(aspect["orb"] > 6 for aspect in primary_overlay["aspects"])
    assert any(aspect["type"] == "quincunx" for aspect in secondary_overlay["aspects"])
    assert any(aspect["orb"] > 6 for aspect in secondary_overlay["aspects"])


def test_dual_subject_fusion_builds_two_natals_and_passes_them_to_hooks():
    primary = build_profile("Luna", "2000-01-01", "20:00", "Shanghai", 31.2304, 121.4737)
    secondary = build_profile("Sol", "1993-09-07", "21:10", "Beijing", 39.9042, 116.4074)
    settings = build_settings()

    generator = StubFusionGenerator()
    result = generator.generate(primary, secondary, settings)

    assert result.chart_type == "stubFusion"
    assert result.related_charts["primaryNatal"]["chartType"] == "natal"
    assert result.related_charts["secondaryNatal"]["chartType"] == "natal"
    assert result.related_charts["fusedChart"]["chartType"] == "natal"
    assert (
        generator.captured["build_fused_chart"]["primary_chart"].profiles[0].name  # type: ignore[index]
        == "Luna"
    )
    assert (
        generator.captured["build_fused_chart"]["secondary_chart"].profiles[0].name  # type: ignore[index]
        == "Sol"
    )
    assert generator.captured["build_chart_result"]["fused_chart"] is generator.captured["build_fused_chart"]["primary_chart"]  # type: ignore[index]


def test_dual_subject_fusion_requires_subclass_implementation():
    primary = build_profile("Luna", "2000-01-01", "20:00", "Shanghai", 31.2304, 121.4737)
    secondary = build_profile("Sol", "1993-09-07", "21:10", "Beijing", 39.9042, 116.4074)

    generator = IncompleteFusionGenerator()

    with pytest.raises(NotImplementedError):
        generator.generate(primary, secondary, ChartSettings())

import re
from typing import TypedDict

from app.models.chart import (
    BirthProfile,
    ChartOverlay,
    ChartResult,
    ChartSettings,
    RelationshipTransitChartRequest,
)
from app.services.chart_generators import ChartGenerationContext, DualSubjectDerivedGenerator
from app.services.ephemeris import EphemerisService
from app.services.synastry import planetary_placements
from app.services.transit import build_transit_profile


class RelationshipTransitTargetContext(TypedDict):
    transit_date: str
    transit_time: str


class RelationshipTransitGenerator(DualSubjectDerivedGenerator[RelationshipTransitTargetContext]):
    primary_overlay_id = "transit-in-primary"
    secondary_overlay_id = "transit-in-secondary"

    def build_derived_chart(
        self,
        primary_profile: BirthProfile,
        secondary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: RelationshipTransitTargetContext,
    ) -> ChartResult:
        _ = secondary_profile
        profile = build_transit_profile(
            primary_profile,
            {
                "transit_date": target_context["transit_date"],
                "transit_time": target_context["transit_time"],
            },
        )
        transit_sky = self.context.natal.calculate_from_profile(profile, settings)
        transit_sky.chart_id = build_relationship_transit_sky_id(primary_profile, target_context)
        transit_sky.chart_type = "transitSky"
        transit_sky.title = f"Transit Sky {target_context['transit_date']} {target_context['transit_time']}"
        return transit_sky

    def build_primary_overlay_label(
        self,
        primary_chart: ChartResult,
        _secondary_chart: ChartResult,
        _derived_chart: ChartResult,
    ) -> str:
        return f"Transit sky in {primary_chart.profiles[0].name} houses"

    def build_secondary_overlay_label(
        self,
        _primary_chart: ChartResult,
        secondary_chart: ChartResult,
        _derived_chart: ChartResult,
    ) -> str:
        return f"Transit sky in {secondary_chart.profiles[0].name} houses"

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        derived_chart: ChartResult,
        primary_overlay: ChartOverlay,
        secondary_overlay: ChartOverlay,
        settings: ChartSettings,
        target_context: RelationshipTransitTargetContext,
    ) -> ChartResult:
        _ = settings
        primary_profile = primary_chart.profiles[0]
        secondary_profile = secondary_chart.profiles[0]
        return ChartResult(
            chartId=build_relationship_transit_result_id(primary_profile, secondary_profile, target_context),
            chartType="relationshipTransit",
            title=f"{primary_profile.name} × {secondary_profile.name} Relationship Transit Chart",
            profiles=[primary_profile, secondary_profile],
            calculation=self.build_calculation_metadata(),
            placements=[
                *planetary_placements(primary_chart.placements),
                *planetary_placements(secondary_chart.placements),
                *planetary_placements(derived_chart.placements),
            ],
            houses=[],
            aspects=[],
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "secondaryNatal": secondary_chart.model_dump(by_alias=True),
                "transitSky": derived_chart.model_dump(by_alias=True),
                "primaryTransitOverlay": primary_overlay.model_dump(by_alias=True),
                "secondaryTransitOverlay": secondary_overlay.model_dump(by_alias=True),
            },
        )


class RelationshipTransitChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = RelationshipTransitGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: RelationshipTransitChartRequest) -> ChartResult:
        return self.generator.generate(
            request.primary,
            request.secondary,
            request.settings,
            RelationshipTransitTargetContext(
                transit_date=request.transit_date,
                transit_time=request.transit_time,
            ),
        )


def build_relationship_transit_sky_id(
    primary: BirthProfile,
    target_context: RelationshipTransitTargetContext,
) -> str:
    raw = f"relationship-transit-sky-{target_context['transit_date']}-{target_context['transit_time']}-{primary.location_name}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


def build_relationship_transit_result_id(
    primary: BirthProfile,
    secondary: BirthProfile,
    target_context: RelationshipTransitTargetContext,
) -> str:
    raw = (
        f"relationship-transit-{primary.name}-{secondary.name}-"
        f"{target_context['transit_date']}-{target_context['transit_time']}"
    )
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

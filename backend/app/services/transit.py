import re
from typing import TypedDict

from app.models.chart import BirthProfile, ChartOverlay, ChartResult, ChartSettings, TransitChartRequest
from app.services.chart_generators import ChartGenerationContext, SingleSubjectDerivedGenerator
from app.services.ephemeris import EphemerisService
from app.services.synastry import planetary_placements


class TransitTargetContext(TypedDict):
    transit_date: str
    transit_time: str


class TransitGenerator(SingleSubjectDerivedGenerator[TransitTargetContext]):
    overlay_id = "transit-in-natal"

    def build_derived_chart(
        self,
        primary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: TransitTargetContext,
    ) -> ChartResult:
        profile = build_transit_profile(primary_profile, target_context)
        transit_sky = self.context.natal.calculate_from_profile(profile, settings)
        transit_sky.chart_id = build_transit_sky_chart_id(primary_profile, target_context)
        transit_sky.chart_type = "transitSky"
        transit_sky.title = f"Transit Sky {target_context['transit_date']} {target_context['transit_time']}"
        return transit_sky

    def build_overlay_label(self, primary_chart: ChartResult, _derived_chart: ChartResult) -> str:
        return f"Transit sky in {primary_chart.profiles[0].name} houses"

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        derived_chart: ChartResult,
        overlay: ChartOverlay,
        settings: ChartSettings,
        target_context: TransitTargetContext,
    ) -> ChartResult:
        _ = settings
        primary_profile = primary_chart.profiles[0]
        return ChartResult(
            chartId=build_transit_chart_id(primary_profile, target_context),
            chartType="transit",
            title=f"{primary_profile.name} Transit Chart",
            profiles=[primary_profile],
            calculation=self.build_calculation_metadata(),
            placements=[
                *planetary_placements(primary_chart.placements),
                *planetary_placements(derived_chart.placements),
            ],
            houses=[],
            aspects=overlay.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "transitSky": derived_chart.model_dump(by_alias=True),
                "transitOverlay": overlay.model_dump(by_alias=True),
            },
        )


class TransitChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = TransitGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: TransitChartRequest) -> ChartResult:
        return self.generator.generate(
            request.primary,
            request.settings,
            TransitTargetContext(
                transit_date=request.transit_date,
                transit_time=request.transit_time,
            ),
        )


def build_transit_profile(primary: BirthProfile, target_context: TransitTargetContext) -> BirthProfile:
    return BirthProfile(
        name="Transit Sky",
        date=target_context["transit_date"],
        time=target_context["transit_time"],
        locationName=primary.location_name,
        latitude=primary.latitude,
        longitude=primary.longitude,
        timezone=primary.timezone,
    )


def build_transit_chart_id(primary: BirthProfile, target_context: TransitTargetContext) -> str:
    raw = f"transit-{primary.name}-{primary.date}-{target_context['transit_date']}-{target_context['transit_time']}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


def build_transit_sky_chart_id(primary: BirthProfile, target_context: TransitTargetContext) -> str:
    raw = f"transit-sky-{target_context['transit_date']}-{target_context['transit_time']}-{primary.location_name}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

import re
from typing import TypedDict

from app.models.chart import BirthProfile, ChartOverlay, ChartResult, ChartSettings, ProgressionChartRequest
from app.services.chart_generators import ChartGenerationContext, SingleSubjectDerivedGenerator
from app.services.ephemeris import EphemerisService
from app.services.synastry import planetary_placements


class ProgressionTargetContext(TypedDict):
    progression_date: str
    progression_time: str


class ProgressionGenerator(SingleSubjectDerivedGenerator[ProgressionTargetContext]):
    overlay_id = "progressed-in-natal"

    def build_derived_chart(
        self,
        primary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: ProgressionTargetContext,
    ) -> ChartResult:
        profile = build_progressed_profile(primary_profile, target_context)
        progressed_chart = self.context.natal.calculate_from_profile(profile, settings)
        progressed_chart.chart_id = build_progressed_chart_id(primary_profile, target_context)
        progressed_chart.chart_type = "progressedChart"
        progressed_chart.title = f"{primary_profile.name} Progressed"
        return progressed_chart

    def build_overlay_label(self, primary_chart: ChartResult, _derived_chart: ChartResult) -> str:
        return f"Progressed chart in {primary_chart.profiles[0].name} houses"

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        derived_chart: ChartResult,
        overlay: ChartOverlay,
        settings: ChartSettings,
        target_context: ProgressionTargetContext,
    ) -> ChartResult:
        _ = settings, target_context
        primary_profile = primary_chart.profiles[0]
        return ChartResult(
            chartId=build_progression_result_id(primary_profile, target_context),
            chartType="progression",
            title=f"{primary_profile.name} Progression Chart",
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
                "progressedChart": derived_chart.model_dump(by_alias=True),
                "progressedOverlay": overlay.model_dump(by_alias=True),
            },
        )


class ProgressionChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = ProgressionGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: ProgressionChartRequest) -> ChartResult:
        return self.generator.generate(
            request.primary,
            request.settings,
            ProgressionTargetContext(
                progression_date=request.progression_date,
                progression_time=request.progression_time,
            ),
        )


def build_progressed_profile(
    primary: BirthProfile,
    target_context: ProgressionTargetContext,
) -> BirthProfile:
    return BirthProfile(
        name=f"{primary.name} Progressed",
        date=target_context["progression_date"],
        time=target_context["progression_time"],
        locationName=primary.location_name,
        latitude=primary.latitude,
        longitude=primary.longitude,
        timezone=primary.timezone,
    )


def build_progressed_chart_id(primary: BirthProfile, target_context: ProgressionTargetContext) -> str:
    raw = f"progressed-{primary.name}-{target_context['progression_date']}-{target_context['progression_time']}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


def build_progression_result_id(primary: BirthProfile, target_context: ProgressionTargetContext) -> str:
    raw = f"progression-{primary.name}-{target_context['progression_date']}-{target_context['progression_time']}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

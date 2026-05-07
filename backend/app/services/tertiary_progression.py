import re
from datetime import timedelta
from typing import TypedDict
from zoneinfo import ZoneInfo

from app.models.chart import BirthProfile, ChartOverlay, ChartResult, ChartSettings, TertiaryProgressionChartRequest
from app.services.chart_generators import ChartGenerationContext, SingleSubjectDerivedGenerator
from app.services.ephemeris import EphemerisService
from app.services.synastry import planetary_placements

LUNAR_MONTH_DAYS = 27.321582


class TertiaryProgressionTargetContext(TypedDict):
    tertiary_date: str
    tertiary_time: str


class TertiaryProgressionGenerator(SingleSubjectDerivedGenerator[TertiaryProgressionTargetContext]):
    overlay_id = "tertiary-progressed-in-natal"

    def build_derived_chart(
        self,
        primary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: TertiaryProgressionTargetContext,
    ) -> ChartResult:
        profile = build_tertiary_progressed_profile(primary_profile, target_context, self.context.ephemeris)
        derived_chart = self.context.natal.calculate_from_profile(profile, settings)
        derived_chart.chart_id = build_tertiary_progressed_chart_id(primary_profile, target_context)
        derived_chart.chart_type = "tertiaryProgressedChart"
        derived_chart.title = f"{primary_profile.name} Tertiary Progressed"
        return derived_chart

    def build_overlay_label(self, primary_chart: ChartResult, _derived_chart: ChartResult) -> str:
        return f"Tertiary progressed chart in {primary_chart.profiles[0].name} houses"

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        derived_chart: ChartResult,
        overlay: ChartOverlay,
        settings: ChartSettings,
        target_context: TertiaryProgressionTargetContext,
    ) -> ChartResult:
        _ = settings, target_context
        primary_profile = primary_chart.profiles[0]
        return ChartResult(
            chartId=build_tertiary_progression_result_id(primary_profile, target_context),
            chartType="tertiaryProgression",
            title=f"{primary_profile.name} Tertiary Progression Chart",
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
                "tertiaryProgressedChart": derived_chart.model_dump(by_alias=True),
                "tertiaryProgressedOverlay": overlay.model_dump(by_alias=True),
            },
        )


class TertiaryProgressionChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = TertiaryProgressionGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: TertiaryProgressionChartRequest) -> ChartResult:
        return self.generator.generate(
            request.primary,
            request.settings,
            TertiaryProgressionTargetContext(
                tertiary_date=request.tertiary_date,
                tertiary_time=request.tertiary_time,
            ),
        )


def build_tertiary_progressed_profile(
    primary: BirthProfile,
    target_context: TertiaryProgressionTargetContext,
    ephemeris: EphemerisService,
) -> BirthProfile:
    natal_utc = ephemeris.normalize_profile_datetime(primary)
    target_utc = ephemeris.normalize_local_datetime(
        target_context["tertiary_date"],
        target_context["tertiary_time"],
        primary.timezone or "UTC",
    )
    age_days = max((target_utc - natal_utc).total_seconds() / 86400, 0)
    progressed_utc = natal_utc + timedelta(days=age_days / LUNAR_MONTH_DAYS)
    timezone_name = primary.timezone or "UTC"
    progressed_local = progressed_utc.astimezone(ZoneInfo(timezone_name))

    return BirthProfile(
        name=f"{primary.name} Tertiary Progressed",
        date=progressed_local.strftime("%Y-%m-%d"),
        time=progressed_local.strftime("%H:%M"),
        locationName=primary.location_name,
        latitude=primary.latitude,
        longitude=primary.longitude,
        timezone=timezone_name,
    )


def build_tertiary_progressed_chart_id(primary: BirthProfile, target_context: TertiaryProgressionTargetContext) -> str:
    raw = f"tertiary-progressed-{primary.name}-{target_context['tertiary_date']}-{target_context['tertiary_time']}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


def build_tertiary_progression_result_id(primary: BirthProfile, target_context: TertiaryProgressionTargetContext) -> str:
    raw = f"tertiary-progression-{primary.name}-{target_context['tertiary_date']}-{target_context['tertiary_time']}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

import re
from datetime import UTC
from zoneinfo import ZoneInfo

from app.models.chart import BirthProfile, ChartResult, ChartSettings, CompositeChartRequest
from app.services.chart_generators import ChartGenerationContext, DualSubjectFusionGenerator
from app.services.ephemeris import EphemerisService


class CompositeGenerator(DualSubjectFusionGenerator):
    def build_fused_chart(
        self,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        profile = build_midpoint_profile(primary_chart.profiles[0], secondary_chart.profiles[0], "Composite Chart")
        fused_chart = self.context.natal.calculate_from_profile(profile, settings)
        fused_chart.chart_id = build_fused_chart_id("composite-core", primary_chart.profiles[0], secondary_chart.profiles[0])
        fused_chart.chart_type = "compositeChart"
        fused_chart.title = "Composite Chart"
        return fused_chart

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        fused_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        _ = settings
        primary_profile = primary_chart.profiles[0]
        secondary_profile = secondary_chart.profiles[0]
        return ChartResult(
            chartId=build_fused_chart_id("composite", primary_profile, secondary_profile),
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


class CompositeChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = CompositeGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: CompositeChartRequest) -> ChartResult:
        return self.generator.generate(request.primary, request.secondary, request.settings)


def build_midpoint_profile(primary: BirthProfile, secondary: BirthProfile, name: str) -> BirthProfile:
    primary_utc = EphemerisService().normalize_profile_datetime(primary)
    secondary_utc = EphemerisService().normalize_profile_datetime(secondary)
    midpoint_utc = primary_utc + (secondary_utc - primary_utc) / 2
    timezone_name = primary.timezone or secondary.timezone or "UTC"
    midpoint_local = midpoint_utc.astimezone(ZoneInfo(timezone_name))

    return BirthProfile(
        name=name,
        date=midpoint_local.strftime("%Y-%m-%d"),
        time=midpoint_local.strftime("%H:%M"),
        locationName=f"{primary.location_name} / {secondary.location_name}",
        latitude=average_coordinate(primary.latitude, secondary.latitude),
        longitude=average_coordinate(primary.longitude, secondary.longitude),
        timezone=timezone_name,
    )


def average_coordinate(first: float | None, second: float | None) -> float | None:
    if first is None or second is None:
        return first if second is None else second
    return (first + second) / 2


def build_fused_chart_id(prefix: str, primary: BirthProfile, secondary: BirthProfile) -> str:
    parts = sorted(
        [
            f"{primary.name}-{primary.date}-{primary.time}",
            f"{secondary.name}-{secondary.date}-{secondary.time}",
        ]
    )
    raw = f"{prefix}-{'-'.join(parts)}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

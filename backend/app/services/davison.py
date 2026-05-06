import re
from datetime import UTC, datetime

from app.models.chart import BirthProfile, ChartResult, ChartSettings, DavisonChartRequest
from app.services.chart_generators import ChartGenerationContext, DualSubjectFusionGenerator
from app.services.composite import (
    build_fusion_pair_signature,
    midpoint_coordinate,
    midpoint_instant,
)
from app.services.ephemeris import EphemerisService


def build_davison_profile(
    primary_profile: BirthProfile,
    secondary_profile: BirthProfile,
    ephemeris: EphemerisService,
) -> BirthProfile:
    utc_midpoint = midpoint_instant(primary_profile, secondary_profile, ephemeris).astimezone(UTC)

    if primary_profile.latitude is None or secondary_profile.latitude is None:
        raise ValueError("Davison chart requires latitude for both profiles.")
    if primary_profile.longitude is None or secondary_profile.longitude is None:
        raise ValueError("Davison chart requires longitude for both profiles.")

    return BirthProfile(
        name=f"{primary_profile.name} + {secondary_profile.name} Davison",
        date=utc_midpoint.strftime("%Y-%m-%d"),
        time=utc_midpoint.strftime("%H:%M"),
        locationName="Davison Midpoint",
        latitude=midpoint_coordinate(primary_profile.latitude, secondary_profile.latitude),
        longitude=midpoint_coordinate(primary_profile.longitude, secondary_profile.longitude),
        timezone="UTC",
    )


def build_davison_chart_id_from_profiles(
    primary_profile: BirthProfile,
    secondary_profile: BirthProfile,
) -> str:
    pair_signature = build_fusion_pair_signature(primary_profile, secondary_profile)
    raw = f"davison-{pair_signature}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


class DavisonGenerator(DualSubjectFusionGenerator):
    def build_fused_chart(
        self,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        davison_profile = build_davison_profile(
            primary_chart.profiles[0],
            secondary_chart.profiles[0],
            self.context.ephemeris,
        )
        return self.context.natal.calculate_from_profile(davison_profile, settings)

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


class DavisonChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = DavisonGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: DavisonChartRequest) -> ChartResult:
        return self.generator.generate(request.primary, request.secondary, request.settings)

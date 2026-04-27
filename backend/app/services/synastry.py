import re

from app.models.chart import Aspect, BirthProfile, ChartOverlay, ChartResult, ChartSettings, Placement, SynastryChartRequest
from app.services.aspects import resolve_aspect_set, resolve_orb_limit
from app.services.chart_generators import ChartGenerationContext, DualSubjectComparisonGenerator
from app.services.ephemeris import EphemerisService
from app.services.overlay import calculate_inter_chart_aspects as calculate_overlay_inter_chart_aspects


class SynastryGenerator(DualSubjectComparisonGenerator):
    primary_overlay_id = "secondary-in-primary"
    secondary_overlay_id = "primary-in-secondary"

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        primary_overlay: ChartOverlay,
        secondary_overlay: ChartOverlay,
        settings: ChartSettings,
    ) -> ChartResult:
        primary_profile = primary_chart.profiles[0]
        secondary_profile = secondary_chart.profiles[0]

        return ChartResult(
            chartId=build_synastry_chart_id_from_profiles(primary_profile, secondary_profile),
            chartType="synastry",
            title=f"{primary_profile.name} × {secondary_profile.name} Synastry Chart",
            profiles=[primary_profile, secondary_profile],
            calculation=self.build_calculation_metadata(),
            placements=[
                *planetary_placements(primary_chart.placements),
                *planetary_placements(secondary_chart.placements),
            ],
            houses=[],
            aspects=primary_overlay.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "secondaryNatal": secondary_chart.model_dump(by_alias=True),
                "primaryOverlay": primary_overlay.model_dump(by_alias=True),
                "secondaryOverlay": secondary_overlay.model_dump(by_alias=True),
            },
        )


class SynastryChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = SynastryGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: SynastryChartRequest) -> ChartResult:
        return self.generator.generate(request.primary, request.secondary, request.settings)


def planetary_placements(placements: list[Placement]) -> list[Placement]:
    return [
        placement
        for placement in placements
        if placement.body not in {"Ascendant", "Midheaven"}
    ]


def calculate_inter_chart_aspects(
    primary_placements: list[Placement],
    secondary_placements: list[Placement],
    aspect_set: str = "major",
    orb_profile: str = "default",
) -> list[Aspect]:
    return calculate_overlay_inter_chart_aspects(
        primary_placements,
        secondary_placements,
        definitions=resolve_aspect_set(aspect_set),
        orb_limit=resolve_orb_limit(orb_profile),
    )


def build_synastry_chart_id_from_profiles(
    primary_profile: BirthProfile,
    secondary_profile: BirthProfile,
) -> str:
    raw = (
        f"synastry-{primary_profile.name}-{secondary_profile.name}-"
        f"{primary_profile.date}-{secondary_profile.date}"
    )
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


def build_synastry_chart_id(request: SynastryChartRequest) -> str:
    return build_synastry_chart_id_from_profiles(request.primary, request.secondary)

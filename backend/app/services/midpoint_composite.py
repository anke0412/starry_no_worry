from app.models.chart import ChartResult, ChartSettings, MidpointCompositeChartRequest, Placement
from app.services.aspects import calculate_aspects
from app.services.chart_generators import ChartGenerationContext, DualSubjectFusionGenerator
from app.services.composite import build_fused_chart_id, build_midpoint_profile
from app.services.ephemeris import EphemerisService, zodiac_position
from app.services.houses import assign_house
from app.services.point_registry import sort_placements_by_registry

NON_AVERAGED_BODIES = {"Ascendant", "Midheaven", "Vertex", "Part of Fortune"}


class MidpointCompositeGenerator(DualSubjectFusionGenerator):
    def build_fused_chart(
        self,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        profile = build_midpoint_profile(primary_chart.profiles[0], secondary_chart.profiles[0], "Midpoint Composite Chart")
        midpoint_event_chart = self.context.natal.calculate_from_profile(profile, settings)
        primary_by_body = {placement.body: placement for placement in primary_chart.placements}
        secondary_by_body = {placement.body: placement for placement in secondary_chart.placements}
        house_cusps = [house.longitude for house in midpoint_event_chart.houses]

        placements: list[Placement] = []

        for placement in midpoint_event_chart.placements:
            if placement.body in NON_AVERAGED_BODIES:
                placements.append(placement)
                continue

            primary_placement = primary_by_body.get(placement.body)
            secondary_placement = secondary_by_body.get(placement.body)

            if primary_placement is None or secondary_placement is None:
                placements.append(placement)
                continue

            averaged_longitude = midpoint_longitude(primary_placement.longitude, secondary_placement.longitude)
            position = zodiac_position(averaged_longitude)
            placements.append(
                Placement(
                    body=placement.body,
                    longitude=round(averaged_longitude % 360, 6),
                    sign=position.sign,
                    degree=position.degree,
                    minute=position.minute,
                    house=assign_house(averaged_longitude, house_cusps),
                    retrograde=placement.retrograde,
                )
            )

        midpoint_event_chart.placements = sort_placements_by_registry(placements)
        midpoint_event_chart.aspects = calculate_aspects(
            [placement for placement in midpoint_event_chart.placements if placement.body not in {"Ascendant", "Midheaven"}],
            aspect_set=settings.aspect_set,
            orb_profile=settings.orb_profile,
        )
        midpoint_event_chart.chart_id = build_fused_chart_id(
            "midpoint-composite-core", primary_chart.profiles[0], secondary_chart.profiles[0]
        )
        midpoint_event_chart.chart_type = "midpointCompositeChart"
        midpoint_event_chart.title = "Midpoint Composite Chart"
        midpoint_event_chart.statistics = None
        midpoint_event_chart = midpoint_event_chart.model_validate(midpoint_event_chart.model_dump(by_alias=True))
        return midpoint_event_chart

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
            chartId=build_fused_chart_id("midpoint-composite", primary_profile, secondary_profile),
            chartType="midpointComposite",
            title=f"{primary_profile.name} × {secondary_profile.name} Midpoint Composite Chart",
            profiles=[primary_profile, secondary_profile],
            calculation=self.build_calculation_metadata(),
            placements=fused_chart.placements,
            houses=fused_chart.houses,
            aspects=fused_chart.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "secondaryNatal": secondary_chart.model_dump(by_alias=True),
                "midpointCompositeChart": fused_chart.model_dump(by_alias=True),
            },
        )


class MidpointCompositeChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = MidpointCompositeGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: MidpointCompositeChartRequest) -> ChartResult:
        return self.generator.generate(request.primary, request.secondary, request.settings)


def midpoint_longitude(first: float, second: float) -> float:
    delta = ((second - first + 540) % 360) - 180
    return (first + delta / 2) % 360

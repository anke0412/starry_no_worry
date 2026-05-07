import re
from typing import TypedDict

from app.models.chart import BirthProfile, ChartOverlay, ChartResult, ChartSettings, HouseCusp, Placement, SolarArcChartRequest
from app.services.aspects import calculate_aspects
from app.services.chart_generators import ChartGenerationContext, SingleSubjectDerivedGenerator
from app.services.ephemeris import EphemerisService, zodiac_position
from app.services.houses import assign_house
from app.services.point_registry import sort_placements_by_registry
from app.services.progression import build_progressed_profile
from app.services.synastry import planetary_placements


class SolarArcTargetContext(TypedDict):
    solar_arc_date: str
    solar_arc_time: str


class SolarArcGenerator(SingleSubjectDerivedGenerator[SolarArcTargetContext]):
    overlay_id = "solar-arc-in-natal"

    def build_derived_chart(
        self,
        primary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: SolarArcTargetContext,
    ) -> ChartResult:
        natal_chart = self.context.natal.calculate_from_profile(primary_profile, settings)
        target_profile = build_progressed_profile(
            primary_profile,
            {
                "progression_date": target_context["solar_arc_date"],
                "progression_time": target_context["solar_arc_time"],
            },
        )
        target_chart = self.context.natal.calculate_from_profile(target_profile, settings)
        solar_arc = longitude_delta(
            longitude_for_body(target_chart.placements, "Sun"),
            longitude_for_body(natal_chart.placements, "Sun"),
        )
        derived_chart = shift_chart_by_arc(natal_chart, solar_arc, settings)
        derived_chart.chart_id = build_solar_arc_chart_id(primary_profile, target_context)
        derived_chart.chart_type = "solarArcChart"
        derived_chart.title = f"{primary_profile.name} Solar Arc"
        return derived_chart

    def build_overlay_label(self, primary_chart: ChartResult, _derived_chart: ChartResult) -> str:
        return f"Solar arc chart in {primary_chart.profiles[0].name} houses"

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        derived_chart: ChartResult,
        overlay: ChartOverlay,
        settings: ChartSettings,
        target_context: SolarArcTargetContext,
    ) -> ChartResult:
        _ = settings, target_context
        primary_profile = primary_chart.profiles[0]
        return ChartResult(
            chartId=build_solar_arc_result_id(primary_profile, target_context),
            chartType="solarArc",
            title=f"{primary_profile.name} Solar Arc Chart",
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
                "solarArcChart": derived_chart.model_dump(by_alias=True),
                "solarArcOverlay": overlay.model_dump(by_alias=True),
            },
        )


class SolarArcChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = SolarArcGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: SolarArcChartRequest) -> ChartResult:
        return self.generator.generate(
            request.primary,
            request.settings,
            SolarArcTargetContext(
                solar_arc_date=request.solar_arc_date,
                solar_arc_time=request.solar_arc_time,
            ),
        )


def shift_chart_by_arc(chart: ChartResult, solar_arc: float, settings: ChartSettings) -> ChartResult:
    shifted_houses = [shift_house(house, solar_arc) for house in chart.houses]
    house_cusps = [house.longitude for house in shifted_houses]
    shifted_placements = sort_placements_by_registry(
        [shift_placement(placement, solar_arc, house_cusps) for placement in chart.placements]
    )
    shifted_aspects = calculate_aspects(
        planetary_placements(shifted_placements),
        aspect_set=settings.aspect_set,
        orb_profile=settings.orb_profile,
    )

    return ChartResult(
        chartId=chart.chart_id,
        chartType=chart.chart_type,
        title=chart.title,
        profiles=chart.profiles,
        calculation=chart.calculation,
        placements=shifted_placements,
        houses=shifted_houses,
        aspects=shifted_aspects,
    )


def shift_placement(placement: Placement, solar_arc: float, house_cusps: list[float]) -> Placement:
    longitude = (placement.longitude + solar_arc) % 360
    position = zodiac_position(longitude)
    return Placement(
        body=placement.body,
        longitude=round(longitude, 6),
        sign=position.sign,
        degree=position.degree,
        minute=position.minute,
        house=assign_house(longitude, house_cusps),
        retrograde=placement.retrograde,
    )


def shift_house(house: HouseCusp, solar_arc: float) -> HouseCusp:
    longitude = (house.longitude + solar_arc) % 360
    position = zodiac_position(longitude)
    return HouseCusp(
        house=house.house,
        longitude=round(longitude, 6),
        sign=position.sign,
        degree=position.degree,
        minute=position.minute,
    )


def longitude_for_body(placements: list[Placement], body: str) -> float:
    for placement in placements:
        if placement.body == body:
            return placement.longitude
    raise ValueError(f"Missing placement for {body}")


def longitude_delta(target: float, natal: float) -> float:
    return (target - natal) % 360


def build_solar_arc_chart_id(primary: BirthProfile, target_context: SolarArcTargetContext) -> str:
    raw = f"solar-arc-{primary.name}-{target_context['solar_arc_date']}-{target_context['solar_arc_time']}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


def build_solar_arc_result_id(primary: BirthProfile, target_context: SolarArcTargetContext) -> str:
    raw = f"solar-arc-result-{primary.name}-{target_context['solar_arc_date']}-{target_context['solar_arc_time']}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

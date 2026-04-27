from datetime import UTC, datetime
import re

from app.models.chart import BirthProfile, CalculationMetadata, ChartResult, ChartSettings, NatalChartRequest
from app.services.aspects import calculate_aspects
from app.services.ephemeris import EphemerisService
from app.services.houses import HouseCalculationService, assign_house
from app.services.lunar_nodes import LunarNodeService
from app.services.point_registry import sort_placements_by_registry
from app.services.supplemental_points import SupplementalPointService


class NatalChartService:
    def __init__(
        self,
        ephemeris: EphemerisService | None = None,
        houses: HouseCalculationService | None = None,
        lunar_nodes: LunarNodeService | None = None,
        supplemental_points: SupplementalPointService | None = None,
    ) -> None:
        self.ephemeris = ephemeris or EphemerisService()
        self.houses = houses or HouseCalculationService()
        self.lunar_nodes = lunar_nodes or LunarNodeService()
        self.supplemental_points = supplemental_points or SupplementalPointService()

    def calculate(self, request: NatalChartRequest) -> ChartResult:
        return self.calculate_from_profile(request.primary, request.settings)

    def calculate_from_profile(
        self,
        profile: BirthProfile,
        settings: ChartSettings | None = None,
    ) -> ChartResult:
        settings = settings or ChartSettings()
        utc_datetime = self.ephemeris.normalize_profile_datetime(profile)
        planet_placements = self.ephemeris.calculate_profile_placements(profile)
        swiss_points = self.supplemental_points.calculate_swiss_points(utc_datetime)
        node_calculation = self.lunar_nodes.calculate(utc_datetime)
        house_calculation = self.houses.calculate(profile, utc_datetime, settings.house_system)
        house_cusps = [house.longitude for house in house_calculation.houses]
        calculated_points = [
            *planet_placements,
            *swiss_points,
            node_calculation.north_node,
            node_calculation.south_node,
            house_calculation.vertex,
        ]

        for placement in calculated_points:
            placement.house = assign_house(placement.longitude, house_cusps)

        placement_map = {placement.body: placement for placement in calculated_points}
        part_of_fortune = self.supplemental_points.calculate_part_of_fortune(
            house_calculation.ascendant,
            placement_map["Sun"],
            placement_map["Moon"],
        )
        part_of_fortune.house = assign_house(part_of_fortune.longitude, house_cusps)

        aspect_placements = [*calculated_points, part_of_fortune]
        placements = sort_placements_by_registry(
            [*calculated_points, part_of_fortune, house_calculation.ascendant, house_calculation.midheaven]
        )

        return ChartResult(
            chartId=build_natal_chart_id(profile),
            chartType="natal",
            title=f"{profile.name} Natal Chart",
            profiles=[profile],
            calculation=CalculationMetadata(
                engine=self.ephemeris.engine_name,
                engineVersion=self.ephemeris.engine_version,
                calculatedAt=datetime.now(UTC).isoformat(),
            ),
            placements=placements,
            houses=house_calculation.houses,
            aspects=calculate_aspects(
                aspect_placements,
                aspect_set=settings.aspect_set,
                orb_profile=settings.orb_profile,
            ),
        )


def build_natal_chart_id(profile: BirthProfile) -> str:
    raw = f"natal-{profile.name}-{profile.date}-{profile.time}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

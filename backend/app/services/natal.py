from datetime import UTC, datetime
import re

from app.models.chart import BirthProfile, CalculationMetadata, ChartResult, NatalChartRequest
from app.services.aspects import calculate_major_aspects
from app.services.ephemeris import EphemerisService
from app.services.houses import HouseCalculationService, assign_house


class NatalChartService:
    def __init__(
        self,
        ephemeris: EphemerisService | None = None,
        houses: HouseCalculationService | None = None,
    ) -> None:
        self.ephemeris = ephemeris or EphemerisService()
        self.houses = houses or HouseCalculationService()

    def calculate(self, request: NatalChartRequest) -> ChartResult:
        return self.calculate_from_profile(request.primary, request.settings.house_system)

    def calculate_from_profile(self, profile: BirthProfile, house_system: str = "placidus") -> ChartResult:
        utc_datetime = self.ephemeris.normalize_profile_datetime(profile)
        placements = self.ephemeris.calculate_profile_placements(profile)
        house_calculation = self.houses.calculate(profile, utc_datetime, house_system)
        house_cusps = [house.longitude for house in house_calculation.houses]

        for placement in placements:
            placement.house = assign_house(placement.longitude, house_cusps)

        planetary_placements = list(placements)
        placements.extend([house_calculation.ascendant, house_calculation.midheaven])

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
            aspects=calculate_major_aspects(planetary_placements),
        )


def build_natal_chart_id(profile: BirthProfile) -> str:
    raw = f"natal-{profile.name}-{profile.date}-{profile.time}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

from datetime import UTC, datetime
import re

from app.models.chart import BirthProfile, CalculationMetadata, ChartResult, NatalChartRequest
from app.services.aspects import calculate_major_aspects
from app.services.ephemeris import EphemerisService


class NatalChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.ephemeris = ephemeris or EphemerisService()

    def calculate(self, request: NatalChartRequest) -> ChartResult:
        return self.calculate_from_profile(request.primary)

    def calculate_from_profile(self, profile: BirthProfile) -> ChartResult:
        placements = self.ephemeris.calculate_profile_placements(profile)
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
            houses=[],
            aspects=calculate_major_aspects(placements),
        )


def build_natal_chart_id(profile: BirthProfile) -> str:
    raw = f"natal-{profile.name}-{profile.date}-{profile.time}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

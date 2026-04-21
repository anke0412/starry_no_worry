from datetime import UTC, datetime
import re

from app.models.chart import CalculationMetadata, ChartResult, NatalChartRequest
from app.services.aspects import calculate_major_aspects
from app.services.ephemeris import EphemerisService


class NatalChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.ephemeris = ephemeris or EphemerisService()

    def calculate(self, request: NatalChartRequest) -> ChartResult:
        placements = self.ephemeris.calculate_profile_placements(request.primary)

        return ChartResult(
            chartId=build_natal_chart_id(request),
            chartType="natal",
            title=f"{request.primary.name} Natal Chart",
            profiles=[request.primary],
            calculation=CalculationMetadata(
                engine=self.ephemeris.engine_name,
                engineVersion=self.ephemeris.engine_version,
                calculatedAt=datetime.now(UTC).isoformat(),
            ),
            placements=placements,
            houses=[],
            aspects=calculate_major_aspects(placements),
        )


def build_natal_chart_id(request: NatalChartRequest) -> str:
    raw = f"natal-{request.primary.name}-{request.primary.date}-{request.primary.time}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

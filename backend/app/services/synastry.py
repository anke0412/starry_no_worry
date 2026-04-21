from datetime import UTC, datetime
import re

from app.models.chart import Aspect, CalculationMetadata, ChartResult, Placement, SynastryChartRequest
from app.services.aspects import angular_distance, closest_major_aspect
from app.services.ephemeris import EphemerisService
from app.services.natal import NatalChartService


class SynastryChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.ephemeris = ephemeris or EphemerisService()
        self.natal = NatalChartService(self.ephemeris)

    def calculate(self, request: SynastryChartRequest) -> ChartResult:
        primary_natal = self.natal.calculate_from_profile(request.primary)
        secondary_natal = self.natal.calculate_from_profile(request.secondary)

        return ChartResult(
            chartId=build_synastry_chart_id(request),
            chartType="synastry",
            title=f"{request.primary.name} × {request.secondary.name} Synastry Chart",
            profiles=[request.primary, request.secondary],
            calculation=CalculationMetadata(
                engine=self.ephemeris.engine_name,
                engineVersion=self.ephemeris.engine_version,
                calculatedAt=datetime.now(UTC).isoformat(),
            ),
            placements=[*primary_natal.placements, *secondary_natal.placements],
            houses=[],
            aspects=calculate_inter_chart_aspects(primary_natal.placements, secondary_natal.placements),
            relatedCharts={
                "primaryNatal": primary_natal.model_dump(by_alias=True),
                "secondaryNatal": secondary_natal.model_dump(by_alias=True),
            },
        )


def calculate_inter_chart_aspects(
    primary_placements: list[Placement],
    secondary_placements: list[Placement],
    orb_limit: float = 6.0,
) -> list[Aspect]:
    aspects: list[Aspect] = []

    for primary in primary_placements:
        for secondary in secondary_placements:
            angle = angular_distance(primary.longitude, secondary.longitude)
            aspect = closest_major_aspect(angle, orb_limit)

            if aspect is None:
                continue

            aspect_type, orb = aspect
            aspects.append(
                Aspect(
                    **{
                        "from": primary.body,
                        "to": secondary.body,
                        "type": aspect_type,
                        "angle": round(angle, 6),
                        "orb": round(orb, 6),
                    }
                )
            )

    return sorted(aspects, key=lambda item: item.orb)


def build_synastry_chart_id(request: SynastryChartRequest) -> str:
    raw = f"synastry-{request.primary.name}-{request.secondary.name}-{request.primary.date}-{request.secondary.date}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

from datetime import UTC, datetime
import re

from app.models.chart import BirthProfile, CalculationMetadata, ChartResult, TransitChartRequest
from app.services.aspects import calculate_major_aspects
from app.services.ephemeris import EphemerisService
from app.services.natal import NatalChartService
from app.services.synastry import calculate_inter_chart_aspects, planetary_placements


class TransitChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.ephemeris = ephemeris or EphemerisService()
        self.natal = NatalChartService(self.ephemeris)

    def calculate(self, request: TransitChartRequest) -> ChartResult:
        primary_natal = self.natal.calculate_from_profile(request.primary, request.settings.house_system)
        transit_sky = self.calculate_transit_sky(request)
        primary_planets = planetary_placements(primary_natal.placements)

        return ChartResult(
            chartId=build_transit_chart_id(request),
            chartType="transit",
            title=f"{request.primary.name} Transit Chart",
            profiles=[request.primary],
            calculation=self.build_calculation_metadata(),
            placements=[*primary_planets, *transit_sky.placements],
            houses=[],
            aspects=calculate_inter_chart_aspects(transit_sky.placements, primary_planets),
            relatedCharts={
                "primaryNatal": primary_natal.model_dump(by_alias=True),
                "transitSky": transit_sky.model_dump(by_alias=True),
            },
        )

    def calculate_transit_sky(self, request: TransitChartRequest) -> ChartResult:
        profile = build_transit_profile(request)
        placements = self.ephemeris.calculate_profile_placements(profile)

        return ChartResult(
            chartId=build_transit_sky_chart_id(request),
            chartType="transitSky",
            title=f"Transit Sky {request.transit_date} {request.transit_time}",
            profiles=[profile],
            calculation=self.build_calculation_metadata(),
            placements=placements,
            houses=[],
            aspects=calculate_major_aspects(placements),
        )

    def build_calculation_metadata(self) -> CalculationMetadata:
        return CalculationMetadata(
            engine=self.ephemeris.engine_name,
            engineVersion=self.ephemeris.engine_version,
            calculatedAt=datetime.now(UTC).isoformat(),
        )


def build_transit_profile(request: TransitChartRequest) -> BirthProfile:
    primary = request.primary
    return BirthProfile(
        name="Transit Sky",
        date=request.transit_date,
        time=request.transit_time,
        locationName=primary.location_name,
        latitude=primary.latitude,
        longitude=primary.longitude,
        timezone=primary.timezone,
    )


def build_transit_chart_id(request: TransitChartRequest) -> str:
    raw = f"transit-{request.primary.name}-{request.primary.date}-{request.transit_date}-{request.transit_time}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


def build_transit_sky_chart_id(request: TransitChartRequest) -> str:
    raw = f"transit-sky-{request.transit_date}-{request.transit_time}-{request.primary.location_name}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")

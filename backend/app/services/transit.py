from datetime import UTC, datetime
import re

from app.models.chart import BirthProfile, CalculationMetadata, ChartResult, TransitChartRequest
from app.services.ephemeris import EphemerisService
from app.services.natal import NatalChartService
from app.services.overlay import ChartOverlayService
from app.services.synastry import planetary_placements


class TransitChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.ephemeris = ephemeris or EphemerisService()
        self.natal = NatalChartService(self.ephemeris)
        self.overlay = ChartOverlayService()

    def calculate(self, request: TransitChartRequest) -> ChartResult:
        primary_natal = self.natal.calculate_from_profile(request.primary, request.settings)
        transit_sky = self.calculate_transit_sky(request)
        primary_planets = planetary_placements(primary_natal.placements)
        transit_planets = planetary_placements(transit_sky.placements)
        transit_overlay = self.overlay.build(
            overlay_id="transit-in-natal",
            label=f"Transit sky in {request.primary.name} houses",
            reference_chart=primary_natal,
            overlay_chart=transit_sky,
            aspect_set=request.settings.aspect_set,
            orb_profile=request.settings.orb_profile,
        )

        return ChartResult(
            chartId=build_transit_chart_id(request),
            chartType="transit",
            title=f"{request.primary.name} Transit Chart",
            profiles=[request.primary],
            calculation=self.build_calculation_metadata(),
            placements=[*primary_planets, *transit_planets],
            houses=[],
            aspects=transit_overlay.aspects,
            relatedCharts={
                "primaryNatal": primary_natal.model_dump(by_alias=True),
                "transitSky": transit_sky.model_dump(by_alias=True),
                "transitOverlay": transit_overlay.model_dump(by_alias=True),
            },
        )

    def calculate_transit_sky(self, request: TransitChartRequest) -> ChartResult:
        profile = build_transit_profile(request)
        transit_sky = self.natal.calculate_from_profile(profile, request.settings)
        transit_sky.chart_id = build_transit_sky_chart_id(request)
        transit_sky.chart_type = "transitSky"
        transit_sky.title = f"Transit Sky {request.transit_date} {request.transit_time}"
        return transit_sky

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

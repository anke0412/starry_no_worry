import re
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import TypedDict
from zoneinfo import ZoneInfo

from app.models.chart import (
    BirthProfile,
    ChartOverlay,
    ChartResult,
    ChartSettings,
    Placement,
    ReturnLocation,
    SolarReturnChartRequest,
)
from app.services.chart_generators import ChartGenerationContext, SingleSubjectDerivedGenerator
from app.services.ephemeris import EphemerisService
from app.services.synastry import planetary_placements

COARSE_STEP_MINUTES = 30
BISECTION_TOLERANCE_SECONDS = 1
BISECTION_ITERATIONS = 32


@dataclass(frozen=True)
class SolarReturnSearchInput:
    natal_profile: BirthProfile
    anchor_date: str
    anchor_time: str
    anchor_timezone: str


class SolarReturnTargetContext(TypedDict):
    anchor_date: str
    anchor_time: str
    return_location: dict[str, object]


def angular_offset(longitude: float, target_longitude: float) -> float:
    return ((longitude - target_longitude + 180) % 360) - 180


def natal_sun_longitude_for_profile(
    profile: BirthProfile,
    ephemeris: EphemerisService | None = None,
) -> float:
    service = ephemeris or EphemerisService()
    utc_datetime = service.normalize_profile_datetime(profile)
    return service.body_longitude(utc_datetime, "Sun")


def find_solar_return_datetime(
    search_input: SolarReturnSearchInput,
    ephemeris: EphemerisService | None = None,
) -> datetime:
    if not search_input.anchor_timezone:
        raise ValueError("Solar return location timezone is required.")

    service = ephemeris or EphemerisService()
    anchor_timezone = ZoneInfo(search_input.anchor_timezone)
    anchor_local = datetime.fromisoformat(
        f"{search_input.anchor_date}T{search_input.anchor_time}"
    ).replace(tzinfo=anchor_timezone)
    anchor = anchor_local.astimezone(UTC)
    natal_sun_longitude = natal_sun_longitude_for_profile(search_input.natal_profile, service)
    lower, upper = bracket_solar_return(anchor_local.year, search_input.anchor_timezone, natal_sun_longitude, service)
    return bisect_solar_return(lower, upper, natal_sun_longitude, service)


def bracket_solar_return(
    anchor_year: int,
    anchor_timezone: str,
    natal_sun_longitude: float,
    ephemeris: EphemerisService,
) -> tuple[datetime, datetime]:
    start = ephemeris.normalize_local_datetime(f"{anchor_year}-01-01", "00:00", anchor_timezone)
    end = ephemeris.normalize_local_datetime(f"{anchor_year + 1}-01-01", "00:00", anchor_timezone)
    step = timedelta(minutes=COARSE_STEP_MINUTES)

    current = start
    current_offset = angular_offset(ephemeris.body_longitude(current, "Sun"), natal_sun_longitude)

    while current < end:
        next_time = min(current + step, end)
        next_offset = angular_offset(ephemeris.body_longitude(next_time, "Sun"), natal_sun_longitude)

        if current_offset == 0:
            return current, current

        if next_offset == 0 or current_offset * next_offset < 0:
            return current, next_time

        current = next_time
        current_offset = next_offset

    raise ValueError("Unable to locate a solar return near the requested anchor time.")


def bisect_solar_return(
    lower: datetime,
    upper: datetime,
    natal_sun_longitude: float,
    ephemeris: EphemerisService,
) -> datetime:
    if lower == upper:
        return lower.astimezone(UTC)

    lower_offset = angular_offset(ephemeris.body_longitude(lower, "Sun"), natal_sun_longitude)

    for _ in range(BISECTION_ITERATIONS):
        if (upper - lower).total_seconds() <= BISECTION_TOLERANCE_SECONDS:
            break

        midpoint = lower + (upper - lower) / 2
        midpoint_offset = angular_offset(ephemeris.body_longitude(midpoint, "Sun"), natal_sun_longitude)

        if midpoint_offset == 0:
            return midpoint.astimezone(UTC)

        if lower_offset * midpoint_offset <= 0:
            upper = midpoint
        else:
            lower = midpoint
            lower_offset = midpoint_offset

    return (lower + (upper - lower) / 2).astimezone(UTC)


def validate_return_location(return_location: ReturnLocation) -> None:
    if return_location.latitude is None or return_location.longitude is None:
        raise ValueError("Solar return location latitude and longitude are required.")
    if not return_location.timezone:
        raise ValueError("Solar return location timezone is required.")


def build_solar_return_profile(
    primary_profile: BirthProfile,
    exact_return: datetime,
    return_location: ReturnLocation,
) -> BirthProfile:
    validate_return_location(return_location)
    local_return = exact_return.astimezone(ZoneInfo(return_location.timezone))
    return BirthProfile(
        name=f"{primary_profile.name} Solar Return",
        date=local_return.strftime("%Y-%m-%d"),
        time=local_return.strftime("%H:%M"),
        locationName=return_location.location_name,
        latitude=return_location.latitude,
        longitude=return_location.longitude,
        timezone=return_location.timezone,
    )


def build_solar_return_chart_id(primary: BirthProfile, exact_return: datetime) -> str:
    raw = f"solar-return-{primary.name}-{exact_return.astimezone(UTC).strftime('%Y-%m-%d-%H-%M-%S')}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


def build_solar_return_result_id(primary: BirthProfile, exact_return: datetime) -> str:
    raw = f"solar-return-result-{primary.name}-{exact_return.astimezone(UTC).strftime('%Y-%m-%d-%H-%M-%S')}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


class SolarReturnGenerator(SingleSubjectDerivedGenerator[SolarReturnTargetContext]):
    overlay_id = "solar-return-in-natal"

    def build_derived_chart(
        self,
        primary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: SolarReturnTargetContext,
    ) -> ChartResult:
        return_location = ReturnLocation.model_validate(target_context["return_location"])
        exact_return = find_solar_return_datetime(
            SolarReturnSearchInput(
                natal_profile=primary_profile,
                anchor_date=target_context["anchor_date"],
                anchor_time=target_context["anchor_time"],
                anchor_timezone=return_location.timezone or "",
            ),
            self.context.ephemeris,
        )
        profile = build_solar_return_profile(primary_profile, exact_return, return_location)
        solar_return = self.context.natal.calculate_from_profile(profile, settings)
        solar_return.chart_id = build_solar_return_chart_id(primary_profile, exact_return)
        solar_return.chart_type = "solarReturn"
        solar_return.title = f"{primary_profile.name} Solar Return"
        return solar_return

    def build_overlay_label(self, primary_chart: ChartResult, _derived_chart: ChartResult) -> str:
        return f"Solar Return in {primary_chart.profiles[0].name} houses"

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        derived_chart: ChartResult,
        overlay: ChartOverlay,
        settings: ChartSettings,
        target_context: SolarReturnTargetContext,
    ) -> ChartResult:
        _ = settings, target_context
        primary_profile = primary_chart.profiles[0]
        exact_return = datetime.fromisoformat(
            f"{derived_chart.profiles[0].date}T{derived_chart.profiles[0].time}:00"
        ).replace(tzinfo=ZoneInfo(derived_chart.profiles[0].timezone or "UTC"))

        return ChartResult(
            chartId=build_solar_return_result_id(primary_profile, exact_return),
            chartType="solarReturn",
            title=f"{primary_profile.name} Solar Return Chart",
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
                "solarReturn": derived_chart.model_dump(by_alias=True),
                "solarReturnOverlay": overlay.model_dump(by_alias=True),
            },
        )


class SolarReturnChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = SolarReturnGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: SolarReturnChartRequest) -> ChartResult:
        validate_return_location(request.return_location)
        return self.generator.generate(
            request.primary,
            request.settings,
            SolarReturnTargetContext(
                anchor_date=request.anchor_date,
                anchor_time=request.anchor_time,
                return_location=request.return_location.model_dump(by_alias=True),
            ),
        )

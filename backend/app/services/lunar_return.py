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
    ReturnLocation,
    LunarReturnChartRequest,
)
from app.services.chart_generators import ChartGenerationContext, SingleSubjectDerivedGenerator
from app.services.ephemeris import EphemerisService
from app.services.solar_return import angular_offset, validate_return_location
from app.services.synastry import planetary_placements

COARSE_STEP_MINUTES = 30
BISECTION_TOLERANCE_SECONDS = 1
BISECTION_ITERATIONS = 32
SEARCH_WINDOW_DAYS = 40


@dataclass(frozen=True)
class LunarReturnSearchInput:
    natal_profile: BirthProfile
    anchor_date: str
    anchor_time: str
    anchor_timezone: str


class LunarReturnTargetContext(TypedDict):
    anchor_date: str
    anchor_time: str
    return_location: dict[str, object]


def natal_moon_longitude_for_profile(
    profile: BirthProfile,
    ephemeris: EphemerisService | None = None,
) -> float:
    service = ephemeris or EphemerisService()
    utc_datetime = service.normalize_profile_datetime(profile)
    return service.body_longitude(utc_datetime, "Moon")


def find_lunar_return_datetime(
    search_input: LunarReturnSearchInput,
    ephemeris: EphemerisService | None = None,
) -> datetime:
    if not search_input.anchor_timezone:
        raise ValueError("Lunar return location timezone is required.")

    service = ephemeris or EphemerisService()
    anchor_timezone = ZoneInfo(search_input.anchor_timezone)
    anchor_local = datetime.fromisoformat(
        f"{search_input.anchor_date}T{search_input.anchor_time}"
    ).replace(tzinfo=anchor_timezone)
    anchor = anchor_local.astimezone(UTC)
    natal_moon_longitude = natal_moon_longitude_for_profile(search_input.natal_profile, service)
    lower, upper = bracket_lunar_return(anchor, natal_moon_longitude, service)
    return bisect_lunar_return(lower, upper, natal_moon_longitude, service)


def bracket_lunar_return(
    anchor: datetime,
    natal_moon_longitude: float,
    ephemeris: EphemerisService,
) -> tuple[datetime, datetime]:
    start = anchor - timedelta(days=SEARCH_WINDOW_DAYS)
    end = anchor + timedelta(days=SEARCH_WINDOW_DAYS)
    step = timedelta(minutes=COARSE_STEP_MINUTES)

    current = start
    current_offset = angular_offset(ephemeris.body_longitude(current, "Moon"), natal_moon_longitude)
    candidates: list[tuple[datetime, datetime]] = []

    while current < end:
        next_time = min(current + step, end)
        next_offset = angular_offset(ephemeris.body_longitude(next_time, "Moon"), natal_moon_longitude)

        if current_offset == 0:
            return current, current

        if next_offset == 0 or current_offset * next_offset < 0:
            candidates.append((current, next_time))

        current = next_time
        current_offset = next_offset

    if not candidates:
        raise ValueError("Unable to locate a lunar return near the requested anchor time.")

    return min(
        candidates,
        key=lambda candidate: abs(((candidate[0] + (candidate[1] - candidate[0]) / 2) - anchor).total_seconds()),
    )


def bisect_lunar_return(
    lower: datetime,
    upper: datetime,
    natal_moon_longitude: float,
    ephemeris: EphemerisService,
) -> datetime:
    if lower == upper:
        return lower.astimezone(UTC)

    lower_offset = angular_offset(ephemeris.body_longitude(lower, "Moon"), natal_moon_longitude)

    for _ in range(BISECTION_ITERATIONS):
        if (upper - lower).total_seconds() <= BISECTION_TOLERANCE_SECONDS:
            break

        midpoint = lower + (upper - lower) / 2
        midpoint_offset = angular_offset(ephemeris.body_longitude(midpoint, "Moon"), natal_moon_longitude)

        if midpoint_offset == 0:
            return midpoint.astimezone(UTC)

        if lower_offset * midpoint_offset <= 0:
            upper = midpoint
        else:
            lower = midpoint
            lower_offset = midpoint_offset

    return (lower + (upper - lower) / 2).astimezone(UTC)


def build_lunar_return_profile(
    primary_profile: BirthProfile,
    exact_return: datetime,
    return_location: ReturnLocation,
) -> BirthProfile:
    validate_return_location(return_location)
    local_return = exact_return.astimezone(ZoneInfo(return_location.timezone))
    return BirthProfile(
        name=f"{primary_profile.name} Lunar Return",
        date=local_return.strftime("%Y-%m-%d"),
        time=local_return.strftime("%H:%M"),
        locationName=return_location.location_name,
        latitude=return_location.latitude,
        longitude=return_location.longitude,
        timezone=return_location.timezone,
    )


def build_lunar_return_chart_id(primary: BirthProfile, exact_return: datetime) -> str:
    raw = f"lunar-return-{primary.name}-{exact_return.astimezone(UTC).strftime('%Y-%m-%d-%H-%M-%S')}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


def build_lunar_return_result_id(primary: BirthProfile, exact_return: datetime) -> str:
    raw = f"lunar-return-result-{primary.name}-{exact_return.astimezone(UTC).strftime('%Y-%m-%d-%H-%M-%S')}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


class LunarReturnGenerator(SingleSubjectDerivedGenerator[LunarReturnTargetContext]):
    overlay_id = "lunar-return-in-natal"

    def build_derived_chart(
        self,
        primary_profile: BirthProfile,
        settings: ChartSettings,
        target_context: LunarReturnTargetContext,
    ) -> ChartResult:
        return_location = ReturnLocation.model_validate(target_context["return_location"])
        exact_return = find_lunar_return_datetime(
            LunarReturnSearchInput(
                natal_profile=primary_profile,
                anchor_date=target_context["anchor_date"],
                anchor_time=target_context["anchor_time"],
                anchor_timezone=return_location.timezone or "",
            ),
            self.context.ephemeris,
        )
        profile = build_lunar_return_profile(primary_profile, exact_return, return_location)
        lunar_return = self.context.natal.calculate_from_profile(profile, settings)
        lunar_return.chart_id = build_lunar_return_chart_id(primary_profile, exact_return)
        lunar_return.chart_type = "lunarReturn"
        lunar_return.title = f"{primary_profile.name} Lunar Return"
        return lunar_return

    def build_overlay_label(self, primary_chart: ChartResult, _derived_chart: ChartResult) -> str:
        return f"Lunar Return in {primary_chart.profiles[0].name} houses"

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        derived_chart: ChartResult,
        overlay: ChartOverlay,
        settings: ChartSettings,
        target_context: LunarReturnTargetContext,
    ) -> ChartResult:
        _ = settings, target_context
        primary_profile = primary_chart.profiles[0]
        exact_return = datetime.fromisoformat(
            f"{derived_chart.profiles[0].date}T{derived_chart.profiles[0].time}:00"
        ).replace(tzinfo=ZoneInfo(derived_chart.profiles[0].timezone or "UTC"))

        return ChartResult(
            chartId=build_lunar_return_result_id(primary_profile, exact_return),
            chartType="lunarReturn",
            title=f"{primary_profile.name} Lunar Return Chart",
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
                "lunarReturn": derived_chart.model_dump(by_alias=True),
                "lunarReturnOverlay": overlay.model_dump(by_alias=True),
            },
        )


class LunarReturnChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = LunarReturnGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: LunarReturnChartRequest) -> ChartResult:
        validate_return_location(request.return_location)
        return self.generator.generate(
            request.primary,
            request.settings,
            LunarReturnTargetContext(
                anchor_date=request.anchor_date,
                anchor_time=request.anchor_time,
                return_location=request.return_location.model_dump(by_alias=True),
            ),
        )

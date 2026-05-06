import math
import re
from datetime import UTC, datetime

from app.models.chart import BirthProfile, ChartResult, ChartSettings, CompositeChartRequest, Placement
from app.services.aspects import calculate_aspects
from app.services.chart_generators import ChartGenerationContext, DualSubjectFusionGenerator
from app.services.ephemeris import EphemerisService
from app.services.ephemeris import zodiac_position
from app.services.houses import assign_house
from app.services.point_registry import sort_placements_by_registry


def midpoint_longitude(first: float, second: float) -> float:
    normalized_first = first % 360
    normalized_second = second % 360
    first_radians = math.radians(normalized_first)
    second_radians = math.radians(normalized_second)
    x_component = math.cos(first_radians) + math.cos(second_radians)
    y_component = math.sin(first_radians) + math.sin(second_radians)

    if abs(x_component) < 1e-12 and abs(y_component) < 1e-12:
        midpoint = (min(normalized_first, normalized_second) + 90.0) % 360
    else:
        midpoint = math.degrees(math.atan2(y_component, x_component)) % 360

    rounded = round(midpoint % 360, 6)
    return 0.0 if rounded in {0.0, 360.0} else rounded


def midpoint_coordinate(first: float, second: float) -> float:
    return (first + second) / 2


def midpoint_instant(
    primary_profile: BirthProfile,
    secondary_profile: BirthProfile,
    ephemeris: EphemerisService,
) -> datetime:
    primary_instant = ephemeris.normalize_profile_datetime(primary_profile)
    secondary_instant = ephemeris.normalize_profile_datetime(secondary_profile)
    midpoint_timestamp = (primary_instant.timestamp() + secondary_instant.timestamp()) / 2
    return datetime.fromtimestamp(midpoint_timestamp, tz=UTC)


def midpoint_placement(first: Placement, second: Placement) -> Placement:
    if first.body != second.body:
        raise ValueError("Composite midpoint placements require matching bodies.")

    midpoint = midpoint_longitude(first.longitude, second.longitude)
    position = zodiac_position(midpoint)
    retrograde = first.retrograde if first.retrograde == second.retrograde else None
    return Placement(
        body=first.body,
        longitude=midpoint,
        sign=position.sign,
        degree=position.degree,
        minute=position.minute,
        retrograde=retrograde,
    )


def build_composite_profile(
    primary_profile: BirthProfile,
    secondary_profile: BirthProfile,
    ephemeris: EphemerisService,
) -> BirthProfile:
    utc_midpoint = midpoint_instant(primary_profile, secondary_profile, ephemeris).astimezone(UTC)

    if primary_profile.latitude is None or secondary_profile.latitude is None:
        raise ValueError("Composite chart requires latitude for both profiles.")
    if primary_profile.longitude is None or secondary_profile.longitude is None:
        raise ValueError("Composite chart requires longitude for both profiles.")

    return BirthProfile(
        name=f"{primary_profile.name} + {secondary_profile.name} Composite",
        date=utc_midpoint.strftime("%Y-%m-%d"),
        time=utc_midpoint.strftime("%H:%M"),
        locationName="Composite Midpoint",
        latitude=midpoint_coordinate(primary_profile.latitude, secondary_profile.latitude),
        longitude=midpoint_coordinate(primary_profile.longitude, secondary_profile.longitude),
        timezone="UTC",
    )


def build_midpoint_placements(
    primary_chart: ChartResult,
    secondary_chart: ChartResult,
    synthetic_chart: ChartResult,
) -> list[Placement]:
    primary_by_body = {placement.body: placement for placement in primary_chart.placements}
    secondary_by_body = {placement.body: placement for placement in secondary_chart.placements}
    synthetic_by_body = {placement.body: placement for placement in synthetic_chart.placements}
    house_cusps = [house.longitude for house in synthetic_chart.houses]
    angle_bodies = {"Ascendant", "Midheaven", "Vertex"}
    midpoint_bodies = set(primary_by_body) & set(secondary_by_body)
    placements: list[Placement] = []

    for body in midpoint_bodies:
        if body in angle_bodies:
            continue

        midpoint = midpoint_placement(primary_by_body[body], secondary_by_body[body])
        midpoint.house = assign_house(midpoint.longitude, house_cusps)
        placements.append(midpoint)

    for body in angle_bodies:
        if body in synthetic_by_body:
            placements.append(synthetic_by_body[body])

    return sort_placements_by_registry(placements)


def build_composite_chart(
    primary_chart: ChartResult,
    secondary_chart: ChartResult,
    synthetic_chart: ChartResult,
    settings: ChartSettings,
) -> ChartResult:
    placements = build_midpoint_placements(primary_chart, secondary_chart, synthetic_chart)
    aspect_placements = [placement for placement in placements if placement.body not in {"Ascendant", "Midheaven"}]
    return ChartResult(
        chartId=synthetic_chart.chart_id,
        chartType=synthetic_chart.chart_type,
        title=synthetic_chart.title,
        profiles=synthetic_chart.profiles,
        calculation=synthetic_chart.calculation,
        placements=placements,
        houses=synthetic_chart.houses,
        aspects=calculate_aspects(
            aspect_placements,
            aspect_set=settings.aspect_set,
            orb_profile=settings.orb_profile,
        ),
    )


def build_composite_chart_id_from_profiles(
    primary_profile: BirthProfile,
    secondary_profile: BirthProfile,
) -> str:
    pair_signature = build_fusion_pair_signature(primary_profile, secondary_profile)
    raw = f"composite-{pair_signature}"
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")


def build_fusion_pair_signature(
    primary_profile: BirthProfile,
    secondary_profile: BirthProfile,
) -> str:
    signatures = sorted(
        [
            build_profile_identity_signature(primary_profile),
            build_profile_identity_signature(secondary_profile),
        ]
    )
    return "-".join(signatures)


def build_profile_identity_signature(profile: BirthProfile) -> str:
    latitude = "" if profile.latitude is None else f"{profile.latitude:.6f}"
    longitude = "" if profile.longitude is None else f"{profile.longitude:.6f}"
    timezone = profile.timezone or ""
    return (
        f"{profile.name}-{profile.date}-{profile.time}-{timezone}-"
        f"{profile.location_name}-{latitude}-{longitude}"
    )


class CompositeGenerator(DualSubjectFusionGenerator):
    def build_fused_chart(
        self,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        composite_profile = build_composite_profile(
            primary_chart.profiles[0],
            secondary_chart.profiles[0],
            self.context.ephemeris,
        )
        synthetic_chart = self.context.natal.calculate_from_profile(composite_profile, settings)
        return build_composite_chart(primary_chart, secondary_chart, synthetic_chart, settings)

    def build_chart_result(
        self,
        *,
        primary_chart: ChartResult,
        secondary_chart: ChartResult,
        fused_chart: ChartResult,
        settings: ChartSettings,
    ) -> ChartResult:
        _ = settings
        primary_profile = primary_chart.profiles[0]
        secondary_profile = secondary_chart.profiles[0]
        return ChartResult(
            chartId=build_composite_chart_id_from_profiles(primary_profile, secondary_profile),
            chartType="composite",
            title=f"{primary_profile.name} × {secondary_profile.name} Composite Chart",
            profiles=[primary_profile, secondary_profile],
            calculation=self.build_calculation_metadata(),
            placements=fused_chart.placements,
            houses=fused_chart.houses,
            aspects=fused_chart.aspects,
            relatedCharts={
                "primaryNatal": primary_chart.model_dump(by_alias=True),
                "secondaryNatal": secondary_chart.model_dump(by_alias=True),
                "compositeChart": fused_chart.model_dump(by_alias=True),
            },
        )


class CompositeChartService:
    def __init__(self, ephemeris: EphemerisService | None = None) -> None:
        self.generator = CompositeGenerator(ChartGenerationContext.create(ephemeris))

    def calculate(self, request: CompositeChartRequest) -> ChartResult:
        return self.generator.generate(request.primary, request.secondary, request.settings)

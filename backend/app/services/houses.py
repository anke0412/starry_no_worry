from dataclasses import dataclass
from datetime import UTC, datetime

import swisseph as swe

from app.models.chart import BirthProfile, HouseCusp, Placement
from app.services.ephemeris import zodiac_position

PLACIDUS = "placidus"
HOUSE_SYSTEM_CODES = {
    PLACIDUS: b"P",
}


@dataclass(frozen=True)
class HouseCalculation:
    houses: list[HouseCusp]
    ascendant: Placement
    midheaven: Placement


class HouseCalculationService:
    def calculate(
        self,
        profile: BirthProfile,
        utc_datetime: datetime,
        house_system: str = PLACIDUS,
    ) -> HouseCalculation:
        validate_birth_coordinates(profile)
        if house_system not in HOUSE_SYSTEM_CODES:
            raise ValueError(f"Unsupported house system: {house_system}")
        if utc_datetime.tzinfo is None:
            raise ValueError("House calculation datetime must be timezone-aware.")

        utc_datetime = utc_datetime.astimezone(UTC)
        julian_day = swe.julday(
            utc_datetime.year,
            utc_datetime.month,
            utc_datetime.day,
            decimal_utc_hour(utc_datetime),
        )
        cusps, angles = swe.houses_ex(
            julian_day,
            profile.latitude,
            profile.longitude,
            HOUSE_SYSTEM_CODES[house_system],
        )

        house_longitudes = [normalize_longitude(cusp) for cusp in cusps[:12]]
        houses = [
            build_house_cusp(index + 1, longitude)
            for index, longitude in enumerate(house_longitudes)
        ]
        ascendant = build_angle_placement("Ascendant", angles[0], house=1)
        midheaven = build_angle_placement("Midheaven", angles[1], house=10)

        return HouseCalculation(
            houses=houses,
            ascendant=ascendant,
            midheaven=midheaven,
        )


def validate_birth_coordinates(profile: BirthProfile) -> None:
    if profile.latitude is None:
        raise ValueError("Birth profile latitude is required for house calculation.")
    if profile.longitude is None:
        raise ValueError("Birth profile longitude is required for house calculation.")
    if not -90 <= profile.latitude <= 90:
        raise ValueError("Birth profile latitude must be between -90 and 90.")
    if not -180 <= profile.longitude <= 180:
        raise ValueError("Birth profile longitude must be between -180 and 180.")


def decimal_utc_hour(utc_datetime: datetime) -> float:
    return (
        utc_datetime.hour
        + utc_datetime.minute / 60
        + utc_datetime.second / 3600
        + utc_datetime.microsecond / 3_600_000_000
    )


def normalize_longitude(longitude: float) -> float:
    return round(longitude % 360, 6)


def build_house_cusp(house: int, longitude: float) -> HouseCusp:
    position = zodiac_position(longitude)
    return HouseCusp(
        house=house,
        longitude=normalize_longitude(longitude),
        sign=position.sign,
        degree=position.degree,
        minute=position.minute,
    )


def build_angle_placement(body: str, longitude: float, house: int) -> Placement:
    position = zodiac_position(longitude)
    return Placement(
        body=body,
        longitude=normalize_longitude(longitude),
        sign=position.sign,
        degree=position.degree,
        minute=position.minute,
        house=house,
    )


def assign_house(longitude: float, house_cusps: list[float]) -> int:
    normalized = longitude % 360
    if len(house_cusps) != 12:
        raise ValueError("House assignment requires 12 house cusps.")

    for index, start in enumerate(house_cusps):
        end = house_cusps[(index + 1) % 12]
        if longitude_in_span(normalized, start % 360, end % 360):
            return index + 1

    return 12


def longitude_in_span(longitude: float, start: float, end: float) -> bool:
    if start <= end:
        return start <= longitude < end
    return longitude >= start or longitude < end

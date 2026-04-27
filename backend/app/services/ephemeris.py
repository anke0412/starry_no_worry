from dataclasses import dataclass
from datetime import UTC, datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import ephem

from app.models.chart import BirthProfile, Placement
from app.services.point_registry import DEFAULT_PLANET_BODIES

SIGNS = (
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
)

BODY_CLASSES = {
    "Sun": ephem.Sun,
    "Moon": ephem.Moon,
    "Mercury": ephem.Mercury,
    "Venus": ephem.Venus,
    "Mars": ephem.Mars,
    "Jupiter": ephem.Jupiter,
    "Saturn": ephem.Saturn,
    "Uranus": ephem.Uranus,
    "Neptune": ephem.Neptune,
    "Pluto": ephem.Pluto,
}


@dataclass(frozen=True)
class ZodiacPosition:
    sign: str
    degree: int
    minute: int


def normalize_birth_datetime(profile: BirthProfile) -> datetime:
    if not profile.timezone:
        raise ValueError("Birth profile timezone is required for ephemeris calculation.")

    try:
        timezone = ZoneInfo(profile.timezone)
    except ZoneInfoNotFoundError as error:
        raise ValueError(f"Unknown timezone: {profile.timezone}") from error

    local_datetime = datetime.fromisoformat(f"{profile.date}T{profile.time}").replace(tzinfo=timezone)
    return local_datetime.astimezone(UTC)


def zodiac_position(longitude: float) -> ZodiacPosition:
    normalized = longitude % 360
    sign_index = int(normalized // 30)
    sign_longitude = normalized - sign_index * 30
    degree = int(sign_longitude)
    minute = int(round((sign_longitude - degree) * 60))

    if minute == 60:
        degree += 1
        minute = 0

    return ZodiacPosition(sign=SIGNS[sign_index], degree=degree, minute=minute)


class EphemerisService:
    engine_name = "ephem"
    engine_version = ephem.__version__

    def normalize_profile_datetime(self, profile: BirthProfile) -> datetime:
        return normalize_birth_datetime(profile)

    def calculate_profile_placements(
        self,
        profile: BirthProfile,
        bodies: tuple[str, ...] = DEFAULT_PLANET_BODIES,
    ) -> list[Placement]:
        utc_datetime = self.normalize_profile_datetime(profile)
        return [self.calculate_body(utc_datetime, body) for body in bodies]

    def calculate_body(self, utc_datetime: datetime, body: str) -> Placement:
        if body not in BODY_CLASSES:
            raise ValueError(f"Unsupported ephemeris body: {body}")

        if utc_datetime.tzinfo is None:
            raise ValueError("Ephemeris datetime must be timezone-aware.")

        utc_datetime = utc_datetime.astimezone(UTC)
        ephem_body = BODY_CLASSES[body]()
        ephem_body.compute(utc_datetime)

        longitude = float(ephem.Ecliptic(ephem_body).lon) * 180 / ephem.pi
        position = zodiac_position(longitude)

        return Placement(
            body=body,
            longitude=round(longitude % 360, 6),
            sign=position.sign,
            degree=position.degree,
            minute=position.minute,
        )

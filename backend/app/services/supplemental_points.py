from datetime import UTC, datetime
from pathlib import Path

import swisseph as swe

from app.models.chart import Placement
from app.services.ephemeris import zodiac_position
from app.services.houses import decimal_utc_hour, normalize_longitude
from app.services.point_registry import DEFAULT_SWISS_POINT_BODIES, SWISS_POINT_CODES

EPHEMERIS_PATH = str(Path(__file__).resolve().parents[2])
swe.set_ephe_path(EPHEMERIS_PATH)


class SupplementalPointService:
    def calculate_swiss_points(
        self,
        utc_datetime: datetime,
        bodies: tuple[str, ...] = DEFAULT_SWISS_POINT_BODIES,
    ) -> list[Placement]:
        if utc_datetime.tzinfo is None:
            raise ValueError("Supplemental point calculation datetime must be timezone-aware.")

        utc_datetime = utc_datetime.astimezone(UTC)
        julian_day = swe.julday(
            utc_datetime.year,
            utc_datetime.month,
            utc_datetime.day,
            decimal_utc_hour(utc_datetime),
        )
        return [self.calculate_swiss_point(julian_day, body) for body in bodies]

    def calculate_swiss_point(self, julian_day: float, body: str) -> Placement:
        if body not in SWISS_POINT_CODES:
            raise ValueError(f"Unsupported supplemental point: {body}")

        point_data, _flags = swe.calc_ut(julian_day, SWISS_POINT_CODES[body], swe.FLG_SWIEPH)
        return build_point_placement(body, point_data[0])

    def calculate_part_of_fortune(
        self,
        ascendant: Placement,
        sun: Placement,
        moon: Placement,
    ) -> Placement:
        diurnal = sun.house is not None and 7 <= sun.house <= 12
        longitude = (
            ascendant.longitude + moon.longitude - sun.longitude
            if diurnal
            else ascendant.longitude + sun.longitude - moon.longitude
        )
        return build_point_placement("Part of Fortune", longitude)


def build_point_placement(body: str, longitude: float) -> Placement:
    normalized_longitude = normalize_longitude(longitude)
    position = zodiac_position(normalized_longitude)
    return Placement(
        body=body,
        longitude=normalized_longitude,
        sign=position.sign,
        degree=position.degree,
        minute=position.minute,
    )

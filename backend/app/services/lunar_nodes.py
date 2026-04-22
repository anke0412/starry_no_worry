from dataclasses import dataclass
from datetime import UTC, datetime

import swisseph as swe

from app.models.chart import Placement
from app.services.ephemeris import zodiac_position
from app.services.houses import decimal_utc_hour, normalize_longitude


@dataclass(frozen=True)
class LunarNodes:
    north_node: Placement
    south_node: Placement


class LunarNodeService:
    def calculate(self, utc_datetime: datetime) -> LunarNodes:
        if utc_datetime.tzinfo is None:
            raise ValueError("Lunar node calculation datetime must be timezone-aware.")

        utc_datetime = utc_datetime.astimezone(UTC)
        julian_day = swe.julday(
            utc_datetime.year,
            utc_datetime.month,
            utc_datetime.day,
            decimal_utc_hour(utc_datetime),
        )
        node_data, _flags = swe.calc_ut(julian_day, swe.MEAN_NODE)
        north_longitude = normalize_longitude(node_data[0])
        south_longitude = normalize_longitude(north_longitude + 180)

        return LunarNodes(
            north_node=build_node_placement("North Node", north_longitude),
            south_node=build_node_placement("South Node", south_longitude),
        )


def build_node_placement(body: str, longitude: float) -> Placement:
    position = zodiac_position(longitude)
    return Placement(
        body=body,
        longitude=normalize_longitude(longitude),
        sign=position.sign,
        degree=position.degree,
        minute=position.minute,
    )

from dataclasses import dataclass
from typing import Literal

import swisseph as swe

PointSource = Literal["ephem", "swiss_ephemeris", "lunar_nodes", "derived", "angle"]


@dataclass(frozen=True)
class PointDefinition:
    body: str
    source: PointSource
    swiss_code: int | None = None


POINT_REGISTRY: tuple[PointDefinition, ...] = (
    PointDefinition("Sun", "ephem"),
    PointDefinition("Moon", "ephem"),
    PointDefinition("Mercury", "ephem"),
    PointDefinition("Venus", "ephem"),
    PointDefinition("Mars", "ephem"),
    PointDefinition("Jupiter", "ephem"),
    PointDefinition("Saturn", "ephem"),
    PointDefinition("Uranus", "ephem"),
    PointDefinition("Neptune", "ephem"),
    PointDefinition("Pluto", "ephem"),
    PointDefinition("Chiron", "swiss_ephemeris", swiss_code=swe.CHIRON),
    PointDefinition("Lilith", "swiss_ephemeris", swiss_code=swe.MEAN_APOG),
    PointDefinition("North Node", "lunar_nodes"),
    PointDefinition("South Node", "lunar_nodes"),
    PointDefinition("Part of Fortune", "derived"),
    PointDefinition("Vertex", "angle"),
    PointDefinition("Ascendant", "angle"),
    PointDefinition("Midheaven", "angle"),
)

POINT_ORDER = {definition.body: index for index, definition in enumerate(POINT_REGISTRY)}

DEFAULT_PLANET_BODIES = tuple(
    definition.body
    for definition in POINT_REGISTRY
    if definition.source == "ephem"
)

DEFAULT_SWISS_POINT_BODIES = tuple(
    definition.body
    for definition in POINT_REGISTRY
    if definition.source == "swiss_ephemeris"
)

SWISS_POINT_CODES = {
    definition.body: definition.swiss_code
    for definition in POINT_REGISTRY
    if definition.source == "swiss_ephemeris" and definition.swiss_code is not None
}


def sort_placements_by_registry(placements):
    return sorted(placements, key=lambda placement: POINT_ORDER.get(placement.body, 999))

from itertools import combinations

from app.models.chart import Aspect, Placement

MAJOR_ASPECTS = {
    "conjunction": 0,
    "sextile": 60,
    "square": 90,
    "trine": 120,
    "opposition": 180,
}

MAJOR_EXTENDED_ASPECTS = {
    **MAJOR_ASPECTS,
    "quincunx": 150,
}

ASPECT_SETS = {
    "major": MAJOR_ASPECTS,
    "major_extended": MAJOR_EXTENDED_ASPECTS,
}

ORB_PROFILES = {
    "tight": 4.0,
    "default": 6.0,
    "wide": 8.0,
}


def calculate_aspects(
    placements: list[Placement],
    *,
    aspect_set: str = "major",
    orb_profile: str = "default",
) -> list[Aspect]:
    aspects: list[Aspect] = []
    definitions = resolve_aspect_set(aspect_set)
    orb_limit = resolve_orb_limit(orb_profile)

    for first, second in combinations(placements, 2):
        angle = angular_distance(first.longitude, second.longitude)
        aspect = closest_aspect(angle, definitions, orb_limit)

        if aspect is None:
            continue

        aspect_type, orb = aspect
        aspects.append(
            Aspect(
                **{
                    "from": first.body,
                    "to": second.body,
                    "type": aspect_type,
                    "angle": round(angle, 6),
                    "orb": round(orb, 6),
                }
            )
        )

    return sorted(aspects, key=lambda item: item.orb)


def calculate_major_aspects(placements: list[Placement], orb_limit: float = 6.0) -> list[Aspect]:
    aspects: list[Aspect] = []

    for first, second in combinations(placements, 2):
        angle = angular_distance(first.longitude, second.longitude)
        aspect = closest_aspect(angle, MAJOR_ASPECTS, orb_limit)

        if aspect is None:
            continue

        aspect_type, orb = aspect
        aspects.append(
            Aspect(
                **{
                    "from": first.body,
                    "to": second.body,
                    "type": aspect_type,
                    "angle": round(angle, 6),
                    "orb": round(orb, 6),
                }
            )
        )

    return sorted(aspects, key=lambda item: item.orb)


def angular_distance(first_longitude: float, second_longitude: float) -> float:
    raw_distance = abs(first_longitude - second_longitude) % 360
    return min(raw_distance, 360 - raw_distance)


def closest_major_aspect(angle: float, orb_limit: float) -> tuple[str, float] | None:
    return closest_aspect(angle, MAJOR_ASPECTS, orb_limit)


def closest_aspect(
    angle: float,
    definitions: dict[str, float],
    orb_limit: float,
) -> tuple[str, float] | None:
    candidates = [
        (aspect_type, abs(angle - exact_angle))
        for aspect_type, exact_angle in definitions.items()
        if abs(angle - exact_angle) <= orb_limit
    ]

    if not candidates:
        return None

    return min(candidates, key=lambda item: item[1])


def resolve_aspect_set(aspect_set: str) -> dict[str, float]:
    if aspect_set not in ASPECT_SETS:
        raise ValueError(f"Unsupported aspect set: {aspect_set}")
    return ASPECT_SETS[aspect_set]


def resolve_orb_limit(orb_profile: str) -> float:
    if orb_profile not in ORB_PROFILES:
        raise ValueError(f"Unsupported orb profile: {orb_profile}")
    return ORB_PROFILES[orb_profile]

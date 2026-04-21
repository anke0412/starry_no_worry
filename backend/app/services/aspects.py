from itertools import combinations

from app.models.chart import Aspect, Placement

MAJOR_ASPECTS = {
    "conjunction": 0,
    "sextile": 60,
    "square": 90,
    "trine": 120,
    "opposition": 180,
}


def calculate_major_aspects(placements: list[Placement], orb_limit: float = 6.0) -> list[Aspect]:
    aspects: list[Aspect] = []

    for first, second in combinations(placements, 2):
        angle = angular_distance(first.longitude, second.longitude)
        aspect = closest_major_aspect(angle, orb_limit)

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
    candidates = [
        (aspect_type, abs(angle - exact_angle))
        for aspect_type, exact_angle in MAJOR_ASPECTS.items()
        if abs(angle - exact_angle) <= orb_limit
    ]

    if not candidates:
        return None

    return min(candidates, key=lambda item: item[1])

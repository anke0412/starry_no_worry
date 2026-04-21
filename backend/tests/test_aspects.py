import pytest

from app.models.chart import Placement
from app.services.aspects import calculate_major_aspects


def placement(body: str, longitude: float) -> Placement:
    return Placement(
        body=body,
        longitude=longitude,
        sign="Aries",
        degree=0,
        minute=0,
    )


def test_calculates_major_aspects_sorted_by_orb():
    aspects = calculate_major_aspects(
        [
            placement("Sun", 10),
            placement("Moon", 70.5),
            placement("Saturn", 130.1),
        ]
    )

    assert aspects[0].from_body == "Sun"
    assert aspects[0].to_body == "Saturn"
    assert aspects[0].type == "trine"
    assert aspects[0].angle == pytest.approx(120.1)
    assert aspects[0].orb == pytest.approx(0.1)
    assert aspects[1].type == "sextile"


def test_ignores_pairs_outside_default_orb():
    aspects = calculate_major_aspects(
        [
            placement("Sun", 10),
            placement("Moon", 78),
        ]
    )

    assert aspects == []

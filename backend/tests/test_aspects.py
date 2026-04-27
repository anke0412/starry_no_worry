import pytest

from app.models.chart import Placement
from app.services.aspects import calculate_aspects


def placement(body: str, longitude: float) -> Placement:
    return Placement(
        body=body,
        longitude=longitude,
        sign="Aries",
        degree=0,
        minute=0,
    )


def test_calculates_major_aspects_sorted_by_orb():
    aspects = calculate_aspects(
        [
            placement("Sun", 10),
            placement("Moon", 70.5),
            placement("Saturn", 130.1),
        ],
        aspect_set="major",
        orb_profile="default",
    )

    assert aspects[0].from_body == "Sun"
    assert aspects[0].to_body == "Saturn"
    assert aspects[0].type == "trine"
    assert aspects[0].angle == pytest.approx(120.1)
    assert aspects[0].orb == pytest.approx(0.1)
    assert aspects[1].type == "sextile"


def test_ignores_pairs_outside_default_orb():
    aspects = calculate_aspects(
        [
            placement("Sun", 10),
            placement("Moon", 78),
        ],
        aspect_set="major",
        orb_profile="default",
    )

    assert aspects == []


def test_tight_orb_profile_filters_wider_major_aspects():
    aspects = calculate_aspects(
        [
            placement("Sun", 10),
            placement("Moon", 75),
        ],
        aspect_set="major",
        orb_profile="tight",
    )

    assert aspects == []


def test_extended_aspect_set_includes_quincunx():
    aspects = calculate_aspects(
        [
            placement("Sun", 10),
            placement("Moon", 160.5),
        ],
        aspect_set="major_extended",
        orb_profile="default",
    )

    assert len(aspects) == 1
    assert aspects[0].type == "quincunx"
    assert aspects[0].orb == pytest.approx(0.5)

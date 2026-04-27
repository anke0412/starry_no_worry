from datetime import datetime, timezone

from app.models.chart import Placement
from app.services.point_registry import DEFAULT_SWISS_POINT_BODIES, POINT_ORDER
from app.services.supplemental_points import SupplementalPointService


def test_registry_includes_phase_two_supplemental_points():
    assert DEFAULT_SWISS_POINT_BODIES == ("Chiron", "Lilith")
    assert POINT_ORDER["Part of Fortune"] < POINT_ORDER["Vertex"]


def test_calculates_swiss_supplemental_points_for_known_datetime():
    service = SupplementalPointService()

    points = service.calculate_swiss_points(datetime(2000, 1, 1, 12, 0, tzinfo=timezone.utc))

    assert [point.body for point in points] == ["Chiron", "Lilith"]
    assert points[0].sign == "Sagittarius"
    assert points[1].sign == "Sagittarius"


def test_calculates_part_of_fortune_with_day_and_night_formulas():
    service = SupplementalPointService()

    day_fortune = service.calculate_part_of_fortune(
        Placement(body="Ascendant", longitude=100, sign="Cancer", degree=10, minute=0, house=1),
        Placement(body="Sun", longitude=120, sign="Leo", degree=0, minute=0, house=10),
        Placement(body="Moon", longitude=150, sign="Virgo", degree=0, minute=0, house=11),
    )
    night_fortune = service.calculate_part_of_fortune(
        Placement(body="Ascendant", longitude=100, sign="Cancer", degree=10, minute=0, house=1),
        Placement(body="Sun", longitude=120, sign="Leo", degree=0, minute=0, house=2),
        Placement(body="Moon", longitude=150, sign="Virgo", degree=0, minute=0, house=8),
    )

    assert day_fortune.body == "Part of Fortune"
    assert day_fortune.longitude == 130
    assert night_fortune.longitude == 70

from datetime import datetime, timezone

import pytest

from app.models.chart import BirthProfile
from app.services.houses import HouseCalculationService, assign_house


def shanghai_profile() -> BirthProfile:
    return BirthProfile(
        name="Luna",
        date="2000-01-01",
        time="20:00",
        locationName="Shanghai",
        latitude=31.2304,
        longitude=121.4737,
        timezone="Asia/Shanghai",
    )


def test_calculates_placidus_houses_and_angles():
    service = HouseCalculationService()

    result = service.calculate(
        profile=shanghai_profile(),
        utc_datetime=datetime(2000, 1, 1, 12, 0, tzinfo=timezone.utc),
    )

    assert len(result.houses) == 12
    assert [house.house for house in result.houses] == list(range(1, 13))
    assert result.ascendant.body == "Ascendant"
    assert result.ascendant.house == 1
    assert result.midheaven.body == "Midheaven"
    assert result.midheaven.house == 10


def test_assigns_longitude_to_wrapping_house_span():
    houses = [
        350,
        20,
        50,
        80,
        110,
        140,
        170,
        200,
        230,
        260,
        290,
        320,
    ]

    assert assign_house(355, houses) == 1
    assert assign_house(15, houses) == 1
    assert assign_house(75, houses) == 3


def test_requires_coordinates_for_house_calculation():
    profile = shanghai_profile()
    profile.latitude = None

    service = HouseCalculationService()

    with pytest.raises(ValueError, match="latitude is required"):
        service.calculate(profile=profile, utc_datetime=datetime(2000, 1, 1, 12, 0, tzinfo=timezone.utc))


def test_rejects_invalid_coordinates_for_house_calculation():
    profile = shanghai_profile()
    profile.longitude = 200

    service = HouseCalculationService()

    with pytest.raises(ValueError, match="longitude must be between -180 and 180"):
        service.calculate(profile=profile, utc_datetime=datetime(2000, 1, 1, 12, 0, tzinfo=timezone.utc))

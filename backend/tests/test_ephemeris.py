from datetime import datetime, timezone

import pytest

from app.models.chart import BirthProfile
from app.services.ephemeris import (
    EphemerisService,
    normalize_birth_datetime,
    zodiac_position,
)
from app.services.point_registry import DEFAULT_PLANET_BODIES


def test_normalizes_birth_datetime_to_utc():
    profile = BirthProfile(
        name="Luna",
        date="2000-01-01",
        time="20:00",
        locationName="Shanghai",
        timezone="Asia/Shanghai",
    )

    assert normalize_birth_datetime(profile) == datetime(2000, 1, 1, 12, 0, tzinfo=timezone.utc)


def test_requires_timezone_for_ephemeris_calculation():
    profile = BirthProfile(
        name="Luna",
        date="2000-01-01",
        time="20:00",
        locationName="Shanghai",
    )

    with pytest.raises(ValueError, match="timezone"):
        normalize_birth_datetime(profile)


def test_zodiac_position_maps_longitude_to_sign_degree_and_minute():
    position = zodiac_position(280.3725)

    assert position.sign == "Capricorn"
    assert position.degree == 10
    assert position.minute == 22


def test_calculates_sun_position_for_known_utc_datetime():
    service = EphemerisService()

    placement = service.calculate_body(datetime(2000, 1, 1, 12, 0, tzinfo=timezone.utc), "Sun")

    assert placement.body == "Sun"
    assert placement.sign == "Capricorn"
    assert placement.degree == 10
    assert placement.minute in {21, 22, 23}
    assert placement.longitude == pytest.approx(280.37, abs=0.05)


def test_calculates_default_planet_positions_from_birth_profile():
    service = EphemerisService()
    profile = BirthProfile(
        name="Luna",
        date="2000-01-01",
        time="20:00",
        locationName="Shanghai",
        timezone="Asia/Shanghai",
    )

    placements = service.calculate_profile_placements(profile)

    assert [placement.body for placement in placements] == list(DEFAULT_PLANET_BODIES)
    assert placements[0].body == "Sun"
    assert placements[0].sign == "Capricorn"

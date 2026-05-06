from datetime import UTC, datetime
import importlib

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.chart import BirthProfile, CalculationMetadata, ChartResult, DavisonChartRequest
from app.services.composite import midpoint_longitude


client = TestClient(app)


def profile(name: str, date: str, time: str, location_name: str = "Shanghai") -> dict:
    return {
        "name": name,
        "date": date,
        "time": time,
        "locationName": location_name,
        "latitude": 31.2304 if location_name == "Shanghai" else 39.9042,
        "longitude": 121.4737 if location_name == "Shanghai" else 116.4074,
        "timezone": "Asia/Shanghai",
    }


def load_davison_module():
    try:
        return importlib.import_module("app.services.davison")
    except ModuleNotFoundError as error:
        pytest.fail(f"Davison service module is missing: {error}")


def test_midpoint_instant_uses_utc_midpoint():
    davison = load_davison_module()
    primary = BirthProfile(
        name="Luna",
        date="2000-01-01",
        time="23:30",
        locationName="Shanghai",
        latitude=30.0,
        longitude=170.0,
        timezone="Asia/Shanghai",
    )
    secondary = BirthProfile(
        name="Sol",
        date="2000-01-01",
        time="08:30",
        locationName="New York",
        latitude=10.0,
        longitude=-170.0,
        timezone="America/New_York",
    )

    midpoint = davison.midpoint_instant(primary, secondary, davison.EphemerisService())

    assert midpoint == datetime(2000, 1, 1, 14, 30, tzinfo=UTC)


def test_davison_profile_uses_arithmetic_midpoint_coordinates():
    davison = load_davison_module()
    primary = BirthProfile(
        name="Luna",
        date="2000-01-01",
        time="23:30",
        locationName="Shanghai",
        latitude=30.0,
        longitude=170.0,
        timezone="Asia/Shanghai",
    )
    secondary = BirthProfile(
        name="Sol",
        date="2000-01-01",
        time="08:30",
        locationName="New York",
        latitude=10.0,
        longitude=-170.0,
        timezone="America/New_York",
    )

    davison_profile = davison.build_davison_profile(primary, secondary, davison.EphemerisService())

    assert davison_profile.date == "2000-01-01"
    assert davison_profile.time == "14:30"
    assert davison_profile.timezone == "UTC"
    assert davison_profile.latitude == 20.0
    assert davison_profile.longitude == 0.0


def test_davison_chart_id_changes_when_profile_identity_changes():
    davison = load_davison_module()
    primary = BirthProfile(
        name="Luna",
        date="2000-01-01",
        time="20:00",
        locationName="Shanghai",
        latitude=31.2304,
        longitude=121.4737,
        timezone="Asia/Shanghai",
    )
    same_name_different_time = BirthProfile(
        name="Luna",
        date="2000-01-01",
        time="20:30",
        locationName="Shanghai",
        latitude=31.2304,
        longitude=121.4737,
        timezone="Asia/Shanghai",
    )
    secondary = BirthProfile(
        name="Sol",
        date="1993-09-07",
        time="21:10",
        locationName="Beijing",
        latitude=39.9042,
        longitude=116.4074,
        timezone="Asia/Shanghai",
    )

    assert davison.build_davison_chart_id_from_profiles(
        primary,
        secondary,
    ) != davison.build_davison_chart_id_from_profiles(
        same_name_different_time,
        secondary,
    )


def test_davison_chart_id_is_order_invariant_for_the_same_pair():
    davison = load_davison_module()
    primary = BirthProfile(
        name="Luna",
        date="2000-01-01",
        time="20:00",
        locationName="Shanghai",
        latitude=31.2304,
        longitude=121.4737,
        timezone="Asia/Shanghai",
    )
    secondary = BirthProfile(
        name="Sol",
        date="1993-09-07",
        time="21:10",
        locationName="Beijing",
        latitude=39.9042,
        longitude=116.4074,
        timezone="Asia/Shanghai",
    )

    assert davison.build_davison_chart_id_from_profiles(
        primary,
        secondary,
    ) == davison.build_davison_chart_id_from_profiles(
        secondary,
        primary,
    )


def test_davison_service_delegates_to_fusion_generator(monkeypatch):
    davison = load_davison_module()
    request = DavisonChartRequest(
        primary=profile("Luna", "2000-01-01", "20:00"),
        secondary=profile("Sol", "1993-09-07", "21:10", "Beijing"),
    )
    expected = ChartResult(
        chartId="stub-davison",
        chartType="davison",
        title="Stub Davison Chart",
        profiles=[request.primary, request.secondary],
        calculation=CalculationMetadata(
            engine="stub",
            engineVersion="0",
            calculatedAt="2026-04-28T00:00:00+00:00",
        ),
        placements=[],
        houses=[],
        aspects=[],
    )
    service = davison.DavisonChartService()
    captured: dict[str, object] = {}

    def fake_generate(primary, secondary, settings):
        captured["primary"] = primary
        captured["secondary"] = secondary
        captured["settings"] = settings
        return expected

    monkeypatch.setattr(service.generator, "generate", fake_generate)

    assert service.calculate(request) is expected
    assert captured == {
        "primary": request.primary,
        "secondary": request.secondary,
        "settings": request.settings,
    }


def test_davison_endpoint_returns_fused_chart_and_related_natals():
    response = client.post(
        "/api/charts/davison",
        json={
            "primary": profile("Luna", "2000-01-01", "20:00"),
            "secondary": profile("Sol", "1993-09-07", "21:10", "Beijing"),
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert data["chartType"] == "davison"
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "davisonChart",
    }
    assert data["relatedCharts"]["davisonChart"]["chartType"] == "natal"
    assert data["relatedCharts"]["davisonChart"]["profiles"][0]["timezone"] == "UTC"


def test_davison_endpoint_uses_midpoint_event_chart_instead_of_midpoint_longitudes():
    response = client.post(
        "/api/charts/davison",
        json={
            "primary": profile("Luna", "2000-01-01", "20:00"),
            "secondary": profile("Sol", "1993-09-07", "21:10", "Beijing"),
        },
    )

    assert response.status_code == 200
    data = response.json()

    primary_chart = data["relatedCharts"]["primaryNatal"]
    secondary_chart = data["relatedCharts"]["secondaryNatal"]
    davison_chart = data["relatedCharts"]["davisonChart"]

    primary_sun = next(placement for placement in primary_chart["placements"] if placement["body"] == "Sun")
    secondary_sun = next(placement for placement in secondary_chart["placements"] if placement["body"] == "Sun")
    davison_sun = next(placement for placement in davison_chart["placements"] if placement["body"] == "Sun")

    assert davison_sun["longitude"] != midpoint_longitude(
        primary_sun["longitude"],
        secondary_sun["longitude"],
    )

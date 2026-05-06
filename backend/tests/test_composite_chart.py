from fastapi.testclient import TestClient

from app.main import app
from app.models.chart import BirthProfile, CalculationMetadata, ChartResult, CompositeChartRequest, Placement
from app.services.composite import (
    CompositeChartService,
    build_composite_profile,
    build_composite_chart_id_from_profiles,
    midpoint_coordinate,
    midpoint_longitude,
    midpoint_placement,
)
from app.services.ephemeris import EphemerisService


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


def test_midpoint_longitude_wraps_across_zero_aries():
    assert midpoint_longitude(350.0, 10.0) == 0.0


def test_midpoint_placement_uses_ecliptic_wraparound_semantics():
    midpoint = midpoint_placement(
        placement("Sun", 350.0),
        placement("Sun", 10.0),
    )

    assert midpoint.body == "Sun"
    assert midpoint.longitude == 0.0
    assert midpoint.sign == "Aries"
    assert midpoint.degree == 0
    assert midpoint.minute == 0


def test_midpoint_coordinate_uses_arithmetic_mean_for_geographic_longitude():
    assert midpoint_coordinate(170.0, -170.0) == 0.0


def test_composite_service_delegates_to_fusion_generator(monkeypatch):
    request = CompositeChartRequest(
        primary=profile("Luna", "2000-01-01", "20:00"),
        secondary=profile("Sol", "1993-09-07", "21:10", "Beijing"),
    )
    expected = ChartResult(
        chartId="stub-composite",
        chartType="composite",
        title="Stub Composite Chart",
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
    service = CompositeChartService()
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


def test_composite_profile_uses_utc_handoff_and_is_order_invariant():
    ephemeris = EphemerisService()
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

    forward = build_composite_profile(primary, secondary, ephemeris)
    reverse = build_composite_profile(secondary, primary, ephemeris)

    assert forward.date == reverse.date
    assert forward.time == reverse.time
    assert forward.timezone == reverse.timezone == "UTC"
    assert forward.latitude == reverse.latitude == 20.0
    assert forward.longitude == reverse.longitude == 0.0


def test_composite_chart_id_changes_when_profile_identity_changes():
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

    assert build_composite_chart_id_from_profiles(primary, secondary) != build_composite_chart_id_from_profiles(
        same_name_different_time,
        secondary,
    )


def test_composite_chart_id_is_order_invariant_for_the_same_pair():
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

    assert build_composite_chart_id_from_profiles(primary, secondary) == build_composite_chart_id_from_profiles(
        secondary,
        primary,
    )


def test_composite_endpoint_returns_fused_chart_and_related_natals():
    response = client.post(
        "/api/charts/composite",
        json={
            "primary": profile("Luna", "2000-01-01", "20:00"),
            "secondary": profile("Sol", "1993-09-07", "21:10", "Beijing"),
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert data["chartType"] == "composite"
    assert data["title"] == "Luna × Sol Composite Chart"
    assert len(data["profiles"]) == 2
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "compositeChart",
    }
    assert data["relatedCharts"]["primaryNatal"]["chartType"] == "natal"
    assert data["relatedCharts"]["secondaryNatal"]["chartType"] == "natal"
    assert data["relatedCharts"]["compositeChart"]["chartType"] == "natal"
    assert data["relatedCharts"]["compositeChart"]["profiles"][0]["name"] == "Luna + Sol Composite"
    assert data["placements"] == data["relatedCharts"]["compositeChart"]["placements"]
    assert data["houses"] == data["relatedCharts"]["compositeChart"]["houses"]
    assert data["aspects"] == data["relatedCharts"]["compositeChart"]["aspects"]
    assert "North Node" in [placement["body"] for placement in data["placements"]]
    assert "Ascendant" in [placement["body"] for placement in data["placements"]]


def test_composite_endpoint_uses_midpoint_placements_instead_of_midpoint_event_chart():
    response = client.post(
        "/api/charts/composite",
        json={
            "primary": profile("Luna", "2000-01-01", "20:00"),
            "secondary": profile("Sol", "1993-09-07", "21:10", "Beijing"),
        },
    )

    assert response.status_code == 200
    data = response.json()

    primary_chart = data["relatedCharts"]["primaryNatal"]
    secondary_chart = data["relatedCharts"]["secondaryNatal"]
    composite_chart = data["relatedCharts"]["compositeChart"]

    primary_sun = next(placement for placement in primary_chart["placements"] if placement["body"] == "Sun")
    secondary_sun = next(placement for placement in secondary_chart["placements"] if placement["body"] == "Sun")
    composite_sun = next(placement for placement in composite_chart["placements"] if placement["body"] == "Sun")

    assert composite_sun["longitude"] == midpoint_longitude(
        primary_sun["longitude"],
        secondary_sun["longitude"],
    )


def test_composite_endpoint_core_fused_results_do_not_change_when_primary_and_secondary_swap():
    forward = client.post(
        "/api/charts/composite",
        json={
            "primary": profile("Luna", "2000-01-01", "20:00"),
            "secondary": profile("Sol", "1993-09-07", "21:10", "Beijing"),
        },
    )
    reverse = client.post(
        "/api/charts/composite",
        json={
            "primary": profile("Sol", "1993-09-07", "21:10", "Beijing"),
            "secondary": profile("Luna", "2000-01-01", "20:00"),
        },
    )

    assert forward.status_code == 200
    assert reverse.status_code == 200

    forward_data = forward.json()["relatedCharts"]["compositeChart"]
    reverse_data = reverse.json()["relatedCharts"]["compositeChart"]

    forward_longitudes = {placement["body"]: placement["longitude"] for placement in forward_data["placements"]}
    reverse_longitudes = {placement["body"]: placement["longitude"] for placement in reverse_data["placements"]}

    assert forward_longitudes == reverse_longitudes
    assert forward_data["houses"] == reverse_data["houses"]
    assert forward_data["profiles"][0]["date"] == reverse_data["profiles"][0]["date"]
    assert forward_data["profiles"][0]["time"] == reverse_data["profiles"][0]["time"]
    assert forward_data["profiles"][0]["timezone"] == reverse_data["profiles"][0]["timezone"] == "UTC"


def placement(body: str, longitude: float) -> Placement:
    return Placement(
        body=body,
        longitude=longitude,
        sign="Aries",
        degree=0,
        minute=0,
    )

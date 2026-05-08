from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def marx_payload() -> dict:
    return {
        "primary": {
            "name": "Luna",
            "date": "2000-01-01",
            "time": "20:00",
            "locationName": "Shanghai",
            "latitude": 31.2304,
            "longitude": 121.4737,
            "timezone": "Asia/Shanghai",
        },
        "secondary": {
            "name": "Sol",
            "date": "1998-02-03",
            "time": "08:15",
            "locationName": "Beijing",
            "latitude": 39.9042,
            "longitude": 116.4074,
            "timezone": "Asia/Shanghai",
        },
    }


def test_marx_progression_endpoint_returns_dual_progressed_charts_and_overlays():
    response = client.post(
        "/api/charts/marx-progression",
        json={
            **marx_payload(),
            "progressionDate": "2026-05-01",
            "progressionTime": "12:00",
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert data["chartType"] == "marxProgression"
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "davisonChart",
        "primaryMarxChart",
        "secondaryMarxChart",
        "primaryProgressedMarxChart",
        "secondaryProgressedMarxChart",
        "primaryProgressedMarxOverlay",
        "secondaryProgressedMarxOverlay",
    }
    assert data["relatedCharts"]["primaryProgressedMarxChart"]["chartType"] == "progressedChart"
    assert data["relatedCharts"]["primaryProgressedMarxOverlay"]["referenceName"] == "Luna Marx Chart"


def test_marx_tertiary_progression_changes_the_solar_position_from_base_marx_chart():
    response = client.post(
        "/api/charts/marx-tertiary-progression",
        json={
            **marx_payload(),
            "tertiaryDate": "2026-05-01",
            "tertiaryTime": "12:00",
        },
    )

    assert response.status_code == 200
    data = response.json()

    primary_base = {placement["body"]: placement for placement in data["relatedCharts"]["primaryMarxChart"]["placements"]}
    primary_progressed = {
        placement["body"]: placement
        for placement in data["relatedCharts"]["primaryTertiaryProgressedMarxChart"]["placements"]
    }

    assert data["chartType"] == "marxTertiaryProgression"
    assert primary_base["Sun"]["longitude"] != primary_progressed["Sun"]["longitude"]

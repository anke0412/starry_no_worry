from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def relationship_payload() -> dict:
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


def test_composite_progression_endpoint_returns_base_chart_progressed_chart_and_overlay():
    response = client.post(
        "/api/charts/composite-progression",
        json={
            **relationship_payload(),
            "progressionDate": "2026-05-01",
            "progressionTime": "12:00",
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert data["chartType"] == "compositeProgression"
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "compositeChart",
        "progressedChart",
        "progressedOverlay",
    }
    assert data["relatedCharts"]["compositeChart"]["chartType"] == "compositeChart"
    assert data["relatedCharts"]["progressedChart"]["chartType"] == "progressedChart"
    assert data["relatedCharts"]["progressedOverlay"]["referenceName"] == "Composite Chart"


def test_davison_tertiary_progression_changes_the_solar_position_from_base_chart():
    response = client.post(
        "/api/charts/davison-tertiary-progression",
        json={
            **relationship_payload(),
            "tertiaryDate": "2026-05-01",
            "tertiaryTime": "12:00",
        },
    )

    assert response.status_code == 200
    data = response.json()

    base = {placement["body"]: placement for placement in data["relatedCharts"]["davisonChart"]["placements"]}
    progressed = {placement["body"]: placement for placement in data["relatedCharts"]["tertiaryProgressedChart"]["placements"]}

    assert data["chartType"] == "davisonTertiaryProgression"
    assert base["Sun"]["longitude"] != progressed["Sun"]["longitude"]

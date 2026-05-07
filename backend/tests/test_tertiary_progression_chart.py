from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def tertiary_progression_payload() -> dict:
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
        "tertiaryDate": "2026-05-01",
        "tertiaryTime": "12:00",
    }


def test_tertiary_progression_endpoint_returns_natal_progressed_chart_and_overlay():
    response = client.post("/api/charts/tertiary-progression", json=tertiary_progression_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["chartType"] == "tertiaryProgression"
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "tertiaryProgressedChart",
        "tertiaryProgressedOverlay",
    }
    assert data["relatedCharts"]["primaryNatal"]["chartType"] == "natal"
    assert data["relatedCharts"]["tertiaryProgressedChart"]["chartType"] == "tertiaryProgressedChart"
    assert data["relatedCharts"]["tertiaryProgressedOverlay"]["referenceName"] == "Luna"


def test_tertiary_progression_changes_the_solar_position_from_natal():
    response = client.post("/api/charts/tertiary-progression", json=tertiary_progression_payload())

    assert response.status_code == 200
    data = response.json()

    natal = {placement["body"]: placement for placement in data["relatedCharts"]["primaryNatal"]["placements"]}
    progressed = {placement["body"]: placement for placement in data["relatedCharts"]["tertiaryProgressedChart"]["placements"]}

    assert natal["Sun"]["longitude"] != progressed["Sun"]["longitude"]

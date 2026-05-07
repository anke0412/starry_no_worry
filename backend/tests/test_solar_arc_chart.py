from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def solar_arc_payload() -> dict:
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
        "solarArcDate": "2026-05-01",
        "solarArcTime": "12:00",
    }


def test_solar_arc_endpoint_returns_natal_solar_arc_chart_and_overlay():
    response = client.post("/api/charts/solar-arc", json=solar_arc_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["chartType"] == "solarArc"
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "solarArcChart",
        "solarArcOverlay",
    }
    assert data["relatedCharts"]["primaryNatal"]["chartType"] == "natal"
    assert data["relatedCharts"]["solarArcChart"]["chartType"] == "solarArcChart"
    assert data["relatedCharts"]["solarArcOverlay"]["referenceName"] == "Luna"


def test_solar_arc_applies_a_shared_directional_arc_to_multiple_bodies():
    response = client.post("/api/charts/solar-arc", json=solar_arc_payload())

    assert response.status_code == 200
    data = response.json()

    natal = {placement["body"]: placement for placement in data["relatedCharts"]["primaryNatal"]["placements"]}
    directed = {placement["body"]: placement for placement in data["relatedCharts"]["solarArcChart"]["placements"]}

    sun_arc = round((directed["Sun"]["longitude"] - natal["Sun"]["longitude"]) % 360, 6)
    moon_arc = round((directed["Moon"]["longitude"] - natal["Moon"]["longitude"]) % 360, 6)
    mercury_arc = round((directed["Mercury"]["longitude"] - natal["Mercury"]["longitude"]) % 360, 6)

    assert sun_arc > 0
    assert moon_arc == sun_arc
    assert mercury_arc == sun_arc

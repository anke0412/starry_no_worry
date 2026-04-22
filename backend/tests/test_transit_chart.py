from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def transit_payload() -> dict:
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
        "transitDate": "2026-05-01",
        "transitTime": "12:00",
    }


def test_transit_endpoint_returns_natal_transit_sky_and_inter_chart_aspects():
    response = client.post("/api/charts/transit", json=transit_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["chartId"] == "transit-luna-2000-01-01-2026-05-01-12-00"
    assert data["chartType"] == "transit"
    assert data["title"] == "Luna Transit Chart"
    assert len(data["profiles"]) == 1
    assert len(data["placements"]) == 20
    assert data["houses"] == []
    assert data["relatedCharts"]["primaryNatal"]["chartType"] == "natal"
    assert "North Node" in [placement["body"] for placement in data["relatedCharts"]["primaryNatal"]["placements"]]
    assert "South Node" in [placement["body"] for placement in data["relatedCharts"]["primaryNatal"]["placements"]]
    assert data["relatedCharts"]["transitSky"]["chartType"] == "transitSky"
    assert data["relatedCharts"]["transitSky"]["profiles"][0]["date"] == "2026-05-01"
    assert data["relatedCharts"]["transitSky"]["profiles"][0]["time"] == "12:00"
    assert data["relatedCharts"]["transitSky"]["placements"][0]["body"] == "Sun"
    assert data["relatedCharts"]["transitSky"]["placements"][0]["sign"] == "Taurus"
    assert {
        "from": "Sun",
        "to": "Sun",
        "type": "trine",
        "angle": 120.063744,
        "orb": 0.063744,
        "applying": None,
        "weight": None,
    } in data["aspects"]


def test_transit_endpoint_returns_structured_error_without_timezone():
    payload = transit_payload()
    del payload["primary"]["timezone"]

    response = client.post("/api/charts/transit", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "error": {
            "code": "invalid_chart_request",
            "message": "Birth profile timezone is required for ephemeris calculation.",
        }
    }

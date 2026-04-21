from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def natal_payload() -> dict:
    return {
        "primary": {
            "name": "Luna",
            "date": "2000-01-01",
            "time": "20:00",
            "locationName": "Shanghai",
            "timezone": "Asia/Shanghai",
        }
    }


def test_natal_endpoint_returns_real_ephemeris_placements():
    response = client.post("/api/charts/natal", json=natal_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["chartId"] == "natal-luna-2000-01-01-20-00"
    assert data["chartType"] == "natal"
    assert data["title"] == "Luna Natal Chart"
    assert data["calculation"]["engine"] == "ephem"
    assert data["calculation"]["engineVersion"]
    assert [placement["body"] for placement in data["placements"]] == [
        "Sun",
        "Moon",
        "Mercury",
        "Venus",
        "Mars",
        "Jupiter",
        "Saturn",
        "Uranus",
        "Neptune",
        "Pluto",
    ]
    assert data["placements"][0]["sign"] == "Capricorn"
    assert data["placements"][0]["degree"] == 10
    assert data["placements"][0]["longitude"] == 280.378583
    assert data["houses"] == []
    assert {
        "from": "Sun",
        "to": "Saturn",
        "type": "trine",
        "angle": 120.018086,
        "orb": 0.018086,
        "applying": None,
        "weight": None,
    } in data["aspects"]


def test_natal_endpoint_returns_structured_error_without_timezone():
    payload = natal_payload()
    del payload["primary"]["timezone"]

    response = client.post("/api/charts/natal", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "error": {
            "code": "invalid_chart_request",
            "message": "Birth profile timezone is required for ephemeris calculation.",
        }
    }

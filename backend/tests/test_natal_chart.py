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
            "latitude": 31.2304,
            "longitude": 121.4737,
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
        "North Node",
        "South Node",
        "Ascendant",
        "Midheaven",
    ]
    north_node = next(placement for placement in data["placements"] if placement["body"] == "North Node")
    south_node = next(placement for placement in data["placements"] if placement["body"] == "South Node")
    assert data["placements"][0]["sign"] == "Capricorn"
    assert data["placements"][0]["degree"] == 10
    assert data["placements"][0]["longitude"] == 280.378583
    assert abs(((north_node["longitude"] + 180) % 360) - south_node["longitude"]) < 0.000001
    assert north_node["house"] is not None
    assert south_node["house"] is not None
    assert len(data["houses"]) == 12
    assert data["houses"][0]["house"] == 1
    assert data["houses"][0]["sign"]
    assert data["houses"][0]["degree"] is not None
    assert data["houses"][0]["minute"] is not None
    assert all(placement["house"] is not None for placement in data["placements"])
    assert {
        "from": "North Node",
        "to": "South Node",
        "type": "opposition",
        "angle": 180.0,
        "orb": 0.0,
        "applying": None,
        "weight": None,
    } in data["aspects"]
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


def test_natal_endpoint_requires_birth_coordinates():
    payload = natal_payload()
    del payload["primary"]["latitude"]

    response = client.post("/api/charts/natal", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "error": {
            "code": "invalid_chart_request",
            "message": "Birth profile latitude is required for house calculation.",
        }
    }


def test_natal_endpoint_rejects_invalid_birth_coordinates():
    payload = natal_payload()
    payload["primary"]["latitude"] = 120

    response = client.post("/api/charts/natal", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "error": {
            "code": "invalid_chart_request",
            "message": "Birth profile latitude must be between -90 and 90.",
        }
    }


def test_natal_endpoint_rejects_unsupported_house_system_with_structured_error():
    payload = natal_payload()
    payload["settings"] = {
        "houseSystem": "whole-sign",
        "zodiac": "tropical",
        "aspectSet": "major",
        "orbProfile": "default",
    }

    response = client.post("/api/charts/natal", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "error": {
            "code": "invalid_chart_request",
            "message": "Unsupported house system: whole-sign",
        }
    }

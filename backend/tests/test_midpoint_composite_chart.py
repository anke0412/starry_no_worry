from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def midpoint_composite_payload() -> dict:
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
            "date": "1993-09-07",
            "time": "21:10",
            "locationName": "Beijing",
            "latitude": 39.9042,
            "longitude": 116.4074,
            "timezone": "Asia/Shanghai",
        },
    }


def test_midpoint_composite_endpoint_returns_fused_relationship_chart():
    response = client.post("/api/charts/midpoint-composite", json=midpoint_composite_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["chartType"] == "midpointComposite"
    assert data["title"] == "Luna × Sol Midpoint Composite Chart"
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "midpointCompositeChart",
    }
    assert data["relatedCharts"]["midpointCompositeChart"]["chartType"] == "midpointCompositeChart"
    assert len(data["placements"]) >= 18


def test_midpoint_composite_planetary_midpoints_are_not_identical_to_davison_event_chart():
    midpoint_response = client.post("/api/charts/midpoint-composite", json=midpoint_composite_payload())
    davison_response = client.post("/api/charts/davison", json=midpoint_composite_payload())

    assert midpoint_response.status_code == 200
    assert davison_response.status_code == 200

    midpoint_data = midpoint_response.json()
    davison_data = davison_response.json()

    midpoint_sun = next(placement for placement in midpoint_data["placements"] if placement["body"] == "Sun")
    davison_sun = next(placement for placement in davison_data["placements"] if placement["body"] == "Sun")

    assert midpoint_sun["longitude"] != davison_sun["longitude"]

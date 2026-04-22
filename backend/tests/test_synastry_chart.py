from fastapi.testclient import TestClient

from app.main import app
from app.models.chart import Placement
from app.services.synastry import calculate_inter_chart_aspects


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


def placement(body: str, longitude: float) -> Placement:
    return Placement(
        body=body,
        longitude=longitude,
        sign="Aries",
        degree=0,
        minute=0,
    )


def test_calculates_inter_chart_aspects_between_two_placement_sets():
    aspects = calculate_inter_chart_aspects(
        [placement("Sun", 10), placement("Moon", 80)],
        [placement("Venus", 70.5), placement("Mars", 200.2)],
    )

    assert aspects[0].from_body == "Moon"
    assert aspects[0].to_body == "Mars"
    assert aspects[0].type == "trine"
    assert aspects[0].orb == 0.2
    assert aspects[1].from_body == "Sun"
    assert aspects[1].to_body == "Venus"
    assert aspects[1].type == "sextile"


def test_synastry_endpoint_returns_dual_natal_results_and_inter_chart_aspects():
    response = client.post(
        "/api/charts/synastry",
        json={
            "primary": profile("Luna", "2000-01-01", "20:00"),
            "secondary": profile("Sol", "1993-09-07", "21:10", "Beijing"),
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert data["chartId"] == "synastry-luna-sol-2000-01-01-1993-09-07"
    assert data["chartType"] == "synastry"
    assert data["title"] == "Luna × Sol Synastry Chart"
    assert len(data["profiles"]) == 2
    assert len(data["placements"]) == 20
    assert data["relatedCharts"]["primaryNatal"]["chartType"] == "natal"
    assert data["relatedCharts"]["secondaryNatal"]["chartType"] == "natal"
    assert {
        "from": "Moon",
        "to": "Venus",
        "type": "square",
        "angle": 90.237194,
        "orb": 0.237194,
        "applying": None,
        "weight": None,
    } in data["aspects"]

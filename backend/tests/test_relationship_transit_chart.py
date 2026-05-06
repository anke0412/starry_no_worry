from fastapi.testclient import TestClient

from app.main import app
from app.models.chart import RelationshipTransitChartRequest
from app.services.relationship_transit import RelationshipTransitChartService, RelationshipTransitTargetContext


client = TestClient(app)


def relationship_transit_payload() -> dict:
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
        "transitDate": "2026-05-01",
        "transitTime": "12:00",
    }


def test_relationship_transit_service_delegates_to_generator_with_dual_subject_context(monkeypatch):
    request = RelationshipTransitChartRequest.model_validate(relationship_transit_payload())
    service = RelationshipTransitChartService()
    delegated_result = object()
    captured: dict[str, object] = {}

    def fake_generate(primary, secondary, settings, target_context):
        captured["primary"] = primary
        captured["secondary"] = secondary
        captured["settings"] = settings
        captured["target_context"] = target_context
        return delegated_result

    monkeypatch.setattr(service.generator, "generate", fake_generate)

    result = service.calculate(request)

    assert result is delegated_result
    assert captured["primary"] == request.primary
    assert captured["secondary"] == request.secondary
    assert captured["settings"] == request.settings
    assert captured["target_context"] == RelationshipTransitTargetContext(
        transit_date=request.transit_date,
        transit_time=request.transit_time,
    )


def test_relationship_transit_endpoint_returns_dual_natal_transit_sky_and_both_overlays():
    response = client.post("/api/charts/relationship-transit", json=relationship_transit_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["chartType"] == "relationshipTransit"
    assert data["title"] == "Luna × Sol Relationship Transit Chart"
    assert len(data["profiles"]) == 2
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "transitSky",
        "primaryTransitOverlay",
        "secondaryTransitOverlay",
    }
    assert data["relatedCharts"]["primaryNatal"]["chartType"] == "natal"
    assert data["relatedCharts"]["secondaryNatal"]["chartType"] == "natal"
    assert data["relatedCharts"]["transitSky"]["chartType"] == "transitSky"
    assert data["relatedCharts"]["transitSky"]["profiles"][0]["date"] == "2026-05-01"
    assert data["relatedCharts"]["transitSky"]["profiles"][0]["time"] == "12:00"
    assert data["relatedCharts"]["primaryTransitOverlay"]["referenceName"] == "Luna"
    assert data["relatedCharts"]["secondaryTransitOverlay"]["referenceName"] == "Sol"
    assert len(data["relatedCharts"]["primaryTransitOverlay"]["houses"]) == 12
    assert len(data["relatedCharts"]["secondaryTransitOverlay"]["houses"]) == 12
    assert data["aspects"] == []
    assert data["relatedCharts"]["primaryTransitOverlay"]["aspects"]
    assert data["relatedCharts"]["secondaryTransitOverlay"]["aspects"]
    assert data["relatedCharts"]["secondaryTransitOverlay"]["placements"][0]["sourceHouse"] is None


def test_relationship_transit_endpoint_returns_structured_error_without_timezone():
    payload = relationship_transit_payload()
    del payload["primary"]["timezone"]

    response = client.post("/api/charts/relationship-transit", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "error": {
            "code": "invalid_chart_request",
            "message": "Birth profile timezone is required for ephemeris calculation.",
        }
    }

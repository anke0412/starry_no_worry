from fastapi.testclient import TestClient

from app.main import app
from app.models.chart import TransitChartRequest
from app.services.transit import TransitChartService, TransitTargetContext


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


def test_transit_service_delegates_to_generator_with_transit_context(monkeypatch):
    request = TransitChartRequest.model_validate(transit_payload())
    service = TransitChartService()
    delegated_result = object()
    captured: dict[str, object] = {}

    def fake_generate(primary, settings, target_context):
        captured["primary"] = primary
        captured["settings"] = settings
        captured["target_context"] = target_context
        return delegated_result

    monkeypatch.setattr(service.generator, "generate", fake_generate)

    result = service.calculate(request)

    assert result is delegated_result
    assert captured["primary"] == request.primary
    assert captured["settings"] == request.settings
    assert captured["target_context"] == TransitTargetContext(
        transit_date=request.transit_date,
        transit_time=request.transit_time,
    )


def test_transit_endpoint_returns_natal_transit_sky_and_inter_chart_aspects():
    response = client.post("/api/charts/transit", json=transit_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["chartId"] == "transit-luna-2000-01-01-2026-05-01-12-00"
    assert data["chartType"] == "transit"
    assert data["title"] == "Luna Transit Chart"
    assert len(data["profiles"]) == 1
    assert len(data["placements"]) == 32
    assert data["houses"] == []
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "transitSky",
        "transitOverlay",
    }
    assert data["relatedCharts"]["primaryNatal"]["chartType"] == "natal"
    assert "North Node" in [placement["body"] for placement in data["relatedCharts"]["primaryNatal"]["placements"]]
    assert "South Node" in [placement["body"] for placement in data["relatedCharts"]["primaryNatal"]["placements"]]
    assert "Chiron" in [placement["body"] for placement in data["relatedCharts"]["primaryNatal"]["placements"]]
    assert "Lilith" in [placement["body"] for placement in data["relatedCharts"]["primaryNatal"]["placements"]]
    assert "Part of Fortune" in [placement["body"] for placement in data["relatedCharts"]["primaryNatal"]["placements"]]
    assert "Vertex" in [placement["body"] for placement in data["relatedCharts"]["primaryNatal"]["placements"]]
    assert data["relatedCharts"]["transitSky"]["chartType"] == "transitSky"
    assert data["relatedCharts"]["transitSky"]["profiles"][0]["date"] == "2026-05-01"
    assert data["relatedCharts"]["transitSky"]["profiles"][0]["time"] == "12:00"
    assert data["relatedCharts"]["transitSky"]["placements"][0]["body"] == "Sun"
    assert data["relatedCharts"]["transitSky"]["placements"][0]["sign"] == "Taurus"
    assert data["relatedCharts"]["transitOverlay"]["referenceName"] == "Luna"
    assert data["relatedCharts"]["transitOverlay"]["overlayName"] == "Transit Sky"
    assert len(data["relatedCharts"]["transitOverlay"]["houses"]) == 12
    assert data["relatedCharts"]["transitOverlay"]["placements"][0]["body"] == "Sun"
    assert data["relatedCharts"]["transitOverlay"]["placements"][0]["sourceHouse"] is not None
    assert data["relatedCharts"]["transitOverlay"]["placements"][0]["overlayHouse"] is not None
    assert data["relatedCharts"]["transitOverlay"]["aspects"] == data["aspects"]
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

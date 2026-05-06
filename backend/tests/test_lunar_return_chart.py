from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi.testclient import TestClient

from app.main import app
from app.models.chart import BirthProfile, LunarReturnChartRequest
from app.services.lunar_return import (
    LunarReturnChartService,
    LunarReturnSearchInput,
    LunarReturnTargetContext,
    find_lunar_return_datetime,
)


client = TestClient(app)


def lunar_return_payload() -> dict:
    return {
        "primary": {
            "name": "Luna",
            "date": "1996-04-12",
            "time": "08:30",
            "locationName": "Shanghai",
            "latitude": 31.2304,
            "longitude": 121.4737,
            "timezone": "Asia/Shanghai",
        },
        "anchorDate": "2026-05-16",
        "anchorTime": "06:30",
        "returnLocation": {
            "locationName": "Seoul",
            "latitude": 37.5665,
            "longitude": 126.9780,
            "timezone": "Asia/Seoul",
        },
    }


def build_profile() -> BirthProfile:
    return BirthProfile(
        name="Luna",
        date="1996-04-12",
        time="08:30",
        locationName="Shanghai",
        latitude=31.2304,
        longitude=121.4737,
        timezone="Asia/Shanghai",
    )


def test_lunar_return_request_parses_anchor_and_return_location():
    request = LunarReturnChartRequest.model_validate(lunar_return_payload())

    assert request.anchor_date == "2026-05-16"
    assert request.anchor_time == "06:30"
    assert request.return_location.location_name == "Seoul"
    assert request.return_location.timezone == "Asia/Seoul"


def test_find_lunar_return_datetime_returns_exact_time_near_anchor():
    result = find_lunar_return_datetime(
        LunarReturnSearchInput(
            natal_profile=build_profile(),
            anchor_date="2026-05-16",
            anchor_time="06:30",
            anchor_timezone="Asia/Seoul",
        )
    )

    assert isinstance(result, datetime)
    local_result = result.astimezone(ZoneInfo("Asia/Seoul"))
    assert local_result.year == 2026
    assert local_result.month in {5, 6}


def test_lunar_return_service_delegates_to_generator(monkeypatch):
    request = LunarReturnChartRequest.model_validate(lunar_return_payload())
    service = LunarReturnChartService()
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
    assert captured["target_context"] == LunarReturnTargetContext(
        anchor_date=request.anchor_date,
        anchor_time=request.anchor_time,
        return_location=request.return_location.model_dump(by_alias=True),
    )


def test_lunar_return_endpoint_returns_natal_return_chart_and_overlay():
    response = client.post("/api/charts/lunar-return", json=lunar_return_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["chartType"] == "lunarReturn"
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "lunarReturn",
        "lunarReturnOverlay",
    }
    assert data["relatedCharts"]["primaryNatal"]["chartType"] == "natal"
    assert data["relatedCharts"]["lunarReturn"]["chartType"] == "lunarReturn"
    assert data["relatedCharts"]["lunarReturnOverlay"]["referenceName"] == "Luna"

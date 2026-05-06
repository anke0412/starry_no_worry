from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi.testclient import TestClient

from app.main import app
from app.models.chart import BirthProfile, SolarReturnChartRequest
from app.services.solar_return import (
    SolarReturnChartService,
    SolarReturnSearchInput,
    SolarReturnTargetContext,
    find_solar_return_datetime,
)


client = TestClient(app)


def solar_return_payload() -> dict:
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
        "anchorDate": "2026-04-27",
        "anchorTime": "18:00",
        "returnLocation": {
            "locationName": "Tokyo",
            "latitude": 35.6762,
            "longitude": 139.6503,
            "timezone": "Asia/Tokyo",
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


def build_january_profile() -> BirthProfile:
    return BirthProfile(
        name="古乐兽",
        date="1996-01-01",
        time="08:30",
        locationName="上海",
        latitude=31.2304,
        longitude=121.4737,
        timezone="Asia/Shanghai",
    )


def test_solar_return_request_parses_anchor_and_return_location():
    request = SolarReturnChartRequest.model_validate(solar_return_payload())

    assert request.anchor_date == "2026-04-27"
    assert request.anchor_time == "18:00"
    assert request.return_location.location_name == "Tokyo"
    assert request.return_location.timezone == "Asia/Tokyo"


def test_solar_return_endpoint_rejects_missing_return_timezone():
    payload = solar_return_payload()
    del payload["returnLocation"]["timezone"]

    response = client.post("/api/charts/solar-return", json=payload)

    assert response.status_code == 422


def test_find_solar_return_datetime_returns_exact_time_near_anchor():
    result = find_solar_return_datetime(
        SolarReturnSearchInput(
            natal_profile=build_profile(),
            anchor_date="2026-04-27",
            anchor_time="18:00",
            anchor_timezone="Asia/Tokyo",
        )
    )

    assert isinstance(result, datetime)
    assert result.year == 2026
    assert result.month == 4


def test_find_solar_return_datetime_uses_anchor_timezone():
    result = find_solar_return_datetime(
        SolarReturnSearchInput(
            natal_profile=build_profile(),
            anchor_date="2026-04-27",
            anchor_time="18:00",
            anchor_timezone="Asia/Tokyo",
        )
    )

    assert result.tzinfo is not None
    assert result.isoformat().endswith("+00:00")


def test_find_solar_return_datetime_finds_return_within_anchor_year_even_if_anchor_is_months_late():
    result = find_solar_return_datetime(
        SolarReturnSearchInput(
            natal_profile=build_january_profile(),
            anchor_date="2026-04-23",
            anchor_time="18:00",
            anchor_timezone="Asia/Shanghai",
        )
    )

    local_result = result.astimezone(ZoneInfo("Asia/Shanghai"))

    assert local_result.year == 2026
    assert local_result.month == 1


def test_solar_return_service_delegates_to_generator(monkeypatch):
    request = SolarReturnChartRequest.model_validate(solar_return_payload())
    service = SolarReturnChartService()
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
    assert captured["target_context"] == SolarReturnTargetContext(
        anchor_date=request.anchor_date,
        anchor_time=request.anchor_time,
        return_location=request.return_location.model_dump(by_alias=True),
    )


def test_solar_return_endpoint_returns_natal_return_chart_and_overlay():
    response = client.post("/api/charts/solar-return", json=solar_return_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["chartType"] == "solarReturn"
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "solarReturn",
        "solarReturnOverlay",
    }
    assert data["relatedCharts"]["primaryNatal"]["chartType"] == "natal"
    assert data["relatedCharts"]["solarReturn"]["chartType"] == "solarReturn"
    assert data["relatedCharts"]["solarReturnOverlay"]["referenceName"] == "Luna"


def test_lunar_return_endpoint_exists():
    response = client.post("/api/charts/lunar-return", json=solar_return_payload())

    assert response.status_code != 404

from datetime import timedelta
from zoneinfo import ZoneInfo

from fastapi.testclient import TestClient

from app.main import app
from app.models.chart import BirthProfile, ProgressionChartRequest
from app.services.ephemeris import EphemerisService
from app.services.progression import (
    TROPICAL_YEAR_DAYS,
    ProgressionChartService,
    ProgressionTargetContext,
    build_progression_profile,
)


client = TestClient(app)


def progression_payload() -> dict:
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
        "progressionDate": "2026-05-01",
        "progressionTime": "12:00",
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


def test_progression_service_delegates_to_generator(monkeypatch):
    request = ProgressionChartRequest.model_validate(progression_payload())
    service = ProgressionChartService()
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
    assert captured["target_context"] == ProgressionTargetContext(
        progression_date=request.progression_date,
        progression_time=request.progression_time,
    )


def test_progression_profile_preserves_primary_timezone_local_clock():
    service = EphemerisService()
    profile = build_progression_profile(
        build_profile(),
        ProgressionTargetContext(
            progression_date="2026-05-01",
            progression_time="12:00",
        ),
        service,
    )

    birth_utc = service.normalize_profile_datetime(build_profile())
    target_utc = service.normalize_local_datetime("2026-05-01", "12:00", "Asia/Shanghai")
    elapsed_days = (target_utc - birth_utc).total_seconds() / 86400
    expected_local = (birth_utc + timedelta(days=(elapsed_days / TROPICAL_YEAR_DAYS))).astimezone(ZoneInfo("Asia/Shanghai"))

    assert profile.timezone == "Asia/Shanghai"
    assert profile.date == expected_local.strftime("%Y-%m-%d")
    assert profile.time == expected_local.strftime("%H:%M")


def test_progression_endpoint_exists():
    response = client.post("/api/charts/progression", json=progression_payload())

    assert response.status_code != 404


def test_progression_endpoint_returns_natal_progressed_chart_and_overlay():
    response = client.post("/api/charts/progression", json=progression_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["chartType"] == "progression"
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "progressedChart",
        "progressedOverlay",
    }
    assert data["relatedCharts"]["primaryNatal"]["chartType"] == "natal"
    assert data["relatedCharts"]["progressedChart"]["chartType"] == "progressedChart"
    assert data["relatedCharts"]["progressedOverlay"]["referenceName"] == "Luna"

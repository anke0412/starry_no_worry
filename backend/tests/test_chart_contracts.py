from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.models.chart import (
    BirthProfile,
    ChartSettings,
    CompositeProgressionChartRequest,
    CompositeTertiaryProgressionChartRequest,
    CompositeChartRequest,
    DavisonProgressionChartRequest,
    DavisonTertiaryProgressionChartRequest,
    DavisonChartRequest,
    MarxChartRequest,
    NatalChartRequest,
    SolarArcChartRequest,
    TertiaryProgressionChartRequest,
)


client = TestClient(app)


def birth_profile_payload(name: str = "Luna") -> dict:
    return {
        "name": name,
        "date": "1996-04-12",
        "time": "08:30",
        "locationName": "Shanghai",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "timezone": "Asia/Shanghai",
    }


def test_birth_profile_requires_location_name():
    try:
        BirthProfile(name="Luna", date="1996-04-12", time="08:30")
    except ValidationError as error:
        assert error.errors()[0]["loc"] == ("locationName",)
    else:
        raise AssertionError("BirthProfile should require locationName")


def test_natal_request_uses_default_chart_settings():
    request = NatalChartRequest(primary=birth_profile_payload())

    assert request.chart_type == "natal"
    assert request.settings == ChartSettings()
    assert request.model_dump(by_alias=True)["chartType"] == "natal"


def test_composite_request_uses_default_chart_settings():
    request = CompositeChartRequest(
        primary=birth_profile_payload("Luna"),
        secondary=birth_profile_payload("Sol"),
    )

    assert request.chart_type == "composite"
    assert request.settings == ChartSettings()
    assert request.model_dump(by_alias=True)["chartType"] == "composite"


def test_davison_request_uses_default_chart_settings():
    request = DavisonChartRequest(
        primary=birth_profile_payload("Luna"),
        secondary=birth_profile_payload("Sol"),
    )

    assert request.chart_type == "davison"
    assert request.settings == ChartSettings()
    assert request.model_dump(by_alias=True)["chartType"] == "davison"


def test_marx_request_uses_default_chart_settings():
    request = MarxChartRequest(
        primary=birth_profile_payload("Luna"),
        secondary=birth_profile_payload("Sol"),
    )

    assert request.chart_type == "marx"
    assert request.settings == ChartSettings()
    assert request.model_dump(by_alias=True)["chartType"] == "marx"


def test_composite_progression_request_uses_default_chart_settings():
    request = CompositeProgressionChartRequest(
        primary=birth_profile_payload("Luna"),
        secondary=birth_profile_payload("Sol"),
        progressionDate="2026-05-01",
        progressionTime="12:00",
    )

    assert request.chart_type == "compositeProgression"
    assert request.settings == ChartSettings()
    assert request.model_dump(by_alias=True)["chartType"] == "compositeProgression"


def test_davison_progression_request_uses_default_chart_settings():
    request = DavisonProgressionChartRequest(
        primary=birth_profile_payload("Luna"),
        secondary=birth_profile_payload("Sol"),
        progressionDate="2026-05-01",
        progressionTime="12:00",
    )

    assert request.chart_type == "davisonProgression"
    assert request.settings == ChartSettings()
    assert request.model_dump(by_alias=True)["chartType"] == "davisonProgression"


def test_solar_arc_request_uses_default_chart_settings():
    request = SolarArcChartRequest(
        primary=birth_profile_payload("Luna"),
        solarArcDate="2026-05-01",
        solarArcTime="12:00",
    )

    assert request.chart_type == "solarArc"
    assert request.settings == ChartSettings()
    assert request.model_dump(by_alias=True)["chartType"] == "solarArc"


def test_tertiary_progression_request_uses_default_chart_settings():
    request = TertiaryProgressionChartRequest(
        primary=birth_profile_payload("Luna"),
        tertiaryDate="2026-05-01",
        tertiaryTime="12:00",
    )

    assert request.chart_type == "tertiaryProgression"
    assert request.settings == ChartSettings()
    assert request.model_dump(by_alias=True)["chartType"] == "tertiaryProgression"


def test_composite_tertiary_progression_request_uses_default_chart_settings():
    request = CompositeTertiaryProgressionChartRequest(
        primary=birth_profile_payload("Luna"),
        secondary=birth_profile_payload("Sol"),
        tertiaryDate="2026-05-01",
        tertiaryTime="12:00",
    )

    assert request.chart_type == "compositeTertiaryProgression"
    assert request.settings == ChartSettings()
    assert request.model_dump(by_alias=True)["chartType"] == "compositeTertiaryProgression"


def test_davison_tertiary_progression_request_uses_default_chart_settings():
    request = DavisonTertiaryProgressionChartRequest(
        primary=birth_profile_payload("Luna"),
        secondary=birth_profile_payload("Sol"),
        tertiaryDate="2026-05-01",
        tertiaryTime="12:00",
    )

    assert request.chart_type == "davisonTertiaryProgression"
    assert request.settings == ChartSettings()
    assert request.model_dump(by_alias=True)["chartType"] == "davisonTertiaryProgression"


def test_chart_endpoints_are_registered_in_openapi_schema():
    schema = client.get("/openapi.json").json()

    assert "/api/charts/natal" in schema["paths"]
    assert "/api/charts/synastry" in schema["paths"]
    assert "/api/charts/transit" in schema["paths"]
    assert "/api/charts/composite" in schema["paths"]
    assert "/api/charts/davison" in schema["paths"]
    assert "/api/charts/marx" in schema["paths"]
    assert "/api/charts/composite-progression" in schema["paths"]
    assert "/api/charts/davison-progression" in schema["paths"]
    assert "/api/charts/solar-arc" in schema["paths"]
    assert "/api/charts/tertiary-progression" in schema["paths"]
    assert "/api/charts/composite-tertiary-progression" in schema["paths"]
    assert "/api/charts/davison-tertiary-progression" in schema["paths"]


def test_natal_endpoint_accepts_contract_and_returns_chart_result():
    response = client.post("/api/charts/natal", json={"primary": birth_profile_payload()})

    assert response.status_code == 200
    assert response.json()["chartType"] == "natal"


def test_synastry_endpoint_requires_secondary_profile():
    response = client.post("/api/charts/synastry", json={"primary": birth_profile_payload()})

    assert response.status_code == 422


def test_composite_endpoint_requires_secondary_profile():
    response = client.post("/api/charts/composite", json={"primary": birth_profile_payload()})

    assert response.status_code == 422


def test_davison_endpoint_requires_secondary_profile():
    response = client.post("/api/charts/davison", json={"primary": birth_profile_payload()})

    assert response.status_code == 422


def test_marx_endpoint_requires_secondary_profile():
    response = client.post("/api/charts/marx", json={"primary": birth_profile_payload()})

    assert response.status_code == 422


def test_composite_progression_endpoint_requires_secondary_profile():
    response = client.post(
        "/api/charts/composite-progression",
        json={
            "primary": birth_profile_payload(),
            "progressionDate": "2026-05-01",
            "progressionTime": "12:00",
        },
    )

    assert response.status_code == 422


def test_davison_progression_endpoint_requires_secondary_profile():
    response = client.post(
        "/api/charts/davison-progression",
        json={
            "primary": birth_profile_payload(),
            "progressionDate": "2026-05-01",
            "progressionTime": "12:00",
        },
    )

    assert response.status_code == 422


def test_composite_endpoint_accepts_contract_and_returns_chart_result():
    response = client.post(
        "/api/charts/composite",
        json={
            "primary": birth_profile_payload("Luna"),
            "secondary": birth_profile_payload("Sol"),
        },
    )

    assert response.status_code == 200
    assert response.json()["chartType"] == "composite"
    assert set(response.json()["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "compositeChart",
    }


def test_davison_endpoint_accepts_contract_and_returns_chart_result():
    response = client.post(
        "/api/charts/davison",
        json={
            "primary": birth_profile_payload("Luna"),
            "secondary": birth_profile_payload("Sol"),
        },
    )

    assert response.status_code == 200
    assert response.json()["chartType"] == "davison"
    assert set(response.json()["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "davisonChart",
    }


def test_marx_endpoint_accepts_contract_and_returns_chart_result():
    response = client.post(
        "/api/charts/marx",
        json={
            "primary": birth_profile_payload("Luna"),
            "secondary": birth_profile_payload("Sol"),
        },
    )

    assert response.status_code == 200
    assert response.json()["chartType"] == "marx"
    assert set(response.json()["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "davisonChart",
        "primaryMarxChart",
        "secondaryMarxChart",
    }


def test_composite_progression_endpoint_accepts_contract_and_returns_chart_result():
    response = client.post(
        "/api/charts/composite-progression",
        json={
            "primary": birth_profile_payload("Luna"),
            "secondary": birth_profile_payload("Sol"),
            "progressionDate": "2026-05-01",
            "progressionTime": "12:00",
        },
    )

    assert response.status_code == 200
    assert response.json()["chartType"] == "compositeProgression"
    assert set(response.json()["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "compositeChart",
        "progressedChart",
        "progressedOverlay",
    }


def test_davison_progression_endpoint_accepts_contract_and_returns_chart_result():
    response = client.post(
        "/api/charts/davison-progression",
        json={
            "primary": birth_profile_payload("Luna"),
            "secondary": birth_profile_payload("Sol"),
            "progressionDate": "2026-05-01",
            "progressionTime": "12:00",
        },
    )

    assert response.status_code == 200
    assert response.json()["chartType"] == "davisonProgression"
    assert set(response.json()["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "davisonChart",
        "progressedChart",
        "progressedOverlay",
    }


def test_synastry_endpoint_accepts_contract_and_returns_chart_result():
    response = client.post(
        "/api/charts/synastry",
        json={
            "primary": birth_profile_payload("Luna"),
            "secondary": birth_profile_payload("Sol"),
        },
    )

    assert response.status_code == 200
    assert response.json()["chartType"] == "synastry"


def test_transit_endpoint_requires_transit_date_and_time():
    response = client.post("/api/charts/transit", json={"primary": birth_profile_payload()})

    assert response.status_code == 422


def test_solar_arc_endpoint_requires_target_date_and_time():
    response = client.post("/api/charts/solar-arc", json={"primary": birth_profile_payload()})

    assert response.status_code == 422


def test_tertiary_progression_endpoint_requires_target_date_and_time():
    response = client.post("/api/charts/tertiary-progression", json={"primary": birth_profile_payload()})

    assert response.status_code == 422


def test_composite_tertiary_progression_endpoint_requires_target_date_and_time():
    response = client.post(
        "/api/charts/composite-tertiary-progression",
        json={
            "primary": birth_profile_payload(),
            "secondary": birth_profile_payload("Sol"),
        },
    )

    assert response.status_code == 422


def test_davison_tertiary_progression_endpoint_requires_target_date_and_time():
    response = client.post(
        "/api/charts/davison-tertiary-progression",
        json={
            "primary": birth_profile_payload(),
            "secondary": birth_profile_payload("Sol"),
        },
    )

    assert response.status_code == 422


def test_transit_endpoint_accepts_contract_and_returns_chart_result():
    response = client.post(
        "/api/charts/transit",
        json={
            "primary": birth_profile_payload(),
            "transitDate": "2026-05-01",
            "transitTime": "12:00",
        },
    )

    assert response.status_code == 200
    assert response.json()["chartType"] == "transit"


def test_solar_arc_endpoint_accepts_contract_and_returns_chart_result():
    response = client.post(
        "/api/charts/solar-arc",
        json={
            "primary": birth_profile_payload(),
            "solarArcDate": "2026-05-01",
            "solarArcTime": "12:00",
        },
    )

    assert response.status_code == 200
    assert response.json()["chartType"] == "solarArc"
    assert set(response.json()["relatedCharts"].keys()) == {
        "primaryNatal",
        "solarArcChart",
        "solarArcOverlay",
    }


def test_tertiary_progression_endpoint_accepts_contract_and_returns_chart_result():
    response = client.post(
        "/api/charts/tertiary-progression",
        json={
            "primary": birth_profile_payload(),
            "tertiaryDate": "2026-05-01",
            "tertiaryTime": "12:00",
        },
    )

    assert response.status_code == 200
    assert response.json()["chartType"] == "tertiaryProgression"
    assert set(response.json()["relatedCharts"].keys()) == {
        "primaryNatal",
        "tertiaryProgressedChart",
        "tertiaryProgressedOverlay",
    }


def test_composite_tertiary_progression_endpoint_accepts_contract_and_returns_chart_result():
    response = client.post(
        "/api/charts/composite-tertiary-progression",
        json={
            "primary": birth_profile_payload("Luna"),
            "secondary": birth_profile_payload("Sol"),
            "tertiaryDate": "2026-05-01",
            "tertiaryTime": "12:00",
        },
    )

    assert response.status_code == 200
    assert response.json()["chartType"] == "compositeTertiaryProgression"
    assert set(response.json()["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "compositeChart",
        "tertiaryProgressedChart",
        "tertiaryProgressedOverlay",
    }


def test_davison_tertiary_progression_endpoint_accepts_contract_and_returns_chart_result():
    response = client.post(
        "/api/charts/davison-tertiary-progression",
        json={
            "primary": birth_profile_payload("Luna"),
            "secondary": birth_profile_payload("Sol"),
            "tertiaryDate": "2026-05-01",
            "tertiaryTime": "12:00",
        },
    )

    assert response.status_code == 200
    assert response.json()["chartType"] == "davisonTertiaryProgression"
    assert set(response.json()["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "davisonChart",
        "tertiaryProgressedChart",
        "tertiaryProgressedOverlay",
    }

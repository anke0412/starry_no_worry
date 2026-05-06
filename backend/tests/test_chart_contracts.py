from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.models.chart import (
    BirthProfile,
    ChartSettings,
    CompositeChartRequest,
    DavisonChartRequest,
    NatalChartRequest,
    RelationshipTransitChartRequest,
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


def test_relationship_transit_request_uses_default_chart_settings():
    request = RelationshipTransitChartRequest(
        primary=birth_profile_payload("Luna"),
        secondary=birth_profile_payload("Sol"),
        transitDate="2026-05-01",
        transitTime="12:00",
    )

    assert request.chart_type == "relationshipTransit"
    assert request.settings == ChartSettings()
    assert request.model_dump(by_alias=True)["chartType"] == "relationshipTransit"


def test_chart_endpoints_are_registered_in_openapi_schema():
    schema = client.get("/openapi.json").json()

    assert "/api/charts/natal" in schema["paths"]
    assert "/api/charts/synastry" in schema["paths"]
    assert "/api/charts/transit" in schema["paths"]
    assert "/api/charts/relationship-transit" in schema["paths"]
    assert "/api/charts/composite" in schema["paths"]
    assert "/api/charts/davison" in schema["paths"]


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


def test_relationship_transit_endpoint_requires_secondary_profile_and_transit_datetime():
    response = client.post("/api/charts/relationship-transit", json={"primary": birth_profile_payload()})

    assert response.status_code == 422


def test_relationship_transit_endpoint_accepts_contract_and_returns_chart_result():
    response = client.post(
        "/api/charts/relationship-transit",
        json={
            "primary": birth_profile_payload("Luna"),
            "secondary": birth_profile_payload("Sol"),
            "transitDate": "2026-05-01",
            "transitTime": "12:00",
        },
    )

    assert response.status_code == 200
    assert response.json()["chartType"] == "relationshipTransit"

from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.models.chart import BirthProfile, ChartSettings, NatalChartRequest


client = TestClient(app)


def birth_profile_payload(name: str = "Luna") -> dict:
    return {
        "name": name,
        "date": "1996-04-12",
        "time": "08:30",
        "locationName": "Shanghai",
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


def test_chart_endpoints_are_registered_in_openapi_schema():
    schema = client.get("/openapi.json").json()

    assert "/api/charts/natal" in schema["paths"]
    assert "/api/charts/synastry" in schema["paths"]
    assert "/api/charts/transit" in schema["paths"]


def test_natal_endpoint_accepts_contract_and_returns_not_implemented():
    response = client.post("/api/charts/natal", json={"primary": birth_profile_payload()})

    assert response.status_code == 501
    assert response.json() == {
        "error": {
            "code": "not_implemented",
            "message": "Chart calculation endpoint is not implemented yet.",
        }
    }


def test_synastry_endpoint_requires_secondary_profile():
    response = client.post("/api/charts/synastry", json={"primary": birth_profile_payload()})

    assert response.status_code == 422


def test_transit_endpoint_requires_transit_date_and_time():
    response = client.post("/api/charts/transit", json={"primary": birth_profile_payload()})

    assert response.status_code == 422

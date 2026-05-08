from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def marx_payload() -> dict:
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


def test_marx_endpoint_returns_dual_relationship_charts():
    response = client.post("/api/charts/marx", json=marx_payload())

    assert response.status_code == 200
    data = response.json()

    assert data["chartType"] == "marx"
    assert data["title"] == "Luna × Sol Marx Chart"
    assert data["placements"] == []
    assert data["aspects"] == []
    assert set(data["relatedCharts"].keys()) == {
        "primaryNatal",
        "secondaryNatal",
        "davisonChart",
        "primaryMarxChart",
        "secondaryMarxChart",
    }
    assert data["relatedCharts"]["primaryMarxChart"]["chartType"] == "marxChart"
    assert data["relatedCharts"]["secondaryMarxChart"]["chartType"] == "marxChart"
    assert len(data["relatedCharts"]["primaryMarxChart"]["placements"]) >= 18
    assert len(data["relatedCharts"]["secondaryMarxChart"]["placements"]) >= 18

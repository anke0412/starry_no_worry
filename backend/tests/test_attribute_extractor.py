from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_attribute_extraction_endpoint_preserves_output_schema(monkeypatch):
    from app.services.attribute_extractor import AttributeExtractionService

    def fake_complete(self, prompt: str) -> str:
        return """
        {
          "brand_name": ["Anker", "Baseus"],
          "industry": "consumer electronics",
          "product_name": ["wireless charger", "power bank"],
          "attribute and attribute_value": {
            "color": ["black", "white"],
            "capacity": "10000mAh"
          }
        }
        """

    monkeypatch.setattr(AttributeExtractionService, "_complete", fake_complete)

    response = client.post(
        "/api/attributes/extract",
        json={"text": "Ankr mangetic chargre 10000mah black or white from brand site comments"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "text": "Ankr mangetic chargre 10000mah black or white from brand site comments",
        "result": {
            "brand_name": "Anker|Baseus",
            "industry": "consumer electronics",
            "product_name": "wireless charger|power bank",
            "attribute and attribute_value": "color|black|white,capacity|10000mAh",
        },
        "rawResponse": """
        {
          "brand_name": ["Anker", "Baseus"],
          "industry": "consumer electronics",
          "product_name": ["wireless charger", "power bank"],
          "attribute and attribute_value": {
            "color": ["black", "white"],
            "capacity": "10000mAh"
          }
        }
        """,
    }


def test_attribute_extraction_missing_values_become_null(monkeypatch):
    from app.services.attribute_extractor import AttributeExtractionService

    def fake_complete(self, prompt: str) -> str:
        return '{"brand_name": "", "industry": [], "product_name": null, "attribute and attribute_value": {}}'

    monkeypatch.setattr(AttributeExtractionService, "_complete", fake_complete)

    response = client.post(
        "/api/attributes/extract",
        json={"text": "random comment without useful product facts"},
    )

    assert response.status_code == 200
    assert response.json()["result"] == {
        "brand_name": "null",
        "industry": "null",
        "product_name": "null",
        "attribute and attribute_value": "null",
    }


def test_attribute_extractor_falls_back_to_curl_when_urlopen_fails(monkeypatch):
    import json
    from subprocess import CompletedProcess
    from urllib.error import URLError

    from app.services.attribute_extractor import AttributeExtractionService

    monkeypatch.setenv("ATTRIBUTE_LLM_API_URL", "https://example.com/v1/chat/completions")
    monkeypatch.setenv("ATTRIBUTE_LLM_API_KEY", "Bearer test-key")

    def fake_urlopen(req, timeout):
        raise URLError("ssl eof")

    def fake_run(command, input, stdout, stderr, check):
        payload = {
            "choices": [
                {
                    "message": {
                        "content": json.dumps(
                            {
                                "brand_name": "Anker",
                                "industry": "consumer electronics",
                                "product_name": "power bank",
                                "attribute and attribute_value": "capacity|10000mAh",
                            }
                        )
                    }
                }
            ]
        }
        return CompletedProcess(command, 0, stdout=json.dumps(payload).encode("utf-8"), stderr=b"")

    monkeypatch.setattr("app.services.attribute_extractor.request.urlopen", fake_urlopen)
    monkeypatch.setattr("app.services.attribute_extractor.subprocess.run", fake_run)

    extraction = AttributeExtractionService().extract("Ankr powr bank 10000mah")

    assert extraction.result.model_dump(by_alias=True) == {
        "brand_name": "Anker",
        "industry": "consumer electronics",
        "product_name": "power bank",
        "attribute and attribute_value": "capacity|10000mAh",
    }

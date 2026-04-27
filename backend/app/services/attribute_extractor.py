import json
import os
import subprocess
from dataclasses import dataclass
from typing import Any
from urllib import error, request

from app.models.attribute_extraction import ExtractedAttributes


TEST_INPUT_TEXT = (
    "Ankr 20w magnatic powr bank for iphone, maybe Anker or Baseus, 10000mah, "
    "black/white, comments say charging is fast but no clear category."
)

DEFAULT_ATTRIBUTE_RESULT = {
    "brand_name": "null",
    "industry": "null",
    "product_name": "null",
    "attribute and attribute_value": "null",
}


@dataclass
class AttributeExtractionResult:
    result: ExtractedAttributes
    raw_response: str


class AttributeExtractionService:
    def extract(self, text: str) -> AttributeExtractionResult:
        prompt = self._build_prompt(text)
        raw_response = self._complete(prompt)
        payload = self._parse_json_object(raw_response)
        normalized = self._normalize_payload(payload)
        return AttributeExtractionResult(
            result=ExtractedAttributes.model_validate(normalized),
            raw_response=raw_response,
        )

    def _build_prompt(self, text: str) -> str:
        schema = json.dumps(DEFAULT_ATTRIBUTE_RESULT, ensure_ascii=False)
        return f"""
You are an information extraction assistant for noisy commerce text.

Task:
1. Read messy input text from brand sites, e-commerce listings, or user comments.
2. Correct likely misspellings mentally before extracting facts.
3. Keep multiple plausible choices by joining them with "|".
4. If a field has no reliable evidence, return the literal string "null".
5. Always return one JSON object only. No markdown. No explanation.
6. Keep the JSON keys exactly as requested.

Output schema:
{schema}

Formatting rules:
- brand_name, industry, and product_name must always be strings.
- "attribute and attribute_value" must always be a string.
- For attributes, format as "attribute1|value1,attribute2|value2".
- If one attribute has multiple values, keep them in the same segment like "color|black|white".
- Never invent unsupported facts.

Input text:
\"\"\"{text}\"\"\"
        """.strip()

    def _complete(self, prompt: str) -> str:
        api_url = os.getenv("ATTRIBUTE_LLM_API_URL") or os.getenv("LLM_API_URL")
        api_key = os.getenv("ATTRIBUTE_LLM_API_KEY") or os.getenv("LLM_API_KEY")
        model = os.getenv("ATTRIBUTE_LLM_MODEL") or os.getenv("LLM_MODEL") or "gpt-5.2"
        if not api_url or not api_key:
            raise ValueError("Missing ATTRIBUTE_LLM_API_URL/ATTRIBUTE_LLM_API_KEY configuration.")

        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1024,
            "temperature": 0.0,
        }
        req = request.Request(
            api_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": api_key,
            },
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=90) as response:
                body = json.loads(response.read().decode("utf-8"))
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise ValueError(f"LLM request failed with HTTP {exc.code}: {detail[:200]}") from exc
        except error.URLError as exc:
            body = self._complete_with_curl(api_url, api_key, payload, exc)

        return body["choices"][0]["message"]["content"]

    def _complete_with_curl(
        self,
        api_url: str,
        api_key: str,
        payload: dict[str, Any],
        original_error: Exception,
    ) -> dict[str, Any]:
        curl_command = [
            "curl",
            "--silent",
            "--show-error",
            "--fail",
            "-X",
            "POST",
            api_url,
            "-H",
            "Content-Type: application/json",
            "-H",
            f"Authorization: {api_key}",
            "--data-binary",
            "@-",
        ]
        try:
            completed = subprocess.run(
                curl_command,
                input=json.dumps(payload).encode("utf-8"),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
            )
        except subprocess.CalledProcessError as exc:
            detail = exc.stderr.decode("utf-8", errors="ignore")
            raise ValueError(
                f"LLM request failed: {original_error}; curl fallback failed: {detail[:200]}"
            ) from exc

        return json.loads(completed.stdout.decode("utf-8"))

    def _parse_json_object(self, raw_response: str) -> dict[str, Any]:
        if not raw_response or not raw_response.strip():
            return {}

        try:
            payload = json.loads(raw_response)
            return payload if isinstance(payload, dict) else {}
        except json.JSONDecodeError:
            start = raw_response.find("{")
            end = raw_response.rfind("}")
            if start == -1 or end == -1 or end <= start:
                return {}
            try:
                payload = json.loads(raw_response[start : end + 1])
                return payload if isinstance(payload, dict) else {}
            except json.JSONDecodeError:
                return {}

    def _normalize_payload(self, payload: dict[str, Any]) -> dict[str, str]:
        return {
            "brand_name": self._normalize_pipe_text(payload.get("brand_name")),
            "industry": self._normalize_pipe_text(payload.get("industry")),
            "product_name": self._normalize_pipe_text(payload.get("product_name")),
            "attribute and attribute_value": self._normalize_attributes(
                payload.get("attribute and attribute_value")
            ),
        }

    def _normalize_pipe_text(self, value: Any) -> str:
        items = self._flatten_to_strings(value)
        return "|".join(items) if items else "null"

    def _normalize_attributes(self, value: Any) -> str:
        if isinstance(value, dict):
            segments = []
            for attribute, attribute_value in value.items():
                name = self._clean_text(attribute)
                values = self._flatten_to_strings(attribute_value)
                if not name or not values:
                    continue
                segments.append("|".join([name, *values]))
            return ",".join(segments) if segments else "null"

        if isinstance(value, list):
            segments = []
            for item in value:
                if not isinstance(item, dict):
                    continue
                name = self._clean_text(
                    item.get("attribute")
                    or item.get("attribute_name")
                    or item.get("name")
                    or item.get("key")
                )
                values = self._flatten_to_strings(
                    item.get("attribute_value") or item.get("value") or item.get("values")
                )
                if not name or not values:
                    continue
                segments.append("|".join([name, *values]))
            return ",".join(segments) if segments else "null"

        cleaned = self._clean_text(value)
        return cleaned or "null"

    def _flatten_to_strings(self, value: Any) -> list[str]:
        if value is None:
            return []
        if isinstance(value, list):
            results: list[str] = []
            for item in value:
                results.extend(self._flatten_to_strings(item))
            return self._dedupe(results)
        cleaned = self._clean_text(value)
        return [cleaned] if cleaned else []

    def _clean_text(self, value: Any) -> str:
        if value is None:
            return ""
        text = str(value).strip()
        if not text or text.lower() == "null":
            return ""
        return text

    def _dedupe(self, items: list[str]) -> list[str]:
        seen: set[str] = set()
        deduped: list[str] = []
        for item in items:
            normalized = item.casefold()
            if normalized in seen:
                continue
            seen.add(normalized)
            deduped.append(item)
        return deduped

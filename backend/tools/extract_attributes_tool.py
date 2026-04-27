#!/usr/bin/env python3
import argparse
import json
import os
import sys

CURRENT_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.services.attribute_extractor import TEST_INPUT_TEXT, AttributeExtractionService


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Extract structured brand/product attributes from messy text with an LLM."
    )
    parser.add_argument(
        "--text",
        default=TEST_INPUT_TEXT,
        help="Input text to extract attributes from. Defaults to the built-in noisy test string.",
    )
    parser.add_argument(
        "--show-prompt",
        action="store_true",
        help="Print the prompt before calling the LLM.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    service = AttributeExtractionService()

    if args.show_prompt:
        print("PROMPT:")
        print(service._build_prompt(args.text))
        print()

    extraction = service.extract(args.text)
    print("INPUT:")
    print(args.text)
    print()
    print("RAW_RESPONSE:")
    print(extraction.raw_response)
    print()
    print("NORMALIZED_RESULT:")
    print(json.dumps(extraction.result.model_dump(by_alias=True), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

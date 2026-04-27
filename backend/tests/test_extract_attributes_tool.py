from tools.extract_attributes_tool import build_parser
from app.services.attribute_extractor import TEST_INPUT_TEXT


def test_tool_defaults_to_builtin_test_string():
    parser = build_parser()
    args = parser.parse_args([])

    assert args.text == TEST_INPUT_TEXT

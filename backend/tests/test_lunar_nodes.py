from datetime import datetime, timezone

from app.services.lunar_nodes import LunarNodeService


def test_calculates_mean_lunar_nodes_as_opposite_points():
    service = LunarNodeService()

    nodes = service.calculate(datetime(2000, 1, 1, 12, 0, tzinfo=timezone.utc))

    assert nodes.north_node.body == "North Node"
    assert nodes.south_node.body == "South Node"
    assert nodes.north_node.sign == "Leo"
    assert nodes.south_node.sign == "Aquarius"
    assert nodes.north_node.longitude == 125.040646
    assert nodes.south_node.longitude == 305.040646

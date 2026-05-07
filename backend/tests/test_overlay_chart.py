from app.models.chart import ChartResult, HouseCusp, Placement
from app.services.overlay import ChartOverlayService


def placement(body: str, longitude: float, house: int | None = None, retrograde: bool | None = None) -> Placement:
    return Placement(
        body=body,
        longitude=longitude,
        sign="Aries",
        degree=0,
        minute=0,
        house=house,
        retrograde=retrograde,
    )


def house_cusp(house: int, longitude: float) -> HouseCusp:
    return HouseCusp(
        house=house,
        longitude=longitude,
        sign="Aries",
        degree=0,
        minute=0,
    )


def chart(chart_id: str, title: str, placements: list[Placement], houses: list[HouseCusp]) -> ChartResult:
    return ChartResult(
        chartId=chart_id,
        chartType="natal",
        title=title,
        profiles=[],
        calculation={
            "engine": "test",
            "engineVersion": "test",
            "calculatedAt": "2026-04-22T00:00:00+00:00",
        },
        placements=placements,
        houses=houses,
        aspects=[],
    )


def test_builds_overlay_placements_against_reference_houses_and_inter_chart_aspects():
    reference = chart(
        "natal-a",
        "A Natal Chart",
        [placement("Sun", 10, house=1), placement("Moon", 80, house=3)],
        [house_cusp(index + 1, index * 30) for index in range(12)],
    )
    overlay = chart(
        "natal-b",
        "B Natal Chart",
        [placement("Venus", 70.5, house=2, retrograde=True), placement("Mars", 200.2, house=7, retrograde=False)],
        [house_cusp(index + 1, index * 30) for index in range(12)],
    )

    result = ChartOverlayService().build(
        overlay_id="b-in-a",
        label="B in A houses",
        reference_chart=reference,
        overlay_chart=overlay,
    )

    assert result.overlay_id == "b-in-a"
    assert result.reference_chart_id == "natal-a"
    assert result.overlay_chart_id == "natal-b"
    assert len(result.houses) == 12
    assert result.placements[0].body == "Venus"
    assert result.placements[0].source_house == 2
    assert result.placements[0].overlay_house == 3
    assert result.placements[0].retrograde is True
    assert result.placements[1].body == "Mars"
    assert result.placements[1].source_house == 7
    assert result.placements[1].overlay_house == 7
    assert result.placements[1].retrograde is False
    assert result.aspects[0].from_body == "Moon"
    assert result.aspects[0].to_body == "Mars"
    assert result.aspects[0].type == "trine"

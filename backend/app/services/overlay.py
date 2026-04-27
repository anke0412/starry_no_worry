from app.models.chart import Aspect, ChartOverlay, ChartResult, OverlayPlacement, Placement
from app.services.aspects import angular_distance, closest_aspect, resolve_aspect_set, resolve_orb_limit
from app.services.houses import assign_house


class ChartOverlayService:
    def build(
        self,
        overlay_id: str,
        label: str,
        reference_chart: ChartResult,
        overlay_chart: ChartResult,
        aspect_set: str = "major",
        orb_profile: str = "default",
    ) -> ChartOverlay:
        reference_house_cusps = [house.longitude for house in reference_chart.houses]
        reference_placements = aspect_eligible_placements(reference_chart.placements)
        overlay_placements = aspect_eligible_placements(overlay_chart.placements)
        definitions = resolve_aspect_set(aspect_set)
        orb_limit = resolve_orb_limit(orb_profile)

        return ChartOverlay(
            overlayId=overlay_id,
            label=label,
            referenceChartId=reference_chart.chart_id,
            overlayChartId=overlay_chart.chart_id,
            referenceName=chart_name(reference_chart),
            overlayName=chart_name(overlay_chart),
            houses=reference_chart.houses,
            placements=[
                build_overlay_placement(placement, reference_house_cusps)
                for placement in overlay_placements
            ],
            aspects=calculate_inter_chart_aspects(
                reference_placements,
                overlay_placements,
                definitions=definitions,
                orb_limit=orb_limit,
            ),
        )


def build_overlay_placement(placement: Placement, reference_house_cusps: list[float]) -> OverlayPlacement:
    return OverlayPlacement(
        body=placement.body,
        longitude=placement.longitude,
        sign=placement.sign,
        degree=placement.degree,
        minute=placement.minute,
        sourceHouse=placement.house,
        overlayHouse=assign_house(placement.longitude, reference_house_cusps),
        retrograde=placement.retrograde,
    )


def aspect_eligible_placements(placements: list[Placement]) -> list[Placement]:
    return [
        placement
        for placement in placements
        if placement.body not in {"Ascendant", "Midheaven"}
    ]


def calculate_inter_chart_aspects(
    reference_placements: list[Placement],
    overlay_placements: list[Placement],
    definitions: dict[str, float],
    orb_limit: float,
) -> list[Aspect]:
    aspects: list[Aspect] = []

    for reference in reference_placements:
        for overlay in overlay_placements:
            angle = angular_distance(reference.longitude, overlay.longitude)
            aspect = closest_aspect(angle, definitions, orb_limit)

            if aspect is None:
                continue

            aspect_type, orb = aspect
            aspects.append(
                Aspect(
                    **{
                        "from": reference.body,
                        "to": overlay.body,
                        "type": aspect_type,
                        "angle": round(angle, 6),
                        "orb": round(orb, 6),
                    }
                )
            )

    return sorted(aspects, key=lambda item: item.orb)


def chart_name(chart: ChartResult) -> str:
    if chart.profiles:
        return chart.profiles[0].name

    return chart.title

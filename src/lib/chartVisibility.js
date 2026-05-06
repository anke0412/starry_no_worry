export const defaultVisibilitySettings = {
  showNodes: true,
  showSupplementalPoints: true,
  showAngles: true,
};

const NODE_BODIES = new Set(["北交点", "南交点"]);
const SUPPLEMENTAL_POINT_BODIES = new Set(["凯龙星", "莉莉丝", "福点", "宿命点"]);
const ANGLE_BODIES = new Set(["上升点", "天顶"]);

export function applyVisibilityFilters(chart, visibility = defaultVisibilitySettings) {
  const isVisible = buildVisibilityMatcher(visibility);

  return {
    ...chart,
    placements: (chart.placements ?? []).filter((placement) => isVisible(placement.planet)),
    placementGroups: (chart.placementGroups ?? [])
      .map((group) => ({
        ...group,
        placements: (group.placements ?? []).filter((placement) => isVisible(placement.planet)),
      }))
      .filter((group) => group.placements.length > 0),
    aspects: (chart.aspects ?? []).filter((aspect) => isVisible(aspect.from) && isVisible(aspect.to)),
    overlays: (chart.overlays ?? [])
      .map((overlay) => ({
        ...overlay,
        placements: (overlay.placements ?? []).filter((placement) => isVisible(placement.planet)),
        aspects: (overlay.aspects ?? []).filter((aspect) => isVisible(aspect.from) && isVisible(aspect.to)),
      }))
      .filter((overlay) => overlay.placements.length > 0),
  };
}

function buildVisibilityMatcher(visibility) {
  return (planet) => {
    if (!visibility.showNodes && NODE_BODIES.has(planet)) {
      return false;
    }

    if (!visibility.showSupplementalPoints && SUPPLEMENTAL_POINT_BODIES.has(planet)) {
      return false;
    }

    if (!visibility.showAngles && ANGLE_BODIES.has(planet)) {
      return false;
    }

    return true;
  };
}

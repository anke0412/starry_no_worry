const NODE_PLANETS = new Set(["北交点", "南交点"]);
const SUPPLEMENTAL_PLANETS = new Set(["凯龙星", "莉莉丝", "福点", "宿命点"]);
const ANGLE_PLANETS = new Set(["上升点", "天顶"]);

export const defaultVisibilitySettings = {
  showNodes: true,
  showSupplementalPoints: true,
  showAngles: true,
};

export function applyVisibilityFilters(chart, visibility = defaultVisibilitySettings) {
  const placements = filterPlacements(chart.placements ?? [], visibility);
  const placementGroups = (chart.placementGroups ?? []).map((group) => ({
    ...group,
    placements: filterPlacements(group.placements ?? [], visibility),
  }));
  const visiblePlanets = new Set(placementGroups.flatMap((group) => group.placements.map((placement) => placement.planet)));
  const aspects = filterAspects(chart.aspects ?? [], visiblePlanets);
  const overlays = (chart.overlays ?? []).map((overlay) => ({
    ...overlay,
    placements: filterPlacements(overlay.placements ?? [], visibility),
    aspects: filterAspects(overlay.aspects ?? [], visiblePlanets),
  }));

  return {
    ...chart,
    placements,
    placementGroups,
    aspects,
    overlays,
  };
}

function filterPlacements(placements, visibility) {
  return placements.filter((placement) => isPlanetVisible(placement.planet, visibility));
}

function filterAspects(aspects, visiblePlanets) {
  return aspects.filter((aspect) => visiblePlanets.has(aspect.from) && visiblePlanets.has(aspect.to));
}

function isPlanetVisible(planet, visibility) {
  if (!visibility.showNodes && NODE_PLANETS.has(planet)) {
    return false;
  }

  if (!visibility.showSupplementalPoints && SUPPLEMENTAL_PLANETS.has(planet)) {
    return false;
  }

  if (!visibility.showAngles && ANGLE_PLANETS.has(planet)) {
    return false;
  }

  return true;
}

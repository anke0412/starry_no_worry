export function buildPlacementSelectionKey(placement, groupId = "default") {
  return JSON.stringify({
    groupId,
    planet: placement.planet ?? "",
    longitude: Number(placement.longitude ?? 0),
  });
}

export function buildAspectSelectionKeys(aspect, placementGroups = []) {
  if (placementGroups.length === 0) {
    return [];
  }

  if (aspect.fromGroupId || aspect.toGroupId) {
    return [
      findPlacementSelectionKey(findGroupById(placementGroups, aspect.fromGroupId), aspect.from),
      findPlacementSelectionKey(findGroupById(placementGroups, aspect.toGroupId), aspect.to),
    ].filter(Boolean);
  }

  if (placementGroups.length === 1) {
    return [aspect.from, aspect.to]
      .map((planet) => findPlacementSelectionKey(placementGroups[0], planet))
      .filter(Boolean);
  }

  return [
    findPlacementSelectionKey(placementGroups[0], aspect.from),
    findPlacementSelectionKey(placementGroups[1], aspect.to),
  ].filter(Boolean);
}

export function buildOverlaySelectionKeys(placement, placementGroups = []) {
  for (const group of placementGroups) {
    const selectionKey = findPlacementSelectionKey(group, placement.planet, placement.longitude);

    if (selectionKey) {
      return [selectionKey];
    }
  }

  return [];
}

function findPlacementSelectionKey(group, planet, longitude = undefined) {
  if (!group) {
    return null;
  }

  const placement = (group.placements ?? []).find(
    (item) =>
      item.planet === planet &&
      (longitude === undefined || Number(item.longitude ?? 0) === Number(longitude ?? 0)),
  );

  return placement ? buildPlacementSelectionKey(placement, group.id) : null;
}

function findGroupById(groups, groupId) {
  return groups.find((group) => group.id === groupId) ?? null;
}

export function buildPlacementSelectionKey(placement, groupId) {
  return `${groupId}:${placement.planet}`;
}

export function buildAspectSelectionKeys(aspect, placementGroups) {
  const fromGroupId = aspect.fromGroupId ?? findGroupIdForPlanet(placementGroups, aspect.fromOwner, aspect.from);
  const toGroupId = aspect.toGroupId ?? findGroupIdForPlanet(placementGroups, aspect.toOwner, aspect.to);

  return compactKeys([
    fromGroupId ? buildPlacementSelectionKey({ planet: aspect.from }, fromGroupId) : null,
    toGroupId ? buildPlacementSelectionKey({ planet: aspect.to }, toGroupId) : null,
  ]);
}

export function buildOverlaySelectionKeys(placement, overlay, placementGroups) {
  const overlayGroupId = findOverlayGroupId(placement, overlay, placementGroups);

  return compactKeys([
    overlayGroupId ? buildPlacementSelectionKey(placement, overlayGroupId) : null,
  ]);
}

function findGroupIdForPlanet(placementGroups, ownerName, planet) {
  const ownerMatch = placementGroups.find((group) => group.title.includes(ownerName) && hasPlanet(group, planet));

  if (ownerMatch) {
    return ownerMatch.id;
  }

  const directMatch = placementGroups.find((group) => hasPlanet(group, planet));
  return directMatch?.id ?? null;
}

function hasPlanet(group, planet) {
  return group.placements.some((placement) => placement.planet === planet);
}

function findOverlayGroupId(placement, overlay, placementGroups) {
  const overlayChartMatch = placementGroups.find(
    (group) => group.id === overlay.overlayChartId && hasPlanet(group, placement.planet),
  );

  if (overlayChartMatch) {
    return overlayChartMatch.id;
  }

  const overlayNameMatch = placementGroups.find(
    (group) => group.title.includes(overlay.overlayName) && hasPlanet(group, placement.planet),
  );

  if (overlayNameMatch) {
    return overlayNameMatch.id;
  }

  const referenceChartMatch = placementGroups.find(
    (group) => group.id === overlay.referenceChartId && hasPlanet(group, placement.planet),
  );

  if (referenceChartMatch) {
    return referenceChartMatch.id;
  }

  const referenceNameMatch = placementGroups.find(
    (group) => group.title.includes(overlay.referenceName) && hasPlanet(group, placement.planet),
  );

  if (referenceNameMatch) {
    return referenceNameMatch.id;
  }

  return placementGroups.find((group) => hasPlanet(group, placement.planet))?.id ?? null;
}

function compactKeys(keys) {
  return [...new Set(keys.filter(Boolean))];
}

const AUDIENCE_BY_MODE = {
  single: "self",
  couple: "relationship",
  forecast: "timing",
};

export function buildInterpretationContext(chartResult) {
  const entryPoints = buildEntryPoints(chartResult);
  const chartTags = buildChartTags(chartResult, entryPoints);

  return {
    audience: AUDIENCE_BY_MODE[chartResult.mode] || "self",
    chartId: chartResult.id,
    title: chartResult.title,
    category: chartResult.category,
    categoryLabel: chartResult.categoryLabel,
    people: chartResult.people ?? [],
    focus: chartResult.focus ?? [],
    placements: chartResult.placements ?? [],
    aspects: chartResult.aspects ?? [],
    statistics: chartResult.statistics ?? null,
    placementGroups: chartResult.placementGroups ?? [],
    overlays: chartResult.overlays ?? [],
    forecastDate: chartResult.forecastDate,
    entryPoints,
    chartTags,
    qaBridge: buildQaBridge(chartResult, entryPoints),
  };
}

function buildEntryPoints(chartResult) {
  const placementEntries = (chartResult.placements ?? []).slice(0, 3).map((placement, index) => ({
    id: `placement-${index}-${placement.planet}`,
    kind: "placement",
    label: `${placement.planet}${placement.sign}`,
    detail: placement.house && placement.house !== "-" ? `第${placement.house}宫` : "宫位未定",
  }));
  const aspectEntries = (chartResult.aspects ?? []).slice(0, 2).map((aspect, index) => ({
    id: `aspect-${index}-${aspect.from}-${aspect.to}`,
    kind: "aspect",
    label: `${aspect.from} × ${aspect.to}`,
    detail: aspect.label ?? aspect.type,
  }));
  const overlayEntries = (chartResult.overlays ?? []).slice(0, 2).map((overlay, index) => ({
    id: `overlay-${index}-${overlay.id}`,
    kind: "overlay",
    label: overlay.overlayName,
    detail: overlay.referenceName,
  }));
  const groupEntries = (chartResult.placementGroups ?? []).slice(0, 2).map((group, index) => ({
    id: `group-${index}-${group.id}`,
    kind: "group",
    label: group.title,
    detail: `${group.placements.length} 个星体`,
  }));

  return [...placementEntries, ...aspectEntries, ...overlayEntries, ...groupEntries].slice(0, 6);
}

function buildChartTags(chartResult, entryPoints) {
  const tags = new Set([
    chartResult.mode,
    chartResult.category,
    chartResult.categoryLabel,
    ...(chartResult.focus ?? []),
  ]);

  entryPoints.forEach((entryPoint) => {
    tags.add(entryPoint.kind);
    tags.add(entryPoint.label);
  });

  if ((chartResult.overlays ?? []).length) {
    tags.add("overlay");
  }

  if ((chartResult.placementGroups ?? []).length > 1) {
    tags.add("multi-group");
  }

  return [...tags].filter(Boolean);
}

function buildQaBridge(chartResult, entryPoints) {
  return {
    status: "ready-for-followups",
    promptTitle: `${chartResult.title} 问答预留`,
    hint: "后续问答将复用当前盘面上下文、检索片段与局部解读入口。",
    reusableContextKeys: [
      "chartId",
      "category",
      "people",
      "entryPoints",
      "chartTags",
    ],
    suggestedEntryPointIds: entryPoints.slice(0, 3).map((entryPoint) => entryPoint.id),
  };
}

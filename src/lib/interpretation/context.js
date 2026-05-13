const AUDIENCE_BY_MODE = {
  single: "self",
  couple: "relationship",
  forecast: "timing",
};

export function buildInterpretationContext(chartResult) {
  const entryPoints = buildEntryPoints(chartResult);
  const chartTags = buildChartTags(chartResult, entryPoints);
  const linkageHooks = buildLinkageHooks(chartResult, entryPoints);

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
    linkageHooks,
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
      "linkageHooks",
    ],
    suggestedEntryPointIds: entryPoints.slice(0, 3).map((entryPoint) => entryPoint.id),
  };
}

function buildLinkageHooks(chartResult, entryPoints) {
  const hooks = [];
  const groupEntries = (chartResult.placementGroups ?? []).slice(0, 2).map((group, index) => ({
    id: `group-hook-${index}-${group.id}`,
    label: group.title,
  }));
  const overlayEntries = (chartResult.overlays ?? []).slice(0, 2).map((overlay, index) => ({
    id: `overlay-hook-${index}-${overlay.id}`,
    label: overlay.overlayName,
    detail: overlay.referenceName,
  }));
  const people = chartResult.people ?? [];
  const names = people.map((person) => person.name).filter(Boolean);

  if (chartResult.category === "synastry" && groupEntries.length >= 2) {
    hooks.push({
      id: "synastry-to-natal",
      title: "比较盘联动双方本命",
      detail: `先把${groupEntries[0].label}与${groupEntries[1].label}并排看，再回到最强互动相位确认谁在主动触发。`,
      labels: [groupEntries[0].label, groupEntries[1].label],
    });
  } else if (chartResult.category === "synastry" && names.length >= 2) {
    hooks.push({
      id: "synastry-to-natal",
      title: "比较盘联动双方本命",
      detail: `先把${names[0]}与${names[1]}各自的触发点并排看，再回到这段互动里的主相位确认谁在主动点亮对方。`,
      labels: names.slice(0, 2),
    });
  }

  if ((chartResult.category === "composite" || chartResult.category === "davison") && groupEntries[0]) {
    hooks.push({
      id: `${chartResult.category}-to-natal`,
      title: `${chartResult.categoryLabel}联动双方本命`,
      detail: `${chartResult.categoryLabel}先看关系本体，再回头对照${names.join(" 与 ") || "双方"}各自如何承接同一主题。`,
      labels: [groupEntries[0].label, ...names].filter(Boolean).slice(0, 3),
    });
  } else if ((chartResult.category === "composite" || chartResult.category === "davison") && names.length >= 2) {
    hooks.push({
      id: `${chartResult.category}-to-natal`,
      title: `${chartResult.categoryLabel}联动双方本命`,
      detail: `${chartResult.categoryLabel}先看关系本体，再回头对照${names[0]}与${names[1]}各自如何承接同一主题。`,
      labels: names.slice(0, 2),
    });
  }

  if (chartResult.category === "marx" && groupEntries.length >= 2) {
    hooks.push({
      id: "marx-to-davison",
      title: "马克思盘联动双方视角",
      detail: `把${groupEntries[0].label}与${groupEntries[1].label}对照起来看，才能判断谁在维持关系温度、谁在承担关系结构。`,
      labels: [groupEntries[0].label, groupEntries[1].label],
    });
  } else if (chartResult.category === "marx" && names.length >= 2) {
    hooks.push({
      id: "marx-to-davison",
      title: "马克思盘联动双方视角",
      detail: `把${names[0]}与${names[1]}两侧的长期关系视角对照起来看，才能判断谁在维持关系温度、谁在承担关系结构。`,
      labels: names.slice(0, 2),
    });
  }

  if (isRelationshipForecast(chartResult.category) && overlayEntries[0]) {
    hooks.push({
      id: `${chartResult.category}-to-base-chart`,
      title: "推运盘联动基础关系盘",
      detail: `先从${overlayEntries[0].label}进入，再回到基础关系盘的既有结构，避免把短期触发误读成关系本体。`,
      labels: [overlayEntries[0].label, overlayEntries[0].detail].filter(Boolean),
    });
  }

  if (isMarxForecast(chartResult.category) && groupEntries.length >= 2) {
    hooks.push({
      id: `${chartResult.category}-dual-timing`,
      title: "双视角推运联动",
      detail: `这类马克思推运要同时比较${groupEntries[0].label}与${groupEntries[1].label}，再看双方推进节奏是否同步。`,
      labels: [groupEntries[0].label, groupEntries[1].label],
    });
  }

  return hooks.slice(0, 3);
}

function isRelationshipForecast(category) {
  return [
    "composite-progression",
    "davison-progression",
    "marx-progression",
    "composite-tertiary-progression",
    "davison-tertiary-progression",
    "marx-tertiary-progression",
  ].includes(category);
}

function isMarxForecast(category) {
  return category === "marx-progression" || category === "marx-tertiary-progression";
}

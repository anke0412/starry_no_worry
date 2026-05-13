export function buildSubsetSections(context, signals, retrievedNotes) {
  if (context.category === "marx") {
    return [buildMarxBondSection(context, signals, retrievedNotes)].filter(Boolean);
  }

  const relationshipBlueprint = RELATIONSHIP_BLUEPRINTS[context.category];
  if (relationshipBlueprint) {
    return [buildRelationshipSection(context, signals, retrievedNotes, relationshipBlueprint)].filter(Boolean);
  }

  const timingBlueprint = TIMING_BLUEPRINTS[context.category];
  if (timingBlueprint) {
    return [buildTimingSection(context, signals, retrievedNotes, timingBlueprint)].filter(Boolean);
  }

  const dualTimingBlueprint = DUAL_TIMING_BLUEPRINTS[context.category];
  if (dualTimingBlueprint) {
    return [buildDualTimingSection(context, signals, retrievedNotes, dualTimingBlueprint)].filter(Boolean);
  }

  return [];
}

const RELATIONSHIP_BLUEPRINTS = {
  synastry: {
    sectionId: "synastry-bridge",
    title: "比较盘互动落点",
    intro: (context) => context.placementGroups[0] && context.placementGroups[1]
      ? `先把${context.placementGroups[0].title}与${context.placementGroups[1].title}并排看，比较谁更容易在这段关系里先被点亮。`
      : null,
    followup: "比较盘更适合抓互动触发点，而不是直接代替关系本体。",
    citationKind: "group",
  },
  composite: {
    sectionId: "composite-core",
    title: "关系本体结构",
    intro: (context) => context.placementGroups[0]
      ? `先看${context.placementGroups[0].title}，它描述的是这段关系作为“共同体”的本体结构。`
      : null,
    followup: "组合盘优先回答的是“这段关系自己想成为什么样子”。",
    citationKind: "group",
  },
  davison: {
    sectionId: "davison-reality",
    title: "关系现实容器",
    intro: (context) => context.placementGroups[0]
      ? `先看${context.placementGroups[0].title}，它更像这段关系真正落到现实之后的容器与节奏。`
      : null,
    followup: "时空中点盘更适合看关系如何进入现实协作，而不是只看感受强度。",
    citationKind: "group",
  },
};

const TIMING_BLUEPRINTS = {
  "composite-progression": {
    sectionId: "relationship-timing",
    title: "关系推运切口",
    chartLabel: "组合盘次限盘",
    noteSectionId: "relationship-timing",
  },
  "davison-progression": {
    sectionId: "davison-progression-timing",
    title: "关系现实推进",
    chartLabel: "时空中点盘次限盘",
    noteSectionId: "davison-progression-timing",
  },
  "composite-tertiary-progression": {
    sectionId: "composite-tertiary-timing",
    title: "关系短周期脉冲",
    chartLabel: "组合盘三限盘",
    noteSectionId: "composite-tertiary-timing",
  },
  "davison-tertiary-progression": {
    sectionId: "davison-tertiary-timing",
    title: "关系现实短周期",
    chartLabel: "时空中点盘三限盘",
    noteSectionId: "davison-tertiary-timing",
  },
};

const DUAL_TIMING_BLUEPRINTS = {
  "marx-progression": {
    sectionId: "marx-progression-timing",
    title: "双视角推运切口",
    chartLabel: "马克思盘次限盘",
    noteSectionId: "marx-progression-timing",
  },
  "marx-tertiary-progression": {
    sectionId: "marx-tertiary-timing",
    title: "双视角短周期切口",
    chartLabel: "马克思盘三限盘",
    noteSectionId: "marx-tertiary-timing",
  },
};

function buildMarxBondSection(context, signals, retrievedNotes) {
  const note = findNote(retrievedNotes, "marx-bond");

  return {
    id: "marx-bond",
    title: "长期关系粘性",
    body: [
      context.placementGroups[0] ? `先看${context.placementGroups[0].title}，它更接近这段关系从${context.people[0]?.name || "一方"}视角感受到的长期黏性。`
        : null,
      context.placementGroups[1] ? `${context.placementGroups[1].title}则补充了另一侧如何回应同一段关系。` : null,
      signals.leadAspect ? `当前最值得细读的长期触发是${signals.leadAspect.from}与${signals.leadAspect.to}。` : null,
      note ? `检索命中提醒：${note.body}` : null,
    ].filter(Boolean).join(" "),
    citations: citationList(note, context.entryPoints.filter((entryPoint) => entryPoint.kind === "group").map((entryPoint) => entryPoint.label)),
  };
}

function buildRelationshipSection(context, signals, retrievedNotes, blueprint) {
  const note = findNote(retrievedNotes, blueprint.sectionId);

  return {
    id: blueprint.sectionId,
    title: blueprint.title,
    body: [
      blueprint.intro(context),
      signals.leadAspect ? `当前最值得细读的互动触发是${signals.leadAspect.from}与${signals.leadAspect.to}。` : null,
      signals.leadPlacement ? `如果只抓一个局部入口，建议先看${signals.leadPlacement.planet}${signals.leadPlacement.sign}。` : null,
      blueprint.followup,
      note ? `检索命中提醒：${note.body}` : null,
    ].filter(Boolean).join(" "),
    citations: citationList(note, context.entryPoints.filter((entryPoint) => entryPoint.kind === blueprint.citationKind).map((entryPoint) => entryPoint.label)),
  };
}

function buildTimingSection(context, signals, retrievedNotes, blueprint) {
  const note = findNote(retrievedNotes, blueprint.noteSectionId);

  return {
    id: blueprint.sectionId,
    title: blueprint.title,
    body: [
      `这张${blueprint.chartLabel}的锚点是${context.forecastDate || "当前阶段"}，优先看关系本体本身在这个时间点怎样推进。`,
      context.overlays[0] ? `第一阅读入口是“${context.overlays[0].title}”，它直接告诉我们推进体落在这段关系的哪个结构位置。` : null,
      signals.leadPlacement ? `如果只抓一个局部入口，建议先看${signals.leadPlacement.planet}${signals.leadPlacement.sign}。` : null,
      note ? `检索命中提醒：${note.body}` : null,
    ].filter(Boolean).join(" "),
    citations: citationList(note, context.overlays.slice(0, 2).map((overlay) => overlay.title)),
  };
}

function buildDualTimingSection(context, signals, retrievedNotes, blueprint) {
  const note = findNote(retrievedNotes, blueprint.noteSectionId);

  return {
    id: blueprint.sectionId,
    title: blueprint.title,
    body: [
      `这张${blueprint.chartLabel}的锚点是${context.forecastDate || "当前阶段"}，要同时比较双方视角里的推进节奏。`,
      context.overlays[0] ? `第一条联动线索是“${context.overlays[0].title}”。` : null,
      context.overlays[1] ? `第二条联动线索是“${context.overlays[1].title}”，它补充另一侧怎样进入同一轮变化。` : null,
      signals.leadAspect ? `当前最值得细读的推进触发是${signals.leadAspect.from}与${signals.leadAspect.to}。` : null,
      note ? `检索命中提醒：${note.body}` : null,
    ].filter(Boolean).join(" "),
    citations: citationList(
      note,
      [
        ...context.overlays.slice(0, 2).map((overlay) => overlay.title),
        ...context.entryPoints.filter((entryPoint) => entryPoint.kind === "group").map((entryPoint) => entryPoint.label),
      ],
    ),
  };
}

function findNote(retrievedNotes, sectionId) {
  return retrievedNotes.find((note) => note.sectionId === sectionId) ?? null;
}

function citationList(note, labels) {
  return [note?.title, ...labels].filter(Boolean).slice(0, 3);
}

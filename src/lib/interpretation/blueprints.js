export function buildSubsetSections(context, signals, retrievedNotes) {
  if (context.category === "marx") {
    return [buildMarxBondSection(context, signals, retrievedNotes)].filter(Boolean);
  }

  if (context.category === "composite-progression") {
    return [buildCompositeProgressionSection(context, signals, retrievedNotes)].filter(Boolean);
  }

  return [];
}

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

function buildCompositeProgressionSection(context, signals, retrievedNotes) {
  const note = findNote(retrievedNotes, "relationship-timing");

  return {
    id: "relationship-timing",
    title: "关系推运切口",
    body: [
      `这张组合盘次限盘的锚点是${context.forecastDate || "当前阶段"}，优先看关系本体本身在这个时间点怎样推进。`,
      context.overlays[0] ? `第一阅读入口是“${context.overlays[0].title}”，它直接告诉我们推进体落在这段关系的哪个结构位置。` : null,
      signals.leadPlacement ? `如果只抓一个局部入口，建议先看${signals.leadPlacement.planet}${signals.leadPlacement.sign}。` : null,
      note ? `检索命中提醒：${note.body}` : null,
    ].filter(Boolean).join(" "),
    citations: citationList(note, context.overlays.slice(0, 2).map((overlay) => overlay.title)),
  };
}

function findNote(retrievedNotes, sectionId) {
  return retrievedNotes.find((note) => note.sectionId === sectionId) ?? null;
}

function citationList(note, labels) {
  return [note?.title, ...labels].filter(Boolean).slice(0, 3);
}

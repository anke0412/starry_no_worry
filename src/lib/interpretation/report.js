import { buildSubsetSections } from "./blueprints.js";

export function createInterpretationReport(context, signals, retrievedNotes) {
  const sections = [
    buildOverviewSection(context, signals, retrievedNotes),
    buildSignalSection(context, signals),
    ...specializedSections(context, signals, retrievedNotes),
    ...buildSubsetSections(context, signals, retrievedNotes),
  ].filter(Boolean);

  return {
    reportId: `report-${context.chartId}`,
    chartId: context.chartId,
    mode: "agent",
    title: `${context.title} 解读报告`,
    agentName: agentNameForAudience(context.audience),
    summary: summaryForAudience(context, signals, retrievedNotes),
    sections,
    entryPoints: context.entryPoints,
    retrievalNotes: retrievedNotes,
    linkageHooks: context.linkageHooks,
    qaBridge: context.qaBridge,
    recommendedQuestions: questionsForAudience(context, signals),
  };
}

function buildOverviewSection(context, signals, retrievedNotes) {
  const retrievalLead = retrievedNotes[0]?.title;
  const parts = [
    `${context.categoryLabel}会优先落在${joinList(context.focus.slice(0, 2), "、")}这两条主线上。`,
    signals.leadPlacement ? `主轴点位是${placementSummary(signals.leadPlacement)}。` : null,
    signals.dominantStatistic ? `整体分布里最突出的倾向是${signals.dominantStatistic.label}${signals.dominantStatistic.count}。` : null,
    retrievalLead ? `当前检索优先命中的阅读模块是“${retrievalLead}”。` : null,
  ].filter(Boolean);

  return {
    id: "overview",
    title: "整体基调",
    body: parts.join(" "),
  };
}

function buildSignalSection(context, signals) {
  const parts = [];

  if (signals.leadPlacement) {
    parts.push(`先看${placementSummary(signals.leadPlacement)}。`);
  }

  if (signals.supportPlacement) {
    parts.push(`辅助信号来自${placementSummary(signals.supportPlacement)}。`);
  }

  if (signals.leadAspect) {
    parts.push(
      `${signals.leadAspect.from}与${signals.leadAspect.to}形成${signals.leadAspect.label ?? signals.leadAspect.type}，容许度约${signals.leadAspect.orb ?? "-" }。`,
    );
  }

  if (!parts.length) {
    parts.push(`当前可用重点仍围绕${joinList(context.focus.slice(0, 2), "、")}展开。`);
  }

  return {
    id: "chart-signals",
    title: "盘面信号",
    body: parts.join(" "),
  };
}

function specializedSections(context, signals, retrievedNotes) {
  if (context.audience === "relationship") {
    const names = context.people.map((person) => person.name).filter(Boolean);
    const note = noteForSection(retrievedNotes, "dynamic");
    return [
      {
        id: "dynamic",
        title: "关系互动",
        body: [
          `${joinList(names, "与")}的互动可以先从${joinList(context.focus.slice(0, 3), "、")}拆开来看。`,
          signals.overlayTitle ? `当前最直接的落地阅读入口是“${signals.overlayTitle}”。` : null,
          signals.leadAspect ? `优先关注${signals.leadAspect.from}与${signals.leadAspect.to}这组关系触发。` : null,
          note ? `检索补充提示：${note.body}` : null,
        ].filter(Boolean).join(" "),
      },
    ];
  }

  if (context.audience === "timing") {
    const note = noteForSection(retrievedNotes, "timing");
    return [
      {
        id: "timing",
        title: "时间窗口",
        body: [
          `推运锚点是${context.forecastDate || "未设置"}。`,
          signals.leadPlacement ? `此刻最值得追踪的推进体是${placementSummary(signals.leadPlacement)}。` : null,
          signals.leadAspect ? `如果要判断事件触发，先看${signals.leadAspect.from}与${signals.leadAspect.to}的${signals.leadAspect.label ?? signals.leadAspect.type}。` : null,
          note ? `检索补充提示：${note.body}` : null,
        ].filter(Boolean).join(" "),
      },
    ];
  }

  const note = noteForSection(retrievedNotes, "self-pattern");
  return [
    {
      id: "self-pattern",
      title: "个人主题",
      body: [
        signals.leadPlacement ? `可以先把${placementSummary(signals.leadPlacement)}当成自我表达入口。` : null,
        signals.supportPlacement ? `${placementSummary(signals.supportPlacement)}则补充了情绪与反应模式。` : null,
        `阅读顺序建议从${joinList(context.focus.slice(0, 3), "、")}逐层展开。`,
        note ? `检索补充提示：${note.body}` : null,
      ].filter(Boolean).join(" "),
    },
  ];
}

function summaryForAudience(context, signals, retrievedNotes) {
  const dominant = signals.dominantStatistic ? `${signals.dominantStatistic.label}${signals.dominantStatistic.count}` : null;
  const retrieved = retrievedNotes[0]?.title;

  if (context.audience === "relationship") {
    return dominant
      ? `这份报告会聚焦关系互动、吸引模式与长期节奏，当前以${dominant}作为关系气候的背景色${retrieved ? `，并优先调用“${retrieved}”检索模块。` : "。"}`
      : `这份报告会聚焦关系互动、吸引模式与长期相处节奏${retrieved ? `，并优先调用“${retrieved}”检索模块。` : "。"} `;
  }

  if (context.audience === "timing") {
    return dominant
      ? `这份报告会聚焦阶段推进与触发窗口，并用${dominant}辅助判断当前气候${retrieved ? `；首选检索模块是“${retrieved}”。` : "。"}`
      : `这份报告会聚焦未来趋势、阶段性机会与需要留意的压力窗口${retrieved ? `；首选检索模块是“${retrieved}”。` : "。"} `;
  }

  return dominant
    ? `这份报告会聚焦个人结构、内在需求与成长主题，盘面的底色偏向${dominant}${retrieved ? `，并参考“${retrieved}”模块展开。` : "。"}`
    : `这份报告会聚焦个人性格结构、内在需求与成长主题${retrieved ? `，并参考“${retrieved}”模块展开。` : "。"} `;
}

function questionsForAudience(context, signals) {
  const placement = signals.leadPlacement ? placementSummary(signals.leadPlacement) : "当前主轴";

  if (context.audience === "relationship") {
    return [
      `围绕${placement}，我们最容易在哪些情境里互相吸引？`,
      "这段关系最容易在哪个节奏点上失衡？",
      "要把关系推进到下一阶段，最值得先协商什么？",
    ];
  }

  if (context.audience === "timing") {
    return [
      `未来在${context.forecastDate || "这个阶段"}最值得把握的窗口是什么？`,
      `围绕${placement}，近期该主动推进还是先观察？`,
      "哪类决定更适合放到下一轮周期再定？",
    ];
  }

  return [
    `如果把${placement}当成主线，我最该先发展哪种能力？`,
    "我处理情绪与关系时最需要修正的旧模式是什么？",
    "怎样把这张盘的优势落到现实行动里？",
  ];
}

function noteForSection(retrievedNotes, sectionId) {
  return retrievedNotes.find((note) => note.sectionId === sectionId) ?? null;
}

function placementSummary(placement) {
  const house = placement.house && placement.house !== "-" ? `第${placement.house}宫` : "宫位未定";
  return `${placement.planet}${placement.sign} · ${house}`;
}

function joinList(items, separator) {
  return items.filter(Boolean).join(separator);
}

function agentNameForAudience(audience) {
  if (audience === "relationship") return "Relationship Atlas Agent";
  if (audience === "timing") return "Transit Timing Agent";
  return "Natal Insight Agent";
}

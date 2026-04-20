const AUDIENCE_BY_MODE = {
  single: "self",
  couple: "relationship",
  forecast: "timing",
};

export function buildInterpretationContext(chartResult) {
  return {
    audience: AUDIENCE_BY_MODE[chartResult.mode] || "self",
    chartId: chartResult.id,
    title: chartResult.title,
    category: chartResult.category,
    categoryLabel: chartResult.categoryLabel,
    people: chartResult.people,
    focus: chartResult.focus,
    placements: chartResult.placements,
    aspects: chartResult.aspects,
    forecastDate: chartResult.forecastDate,
  };
}

export function createInterpretationReport(context) {
  const baseSections = [
    {
      id: "overview",
      title: "整体基调",
      body: `${context.title} 的重点会落在 ${context.focus.slice(0, 2).join("、")}。当前版本先用结构化占位解读，后续可替换为真实 LLM agent。`,
    },
    {
      id: "chart-signals",
      title: "盘面信号",
      body: `重点观察 ${context.placements[0].planet}${context.placements[0].sign} 与 ${context.aspects[0].from}-${context.aspects[0].to}${context.aspects[0].type}。`,
    },
  ];

  return {
    agentName: agentNameForAudience(context.audience),
    summary: summaryForAudience(context),
    sections: [...baseSections, ...specializedSections(context)],
    recommendedQuestions: questionsForAudience(context.audience),
  };
}

function specializedSections(context) {
  if (context.audience === "relationship") {
    return [
      {
        id: "dynamic",
        title: "关系互动",
        body: `两人的互动可以先从 ${context.focus.join("、")} 四个层面拆解，区分吸引、触发和可协商空间。`,
      },
    ];
  }

  if (context.audience === "timing") {
    return [
      {
        id: "timing",
        title: "时间窗口",
        body: `推运日期 ${context.forecastDate || "未设置"} 可作为趋势锚点，用来比较当前阶段和本命结构的呼应。`,
      },
    ];
  }

  return [
    {
      id: "self-pattern",
      title: "个人主题",
      body: `先从 ${context.focus[0]} 切入，再延展到情绪、安全感、行动方式与人生方向。`,
    },
  ];
}

function summaryForAudience(context) {
  if (context.audience === "relationship") {
    return "这份报告会聚焦关系互动、吸引模式与长期相处节奏。";
  }

  if (context.audience === "timing") {
    return "这份报告会聚焦未来趋势、阶段性机会与需要留意的压力窗口。";
  }

  return "这份报告会聚焦个人性格结构、内在需求与成长主题。";
}

function questionsForAudience(audience) {
  if (audience === "relationship") {
    return ["我们最容易在哪些地方互相吸引？", "这段关系的冲突触发点是什么？", "如何建立更稳定的沟通节奏？"];
  }

  if (audience === "timing") {
    return ["未来三个月最值得把握的机会是什么？", "近期需要避免哪些消耗？", "哪类决定适合延后观察？"];
  }

  return ["我的核心人生主题是什么？", "我如何更好地处理情绪需求？", "适合我的事业表达方式是什么？"];
}

function agentNameForAudience(audience) {
  if (audience === "relationship") return "Relationship Atlas Agent";
  if (audience === "timing") return "Transit Timing Agent";
  return "Natal Insight Agent";
}

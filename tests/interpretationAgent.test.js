import test from "node:test";
import assert from "node:assert/strict";

import { createChartRequest, generateChartSnapshot } from "../src/lib/chartEngine.js";
import {
  buildInterpretationContext,
  createInterpretationReport,
} from "../src/lib/interpretationAgent.js";

test("builds a relationship-specific interpretation report", () => {
  const chart = generateChartSnapshot(
    createChartRequest({
      mode: "couple",
      category: "synastry",
      primary: {
        name: "Luna",
        date: "1996-04-12",
        time: "08:30",
        location: "Shanghai",
      },
      secondary: {
        name: "Sol",
        date: "1993-09-07",
        time: "21:10",
        location: "Beijing",
      },
    }),
  );

  const context = buildInterpretationContext(chart);
  const report = createInterpretationReport(context);

  assert.equal(context.audience, "relationship");
  assert.equal(report.chartId, chart.id);
  assert.equal(report.mode, "agent");
  assert.match(report.reportId, /^report-/);
  assert.match(report.title, /解读报告/);
  assert.equal(report.sections.some((section) => section.id === "dynamic"), true);
  assert.match(report.summary, /关系互动/);
  assert.equal(report.entryPoints.length > 0, true);
  assert.equal(report.retrievalNotes.length > 0, true);
  assert.equal(report.linkageHooks.length > 0, true);
  assert.equal(report.qaBridge.status, "ready-for-followups");
  assert.doesNotMatch(report.sections[0].body, /占位解读/);
});

test("builds a timing section for forecast categories", () => {
  const chart = generateChartSnapshot(
    createChartRequest({
      mode: "forecast",
      category: "transit",
      primary: {
        name: "Luna",
        date: "1996-04-12",
        time: "08:30",
        location: "Shanghai",
      },
      forecastDate: "2026-06-01",
    }),
  );

  const report = createInterpretationReport(buildInterpretationContext(chart));

  assert.equal(report.sections.some((section) => section.id === "timing"), true);
  assert.match(report.recommendedQuestions.join(" "), /未来/);
  assert.match(report.sections.map((section) => section.body).join(" "), /2026-06-01/);
  assert.equal(report.retrievalNotes.some((note) => note.sectionId === "timing"), true);
});

test("uses chart placements and aspects as concrete interpretation signals", () => {
  const context = buildInterpretationContext({
    id: "chart-real-data",
    mode: "single",
    title: "小星 的本命星盘",
    category: "natal",
    categoryLabel: "本命盘",
    people: [{ name: "小星" }],
    focus: ["核心性格", "情绪需求", "事业方向", "关系模式"],
    forecastDate: "",
    placements: [
      { planet: "太阳", sign: "白羊", house: 1, degree: 18, minute: 0 },
      { planet: "月亮", sign: "巨蟹", house: 4, degree: 9, minute: 0 },
    ],
    aspects: [
      { from: "太阳", to: "月亮", type: "trine", label: "拱相", orb: "0.30°" },
    ],
    statistics: {
      totalBodies: 12,
      sections: [
        {
          id: "elementCounts",
          items: [
            { key: "fire", label: "火象", count: 5 },
            { key: "earth", label: "土象", count: 2 },
            { key: "air", label: "风象", count: 3 },
            { key: "water", label: "水象", count: 2 },
          ],
        },
      ],
    },
    placementGroups: [],
    overlays: [],
  });

  const report = createInterpretationReport(context);
  const fullText = [report.summary, ...report.sections.map((section) => section.body), ...report.recommendedQuestions].join(" ");

  assert.match(fullText, /太阳白羊/);
  assert.match(fullText, /月亮巨蟹/);
  assert.match(fullText, /拱相/);
  assert.match(fullText, /火象/);
  assert.equal(context.entryPoints.some((entryPoint) => entryPoint.kind === "placement"), true);
  assert.equal(context.chartTags.includes("placement"), true);
  assert.match(report.retrievalNotes.map((note) => note.title).join(" "), /结构主轴/);
});

test("builds a marx-specific relationship section with citations", () => {
  const chart = {
    id: "chart-marx",
    mode: "couple",
    title: "小星 × 小月 的马克思盘",
    category: "marx",
    categoryLabel: "马克思盘",
    people: [{ name: "小星" }, { name: "小月" }],
    focus: ["长期关系", "情感深度", "关系粘性", "共同命题"],
    forecastDate: "",
    placements: [
      { planet: "太阳", sign: "白羊", house: 1, degree: 18, minute: 0 },
      { planet: "月亮", sign: "巨蟹", house: 4, degree: 9, minute: 0 },
    ],
    aspects: [
      { from: "太阳", to: "月亮", type: "trine", label: "拱相", orb: "0.30°" },
    ],
    statistics: null,
    placementGroups: [
      { id: "primary-marx", title: "小星 视角马克思盘星体", placements: [{ planet: "太阳" }] },
      { id: "secondary-marx", title: "小月 视角马克思盘星体", placements: [{ planet: "月亮" }] },
    ],
    overlays: [],
  };

  const report = createInterpretationReport(buildInterpretationContext(chart));
  const marxSection = report.sections.find((section) => section.id === "marx-bond");

  assert.ok(marxSection);
  assert.match(marxSection.body, /长期黏性|长期粘性/);
  assert.equal(Array.isArray(marxSection.citations), true);
  assert.equal(marxSection.citations.length > 0, true);
});

test("builds a composite progression timing section with citations", () => {
  const chart = {
    id: "chart-composite-progression",
    mode: "forecast",
    title: "小星 × 小月 的组合盘次限盘",
    category: "composite-progression",
    categoryLabel: "组合盘次限盘",
    people: [{ name: "小星" }, { name: "小月" }],
    focus: ["关系阶段", "共同节奏", "情绪推进", "长期课题"],
    forecastDate: "2026-06-01",
    placements: [
      { planet: "太阳", sign: "双子", house: 3, degree: 18, minute: 0 },
      { planet: "月亮", sign: "天秤", house: 7, degree: 9, minute: 0 },
    ],
    aspects: [
      { from: "太阳", to: "月亮", type: "trine", label: "拱相", orb: "0.30°" },
    ],
    statistics: null,
    placementGroups: [
      { id: "composite-core", title: "组合盘星体", placements: [{ planet: "太阳" }] },
      { id: "composite-progressed", title: "次限星体", placements: [{ planet: "月亮" }] },
    ],
    overlays: [
      { id: "overlay-1", title: "次限星体 飞入 组合盘", overlayName: "次限星体", referenceName: "组合盘" },
    ],
  };

  const report = createInterpretationReport(buildInterpretationContext(chart));
  const timingSection = report.sections.find((section) => section.id === "relationship-timing");

  assert.ok(timingSection);
  assert.match(timingSection.body, /2026-06-01/);
  assert.match(timingSection.body, /组合盘次限/);
  assert.equal(Array.isArray(timingSection.citations), true);
  assert.equal(timingSection.citations.length > 0, true);
});

test("builds chart-specific sections for remaining relationship charts", () => {
  const cases = [
    {
      chart: {
        id: "chart-synastry",
        mode: "couple",
        title: "小星 × 小月 的比较盘",
        category: "synastry",
        categoryLabel: "比较盘",
        people: [{ name: "小星" }, { name: "小月" }],
        focus: ["互动模式", "吸引", "磨合", "界限"],
        forecastDate: "",
        placements: [{ planet: "太阳", sign: "双子", house: 3, degree: 12, minute: 0 }],
        aspects: [{ from: "太阳", to: "月亮", type: "opposition", label: "冲相", orb: "0.90°" }],
        statistics: null,
        placementGroups: [
          { id: "primary", title: "小星 的本命星体", placements: [{ planet: "太阳" }] },
          { id: "secondary", title: "小月 的本命星体", placements: [{ planet: "月亮" }] },
        ],
        overlays: [],
      },
      expectedSectionId: "synastry-bridge",
      expectedHookId: "synastry-to-natal",
    },
    {
      chart: {
        id: "chart-composite",
        mode: "couple",
        title: "小星 × 小月 的组合盘",
        category: "composite",
        categoryLabel: "组合盘",
        people: [{ name: "小星" }, { name: "小月" }],
        focus: ["关系本体", "共同目标", "承诺", "节奏"],
        forecastDate: "",
        placements: [{ planet: "金星", sign: "天秤", house: 7, degree: 4, minute: 0 }],
        aspects: [{ from: "金星", to: "土星", type: "trine", label: "拱相", orb: "1.10°" }],
        statistics: null,
        placementGroups: [{ id: "composite", title: "组合盘星体", placements: [{ planet: "金星" }] }],
        overlays: [],
      },
      expectedSectionId: "composite-core",
      expectedHookId: "composite-to-natal",
    },
    {
      chart: {
        id: "chart-davison",
        mode: "couple",
        title: "小星 × 小月 的时空中点盘",
        category: "davison",
        categoryLabel: "时空中点盘",
        people: [{ name: "小星" }, { name: "小月" }],
        focus: ["现实节奏", "容器", "共同路径", "责任"],
        forecastDate: "",
        placements: [{ planet: "土星", sign: "摩羯", house: 10, degree: 11, minute: 0 }],
        aspects: [{ from: "土星", to: "月亮", type: "square", label: "刑相", orb: "0.60°" }],
        statistics: null,
        placementGroups: [{ id: "davison", title: "时空中点盘星体", placements: [{ planet: "土星" }] }],
        overlays: [],
      },
      expectedSectionId: "davison-reality",
      expectedHookId: "davison-to-natal",
    },
  ];

  cases.forEach(({ chart, expectedSectionId, expectedHookId }) => {
    const report = createInterpretationReport(buildInterpretationContext(chart));
    const section = report.sections.find((item) => item.id === expectedSectionId);

    assert.ok(section);
    assert.equal(Array.isArray(section.citations), true);
    assert.equal(report.linkageHooks.some((hook) => hook.id === expectedHookId), true);
  });
});

test("builds chart-specific sections for remaining relationship forecast charts", () => {
  const cases = [
    {
      chart: {
        id: "chart-davison-progression",
        mode: "forecast",
        title: "小星 × 小月 的时空中点盘次限盘",
        category: "davison-progression",
        categoryLabel: "时空中点盘次限盘",
        people: [{ name: "小星" }, { name: "小月" }],
        focus: ["现实推进", "关系阶段", "压力点", "调整"],
        forecastDate: "2026-07-01",
        placements: [{ planet: "火星", sign: "处女", house: 6, degree: 10, minute: 0 }],
        aspects: [{ from: "火星", to: "土星", type: "square", label: "刑相", orb: "0.50°" }],
        statistics: null,
        placementGroups: [
          { id: "davison-core", title: "时空中点盘星体", placements: [{ planet: "月亮" }] },
          { id: "davison-progressed", title: "次限星体", placements: [{ planet: "火星" }] },
        ],
        overlays: [{ id: "davison-overlay", title: "次限星体 飞入 时空中点盘", overlayName: "次限星体", referenceName: "时空中点盘" }],
      },
      expectedSectionId: "davison-progression-timing",
    },
    {
      chart: {
        id: "chart-marx-progression",
        mode: "forecast",
        title: "小星 × 小月 的马克思盘次限盘",
        category: "marx-progression",
        categoryLabel: "马克思盘次限盘",
        people: [{ name: "小星" }, { name: "小月" }],
        focus: ["长期关系", "节奏推进", "依附变化", "承诺"],
        forecastDate: "2026-07-10",
        placements: [{ planet: "太阳", sign: "狮子", house: 5, degree: 13, minute: 0 }],
        aspects: [{ from: "太阳", to: "月亮", type: "trine", label: "拱相", orb: "0.20°" }],
        statistics: null,
        placementGroups: [
          { id: "primary-progressed", title: "小星 视角次限星体", placements: [{ planet: "太阳" }] },
          { id: "secondary-progressed", title: "小月 视角次限星体", placements: [{ planet: "月亮" }] },
        ],
        overlays: [
          { id: "marx-overlay-1", title: "小星 视角次限星体 飞入 马克思盘", overlayName: "次限星体", referenceName: "马克思盘" },
          { id: "marx-overlay-2", title: "小月 视角次限星体 飞入 马克思盘", overlayName: "次限星体", referenceName: "马克思盘" },
        ],
      },
      expectedSectionId: "marx-progression-timing",
    },
    {
      chart: {
        id: "chart-composite-tertiary",
        mode: "forecast",
        title: "小星 × 小月 的组合盘三限盘",
        category: "composite-tertiary-progression",
        categoryLabel: "组合盘三限盘",
        people: [{ name: "小星" }, { name: "小月" }],
        focus: ["短周期", "情绪波动", "推进", "触发"],
        forecastDate: "2026-08-01",
        placements: [{ planet: "月亮", sign: "双鱼", house: 12, degree: 8, minute: 0 }],
        aspects: [{ from: "月亮", to: "金星", type: "conjunction", label: "合相", orb: "0.30°" }],
        statistics: null,
        placementGroups: [
          { id: "composite-core", title: "组合盘星体", placements: [{ planet: "太阳" }] },
          { id: "composite-tertiary", title: "三限星体", placements: [{ planet: "月亮" }] },
        ],
        overlays: [{ id: "composite-tertiary-overlay", title: "三限星体 飞入 组合盘", overlayName: "三限星体", referenceName: "组合盘" }],
      },
      expectedSectionId: "composite-tertiary-timing",
    },
    {
      chart: {
        id: "chart-davison-tertiary",
        mode: "forecast",
        title: "小星 × 小月 的时空中点盘三限盘",
        category: "davison-tertiary-progression",
        categoryLabel: "时空中点盘三限盘",
        people: [{ name: "小星" }, { name: "小月" }],
        focus: ["现实短周期", "触发", "调整", "磨合"],
        forecastDate: "2026-08-08",
        placements: [{ planet: "水星", sign: "双子", house: 3, degree: 2, minute: 0 }],
        aspects: [{ from: "水星", to: "土星", type: "opposition", label: "冲相", orb: "0.40°" }],
        statistics: null,
        placementGroups: [
          { id: "davison-core", title: "时空中点盘星体", placements: [{ planet: "土星" }] },
          { id: "davison-tertiary", title: "三限星体", placements: [{ planet: "水星" }] },
        ],
        overlays: [{ id: "davison-tertiary-overlay", title: "三限星体 飞入 时空中点盘", overlayName: "三限星体", referenceName: "时空中点盘" }],
      },
      expectedSectionId: "davison-tertiary-timing",
    },
    {
      chart: {
        id: "chart-marx-tertiary",
        mode: "forecast",
        title: "小星 × 小月 的马克思盘三限盘",
        category: "marx-tertiary-progression",
        categoryLabel: "马克思盘三限盘",
        people: [{ name: "小星" }, { name: "小月" }],
        focus: ["短周期", "情绪推进", "关系敏感点", "应对"],
        forecastDate: "2026-08-15",
        placements: [{ planet: "金星", sign: "巨蟹", house: 4, degree: 18, minute: 0 }],
        aspects: [{ from: "金星", to: "月亮", type: "sextile", label: "六合", orb: "0.70°" }],
        statistics: null,
        placementGroups: [
          { id: "primary-tertiary", title: "小星 视角三限星体", placements: [{ planet: "金星" }] },
          { id: "secondary-tertiary", title: "小月 视角三限星体", placements: [{ planet: "月亮" }] },
        ],
        overlays: [
          { id: "marx-tertiary-overlay-1", title: "小星 视角三限星体 飞入 马克思盘", overlayName: "三限星体", referenceName: "马克思盘" },
          { id: "marx-tertiary-overlay-2", title: "小月 视角三限星体 飞入 马克思盘", overlayName: "三限星体", referenceName: "马克思盘" },
        ],
      },
      expectedSectionId: "marx-tertiary-timing",
    },
  ];

  cases.forEach(({ chart, expectedSectionId }) => {
    const report = createInterpretationReport(buildInterpretationContext(chart));
    const section = report.sections.find((item) => item.id === expectedSectionId);

    assert.ok(section);
    assert.equal(Array.isArray(section.citations), true);
    assert.equal(report.linkageHooks.length > 0, true);
  });
});

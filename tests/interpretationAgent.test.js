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

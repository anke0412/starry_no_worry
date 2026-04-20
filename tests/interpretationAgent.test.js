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
  assert.equal(report.sections.some((section) => section.id === "dynamic"), true);
  assert.match(report.summary, /关系互动/);
});

test("builds a timing section for forecast categories", () => {
  const chart = generateChartSnapshot(
    createChartRequest({
      mode: "forecast",
      category: "progression",
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
});

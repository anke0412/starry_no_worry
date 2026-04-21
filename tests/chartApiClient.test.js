import test from "node:test";
import assert from "node:assert/strict";

import { calculateChart } from "../src/lib/api/chartApi.js";

function successfulFetch(expectedPath, responseBody) {
  return async (url, options) => {
    assert.equal(url, `http://localhost:8000${expectedPath}`);
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");

    return {
      ok: true,
      async json() {
        return responseBody;
      },
    };
  };
}

const primary = {
  name: "Luna",
  date: "1996-04-12",
  time: "08:30",
  location: "Shanghai",
  timezone: "Asia/Shanghai",
};

test("calls the natal chart API and maps backend placements for the workspace", async () => {
  const chart = await calculateChart(
    {
      mode: "single",
      category: "natal",
      people: [primary],
      primary,
      forecastDate: "",
      forecastTime: "12:00",
    },
    successfulFetch("/api/charts/natal", {
      chartId: "natal-luna",
      chartType: "natal",
      title: "Luna Natal Chart",
      placements: [
        {
          body: "Sun",
          longitude: 22.4,
          sign: "Aries",
          degree: 22,
          minute: 24,
          house: null,
        },
      ],
      aspects: [
        {
          from: "Sun",
          to: "Moon",
          type: "trine",
          orb: 1.25,
        },
      ],
    }),
  );

  assert.equal(chart.id, "natal-luna");
  assert.equal(chart.source, "api");
  assert.equal(chart.placements[0].planet, "Sun");
  assert.equal(chart.placements[0].minute, 24);
  assert.equal(chart.aspects[0].orb, "1.25°");
});

test("calls the transit chart API with forecast date and time", async () => {
  let requestBody;

  await calculateChart(
    {
      mode: "forecast",
      category: "transit",
      people: [primary],
      primary,
      forecastDate: "2026-05-01",
      forecastTime: "12:00",
    },
    async (url, options) => {
      assert.equal(url, "http://localhost:8000/api/charts/transit");
      requestBody = JSON.parse(options.body);

      return {
        ok: true,
        async json() {
          return {
            chartId: "transit-luna",
            chartType: "transit",
            title: "Luna Transit Chart",
            placements: [],
            aspects: [],
          };
        },
      };
    },
  );

  assert.equal(requestBody.transitDate, "2026-05-01");
  assert.equal(requestBody.transitTime, "12:00");
});

test("rejects future chart categories that are not in the phase 1 backend", async () => {
  await assert.rejects(
    calculateChart({
      mode: "couple",
      category: "composite",
      people: [primary],
      primary,
      forecastDate: "",
      forecastTime: "12:00",
    }),
    /暂未接入第一阶段后端计算/,
  );
});

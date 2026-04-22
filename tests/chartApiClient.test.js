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

test("calls the natal chart API and maps backend placements with localized labels", async () => {
  const chart = await calculateChart(
    {
      mode: "single",
      category: "natal",
      people: [{ ...primary, name: "旧名字" }],
      primary: { ...primary, name: "小星" },
      secondary: { ...primary, name: "大耳兽" },
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
        { body: "Moon", longitude: 40, sign: "Taurus", degree: 10, minute: 0, house: 1 },
        { body: "Mercury", longitude: 60, sign: "Gemini", degree: 0, minute: 0, house: 1 },
        { body: "Venus", longitude: 90, sign: "Cancer", degree: 0, minute: 0, house: 2 },
        { body: "Mars", longitude: 120, sign: "Leo", degree: 0, minute: 0, house: 3 },
        { body: "Jupiter", longitude: 150, sign: "Virgo", degree: 0, minute: 0, house: 4 },
        { body: "Saturn", longitude: 180, sign: "Libra", degree: 0, minute: 0, house: 5 },
        { body: "Uranus", longitude: 210, sign: "Scorpio", degree: 0, minute: 0, house: 6 },
        { body: "Neptune", longitude: 240, sign: "Sagittarius", degree: 0, minute: 0, house: 7 },
        { body: "Pluto", longitude: 270, sign: "Capricorn", degree: 0, minute: 0, house: 8 },
        {
          body: "North Node",
          longitude: 112.6,
          sign: "Cancer",
          degree: 22,
          minute: 36,
          house: 2,
        },
        {
          body: "South Node",
          longitude: 292.6,
          sign: "Capricorn",
          degree: 22,
          minute: 36,
          house: 8,
        },
        {
          body: "Ascendant",
          longitude: 88.2,
          sign: "Gemini",
          degree: 28,
          minute: 12,
          house: 1,
        },
        {
          body: "Midheaven",
          longitude: 331.5,
          sign: "Pisces",
          degree: 1,
          minute: 30,
          house: 10,
        },
      ],
      aspects: [
        { from: "Neptune", to: "South Node", type: "square", orb: 2.8 },
        { from: "Mercury", to: "Mars", type: "sextile", orb: 1.6 },
        {
          from: "Sun",
          to: "North Node",
          type: "trine",
          orb: 1.25,
        },
        { from: "Moon", to: "Venus", type: "square", orb: 1.4 },
        { from: "Mars", to: "Jupiter", type: "opposition", orb: 2.0 },
        { from: "Venus", to: "Saturn", type: "trine", orb: 1.8 },
        { from: "Jupiter", to: "Uranus", type: "square", orb: 2.2 },
        { from: "Saturn", to: "Neptune", type: "sextile", orb: 2.4 },
        { from: "Uranus", to: "Pluto", type: "trine", orb: 2.6 },
      ],
    }),
  );

  assert.equal(chart.id, "natal-luna");
  assert.equal(chart.source, "api");
  assert.equal(chart.title, "小星 的本命星盘");
  assert.equal(chart.people.length, 1);
  assert.equal(chart.people[0].name, "小星");
  assert.equal(chart.placements[0].planet, "太阳");
  assert.equal(chart.placements[0].sign, "白羊");
  assert.equal(chart.placements[0].minute, 24);
  assert.equal(chart.placements[10].planet, "北交点");
  assert.equal(chart.placements[10].sign, "巨蟹");
  assert.equal(chart.placements[11].planet, "南交点");
  assert.equal(chart.placements[11].sign, "摩羯");
  assert.equal(chart.placements[12].planet, "上升点");
  assert.equal(chart.placements[12].sign, "双子");
  assert.equal(chart.placements[13].planet, "天顶");
  assert.equal(chart.placements[13].sign, "双鱼");
  assert.equal(chart.aspects[0].from, "太阳");
  assert.equal(chart.aspects[0].to, "北交点");
  assert.equal(chart.aspects[0].orb, "1.25°");
  assert.equal(chart.aspects.length, 9);
  assert.deepEqual(
    chart.aspects.map((aspect) => aspect.from),
    ["太阳", "月亮", "火星", "金星", "水星", "木星", "土星", "天王星", "海王星"],
  );
  assert.equal(chart.aspects[8].from, "海王星");
  assert.equal(chart.aspects[8].to, "南交点");
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

import test from "node:test";
import assert from "node:assert/strict";

import { calculateChart } from "../src/lib/api/chartApi.js";
import { chartCategories, categoriesForMode } from "../src/data/chartCatalog.js";

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
      statistics: {
        totalBodies: 12,
        elementCounts: { fire: 4, earth: 2, air: 3, water: 3 },
        modalityCounts: { cardinal: 4, fixed: 5, mutable: 3 },
        polarityCounts: { yang: 7, yin: 5 },
        hemisphereCounts: { northern: 6, southern: 6, eastern: 5, western: 7 },
      },
      placements: [
        {
          body: "Sun",
          longitude: 22.4,
          sign: "Aries",
          degree: 22,
          minute: 24,
          house: null,
          retrograde: false,
        },
        { body: "Moon", longitude: 40, sign: "Taurus", degree: 10, minute: 0, house: 1, retrograde: false },
        { body: "Mercury", longitude: 60, sign: "Gemini", degree: 0, minute: 0, house: 1, retrograde: true },
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
  assert.equal(chart.placements[0].longitude, 22.4);
  assert.equal(chart.placements[0].minute, 24);
  assert.equal(chart.placements[0].retrograde, false);
  assert.equal(chart.placements[2].retrograde, true);
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
  assert.equal(chart.statistics.totalBodies, 12);
  assert.equal(chart.statistics.sections[0].items[0].label, "火象");
  assert.equal(chart.statistics.sections[0].items[0].count, 4);
});

test("calls the transit chart API with forecast date and time", async () => {
  let requestBody;

  await calculateChart(
    {
      mode: "forecast",
      category: "transit",
      people: [primary],
      primary,
      settings: {
        houseSystem: "whole-sign",
        aspectSet: "major_extended",
        orbProfile: "tight",
      },
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
  assert.equal(requestBody.settings.houseSystem, "whole-sign");
  assert.equal(requestBody.settings.aspectSet, "major_extended");
  assert.equal(requestBody.settings.orbProfile, "tight");
});

test("routes relationship transit requests to the relationship transit endpoint", async () => {
  let requestBody;

  await calculateChart(
    {
      mode: "couple",
      category: "relationship-transit",
      people: [primary],
      primary,
      secondary: { ...primary, name: "Sol" },
      settings: {
        houseSystem: "whole-sign",
        aspectSet: "major_extended",
        orbProfile: "tight",
      },
      forecastDate: "2026-05-01",
      forecastTime: "12:00",
    },
    async (url, options) => {
      assert.equal(url, "http://localhost:8000/api/charts/relationship-transit");
      requestBody = JSON.parse(options.body);

      return {
        ok: true,
        async json() {
          return {
            chartId: "relationship-transit-luna-sol",
            chartType: "relationshipTransit",
            title: "Luna × Sol Relationship Transit Chart",
            placements: [],
            aspects: [],
            relatedCharts: {
              primaryNatal: {
                profiles: [{ name: "Luna" }],
                placements: [],
                houses: [],
                chartType: "natal",
              },
              secondaryNatal: {
                profiles: [{ name: "Sol" }],
                placements: [],
                houses: [],
                chartType: "natal",
              },
              transitSky: {
                profiles: [{ name: "Transit Sky" }],
                placements: [],
                houses: [],
                chartType: "transitSky",
              },
              primaryTransitOverlay: {
                overlayId: "transit-in-primary",
                label: "Transit sky in Luna houses",
                referenceName: "Luna",
                overlayName: "Transit Sky",
                houses: [],
                placements: [],
                aspects: [],
              },
              secondaryTransitOverlay: {
                overlayId: "transit-in-secondary",
                label: "Transit sky in Sol houses",
                referenceName: "Sol",
                overlayName: "Transit Sky",
                houses: [],
                placements: [],
                aspects: [],
              },
            },
          };
        },
      };
    },
  );

  assert.equal(requestBody.primary.name, "Luna");
  assert.equal(requestBody.secondary.name, "Sol");
  assert.equal(requestBody.transitDate, "2026-05-01");
  assert.equal(requestBody.transitTime, "12:00");
  assert.equal(requestBody.settings.houseSystem, "whole-sign");
  assert.equal(requestBody.settings.aspectSet, "major_extended");
  assert.equal(requestBody.settings.orbProfile, "tight");
});

test("routes progression requests to the progression endpoint", async () => {
  let requestBody;

  await calculateChart(
    {
      mode: "forecast",
      category: "progression",
      people: [primary],
      primary,
      settings: {
        houseSystem: "whole-sign",
        aspectSet: "major_extended",
        orbProfile: "tight",
      },
      forecastDate: "2026-05-01",
      forecastTime: "12:00",
    },
    async (url, options) => {
      assert.equal(url, "http://localhost:8000/api/charts/progression");
      requestBody = JSON.parse(options.body);

      return {
        ok: true,
        async json() {
          return {
            chartId: "progression-luna",
            chartType: "progression",
            title: "Luna Progression Chart",
            placements: [],
            aspects: [],
            relatedCharts: {
              primaryNatal: {
                profiles: [{ name: "Luna" }],
                placements: [],
                houses: [],
                chartType: "natal",
              },
              progressedChart: {
                profiles: [{ name: "Luna Progressed" }],
                placements: [],
                houses: [],
                chartType: "progressedChart",
              },
              progressedOverlay: {
                overlayId: "progressed-in-natal",
                label: "Progressed chart in Luna houses",
                referenceName: "Luna",
                overlayName: "Luna Progressed",
                houses: [],
                placements: [],
                aspects: [],
              },
            },
          };
        },
      };
    },
  );

  assert.equal(requestBody.progressionDate, "2026-05-01");
  assert.equal(requestBody.progressionTime, "12:00");
  assert.equal(requestBody.settings.houseSystem, "whole-sign");
  assert.equal(requestBody.settings.aspectSet, "major_extended");
  assert.equal(requestBody.settings.orbProfile, "tight");
});

test("maps progression results as a derived timing chart", async () => {
  const chart = await calculateChart(
    {
      mode: "forecast",
      category: "progression",
      people: [primary],
      primary: { ...primary, name: "小星" },
      forecastDate: "2026-05-01",
      forecastTime: "12:00",
    },
    successfulFetch("/api/charts/progression", {
      chartId: "progression-luna",
      chartType: "progression",
      title: "Luna Progression Chart",
      placements: [],
      aspects: [],
      relatedCharts: {
        primaryNatal: {
          chartId: "natal-luna",
          profiles: [{ name: "Luna" }],
          chartType: "natal",
          placements: [{ body: "Sun", longitude: 22.4, sign: "Aries", degree: 22, minute: 24, house: 1 }],
          houses: [],
        },
        progressedChart: {
          chartId: "progressed-luna",
          profiles: [{ name: "Luna Progressed" }],
          chartType: "progressedChart",
          placements: [{ body: "Moon", longitude: 130, sign: "Leo", degree: 10, minute: 0, house: 5 }],
          houses: [],
        },
        progressedOverlay: {
          overlayId: "progressed-in-natal",
          label: "Progressed chart in Luna houses",
          referenceName: "Luna",
          overlayName: "Luna Progressed",
          houses: [{ house: 1, sign: "Aries" }],
          placements: [{ body: "Moon", longitude: 130, sign: "Leo", degree: 10, minute: 0, sourceHouse: 5, overlayHouse: 1 }],
          aspects: [{ from: "Moon", to: "Sun", type: "trine", orb: 0.3 }],
        },
      },
    }),
  );

  assert.equal(chart.title, "小星 的次限推运盘");
  assert.deepEqual(chart.placementGroups.map((group) => group.title), ["Luna 的本命星体", "次限星体"]);
  assert.equal(chart.aspectOwners.from, "Luna");
  assert.equal(chart.aspectOwners.to, "次限");
  assert.equal(chart.overlays[0].title, "次限星体 飞入 Luna");
});

test("routes solar arc requests to the solar arc endpoint", async () => {
  let requestBody;

  await calculateChart(
    {
      mode: "forecast",
      category: "solar-arc",
      people: [primary],
      primary,
      settings: {
        houseSystem: "whole-sign",
        aspectSet: "major_extended",
        orbProfile: "tight",
      },
      forecastDate: "2026-05-01",
      forecastTime: "12:00",
    },
    async (url, options) => {
      assert.equal(url, "http://localhost:8000/api/charts/solar-arc");
      requestBody = JSON.parse(options.body);

      return {
        ok: true,
        async json() {
          return {
            chartId: "solar-arc-luna",
            chartType: "solarArc",
            title: "Luna Solar Arc Chart",
            placements: [],
            aspects: [],
            relatedCharts: {
              primaryNatal: {
                profiles: [{ name: "Luna" }],
                placements: [],
                houses: [],
                chartType: "natal",
              },
              solarArcChart: {
                profiles: [{ name: "Luna Solar Arc" }],
                placements: [],
                houses: [],
                chartType: "solarArcChart",
              },
              solarArcOverlay: {
                overlayId: "solar-arc-in-natal",
                label: "Solar arc chart in Luna houses",
                referenceName: "Luna",
                overlayName: "Luna Solar Arc",
                houses: [],
                placements: [],
                aspects: [],
              },
            },
          };
        },
      };
    },
  );

  assert.equal(requestBody.solarArcDate, "2026-05-01");
  assert.equal(requestBody.solarArcTime, "12:00");
  assert.equal(requestBody.settings.houseSystem, "whole-sign");
  assert.equal(requestBody.settings.aspectSet, "major_extended");
  assert.equal(requestBody.settings.orbProfile, "tight");
});

test("maps solar arc results as a derived timing chart", async () => {
  const chart = await calculateChart(
    {
      mode: "forecast",
      category: "solar-arc",
      people: [primary],
      primary: { ...primary, name: "小星" },
      forecastDate: "2026-05-01",
      forecastTime: "12:00",
    },
    successfulFetch("/api/charts/solar-arc", {
      chartId: "solar-arc-luna",
      chartType: "solarArc",
      title: "Luna Solar Arc Chart",
      placements: [],
      aspects: [],
      relatedCharts: {
        primaryNatal: {
          chartId: "natal-luna",
          profiles: [{ name: "Luna" }],
          chartType: "natal",
          placements: [{ body: "Sun", longitude: 22.4, sign: "Aries", degree: 22, minute: 24, house: 1 }],
          houses: [],
        },
        solarArcChart: {
          chartId: "solar-arc-luna",
          profiles: [{ name: "Luna Solar Arc" }],
          chartType: "solarArcChart",
          placements: [{ body: "Moon", longitude: 133, sign: "Leo", degree: 13, minute: 0, house: 5 }],
          houses: [],
        },
        solarArcOverlay: {
          overlayId: "solar-arc-in-natal",
          label: "Solar arc chart in Luna houses",
          referenceName: "Luna",
          overlayName: "Luna Solar Arc",
          houses: [{ house: 1, sign: "Aries" }],
          placements: [{ body: "Moon", longitude: 133, sign: "Leo", degree: 13, minute: 0, sourceHouse: 5, overlayHouse: 1 }],
          aspects: [{ from: "Moon", to: "Sun", type: "trine", orb: 0.3 }],
        },
      },
    }),
  );

  assert.equal(chart.title, "小星 的太阳弧推运盘");
  assert.deepEqual(chart.placementGroups.map((group) => group.title), ["Luna 的本命星体", "太阳弧星体"]);
  assert.equal(chart.aspectOwners.from, "Luna");
  assert.equal(chart.aspectOwners.to, "太阳弧");
  assert.equal(chart.overlays[0].title, "太阳弧星体 飞入 Luna");
});

test("routes tertiary progression requests to the tertiary progression endpoint", async () => {
  let requestBody;

  await calculateChart(
    {
      mode: "forecast",
      category: "tertiary-progression",
      people: [primary],
      primary,
      settings: {
        houseSystem: "whole-sign",
        aspectSet: "major_extended",
        orbProfile: "tight",
      },
      forecastDate: "2026-05-01",
      forecastTime: "12:00",
    },
    async (url, options) => {
      assert.equal(url, "http://localhost:8000/api/charts/tertiary-progression");
      requestBody = JSON.parse(options.body);

      return {
        ok: true,
        async json() {
          return {
            chartId: "tertiary-progression-luna",
            chartType: "tertiaryProgression",
            title: "Luna Tertiary Progression Chart",
            placements: [],
            aspects: [],
            relatedCharts: {
              primaryNatal: {
                profiles: [{ name: "Luna" }],
                placements: [],
                houses: [],
                chartType: "natal",
              },
              tertiaryProgressedChart: {
                profiles: [{ name: "Luna Tertiary Progressed" }],
                placements: [],
                houses: [],
                chartType: "tertiaryProgressedChart",
              },
              tertiaryProgressedOverlay: {
                overlayId: "tertiary-progressed-in-natal",
                label: "Tertiary progressed chart in Luna houses",
                referenceName: "Luna",
                overlayName: "Luna Tertiary Progressed",
                houses: [],
                placements: [],
                aspects: [],
              },
            },
          };
        },
      };
    },
  );

  assert.equal(requestBody.tertiaryDate, "2026-05-01");
  assert.equal(requestBody.tertiaryTime, "12:00");
  assert.equal(requestBody.settings.houseSystem, "whole-sign");
  assert.equal(requestBody.settings.aspectSet, "major_extended");
  assert.equal(requestBody.settings.orbProfile, "tight");
});

test("maps tertiary progression results as a derived timing chart", async () => {
  const chart = await calculateChart(
    {
      mode: "forecast",
      category: "tertiary-progression",
      people: [primary],
      primary: { ...primary, name: "小星" },
      forecastDate: "2026-05-01",
      forecastTime: "12:00",
    },
    successfulFetch("/api/charts/tertiary-progression", {
      chartId: "tertiary-progression-luna",
      chartType: "tertiaryProgression",
      title: "Luna Tertiary Progression Chart",
      placements: [],
      aspects: [],
      relatedCharts: {
        primaryNatal: {
          chartId: "natal-luna",
          profiles: [{ name: "Luna" }],
          chartType: "natal",
          placements: [{ body: "Sun", longitude: 22.4, sign: "Aries", degree: 22, minute: 24, house: 1 }],
          houses: [],
        },
        tertiaryProgressedChart: {
          chartId: "tertiary-progressed-luna",
          profiles: [{ name: "Luna Tertiary Progressed" }],
          chartType: "tertiaryProgressedChart",
          placements: [{ body: "Moon", longitude: 141, sign: "Leo", degree: 21, minute: 0, house: 5 }],
          houses: [],
        },
        tertiaryProgressedOverlay: {
          overlayId: "tertiary-progressed-in-natal",
          label: "Tertiary progressed chart in Luna houses",
          referenceName: "Luna",
          overlayName: "Luna Tertiary Progressed",
          houses: [{ house: 1, sign: "Aries" }],
          placements: [{ body: "Moon", longitude: 141, sign: "Leo", degree: 21, minute: 0, sourceHouse: 5, overlayHouse: 1 }],
          aspects: [{ from: "Moon", to: "Sun", type: "trine", orb: 0.3 }],
        },
      },
    }),
  );

  assert.equal(chart.title, "小星 的三限推运盘");
  assert.deepEqual(chart.placementGroups.map((group) => group.title), ["Luna 的本命星体", "三限星体"]);
  assert.equal(chart.aspectOwners.from, "Luna");
  assert.equal(chart.aspectOwners.to, "三限");
  assert.equal(chart.overlays[0].title, "三限星体 飞入 Luna");
});

test("calls the synastry chart API with custom settings", async () => {
  let requestBody;

  await calculateChart(
    {
      mode: "couple",
      category: "synastry",
      people: [primary],
      primary,
      secondary: { ...primary, name: "Sol" },
      settings: {
        houseSystem: "whole-sign",
        aspectSet: "major_extended",
        orbProfile: "tight",
      },
      forecastDate: "",
      forecastTime: "12:00",
    },
    async (url, options) => {
      assert.equal(url, "http://localhost:8000/api/charts/synastry");
      requestBody = JSON.parse(options.body);

      return {
        ok: true,
        async json() {
          return {
            chartId: "synastry-luna-sol",
            chartType: "synastry",
            title: "Luna × Sol Synastry Chart",
            placements: [],
            aspects: [],
          };
        },
      };
    },
  );

  assert.equal(requestBody.settings.houseSystem, "whole-sign");
  assert.equal(requestBody.settings.aspectSet, "major_extended");
  assert.equal(requestBody.settings.orbProfile, "tight");
});

test("routes solar return requests to the solar return endpoint", async () => {
  let requestBody;

  await calculateChart(
    {
      mode: "forecast",
      category: "solar-return",
      people: [primary],
      primary,
      settings: {
        houseSystem: "whole-sign",
        aspectSet: "major_extended",
        orbProfile: "tight",
      },
      solarReturnAnchorDate: "2026-04-27",
      solarReturnAnchorTime: "18:00",
      solarReturnLocation: {
        locationName: "Tokyo",
        latitude: "35.6762",
        longitude: "139.6503",
        timezone: "Asia/Tokyo",
      },
    },
    async (url, options) => {
      assert.equal(url, "http://localhost:8000/api/charts/solar-return");
      requestBody = JSON.parse(options.body);

      return {
        ok: true,
        async json() {
          return {
            chartId: "solar-return-luna",
            chartType: "solarReturn",
            title: "Luna Solar Return Chart",
            placements: [],
            aspects: [],
            relatedCharts: {
              primaryNatal: {
                profiles: [{ name: "Luna" }],
                placements: [],
                houses: [],
                chartType: "natal",
              },
              solarReturn: {
                profiles: [{ name: "Luna Solar Return" }],
                placements: [],
                houses: [],
                chartType: "solarReturn",
              },
              solarReturnOverlay: {
                overlayId: "solar-return-in-natal",
                label: "Solar Return in Luna houses",
                referenceName: "Luna",
                overlayName: "Luna Solar Return",
                houses: [],
                placements: [],
                aspects: [],
              },
            },
          };
        },
      };
    },
  );

  assert.equal(requestBody.anchorDate, "2026-04-27");
  assert.equal(requestBody.anchorTime, "18:00");
  assert.equal(requestBody.returnLocation.locationName, "Tokyo");
  assert.equal(requestBody.settings.houseSystem, "whole-sign");
  assert.equal(requestBody.settings.aspectSet, "major_extended");
  assert.equal(requestBody.settings.orbProfile, "tight");
});

test("routes solar return requests built from createChartRequest with anchor fields intact", async () => {
  let requestBody;

  const { createChartRequest } = await import("../src/lib/chartEngine.js");

  const request = createChartRequest({
    mode: "forecast",
    category: "solar-return",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
      latitude: "31.2304",
      longitude: "121.4737",
      timezone: "Asia/Shanghai",
    },
    solarReturnAnchorDate: "2026-04-27",
    solarReturnAnchorTime: "18:00",
    solarReturnLocation: {
      locationName: "Tokyo",
      latitude: "35.6762",
      longitude: "139.6503",
      timezone: "Asia/Tokyo",
    },
  });

  await calculateChart(request, async (_url, options) => {
    requestBody = JSON.parse(options.body);

    return {
      ok: true,
      async json() {
        return {
          chartId: "solar-return-luna",
          chartType: "solarReturn",
          title: "Luna Solar Return Chart",
          placements: [],
          aspects: [],
          relatedCharts: {
            primaryNatal: { profiles: [{ name: "Luna" }], placements: [], houses: [], chartType: "natal" },
            solarReturn: { profiles: [{ name: "Luna Solar Return" }], placements: [], houses: [], chartType: "solarReturn" },
            solarReturnOverlay: {
              overlayId: "solar-return-in-natal",
              label: "Solar Return in Luna houses",
              referenceName: "Luna",
              overlayName: "Luna Solar Return",
              houses: [],
              placements: [],
              aspects: [],
            },
          },
        };
      },
    };
  });

  assert.equal(requestBody.anchorDate, "2026-04-27");
  assert.equal(requestBody.anchorTime, "18:00");
});

test("routes lunar return requests to the lunar return endpoint", async () => {
  let requestBody;

  await calculateChart(
    {
      mode: "forecast",
      category: "lunar-return",
      people: [primary],
      primary,
      settings: {
        houseSystem: "whole-sign",
        aspectSet: "major_extended",
        orbProfile: "tight",
      },
      solarReturnAnchorDate: "2026-05-16",
      solarReturnAnchorTime: "06:30",
      solarReturnLocation: {
        locationName: "Seoul",
        latitude: "37.5665",
        longitude: "126.9780",
        timezone: "Asia/Seoul",
      },
    },
    async (url, options) => {
      assert.equal(url, "http://localhost:8000/api/charts/lunar-return");
      requestBody = JSON.parse(options.body);

      return {
        ok: true,
        async json() {
          return {
            chartId: "lunar-return-luna",
            chartType: "lunarReturn",
            title: "Luna Lunar Return Chart",
            placements: [],
            aspects: [],
            relatedCharts: {
              primaryNatal: {
                profiles: [{ name: "Luna" }],
                placements: [],
                houses: [],
                chartType: "natal",
              },
              lunarReturn: {
                profiles: [{ name: "Luna Lunar Return" }],
                placements: [],
                houses: [],
                chartType: "lunarReturn",
              },
              lunarReturnOverlay: {
                overlayId: "lunar-return-in-natal",
                label: "Lunar Return in Luna houses",
                referenceName: "Luna",
                overlayName: "Luna Lunar Return",
                houses: [],
                placements: [],
                aspects: [],
              },
            },
          };
        },
      };
    },
  );

  assert.equal(requestBody.anchorDate, "2026-05-16");
  assert.equal(requestBody.anchorTime, "06:30");
  assert.equal(requestBody.returnLocation.locationName, "Seoul");
  assert.equal(requestBody.settings.houseSystem, "whole-sign");
  assert.equal(requestBody.settings.aspectSet, "major_extended");
  assert.equal(requestBody.settings.orbProfile, "tight");
});

test("routes lunar return requests built from createChartRequest with anchor fields intact", async () => {
  let requestBody;

  const { createChartRequest } = await import("../src/lib/chartEngine.js");

  const request = createChartRequest({
    mode: "forecast",
    category: "lunar-return",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
      latitude: "31.2304",
      longitude: "121.4737",
      timezone: "Asia/Shanghai",
    },
    solarReturnAnchorDate: "2026-05-16",
    solarReturnAnchorTime: "06:30",
    solarReturnLocation: {
      locationName: "Seoul",
      latitude: "37.5665",
      longitude: "126.9780",
      timezone: "Asia/Seoul",
    },
  });

  await calculateChart(request, async (_url, options) => {
    requestBody = JSON.parse(options.body);

    return {
      ok: true,
      async json() {
        return {
          chartId: "lunar-return-luna",
          chartType: "lunarReturn",
          title: "Luna Lunar Return Chart",
          placements: [],
          aspects: [],
          relatedCharts: {
            primaryNatal: { profiles: [{ name: "Luna" }], placements: [], houses: [], chartType: "natal" },
            lunarReturn: { profiles: [{ name: "Luna Lunar Return" }], placements: [], houses: [], chartType: "lunarReturn" },
            lunarReturnOverlay: {
              overlayId: "lunar-return-in-natal",
              label: "Lunar Return in Luna houses",
              referenceName: "Luna",
              overlayName: "Luna Lunar Return",
              houses: [],
              placements: [],
              aspects: [],
            },
          },
        };
      },
    };
  });

  assert.equal(requestBody.anchorDate, "2026-05-16");
  assert.equal(requestBody.anchorTime, "06:30");
});

test("return chart API payloads ignore stale forecast fallbacks", async () => {
  let requestBody;

  await calculateChart(
    {
      mode: "forecast",
      category: "lunar-return",
      people: [primary],
      primary,
      forecastDate: "2030-01-01",
      forecastTime: "23:59",
      solarReturnAnchorDate: "2026-05-16",
      solarReturnAnchorTime: "06:30",
      solarReturnLocation: {
        locationName: "Seoul",
        latitude: "37.5665",
        longitude: "126.9780",
        timezone: "Asia/Seoul",
      },
    },
    async (_url, options) => {
      requestBody = JSON.parse(options.body);

      return {
        ok: true,
        async json() {
          return {
            chartId: "lunar-return-luna",
            chartType: "lunarReturn",
            title: "Luna Lunar Return Chart",
            placements: [],
            aspects: [],
            relatedCharts: {
              primaryNatal: { profiles: [{ name: "Luna" }], placements: [], houses: [], chartType: "natal" },
              lunarReturn: { profiles: [{ name: "Luna Lunar Return" }], placements: [], houses: [], chartType: "lunarReturn" },
              lunarReturnOverlay: {
                overlayId: "lunar-return-in-natal",
                label: "Lunar Return in Luna houses",
                referenceName: "Luna",
                overlayName: "Luna Lunar Return",
                houses: [],
                placements: [],
                aspects: [],
              },
            },
          };
        },
      };
    },
  );

  assert.equal(requestBody.anchorDate, "2026-05-16");
  assert.equal(requestBody.anchorTime, "06:30");
});

test("maps lunar return results as a derived timing chart", async () => {
  const chart = await calculateChart(
    {
      mode: "forecast",
      category: "lunar-return",
      people: [primary],
      primary: { ...primary, name: "小星" },
      solarReturnAnchorDate: "2026-05-16",
      solarReturnAnchorTime: "06:30",
      solarReturnLocation: {
        locationName: "Seoul",
        latitude: "37.5665",
        longitude: "126.9780",
        timezone: "Asia/Seoul",
      },
    },
    successfulFetch("/api/charts/lunar-return", {
      chartId: "lunar-return-luna",
      chartType: "lunarReturn",
      title: "Luna Lunar Return Chart",
      placements: [],
      aspects: [],
      relatedCharts: {
        primaryNatal: {
          chartId: "natal-luna",
          profiles: [{ name: "Luna" }],
          chartType: "natal",
          placements: [{ body: "Sun", longitude: 22.4, sign: "Aries", degree: 22, minute: 24, house: 1 }],
          houses: [],
          statistics: {
            totalBodies: 12,
            elementCounts: { fire: 4, earth: 2, air: 3, water: 3 },
            modalityCounts: { cardinal: 4, fixed: 5, mutable: 3 },
            polarityCounts: { yang: 7, yin: 5 },
            hemisphereCounts: { northern: 6, southern: 6, eastern: 5, western: 7 },
          },
        },
        lunarReturn: {
          chartId: "lunar-return-chart-luna",
          profiles: [{ name: "Luna Lunar Return" }],
          chartType: "lunarReturn",
          placements: [{ body: "Moon", longitude: 130, sign: "Leo", degree: 10, minute: 0, house: 5 }],
          houses: [],
          statistics: {
            totalBodies: 12,
            elementCounts: { fire: 3, earth: 3, air: 3, water: 3 },
            modalityCounts: { cardinal: 3, fixed: 5, mutable: 4 },
            polarityCounts: { yang: 6, yin: 6 },
            hemisphereCounts: { northern: 7, southern: 5, eastern: 5, western: 7 },
          },
        },
        lunarReturnOverlay: {
          overlayId: "lunar-return-in-natal",
          label: "Lunar Return in Luna houses",
          referenceName: "Luna",
          overlayName: "Luna Lunar Return",
          houses: [{ house: 1, sign: "Aries" }],
          placements: [
            {
              body: "Moon",
              longitude: 130,
              sign: "Leo",
              degree: 10,
              minute: 0,
              sourceHouse: 5,
              overlayHouse: 1,
            },
          ],
          aspects: [{ from: "Moon", to: "Sun", type: "trine", orb: 0.3 }],
        },
      },
    }),
  );

  assert.equal(chart.title, "小星 的月返推运盘");
  assert.deepEqual(chart.placementGroups.map((group) => group.title), ["Luna 的本命星体", "月返星体"]);
  assert.equal(chart.aspectOwners.from, "Luna");
  assert.equal(chart.aspectOwners.to, "月返");
  assert.equal(chart.overlays[0].title, "月返星体 飞入 Luna");
});

test("maps overlay house placements for synastry and transit results", async () => {
  const synastryChart = await calculateChart(
    {
      mode: "couple",
      category: "synastry",
      people: [primary],
      primary: { ...primary, name: "小星" },
      secondary: { ...primary, name: "小月" },
      forecastDate: "",
      forecastTime: "12:00",
    },
    successfulFetch("/api/charts/synastry", {
      chartId: "synastry-luna-sol",
      chartType: "synastry",
      title: "Luna × Sol Synastry Chart",
      placements: [],
      aspects: [],
      relatedCharts: {
        primaryOverlay: {
          overlayId: "secondary-in-primary",
          label: "Sol in Luna houses",
          referenceName: "Luna",
          overlayName: "Sol",
          houses: [
            { house: 1, sign: "Aries" },
            { house: 2, sign: "Taurus" },
            { house: 3, sign: "Gemini" },
            { house: 4, sign: "Cancer" },
            { house: 5, sign: "Leo" },
            { house: 6, sign: "Virgo" },
            { house: 7, sign: "Libra" },
            { house: 8, sign: "Scorpio" },
            { house: 9, sign: "Sagittarius" },
            { house: 10, sign: "Capricorn" },
            { house: 11, sign: "Aquarius" },
            { house: 12, sign: "Pisces" },
          ],
          placements: [
            {
              body: "Venus",
              longitude: 70,
              sign: "Gemini",
              degree: 10,
              minute: 0,
              sourceHouse: 2,
              overlayHouse: 7,
            },
          ],
          aspects: [{ from: "Moon", to: "Venus", type: "trine", orb: 0.2 }],
        },
        secondaryOverlay: {
          overlayId: "primary-in-secondary",
          label: "Luna in Sol houses",
          referenceName: "Sol",
          overlayName: "Luna",
          houses: [],
          placements: [],
          aspects: [],
        },
        primaryNatal: {
          profiles: [{ name: "Luna" }],
          placements: [{ body: "Sun", sign: "Aries", degree: 1, minute: 0, house: 1 }],
          statistics: {
            totalBodies: 12,
            elementCounts: { fire: 4, earth: 2, air: 3, water: 3 },
            modalityCounts: { cardinal: 4, fixed: 5, mutable: 3 },
            polarityCounts: { yang: 7, yin: 5 },
            hemisphereCounts: { northern: 6, southern: 6, eastern: 5, western: 7 },
          },
        },
        secondaryNatal: {
          profiles: [{ name: "Sol" }],
          placements: [{ body: "Moon", sign: "Taurus", degree: 2, minute: 0, house: 2 }],
          statistics: {
            totalBodies: 12,
            elementCounts: { fire: 2, earth: 4, air: 3, water: 3 },
            modalityCounts: { cardinal: 3, fixed: 5, mutable: 4 },
            polarityCounts: { yang: 5, yin: 7 },
            hemisphereCounts: { northern: 7, southern: 5, eastern: 6, western: 6 },
          },
        },
      },
    }),
  );

  assert.equal(synastryChart.placementGroups[0].title, "Luna 的本命星体");
  assert.equal(synastryChart.placementGroups[1].title, "Sol 的本命星体");
  assert.equal(synastryChart.aspectOwners.from, "Luna");
  assert.equal(synastryChart.aspectOwners.to, "Sol");
  assert.equal(synastryChart.overlays.length, 2);
  assert.equal(synastryChart.overlays[0].title, "Sol 飞入 Luna");
  assert.equal(synastryChart.overlays[0].houseTableTitle, "Sol 飞入 Luna 的宫位");
  assert.equal(synastryChart.overlays[0].placements[0].planet, "金星");
  assert.equal(synastryChart.overlays[0].placements[0].sign, "双子");
  assert.equal(synastryChart.overlays[0].placements[0].sourceHouse, 2);
  assert.equal(synastryChart.overlays[0].placements[0].overlayHouse, 7);
  assert.equal(synastryChart.overlays[0].placements[0].overlayHouseRuler, "金星");
  assert.equal(synastryChart.overlays[0].aspects[0].from, "月亮");
  assert.equal(synastryChart.overlays[0].aspects[0].to, "金星");
  assert.equal(synastryChart.placementGroups[0].statistics.sections[0].items[0].label, "火象");
  assert.equal(synastryChart.placementGroups[1].statistics.sections[3].items[1].label, "南半球");

  const transitChart = await calculateChart(
    {
      mode: "forecast",
      category: "transit",
      people: [primary],
      primary,
      forecastDate: "2026-05-01",
      forecastTime: "12:00",
    },
    successfulFetch("/api/charts/transit", {
      chartId: "transit-luna",
      chartType: "transit",
      title: "Luna Transit Chart",
      placements: [],
      aspects: [],
      relatedCharts: {
        transitOverlay: {
          overlayId: "transit-in-natal",
          label: "Transit sky in Luna houses",
          referenceName: "Luna",
          overlayName: "Transit Sky",
          houses: [
            { house: 10, sign: "Capricorn" },
          ],
          placements: [
            {
              body: "Saturn",
              longitude: 350,
              sign: "Pisces",
              degree: 20,
              minute: 0,
              sourceHouse: 11,
              overlayHouse: 10,
            },
          ],
          aspects: [{ from: "Sun", to: "Saturn", type: "square", orb: 1.1 }],
        },
        primaryNatal: {
          profiles: [{ name: "Luna" }],
          placements: [{ body: "Sun", sign: "Aries", degree: 1, minute: 0, house: 1 }],
          statistics: {
            totalBodies: 12,
            elementCounts: { fire: 4, earth: 2, air: 3, water: 3 },
            modalityCounts: { cardinal: 4, fixed: 5, mutable: 3 },
            polarityCounts: { yang: 7, yin: 5 },
            hemisphereCounts: { northern: 6, southern: 6, eastern: 5, western: 7 },
          },
        },
        transitSky: {
          profiles: [{ name: "Transit Sky" }],
          placements: [{ body: "Saturn", sign: "Pisces", degree: 20, minute: 0, house: 11 }],
          statistics: {
            totalBodies: 12,
            elementCounts: { fire: 3, earth: 3, air: 2, water: 4 },
            modalityCounts: { cardinal: 4, fixed: 4, mutable: 4 },
            polarityCounts: { yang: 5, yin: 7 },
            hemisphereCounts: { northern: 5, southern: 7, eastern: 4, western: 8 },
          },
        },
      },
    }),
  );

  assert.equal(transitChart.placementGroups[0].title, "Luna 的本命星体");
  assert.equal(transitChart.placementGroups[1].title, "流年天象星体");
  assert.equal(transitChart.aspectOwners.from, "Luna");
  assert.equal(transitChart.aspectOwners.to, "流年");
  assert.equal(transitChart.overlays.length, 1);
  assert.equal(transitChart.overlays[0].title, "流年星体 飞入 Luna");
  assert.equal(transitChart.overlays[0].placements[0].planet, "土星");
  assert.equal(transitChart.overlays[0].placements[0].overlayHouse, 10);
  assert.equal(transitChart.overlays[0].placements[0].overlayHouseRuler, "土星");
  assert.equal(transitChart.placementGroups[1].statistics.sections[2].items[1].label, "阴性");
});

test("maps relationship transit results as a dual-subject timing chart", async () => {
  const relationshipTransitChart = await calculateChart(
    {
      mode: "couple",
      category: "relationship-transit",
      people: [primary],
      primary: { ...primary, name: "小星" },
      secondary: { ...primary, name: "小月" },
      forecastDate: "2026-05-01",
      forecastTime: "12:00",
    },
    successfulFetch("/api/charts/relationship-transit", {
      chartId: "relationship-transit-luna-sol",
      chartType: "relationshipTransit",
      title: "Luna × Sol Relationship Transit Chart",
      placements: [],
      aspects: [],
      relatedCharts: {
        primaryNatal: {
          profiles: [{ name: "Luna" }],
          placements: [{ body: "Sun", sign: "Aries", degree: 1, minute: 0, house: 1 }],
          statistics: {
            totalBodies: 12,
            elementCounts: { fire: 4, earth: 2, air: 3, water: 3 },
            modalityCounts: { cardinal: 4, fixed: 5, mutable: 3 },
            polarityCounts: { yang: 7, yin: 5 },
            hemisphereCounts: { northern: 6, southern: 6, eastern: 5, western: 7 },
          },
        },
        secondaryNatal: {
          profiles: [{ name: "Sol" }],
          placements: [{ body: "Moon", sign: "Taurus", degree: 2, minute: 0, house: 2 }],
          statistics: {
            totalBodies: 12,
            elementCounts: { fire: 2, earth: 4, air: 3, water: 3 },
            modalityCounts: { cardinal: 3, fixed: 5, mutable: 4 },
            polarityCounts: { yang: 5, yin: 7 },
            hemisphereCounts: { northern: 7, southern: 5, eastern: 6, western: 6 },
          },
        },
        transitSky: {
          profiles: [{ name: "Transit Sky" }],
          placements: [{ body: "Saturn", sign: "Pisces", degree: 20, minute: 0, house: 11 }],
          statistics: {
            totalBodies: 12,
            elementCounts: { fire: 3, earth: 3, air: 2, water: 4 },
            modalityCounts: { cardinal: 4, fixed: 4, mutable: 4 },
            polarityCounts: { yang: 5, yin: 7 },
            hemisphereCounts: { northern: 5, southern: 7, eastern: 4, western: 8 },
          },
        },
        primaryTransitOverlay: {
          overlayId: "transit-in-primary",
          label: "Transit sky in Luna houses",
          referenceName: "Luna",
          overlayName: "Transit Sky",
          houses: [{ house: 10, sign: "Capricorn" }],
          placements: [
            {
              body: "Saturn",
              longitude: 350,
              sign: "Pisces",
              degree: 20,
              minute: 0,
              sourceHouse: 11,
              overlayHouse: 10,
            },
          ],
          aspects: [{ from: "Sun", to: "Saturn", type: "square", orb: 1.1 }],
        },
        secondaryTransitOverlay: {
          overlayId: "transit-in-secondary",
          label: "Transit sky in Sol houses",
          referenceName: "Sol",
          overlayName: "Transit Sky",
          houses: [{ house: 7, sign: "Libra" }],
          placements: [
            {
              body: "Saturn",
              longitude: 350,
              sign: "Pisces",
              degree: 20,
              minute: 0,
              sourceHouse: 11,
              overlayHouse: 7,
            },
          ],
          aspects: [{ from: "Moon", to: "Saturn", type: "trine", orb: 0.8 }],
        },
      },
    }),
  );

  assert.equal(relationshipTransitChart.title, "小星 × 小月 的关系流年盘");
  assert.deepEqual(
    relationshipTransitChart.placementGroups.map((group) => group.title),
    ["Luna 的本命星体", "Sol 的本命星体", "流年天象星体"],
  );
  assert.equal(relationshipTransitChart.aspectOwners.from, "关系");
  assert.equal(relationshipTransitChart.aspectOwners.to, "流年");
  assert.equal(relationshipTransitChart.overlays.length, 2);
  assert.equal(relationshipTransitChart.aspects.length, 2);
  assert.equal(relationshipTransitChart.aspects[0].from, "太阳");
  assert.equal(relationshipTransitChart.aspects[0].fromOwner, "Luna");
  assert.equal(relationshipTransitChart.aspects[0].toOwner, "流年");
  assert.equal(relationshipTransitChart.overlays[0].title, "流年星体 飞入 Luna");
  assert.equal(relationshipTransitChart.overlays[1].title, "流年星体 飞入 Sol");
  assert.equal(relationshipTransitChart.overlays[1].sourceHouseTitle, "主参考地流年宫位");
  assert.equal(relationshipTransitChart.overlays[1].placements[0].sourceHouse, "-");
  assert.equal(relationshipTransitChart.overlays[1].placements[0].overlayHouse, 7);
});

test("calculateChart routes composite requests to the composite endpoint", async () => {
  let capturedUrl;
  let requestBody;

  await calculateChart(
    {
      mode: "couple",
      category: "composite",
      people: [primary],
      primary,
      secondary: { ...primary, name: "Sol" },
      settings: {
        houseSystem: "whole-sign",
        aspectSet: "major_extended",
        orbProfile: "tight",
      },
      forecastDate: "",
      forecastTime: "12:00",
    },
    async (url, options) => {
      capturedUrl = url;
      requestBody = JSON.parse(options.body);

      return {
        ok: true,
        async json() {
          return {
            chartId: "composite-luna-sol",
            chartType: "composite",
            title: "Luna × Sol Composite Chart",
            placements: [],
            aspects: [],
          };
        },
      };
    },
  );

  assert.equal(capturedUrl, "http://localhost:8000/api/charts/composite");
  assert.equal(requestBody.primary.name, "Luna");
  assert.equal(requestBody.secondary.name, "Sol");
  assert.equal(requestBody.settings.houseSystem, "whole-sign");
  assert.equal(requestBody.settings.aspectSet, "major_extended");
  assert.equal(requestBody.settings.orbProfile, "tight");
});

test("chart catalog includes davison under couple mode", () => {
  const davison = chartCategories.find((category) => category.id === "davison");

  assert.ok(davison);
  assert.equal(davison.mode, "couple");
  assert.equal(categoriesForMode("couple").some((category) => category.id === "davison"), true);
});

test("chart catalog includes midpoint composite under couple mode", () => {
  const midpointComposite = chartCategories.find((category) => category.id === "midpoint-composite");

  assert.ok(midpointComposite);
  assert.equal(midpointComposite.mode, "couple");
  assert.equal(categoriesForMode("couple").some((category) => category.id === "midpoint-composite"), true);
});

test("forecast catalog only exposes chart types with live backend support", () => {
  const forecastCategories = categoriesForMode("forecast").map((category) => category.id);

  assert.deepEqual(forecastCategories, ["transit", "solar-return", "lunar-return", "solar-arc", "progression", "tertiary-progression"]);
  assert.equal(forecastCategories.includes("solar-arc"), true);
  assert.equal(forecastCategories.includes("progression"), true);
  assert.equal(forecastCategories.includes("tertiary-progression"), true);
  assert.equal(forecastCategories.includes("relationship-transit"), false);
});

test("couple catalog exposes relationship transit as a live dual-subject timing chart", () => {
  const coupleCategories = categoriesForMode("couple").map((category) => category.id);
  const relationshipTransit = chartCategories.find((category) => category.id === "relationship-transit");

  assert.equal(coupleCategories.includes("relationship-transit"), true);
  assert.equal(relationshipTransit.mode, "couple");
  assert.equal(relationshipTransit.requiresSecondPerson, true);
  assert.equal(relationshipTransit.requiresForecastDate, true);
});

test("calculateChart routes davison requests to the davison endpoint", async () => {
  let capturedUrl;
  let requestBody;

  await calculateChart(
    {
      mode: "couple",
      category: "davison",
      people: [primary],
      primary,
      secondary: { ...primary, name: "Sol" },
      settings: {
        houseSystem: "whole-sign",
        aspectSet: "major_extended",
        orbProfile: "tight",
      },
      forecastDate: "",
      forecastTime: "12:00",
    },
    async (url, options) => {
      capturedUrl = url;
      requestBody = JSON.parse(options.body);

      return {
        ok: true,
        async json() {
          return {
            chartId: "davison-luna-sol",
            chartType: "davison",
            title: "Luna × Sol Davison Chart",
            placements: [],
            aspects: [],
          };
        },
      };
    },
  );

  assert.equal(capturedUrl, "http://localhost:8000/api/charts/davison");
  assert.equal(requestBody.primary.name, "Luna");
  assert.equal(requestBody.secondary.name, "Sol");
  assert.equal(requestBody.settings.houseSystem, "whole-sign");
  assert.equal(requestBody.settings.aspectSet, "major_extended");
  assert.equal(requestBody.settings.orbProfile, "tight");
});

test("calculateChart routes midpoint composite requests to the midpoint composite endpoint", async () => {
  let capturedUrl;
  let requestBody;

  await calculateChart(
    {
      mode: "couple",
      category: "midpoint-composite",
      people: [primary],
      primary,
      secondary: { ...primary, name: "Sol" },
      settings: {
        houseSystem: "whole-sign",
        aspectSet: "major_extended",
        orbProfile: "tight",
      },
      forecastDate: "",
      forecastTime: "12:00",
    },
    async (url, options) => {
      capturedUrl = url;
      requestBody = JSON.parse(options.body);

      return {
        ok: true,
        async json() {
          return {
            chartId: "midpoint-composite-luna-sol",
            chartType: "midpointComposite",
            title: "Luna × Sol Midpoint Composite Chart",
            placements: [],
            aspects: [],
          };
        },
      };
    },
  );

  assert.equal(capturedUrl, "http://localhost:8000/api/charts/midpoint-composite");
  assert.equal(requestBody.primary.name, "Luna");
  assert.equal(requestBody.secondary.name, "Sol");
  assert.equal(requestBody.settings.houseSystem, "whole-sign");
  assert.equal(requestBody.settings.aspectSet, "major_extended");
  assert.equal(requestBody.settings.orbProfile, "tight");
});

test("maps davison results as a fused relationship chart", async () => {
  const chart = await calculateChart(
    {
      mode: "couple",
      category: "davison",
      people: [primary],
      primary: { ...primary, name: "小星" },
      secondary: { ...primary, name: "小月" },
      forecastDate: "",
      forecastTime: "12:00",
    },
    successfulFetch("/api/charts/davison", {
      chartId: "davison-luna-sol",
      chartType: "davison",
      title: "Luna × Sol Davison Chart",
      placements: [
        { body: "Sun", longitude: 23, sign: "Aries", degree: 23, minute: 0, house: 1 },
      ],
      aspects: [{ from: "Sun", to: "Moon", type: "trine", orb: 0.8 }],
      relatedCharts: {
        primaryNatal: {
          chartId: "natal-luna",
          profiles: [{ name: "Luna" }],
          placements: [{ body: "Sun", sign: "Aries", degree: 1, minute: 0, house: 1 }],
          houses: [],
        },
        secondaryNatal: {
          chartId: "natal-sol",
          profiles: [{ name: "Sol" }],
          placements: [{ body: "Moon", sign: "Taurus", degree: 2, minute: 0, house: 2 }],
          houses: [],
        },
        davisonChart: {
          chartId: "davison-core",
          profiles: [{ name: "Davison Chart" }],
          placements: [{ body: "Sun", sign: "Aries", degree: 23, minute: 0, house: 1 }],
          houses: [],
        },
      },
    }),
  );

  assert.equal(chart.title, "小星 × 小月 的时空中点盘");
  assert.equal(chart.placementGroups[0].title, "时空中点盘星体");
  assert.equal(chart.placementGroups.length, 1);
  assert.equal(chart.placementGroups[0].placements[0].planet, "太阳");
  assert.equal(chart.aspectOwners.from, "时空中点盘");
  assert.equal(chart.aspectOwners.to, "时空中点盘");
  assert.equal(chart.overlays.length, 0);
});

test("maps midpoint composite results as a fused relationship chart", async () => {
  const chart = await calculateChart(
    {
      mode: "couple",
      category: "midpoint-composite",
      people: [primary],
      primary: { ...primary, name: "小星" },
      secondary: { ...primary, name: "小月" },
      forecastDate: "",
      forecastTime: "12:00",
    },
    successfulFetch("/api/charts/midpoint-composite", {
      chartId: "midpoint-composite-luna-sol",
      chartType: "midpointComposite",
      title: "Luna × Sol Midpoint Composite Chart",
      placements: [
        { body: "Sun", longitude: 19, sign: "Aries", degree: 19, minute: 0, house: 1 },
      ],
      aspects: [{ from: "Sun", to: "Moon", type: "trine", orb: 0.8 }],
      relatedCharts: {
        primaryNatal: {
          chartId: "natal-luna",
          profiles: [{ name: "Luna" }],
          placements: [{ body: "Sun", sign: "Aries", degree: 1, minute: 0, house: 1 }],
          houses: [],
        },
        secondaryNatal: {
          chartId: "natal-sol",
          profiles: [{ name: "Sol" }],
          placements: [{ body: "Moon", sign: "Taurus", degree: 2, minute: 0, house: 2 }],
          houses: [],
        },
        midpointCompositeChart: {
          chartId: "midpoint-composite-core",
          profiles: [{ name: "Midpoint Composite Chart" }],
          placements: [{ body: "Sun", sign: "Aries", degree: 19, minute: 0, house: 1 }],
          houses: [],
        },
      },
    }),
  );

  assert.equal(chart.title, "小星 × 小月 的中点组合盘");
  assert.equal(chart.placementGroups[0].title, "中点组合盘星体");
  assert.equal(chart.placementGroups.length, 1);
  assert.equal(chart.placementGroups[0].placements[0].planet, "太阳");
  assert.equal(chart.aspectOwners.from, "中点组合盘");
  assert.equal(chart.aspectOwners.to, "中点组合盘");
  assert.equal(chart.overlays.length, 0);
});

test("maps composite results as a fused relationship chart", async () => {
  const chart = await calculateChart(
    {
      mode: "couple",
      category: "composite",
      people: [primary],
      primary: { ...primary, name: "小星" },
      secondary: { ...primary, name: "小月" },
      forecastDate: "",
      forecastTime: "12:00",
    },
    successfulFetch("/api/charts/composite", {
      chartId: "composite-luna-sol",
      chartType: "composite",
      title: "Luna × Sol Composite Chart",
      placements: [
        { body: "Sun", longitude: 15, sign: "Aries", degree: 15, minute: 0, house: 1 },
      ],
      aspects: [{ from: "Sun", to: "Moon", type: "trine", orb: 0.8 }],
      relatedCharts: {
        primaryNatal: {
          chartId: "natal-luna",
          profiles: [{ name: "Luna" }],
          placements: [{ body: "Sun", sign: "Aries", degree: 1, minute: 0, house: 1 }],
          houses: [],
        },
        secondaryNatal: {
          chartId: "natal-sol",
          profiles: [{ name: "Sol" }],
          placements: [{ body: "Moon", sign: "Taurus", degree: 2, minute: 0, house: 2 }],
          houses: [],
        },
        compositeChart: {
          chartId: "composite-core",
          profiles: [{ name: "Composite Chart" }],
          placements: [{ body: "Sun", sign: "Aries", degree: 15, minute: 0, house: 1 }],
          houses: [],
        },
      },
    }),
  );

  assert.equal(chart.title, "小星 × 小月 的关系组合盘");
  assert.equal(chart.placementGroups[0].title, "组合盘星体");
  assert.equal(chart.placementGroups.length, 1);
  assert.equal(chart.placementGroups[0].placements[0].planet, "太阳");
  assert.equal(chart.aspectOwners.from, "组合盘");
  assert.equal(chart.aspectOwners.to, "组合盘");
  assert.equal(chart.overlays.length, 0);
});

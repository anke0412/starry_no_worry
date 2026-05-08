import test from "node:test";
import assert from "node:assert/strict";

import { buildRegenerationRequestKey, createChartRequest, generateChartSnapshot } from "../src/lib/chartEngine.js";
import { defaultChartSettings } from "../src/lib/api/chartContracts.js";

test("creates a single natal chart request with one person", () => {
  const request = createChartRequest({
    mode: "single",
    category: "natal",
    settings: {
      houseSystem: "equal",
      aspectSet: "major_extended",
      orbProfile: "wide",
    },
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
    },
  });

  assert.equal(request.mode, "single");
  assert.equal(request.category, "natal");
  assert.equal(request.settings.houseSystem, "equal");
  assert.equal(request.people.length, 1);
  assert.equal(request.people[0].name, "Luna");
});

test("requires a second person for relationship charts", () => {
  assert.throws(
    () =>
      createChartRequest({
        mode: "couple",
        category: "synastry",
        primary: {
          name: "Luna",
          date: "1996-04-12",
          time: "08:30",
          location: "Shanghai",
        },
      }),
    /second person/i,
  );
});

test("generates a deterministic chart snapshot for the workspace", () => {
  const request = createChartRequest({
    mode: "forecast",
    category: "transit",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
    },
    forecastDate: "2026-05-01",
  });

  const snapshot = generateChartSnapshot(request);

  assert.equal(snapshot.title, "Luna 的流年推运盘");
  assert.equal(snapshot.focus.length > 0, true);
  assert.equal(snapshot.placements.length, 6);
  assert.equal(snapshot.aspects.length, 4);
});

test("creates a solar return request with anchor datetime and return location", () => {
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

  assert.equal(request.category, "solar-return");
  assert.equal(request.forecastDate, "2026-04-27");
  assert.equal(request.forecastTime, "18:00");
  assert.equal(request.solarReturnAnchorDate, "2026-04-27");
  assert.equal(request.solarReturnAnchorTime, "18:00");
  assert.equal(request.solarReturnLocation.locationName, "Tokyo");
});

test("creates a lunar return request with anchor datetime and return location", () => {
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

  assert.equal(request.category, "lunar-return");
  assert.equal(request.forecastDate, "2026-05-16");
  assert.equal(request.forecastTime, "06:30");
  assert.equal(request.solarReturnAnchorDate, "2026-05-16");
  assert.equal(request.solarReturnAnchorTime, "06:30");
  assert.equal(request.solarReturnLocation.locationName, "Seoul");
});

test("return-chart requests ignore stale forecast date and time fallbacks", () => {
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
  });

  assert.equal(request.forecastDate, "2026-05-16");
  assert.equal(request.forecastTime, "06:30");
});

test("return-chart regeneration keys ignore stale forecast fallbacks", () => {
  const firstKey = buildRegenerationRequestKey({
    mode: "forecast",
    category: "lunar-return",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
    },
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
  });

  const secondKey = buildRegenerationRequestKey({
    mode: "forecast",
    category: "lunar-return",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
    },
    forecastDate: "2040-02-02",
    forecastTime: "00:01",
    solarReturnAnchorDate: "2026-05-16",
    solarReturnAnchorTime: "06:30",
    solarReturnLocation: {
      locationName: "Seoul",
      latitude: "37.5665",
      longitude: "126.9780",
      timezone: "Asia/Seoul",
    },
  });

  assert.equal(firstKey, secondKey);
});

test("creates chart requests with explicit default settings when none are provided", () => {
  const request = createChartRequest({
    mode: "forecast",
    category: "transit",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
    },
    forecastDate: "2026-05-01",
  });

  assert.deepEqual(request.settings, defaultChartSettings);
});

test("creates a progression request with forecast date and time", () => {
  const request = createChartRequest({
    mode: "forecast",
    category: "progression",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
      latitude: "31.2304",
      longitude: "121.4737",
      timezone: "Asia/Shanghai",
    },
    forecastDate: "2026-05-01",
    forecastTime: "12:00",
  });

  assert.equal(request.category, "progression");
  assert.equal(request.forecastDate, "2026-05-01");
  assert.equal(request.forecastTime, "12:00");
});

test("creates a composite progression request with second person and forecast time", () => {
  const request = createChartRequest({
    mode: "forecast",
    category: "composite-progression",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
      latitude: "31.2304",
      longitude: "121.4737",
      timezone: "Asia/Shanghai",
    },
    secondary: {
      name: "Sol",
      date: "1993-09-07",
      time: "21:10",
      location: "Beijing",
      latitude: "39.9042",
      longitude: "116.4074",
      timezone: "Asia/Shanghai",
    },
    forecastDate: "2026-05-01",
    forecastTime: "12:00",
  });

  assert.equal(request.category, "composite-progression");
  assert.equal(request.secondary.name, "Sol");
  assert.equal(request.forecastDate, "2026-05-01");
  assert.equal(request.forecastTime, "12:00");
});

test("creates a solar arc request with forecast date and time", () => {
  const request = createChartRequest({
    mode: "forecast",
    category: "solar-arc",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
      latitude: "31.2304",
      longitude: "121.4737",
      timezone: "Asia/Shanghai",
    },
    forecastDate: "2026-05-01",
    forecastTime: "12:00",
  });

  assert.equal(request.category, "solar-arc");
  assert.equal(request.forecastDate, "2026-05-01");
  assert.equal(request.forecastTime, "12:00");
});

test("creates a tertiary progression request with forecast date and time", () => {
  const request = createChartRequest({
    mode: "forecast",
    category: "tertiary-progression",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
      latitude: "31.2304",
      longitude: "121.4737",
      timezone: "Asia/Shanghai",
    },
    forecastDate: "2026-05-01",
    forecastTime: "12:00",
  });

  assert.equal(request.category, "tertiary-progression");
  assert.equal(request.forecastDate, "2026-05-01");
  assert.equal(request.forecastTime, "12:00");
});

test("creates a davison tertiary progression request with second person and forecast time", () => {
  const request = createChartRequest({
    mode: "forecast",
    category: "davison-tertiary-progression",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
      latitude: "31.2304",
      longitude: "121.4737",
      timezone: "Asia/Shanghai",
    },
    secondary: {
      name: "Sol",
      date: "1993-09-07",
      time: "21:10",
      location: "Beijing",
      latitude: "39.9042",
      longitude: "116.4074",
      timezone: "Asia/Shanghai",
    },
    forecastDate: "2026-05-01",
    forecastTime: "12:00",
  });

  assert.equal(request.category, "davison-tertiary-progression");
  assert.equal(request.secondary.name, "Sol");
  assert.equal(request.forecastDate, "2026-05-01");
  assert.equal(request.forecastTime, "12:00");
});

test("merges partial chart settings with defaults at request creation time", () => {
  const request = createChartRequest({
    mode: "single",
    category: "natal",
    settings: {
      aspectSet: "major_extended",
    },
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
    },
  });

  assert.deepEqual(request.settings, {
    houseSystem: "placidus",
    zodiac: "tropical",
    aspectSet: "major_extended",
    orbProfile: "default",
  });
});

test("builds the same regeneration request key for equivalent chart requests", () => {
  const firstRequest = createChartRequest({
    mode: "forecast",
    category: "transit",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
      latitude: "31.2304",
      longitude: "121.4737",
      timezone: "Asia/Shanghai",
    },
    settings: {
      houseSystem: "whole-sign",
      aspectSet: "major_extended",
      orbProfile: "tight",
    },
    forecastDate: "2026-05-01",
    forecastTime: "12:00",
  });
  const secondRequest = createChartRequest({
    mode: "forecast",
    category: "transit",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
      latitude: "31.2304",
      longitude: "121.4737",
      timezone: "Asia/Shanghai",
    },
    settings: {
      houseSystem: "whole-sign",
      aspectSet: "major_extended",
      orbProfile: "tight",
    },
    forecastDate: "2026-05-01",
    forecastTime: "12:00",
  });

  assert.equal(buildRegenerationRequestKey(firstRequest), buildRegenerationRequestKey(secondRequest));
});

test("changes regeneration request key when chart settings change", () => {
  const defaultRequest = createChartRequest({
    mode: "single",
    category: "natal",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
    },
  });
  const changedSettingsRequest = createChartRequest({
    mode: "single",
    category: "natal",
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      location: "Shanghai",
    },
    settings: {
      houseSystem: "equal",
    },
  });

  assert.notEqual(
    buildRegenerationRequestKey(defaultRequest),
    buildRegenerationRequestKey(changedSettingsRequest),
  );
});

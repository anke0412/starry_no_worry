import test from "node:test";
import assert from "node:assert/strict";

import { createChartRequest, generateChartSnapshot } from "../src/lib/chartEngine.js";

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
  assert.equal(request.solarReturnLocation.locationName, "Tokyo");
});

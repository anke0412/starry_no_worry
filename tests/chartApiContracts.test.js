import test from "node:test";
import assert from "node:assert/strict";

import {
  buildNatalChartPayload,
  buildSynastryChartPayload,
  buildTransitChartPayload,
} from "../src/lib/api/chartContracts.js";

const primary = {
  name: "Luna",
  date: "1996-04-12",
  time: "08:30",
  location: "Shanghai",
  latitude: "31.2304",
  longitude: "121.4737",
  timezone: "Asia/Shanghai",
};

const secondary = {
  name: "Sol",
  date: "1993-09-07",
  time: "21:10",
  location: "Beijing",
  latitude: "39.9042",
  longitude: "116.4074",
  timezone: "Asia/Shanghai",
};

test("builds a natal chart API payload with default settings", () => {
  assert.deepEqual(buildNatalChartPayload(primary), {
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      locationName: "Shanghai",
      latitude: 31.2304,
      longitude: 121.4737,
      timezone: "Asia/Shanghai",
    },
    settings: {
      houseSystem: "placidus",
      zodiac: "tropical",
      aspectSet: "major",
      orbProfile: "default",
    },
  });
});

test("builds a synastry chart API payload with two profiles", () => {
  const payload = buildSynastryChartPayload(primary, secondary);

  assert.equal(payload.primary.name, "Luna");
  assert.equal(payload.secondary.name, "Sol");
  assert.equal(payload.settings.houseSystem, "placidus");
});

test("builds a transit chart API payload with transit target time", () => {
  const payload = buildTransitChartPayload(primary, {
    transitDate: "2026-05-01",
    transitTime: "12:00",
  });

  assert.equal(payload.transitDate, "2026-05-01");
  assert.equal(payload.transitTime, "12:00");
});

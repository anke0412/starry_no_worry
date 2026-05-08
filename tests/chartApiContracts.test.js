import test from "node:test";
import assert from "node:assert/strict";

import {
  aspectSetOptions,
  buildCompositeChartPayload,
  buildCompositeProgressionChartPayload,
  buildCompositeTertiaryProgressionChartPayload,
  buildDavisonChartPayload,
  buildDavisonProgressionChartPayload,
  buildDavisonTertiaryProgressionChartPayload,
  buildLunarReturnChartPayload,
  buildMarxChartPayload,
  buildNatalChartPayload,
  buildProgressionChartPayload,
  buildSolarArcChartPayload,
  buildSolarReturnChartPayload,
  buildSynastryChartPayload,
  buildTertiaryProgressionChartPayload,
  buildTransitChartPayload,
  defaultChartSettings,
  houseSystemOptions,
  orbProfileOptions,
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

test("builds composite payload from two birth profiles", () => {
  assert.deepEqual(buildCompositeChartPayload(primary, secondary), {
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      locationName: "Shanghai",
      latitude: 31.2304,
      longitude: 121.4737,
      timezone: "Asia/Shanghai",
    },
    secondary: {
      name: "Sol",
      date: "1993-09-07",
      time: "21:10",
      locationName: "Beijing",
      latitude: 39.9042,
      longitude: 116.4074,
      timezone: "Asia/Shanghai",
    },
    settings: defaultChartSettings,
  });
});

test("builds davison payload from two birth profiles", () => {
  assert.deepEqual(buildDavisonChartPayload(primary, secondary), {
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      locationName: "Shanghai",
      latitude: 31.2304,
      longitude: 121.4737,
      timezone: "Asia/Shanghai",
    },
    secondary: {
      name: "Sol",
      date: "1993-09-07",
      time: "21:10",
      locationName: "Beijing",
      latitude: 39.9042,
      longitude: 116.4074,
      timezone: "Asia/Shanghai",
    },
    settings: defaultChartSettings,
  });
});

test("builds marx payload from two birth profiles", () => {
  assert.deepEqual(buildMarxChartPayload(primary, secondary), {
    primary: {
      name: "Luna",
      date: "1996-04-12",
      time: "08:30",
      locationName: "Shanghai",
      latitude: 31.2304,
      longitude: 121.4737,
      timezone: "Asia/Shanghai",
    },
    secondary: {
      name: "Sol",
      date: "1993-09-07",
      time: "21:10",
      locationName: "Beijing",
      latitude: 39.9042,
      longitude: 116.4074,
      timezone: "Asia/Shanghai",
    },
    settings: defaultChartSettings,
  });
});

test("builds a transit chart API payload with transit target time", () => {
  const payload = buildTransitChartPayload(primary, {
    transitDate: "2026-05-01",
    transitTime: "12:00",
  });

  assert.equal(payload.transitDate, "2026-05-01");
  assert.equal(payload.transitTime, "12:00");
});

test("builds a progression chart API payload with target time", () => {
  const payload = buildProgressionChartPayload(primary, {
    progressionDate: "2026-05-01",
    progressionTime: "12:00",
  });

  assert.equal(payload.progressionDate, "2026-05-01");
  assert.equal(payload.progressionTime, "12:00");
});

test("builds a composite progression chart API payload with target time", () => {
  const payload = buildCompositeProgressionChartPayload(primary, secondary, {
    progressionDate: "2026-05-01",
    progressionTime: "12:00",
  });

  assert.equal(payload.secondary.name, "Sol");
  assert.equal(payload.progressionDate, "2026-05-01");
  assert.equal(payload.progressionTime, "12:00");
});

test("builds a davison progression chart API payload with target time", () => {
  const payload = buildDavisonProgressionChartPayload(primary, secondary, {
    progressionDate: "2026-05-01",
    progressionTime: "12:00",
  });

  assert.equal(payload.secondary.name, "Sol");
  assert.equal(payload.progressionDate, "2026-05-01");
  assert.equal(payload.progressionTime, "12:00");
});

test("builds a solar arc chart API payload with target time", () => {
  const payload = buildSolarArcChartPayload(primary, {
    solarArcDate: "2026-05-01",
    solarArcTime: "12:00",
  });

  assert.equal(payload.solarArcDate, "2026-05-01");
  assert.equal(payload.solarArcTime, "12:00");
});

test("builds a tertiary progression chart API payload with target time", () => {
  const payload = buildTertiaryProgressionChartPayload(primary, {
    tertiaryDate: "2026-05-01",
    tertiaryTime: "12:00",
  });

  assert.equal(payload.tertiaryDate, "2026-05-01");
  assert.equal(payload.tertiaryTime, "12:00");
});

test("builds a composite tertiary progression chart API payload with target time", () => {
  const payload = buildCompositeTertiaryProgressionChartPayload(primary, secondary, {
    tertiaryDate: "2026-05-01",
    tertiaryTime: "12:00",
  });

  assert.equal(payload.secondary.name, "Sol");
  assert.equal(payload.tertiaryDate, "2026-05-01");
  assert.equal(payload.tertiaryTime, "12:00");
});

test("builds a davison tertiary progression chart API payload with target time", () => {
  const payload = buildDavisonTertiaryProgressionChartPayload(primary, secondary, {
    tertiaryDate: "2026-05-01",
    tertiaryTime: "12:00",
  });

  assert.equal(payload.secondary.name, "Sol");
  assert.equal(payload.tertiaryDate, "2026-05-01");
  assert.equal(payload.tertiaryTime, "12:00");
});

test("builds a solar return chart API payload with anchor and return location", () => {
  const payload = buildSolarReturnChartPayload(primary, {
    anchorDate: "2026-04-27",
    anchorTime: "18:00",
    returnLocation: {
      locationName: "Tokyo",
      latitude: "35.6762",
      longitude: "139.6503",
      timezone: "Asia/Tokyo",
    },
  });

  assert.equal(payload.anchorDate, "2026-04-27");
  assert.equal(payload.anchorTime, "18:00");
  assert.equal(payload.returnLocation.locationName, "Tokyo");
  assert.equal(payload.returnLocation.latitude, 35.6762);
});

test("builds a lunar return chart API payload with anchor and return location", () => {
  const payload = buildLunarReturnChartPayload(primary, {
    anchorDate: "2026-05-16",
    anchorTime: "06:30",
    returnLocation: {
      locationName: "Seoul",
      latitude: "37.5665",
      longitude: "126.9780",
      timezone: "Asia/Seoul",
    },
  });

  assert.equal(payload.anchorDate, "2026-05-16");
  assert.equal(payload.anchorTime, "06:30");
  assert.equal(payload.returnLocation.locationName, "Seoul");
  assert.equal(payload.returnLocation.longitude, 126.978);
});

test("merges custom settings into payloads", () => {
  const payload = buildNatalChartPayload(primary, {
    houseSystem: "equal",
    aspectSet: "major_extended",
    orbProfile: "wide",
  });

  assert.deepEqual(payload.settings, {
    houseSystem: "equal",
    zodiac: "tropical",
    aspectSet: "major_extended",
    orbProfile: "wide",
  });
});

test("exports selectable settings options for the form", () => {
  assert.equal(houseSystemOptions.length, 3);
  assert.equal(aspectSetOptions.length, 2);
  assert.equal(orbProfileOptions.length, 3);
});

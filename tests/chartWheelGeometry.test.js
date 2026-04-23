import test from "node:test";
import assert from "node:assert/strict";

import {
  angleForLongitude,
  buildHouseLineModel,
  buildChartWheelModel,
  pointOnWheel,
  zodiacSegments,
} from "../src/lib/chartWheelGeometry.js";

test("places the ascendant on the left side of the chart wheel", () => {
  assert.equal(angleForLongitude(88.2, 88.2), 180);
  assert.equal(angleForLongitude(178.2, 88.2), 270);

  const point = pointOnWheel({ longitude: 88.2, ascendantLongitude: 88.2, radius: 140, center: 200 });

  assert.equal(Math.round(point.x), 60);
  assert.equal(Math.round(point.y), 200);
});

test("builds zodiac segments and layered wheel placements from chart data", () => {
  const wheel = buildChartWheelModel({
    placementGroups: [
      {
        id: "primary",
        title: "Luna 的本命星体",
        placements: [
          { planet: "太阳", longitude: 22.4, sign: "白羊", degree: 22, minute: 24, house: 1 },
          { planet: "上升点", longitude: 88.2, sign: "双子", degree: 28, minute: 12, house: 1 },
          { planet: "天顶", longitude: 331.5, sign: "双鱼", degree: 1, minute: 30, house: 10 },
        ],
      },
      {
        id: "outer",
        title: "Sol 的本命星体",
        placements: [{ planet: "月亮", longitude: 70, sign: "双子", degree: 10, minute: 0, house: 7 }],
      },
    ],
    aspects: [{ from: "太阳", to: "月亮", type: "trine", orb: "1.2°" }],
  });

  assert.equal(zodiacSegments().length, 12);
  assert.equal(wheel.ascendantLongitude, 88.2);
  assert.equal(wheel.layers.length, 2);
  assert.equal(wheel.layers[0].placements[0].planet, "太阳");
  assert.equal(wheel.layers[0].placements[0].radius, 126);
  assert.equal(wheel.layers[1].placements[0].radius, 154);
  assert.equal(wheel.angleMarkers.ascendant.planet, "上升点");
  assert.equal(wheel.angleMarkers.descendant.planet, "下降点");
  assert.equal(wheel.angleMarkers.ascendant.radius, 126);
  assert.equal(wheel.angleMarkers.descendant.radius, 126);
  assert.equal(wheel.axes.midheaven.label, "MC");
  assert.equal(wheel.axes.imumCoeli.label, "IC");
  assert.equal(wheel.aspectLines[0].from.planet, "太阳");
  assert.equal(wheel.aspectLines[0].to.planet, "月亮");
});

test("staggers clustered placements so dense signs stay readable", () => {
  const wheel = buildChartWheelModel({
    placementGroups: [
      {
        id: "primary",
        title: "Luna 的本命星体",
        placements: [
          { planet: "太阳", longitude: 280, sign: "摩羯", degree: 10, minute: 0, house: 12 },
          { planet: "水星", longitude: 282, sign: "摩羯", degree: 12, minute: 0, house: 12 },
          { planet: "火星", longitude: 284, sign: "摩羯", degree: 14, minute: 0, house: 12 },
          { planet: "上升点", longitude: 304, sign: "水瓶", degree: 4, minute: 0, house: 1 },
          { planet: "天顶", longitude: 231, sign: "天蝎", degree: 21, minute: 0, house: 10 },
        ],
      },
    ],
    aspects: [],
  });

  const radii = wheel.layers[0].placements.slice(0, 3).map((placement) => placement.radius);

  assert.deepEqual(radii, [126, 138, 114]);
});

test("keeps house divider lines short and inside the zodiac band", () => {
  const line = buildHouseLineModel({
    house: 1,
    longitude: 88.2,
    ascendantLongitude: 88.2,
    center: 200,
  });

  assert.equal(line.innerRadius, 136);
  assert.equal(line.outerRadius, 158);
  assert.equal(Math.round(line.inner.x), 64);
  assert.equal(Math.round(line.outer.x), 42);
});

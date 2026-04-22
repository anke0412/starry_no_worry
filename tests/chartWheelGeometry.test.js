import test from "node:test";
import assert from "node:assert/strict";

import {
  angleForLongitude,
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
  assert.equal(wheel.axes.ascendant.label, "ASC");
  assert.equal(wheel.axes.midheaven.label, "MC");
  assert.equal(wheel.aspectLines[0].from.planet, "太阳");
  assert.equal(wheel.aspectLines[0].to.planet, "月亮");
});

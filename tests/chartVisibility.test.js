import test from "node:test";
import assert from "node:assert/strict";

import { applyVisibilityFilters, defaultVisibilitySettings } from "../src/lib/chartVisibility.js";

test("filters optional points, angles, overlays, and aspects from a workspace chart", () => {
  const chart = {
    placements: [
      { planet: "太阳", longitude: 10, house: 1, sign: "白羊", degree: 10, minute: 0 },
      { planet: "北交点", longitude: 20, house: 2, sign: "白羊", degree: 20, minute: 0 },
      { planet: "凯龙星", longitude: 30, house: 3, sign: "金牛", degree: 0, minute: 0 },
      { planet: "上升点", longitude: 40, house: 1, sign: "双子", degree: 10, minute: 0 },
    ],
    placementGroups: [
      {
        id: "primary",
        title: "本命星体",
        placements: [
          { planet: "太阳", longitude: 10, house: 1, sign: "白羊", degree: 10, minute: 0 },
          { planet: "北交点", longitude: 20, house: 2, sign: "白羊", degree: 20, minute: 0 },
          { planet: "凯龙星", longitude: 30, house: 3, sign: "金牛", degree: 0, minute: 0 },
          { planet: "上升点", longitude: 40, house: 1, sign: "双子", degree: 10, minute: 0 },
        ],
      },
    ],
    aspects: [
      { from: "太阳", to: "北交点", type: "trine", orb: "1.00°" },
      { from: "太阳", to: "凯龙星", type: "sextile", orb: "2.00°" },
      { from: "太阳", to: "上升点", type: "square", orb: "3.00°" },
    ],
    overlays: [
      {
        id: "overlay-1",
        title: "流年星体 飞入 Luna",
        houseTableTitle: "流年星体 飞入 Luna 的宫位",
        placements: [
          { planet: "土星", sign: "双鱼", degree: 10, minute: 0, sourceHouse: 10, overlayHouse: 11, overlayHouseRuler: "木星" },
          { planet: "北交点", sign: "白羊", degree: 20, minute: 0, sourceHouse: 2, overlayHouse: 3, overlayHouseRuler: "水星" },
        ],
        aspects: [
          { from: "土星", to: "太阳", type: "trine", orb: "1.00°" },
          { from: "北交点", to: "太阳", type: "square", orb: "2.00°" },
        ],
      },
    ],
  };

  const filtered = applyVisibilityFilters(chart, {
    ...defaultVisibilitySettings,
    showNodes: false,
    showSupplementalPoints: false,
    showAngles: false,
  });

  assert.deepEqual(filtered.placements.map((placement) => placement.planet), ["太阳"]);
  assert.deepEqual(filtered.placementGroups[0].placements.map((placement) => placement.planet), ["太阳"]);
  assert.deepEqual(filtered.aspects, []);
  assert.deepEqual(filtered.overlays[0].placements.map((placement) => placement.planet), ["土星"]);
  assert.deepEqual(filtered.overlays[0].aspects.map((aspect) => `${aspect.from}-${aspect.to}`), ["土星-太阳"]);
});

test("drops empty placement groups and overlays after visibility filtering", () => {
  const chart = {
    placements: [{ planet: "太阳", longitude: 10, house: 1, sign: "白羊", degree: 10, minute: 0 }],
    placementGroups: [
      {
        id: "angles",
        title: "四轴点",
        placements: [{ planet: "上升点", longitude: 40, house: 1, sign: "双子", degree: 10, minute: 0 }],
      },
      {
        id: "core",
        title: "本命星体",
        placements: [{ planet: "太阳", longitude: 10, house: 1, sign: "白羊", degree: 10, minute: 0 }],
      },
    ],
    aspects: [],
    overlays: [
      {
        id: "overlay-1",
        title: "节点飞入",
        houseTableTitle: "节点飞入的宫位",
        placements: [{ planet: "北交点", sign: "白羊", degree: 20, minute: 0, sourceHouse: 2, overlayHouse: 3, overlayHouseRuler: "水星" }],
        aspects: [],
      },
    ],
  };

  const filtered = applyVisibilityFilters(chart, {
    ...defaultVisibilitySettings,
    showNodes: false,
    showAngles: false,
  });

  assert.deepEqual(filtered.placementGroups.map((group) => group.id), ["core"]);
  assert.deepEqual(filtered.overlays, []);
});

test("drops overlays when rendered placements are fully filtered out even if aspects remain", () => {
  const chart = {
    placements: [{ planet: "太阳", longitude: 10, house: 1, sign: "白羊", degree: 10, minute: 0 }],
    placementGroups: [
      {
        id: "core",
        title: "本命星体",
        placements: [{ planet: "太阳", longitude: 10, house: 1, sign: "白羊", degree: 10, minute: 0 }],
      },
    ],
    aspects: [],
    overlays: [
      {
        id: "overlay-1",
        title: "节点飞入",
        houseTableTitle: "节点飞入的宫位",
        placements: [{ planet: "北交点", sign: "白羊", degree: 20, minute: 0, sourceHouse: 2, overlayHouse: 3, overlayHouseRuler: "水星" }],
        aspects: [{ from: "太阳", to: "太阳", type: "square", orb: "2.00°" }],
      },
    ],
  };

  const filtered = applyVisibilityFilters(chart, {
    ...defaultVisibilitySettings,
    showNodes: false,
  });

  assert.deepEqual(filtered.overlays, []);
});

import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAspectSelectionKeys,
  buildOverlaySelectionKeys,
  buildPlacementSelectionKey,
} from "../src/lib/chartSelection.js";
import { applyVisibilityFilters, defaultVisibilitySettings } from "../src/lib/chartVisibility.js";

test("buildPlacementSelectionKey uses group id and planet label", () => {
  assert.equal(buildPlacementSelectionKey({ planet: "太阳" }, "natal-luna"), "natal-luna:太阳");
});

test("buildAspectSelectionKeys prefers explicit group ids when present", () => {
  const keys = buildAspectSelectionKeys(
    {
      from: "太阳",
      to: "月亮",
      fromGroupId: "natal-luna",
      toGroupId: "transit-sky",
    },
    [],
  );

  assert.deepEqual(keys, ["natal-luna:太阳", "transit-sky:月亮"]);
});

test("buildOverlaySelectionKeys prefers the overlay chart group instead of fan-out matches", () => {
  const keys = buildOverlaySelectionKeys(
    { planet: "月亮" },
    {
      overlayChartId: "transit-sky",
      referenceChartId: "natal-luna",
      overlayName: "流年星体",
      referenceName: "Luna",
    },
    [
      { id: "natal-luna", placements: [{ planet: "太阳" }, { planet: "月亮" }] },
      { id: "transit-sky", placements: [{ planet: "月亮" }] },
    ],
  );

  assert.deepEqual(keys, ["transit-sky:月亮"]);
});

test("applyVisibilityFilters hides nodes supplemental points and angles from chart surfaces", () => {
  const chart = {
    placements: [
      { planet: "太阳" },
      { planet: "北交点" },
      { planet: "凯龙星" },
      { planet: "上升点" },
    ],
    placementGroups: [
      {
        id: "natal-luna",
        placements: [
          { planet: "太阳" },
          { planet: "北交点" },
          { planet: "凯龙星" },
          { planet: "上升点" },
        ],
      },
    ],
    aspects: [
      { from: "太阳", to: "北交点" },
      { from: "太阳", to: "凯龙星" },
      { from: "太阳", to: "上升点" },
    ],
    overlays: [
      {
        placements: [{ planet: "凯龙星" }, { planet: "太阳" }],
        aspects: [{ from: "太阳", to: "凯龙星" }],
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
  assert.deepEqual(filtered.overlays[0].placements.map((placement) => placement.planet), ["太阳"]);
});

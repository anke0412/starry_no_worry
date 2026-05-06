import test from "node:test";
import assert from "node:assert/strict";

import { buildAspectSelectionKeys, buildOverlaySelectionKeys, buildPlacementSelectionKey } from "../src/lib/chartSelection.js";

test("builds the same selection key for the same placement identity", () => {
  const firstKey = buildPlacementSelectionKey(
    { planet: "太阳", longitude: 22.4, sign: "白羊", house: 1 },
    "primary",
  );
  const secondKey = buildPlacementSelectionKey(
    { planet: "太阳", longitude: 22.4, sign: "白羊", house: 1 },
    "primary",
  );

  assert.equal(firstKey, secondKey);
});

test("changes selection key when group identity changes", () => {
  const primaryKey = buildPlacementSelectionKey(
    { planet: "太阳", longitude: 22.4, sign: "白羊", house: 1 },
    "primary",
  );
  const secondaryKey = buildPlacementSelectionKey(
    { planet: "太阳", longitude: 22.4, sign: "白羊", house: 1 },
    "secondary",
  );

  assert.notEqual(primaryKey, secondaryKey);
});

test("changes selection key when placement longitude changes", () => {
  const firstKey = buildPlacementSelectionKey(
    { planet: "太阳", longitude: 22.4, sign: "白羊", house: 1 },
    "primary",
  );
  const secondKey = buildPlacementSelectionKey(
    { planet: "太阳", longitude: 22.5, sign: "白羊", house: 1 },
    "primary",
  );

  assert.notEqual(firstKey, secondKey);
});

test("builds two placement selection keys for a dual-layer aspect row", () => {
  const selectionKeys = buildAspectSelectionKeys(
    { from: "太阳", to: "月亮" },
    [
      {
        id: "primary",
        placements: [{ planet: "太阳", longitude: 22.4 }],
      },
      {
        id: "secondary",
        placements: [{ planet: "月亮", longitude: 40 }],
      },
    ],
  );

  assert.deepEqual(selectionKeys, [
    buildPlacementSelectionKey({ planet: "太阳", longitude: 22.4 }, "primary"),
    buildPlacementSelectionKey({ planet: "月亮", longitude: 40 }, "secondary"),
  ]);
});

test("builds two keys from the same layer for a single-chart aspect row", () => {
  const selectionKeys = buildAspectSelectionKeys(
    { from: "太阳", to: "月亮" },
    [
      {
        id: "natal",
        placements: [
          { planet: "太阳", longitude: 22.4 },
          { planet: "月亮", longitude: 40 },
        ],
      },
    ],
  );

  assert.deepEqual(selectionKeys, [
    buildPlacementSelectionKey({ planet: "太阳", longitude: 22.4 }, "natal"),
    buildPlacementSelectionKey({ planet: "月亮", longitude: 40 }, "natal"),
  ]);
});

test("builds one placement selection key for an overlay row", () => {
  const selectionKeys = buildOverlaySelectionKeys(
    { planet: "土星", longitude: 350 },
    [
      {
        id: "primary",
        placements: [{ planet: "太阳", longitude: 22.4 }],
      },
      {
        id: "transit",
        placements: [{ planet: "土星", longitude: 350 }],
      },
    ],
  );

  assert.deepEqual(selectionKeys, [buildPlacementSelectionKey({ planet: "土星", longitude: 350 }, "transit")]);
});

test("builds aspect selection keys from explicit group ids for relationship transit rows", () => {
  const selectionKeys = buildAspectSelectionKeys(
    {
      from: "月亮",
      to: "土星",
      fromGroupId: "secondary",
      toGroupId: "transit",
    },
    [
      {
        id: "primary",
        placements: [{ planet: "太阳", longitude: 22.4 }],
      },
      {
        id: "secondary",
        placements: [{ planet: "月亮", longitude: 40 }],
      },
      {
        id: "transit",
        placements: [{ planet: "土星", longitude: 350 }],
      },
    ],
  );

  assert.deepEqual(selectionKeys, [
    buildPlacementSelectionKey({ planet: "月亮", longitude: 40 }, "secondary"),
    buildPlacementSelectionKey({ planet: "土星", longitude: 350 }, "transit"),
  ]);
});

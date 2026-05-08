import test from "node:test";
import assert from "node:assert/strict";

import {
  applyPresetToLocation,
  cityOptions,
  countryOptions,
  defaultLocationState,
  locationSummary,
} from "../src/data/locationCatalog.js";

test("location catalog exposes expanded built-in country coverage beyond China and the United States", () => {
  const optionValues = countryOptions().map((option) => option.value);

  assert.deepEqual(optionValues, [
    "china",
    "usa",
    "japan",
    "south-korea",
    "singapore",
    "united-kingdom",
    "canada",
    "australia",
    "custom",
  ]);
});

test("location catalog applies preset cities and timezones for newly added countries", () => {
  const japan = defaultLocationState("japan", "tokyo");
  const canada = applyPresetToLocation(
    { countryId: "canada", cityId: "", location: "", latitude: "", longitude: "", timezone: "" },
    "canada",
    "vancouver",
  );

  assert.equal(japan.location, "Tokyo");
  assert.equal(japan.timezone, "Asia/Tokyo");
  assert.equal(locationSummary(japan), "35.6762, 139.6503 · Asia/Tokyo");

  assert.equal(canada.location, "Vancouver");
  assert.equal(canada.timezone, "America/Vancouver");
  assert.deepEqual(
    cityOptions("australia").map((option) => option.value),
    ["sydney", "melbourne", "brisbane", "perth", "custom"],
  );
});

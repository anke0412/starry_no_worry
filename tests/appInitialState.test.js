import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

test("workspace does not initialize with a generated placeholder chart", () => {
  assert.match(appSource, /const \[result, setResult\] = useState\(null\)/);
  assert.doesNotMatch(appSource, /useState\(\(\) => buildResult\(/);
  assert.doesNotMatch(appSource, /function EmptyChartState/);
});

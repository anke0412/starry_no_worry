import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

test("workspace does not initialize with a generated placeholder chart", () => {
  assert.match(appSource, /const \[result, setResult\] = useState\(null\)/);
  assert.doesNotMatch(appSource, /useState\(\(\) => buildResult\(/);
  assert.doesNotMatch(appSource, /function EmptyChartState/);
});

test("chart result panel renders an aspect list", () => {
  assert.match(appSource, />主要相位</);
  assert.match(appSource, /result\.chart\.aspects\.map/);
});

test("natal result page uses stacked interpretation layout and tables", () => {
  assert.match(appSource, /className="result-stack"/);
  assert.match(appSource, />星体落点</);
  assert.match(appSource, />星体</);
  assert.match(appSource, />星座</);
  assert.match(appSource, />度数</);
  assert.match(appSource, />宫位</);
  assert.match(appSource, />星体 A</);
  assert.match(appSource, />星体 B</);
  assert.match(appSource, />相位类型</);
  assert.match(appSource, />容许度</);
});

test("result page renders overlay house tables when available", () => {
  assert.match(appSource, /result\.chart\.overlays\.map/);
  assert.match(appSource, />落入参考盘宫位</);
  assert.match(appSource, />原本宫位</);
});

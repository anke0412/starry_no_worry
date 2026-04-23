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

test("chart result panel renders a reusable chart wheel instead of the placeholder visual", () => {
  assert.match(appSource, /<ChartWheel chart=\{result\.chart\} \/>/);
  assert.doesNotMatch(appSource, /星盘图占位/);
  assert.doesNotMatch(appSource, /planet-dot/);
});

test("chart wheel includes a compact aspect legend", () => {
  const chartWheelSource = readFileSync(new URL("../src/components/chart/ChartWheel.jsx", import.meta.url), "utf8");

  assert.match(chartWheelSource, /chart-wheel-aspect-legend/);
  assert.match(chartWheelSource, /label: "合相"/);
  assert.match(chartWheelSource, /label: "刑冲"/);
  assert.match(chartWheelSource, /label: "和谐相位"/);
});

test("chart wheel uses astrology glyphs and angle markers instead of text initials", () => {
  const chartWheelSource = readFileSync(new URL("../src/components/chart/ChartWheel.jsx", import.meta.url), "utf8");

  assert.match(chartWheelSource, /planetGlyph/);
  assert.match(chartWheelSource, /☉/);
  assert.match(chartWheelSource, /☽/);
  assert.match(chartWheelSource, /wheel-angle-marker/);
  assert.doesNotMatch(chartWheelSource, /planetShortLabel/);
  assert.doesNotMatch(chartWheelSource, /wheel-axis-asc/);
  assert.doesNotMatch(chartWheelSource, /wheel-axis-dsc/);
});

test("natal result page uses stacked interpretation layout and tables", () => {
  assert.match(appSource, /className="result-stack"/);
  assert.match(appSource, /result\.chart\.placementGroups\.map/);
  assert.match(appSource, />星体</);
  assert.match(appSource, />星座</);
  assert.match(appSource, />度数</);
  assert.match(appSource, />宫位</);
  assert.match(appSource, /result\.chart\.aspectOwners\.from/);
  assert.match(appSource, /result\.chart\.aspectOwners\.to/);
  assert.match(appSource, />相位类型</);
  assert.match(appSource, />容许度</);
});

test("result page renders overlay house tables when available", () => {
  assert.match(appSource, /result\.chart\.overlays\.map/);
  assert.match(appSource, />飞入宫位</);
  assert.match(appSource, />原本宫位</);
  assert.match(appSource, />飞入宫位宫主星</);
  assert.match(appSource, /result\.chart\.placementGroups\.map/);
  assert.match(appSource, /result\.chart\.aspectOwners\.from/);
});

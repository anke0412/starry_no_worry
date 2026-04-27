import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

test("workspace does not initialize with a generated placeholder chart", () => {
  assert.match(appSource, /const \[result, setResult\] = useState\(null\)/);
  assert.doesNotMatch(appSource, /useState\(\(\) => buildResult\(/);
  assert.doesNotMatch(appSource, /function EmptyChartState/);
});

test("workspace exposes chart settings controls for house system and aspect calculation", () => {
  assert.match(appSource, /const \[settings, setSettings\] = useState\(defaultChartSettings\)/);
  assert.match(appSource, /<details className="advanced-settings">/);
  assert.match(appSource, /高级设置/);
  assert.match(appSource, /宫位系统/);
  assert.match(appSource, /相位集合/);
  assert.match(appSource, /容许度/);
});

test("chart result panel renders an aspect list", () => {
  assert.match(appSource, />主要相位</);
  assert.match(appSource, /result\.chart\.aspects\.map/);
  assert.match(appSource, /aspect-chip/);
});

test("chart result panel renders a reusable chart wheel instead of the placeholder visual", () => {
  assert.match(appSource, /<ChartWheel chart=\{result\.chart\} \/>/);
  assert.doesNotMatch(appSource, /星盘图占位/);
  assert.doesNotMatch(appSource, /planet-dot/);
});

test("chart wheel hides visual aspect lines and folds aspect information into planet tooltips", () => {
  const chartWheelSource = readFileSync(new URL("../src/components/chart/ChartWheel.jsx", import.meta.url), "utf8");

  assert.doesNotMatch(chartWheelSource, /chart-wheel-aspect-legend/);
  assert.doesNotMatch(chartWheelSource, /wheel-aspect-line/);
  assert.doesNotMatch(chartWheelSource, /wheel-aspect-hitbox/);
  assert.doesNotMatch(chartWheelSource, /aspectTooltip/);
  assert.match(chartWheelSource, /relatedAspectLines/);
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

test("chart wheel renders planet glyphs without extra bubble circles", () => {
  const chartWheelSource = readFileSync(new URL("../src/components/chart/ChartWheel.jsx", import.meta.url), "utf8");
  const stylesSource = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.doesNotMatch(chartWheelSource, /<circle cx=\{placement\.point\.x\}/);
  assert.doesNotMatch(stylesSource, /\.wheel-placement circle/);
  assert.match(chartWheelSource, /className=\{placement\.planet === "宿命点" \? "wheel-placement-glyph-vertex" : undefined\}/);
  assert.match(chartWheelSource, /x=\{placement\.labelPoint\.x\}/);
  assert.match(chartWheelSource, /y=\{placement\.labelPoint\.y\}/);
});

test("chart wheel follows a professional point leader layout", () => {
  const chartWheelSource = readFileSync(new URL("../src/components/chart/ChartWheel.jsx", import.meta.url), "utf8");
  const stylesSource = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(chartWheelSource, /wheel-placement-leader/);
  assert.match(chartWheelSource, /wheel-placement-dot/);
  assert.match(chartWheelSource, /wheel-house-axis/);
  assert.match(chartWheelSource, /ZodiacGlyph/);
  assert.match(stylesSource, /\.wheel-placement-leader/);
  assert.match(stylesSource, /\.wheel-house-axis/);
});

test("chart wheel uses themed zodiac glyph assets and a larger aspect field", () => {
  const chartWheelSource = readFileSync(new URL("../src/components/chart/ChartWheel.jsx", import.meta.url), "utf8");
  const zodiacGlyphSource = readFileSync(new URL("../src/components/chart/ZodiacGlyph.jsx", import.meta.url), "utf8");
  const geometrySource = readFileSync(new URL("../src/lib/chartWheelGeometry.js", import.meta.url), "utf8");
  const stylesSource = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(geometrySource, /symbolId: sign\.id/);
  assert.match(zodiacGlyphSource, /aries/);
  assert.match(zodiacGlyphSource, /aquarius/);
  assert.match(chartWheelSource, /zodiacTooltip/);
  assert.match(chartWheelSource, /r="122"/);
  assert.match(chartWheelSource, /line\.labelPoint/);
  assert.doesNotMatch(chartWheelSource, /HOUSE_LABEL_RADIUS/);
  assert.match(stylesSource, /\.wheel-zodiac-glyph/);
});

test("chart wheel has compact placement hover tooltips and softer MC IC axis lines", () => {
  const chartWheelSource = readFileSync(new URL("../src/components/chart/ChartWheel.jsx", import.meta.url), "utf8");
  const geometrySource = readFileSync(new URL("../src/lib/chartWheelGeometry.js", import.meta.url), "utf8");
  const stylesSource = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(chartWheelSource, /chart-wheel-tooltip/);
  assert.match(chartWheelSource, /placementTooltip/);
  assert.match(chartWheelSource, /compactPlacementInfo/);
  assert.match(chartWheelSource, /samePlacement/);
  assert.match(chartWheelSource, /aspectTone/);
  assert.doesNotMatch(chartWheelSource, /houseTooltip/);
  assert.doesNotMatch(chartWheelSource, /<dl>/);
  assert.match(stylesSource, /\.chart-wheel-tooltip/);
  assert.match(stylesSource, /\.chart-wheel-tooltip-harmonious/);
  assert.match(stylesSource, /\.chart-wheel-tooltip-challenging/);
  assert.match(stylesSource, /--wheel-symbol-fill/);
  assert.match(stylesSource, /transform: translate\(-50%, 8px\)/);
  assert.match(stylesSource, /stroke: rgba\(97, 125, 85, 0\.16\)/);
  assert.match(geometrySource, /radius: 122/);
  assert.match(geometrySource, /radius: 158/);
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

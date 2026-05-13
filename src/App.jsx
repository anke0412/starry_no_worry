import React, { useEffect, useState, useTransition } from "react";

import { ChartWheel } from "./components/chart/ChartWheel.jsx";
import { categoriesForMode, readingModes } from "./data/chartCatalog.js";
import {
  applyPresetToLocation,
  cityOptions,
  countryOptions,
  defaultLocationState,
} from "./data/locationCatalog.js";
import { calculateChart } from "./lib/api/chartApi.js";
import {
  aspectSetOptions,
  defaultChartSettings,
  houseSystemOptions,
  orbProfileOptions,
} from "./lib/api/chartContracts.js";
import { buildAspectSelectionKeys, buildOverlaySelectionKeys, buildPlacementSelectionKey } from "./lib/chartSelection.js";
import { applyVisibilityFilters, defaultVisibilitySettings } from "./lib/chartVisibility.js";
import { buildRegenerationRequestKey, createChartRequest } from "./lib/chartEngine.js";
import { buildInterpretationContext, createInterpretationReport } from "./lib/interpretationAgent.js";

const defaultPeople = {
  primary: {
    name: "古乐兽",
    date: "1996-01-01",
    time: "08:30",
    ...defaultLocationState("china", "shanghai"),
  },
  secondary: {
    name: "大耳兽",
    date: "2000-01-01",
    time: "21:10",
    ...defaultLocationState("china", "beijing"),
  },
};

export default function App() {
  const [activeMode, setActiveMode] = useState("single");
  const [activeCategory, setActiveCategory] = useState("natal");
  const [people, setPeople] = useState(defaultPeople);
  const [settings, setSettings] = useState(defaultChartSettings);
  const [visibility, setVisibility] = useState(defaultVisibilitySettings);
  const [forecastDate, setForecastDate] = useState("2026-05-01");
  const [forecastTime, setForecastTime] = useState("12:00");
  const [solarReturnAnchorDate, setSolarReturnAnchorDate] = useState("2026-04-27");
  const [solarReturnAnchorTime, setSolarReturnAnchorTime] = useState("18:00");
  const [solarReturnLocation, setSolarReturnLocation] = useState({
    ...defaultLocationState("china", "shanghai"),
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState("workspace");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedPlacementKey, setSelectedPlacementKey] = useState(null);

  const categories = categoriesForMode(activeMode);
  const selectedCategory = categories.find((category) => category.id === activeCategory) || categories[0];
  const needsSecondPerson = selectedCategory?.requiresSecondPerson;
  const needsForecastDate = selectedCategory?.requiresForecastDate;
  const currentRequestKey = buildRegenerationRequestKey({
    mode: activeMode,
    category: activeCategory,
    primary: people.primary,
    secondary: people.secondary,
    settings,
    forecastDate,
    forecastTime,
    solarReturnAnchorDate,
    solarReturnAnchorTime,
    solarReturnLocation,
  });

  useEffect(() => {
    if (result && result.requestKey !== currentRequestKey) {
      setResult(null);
    }
  }, [currentRequestKey, result]);

  function handleModeChange(mode) {
    const nextCategory = categoriesForMode(mode)[0].id;
    setActiveMode(mode);
    setActiveCategory(nextCategory);
  }

  async function handleGenerate(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const request = createChartRequest({
        mode: activeMode,
        category: activeCategory,
        primary: people.primary,
        secondary: people.secondary,
        settings,
        forecastDate,
        forecastTime,
        solarReturnAnchorDate,
        solarReturnAnchorTime,
        solarReturnLocation,
      });
      const requestKey = buildRegenerationRequestKey({
        mode: activeMode,
        category: activeCategory,
        primary: people.primary,
        secondary: people.secondary,
        settings,
        forecastDate,
        forecastTime,
        solarReturnAnchorDate,
        solarReturnAnchorTime,
        solarReturnLocation,
      });
      const chart = await calculateChart(request);
      const report = createInterpretationReport(buildInterpretationContext(chart));

      startTransition(() => {
        setResult({ chart, report, requestKey });
        setCurrentView("result");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    } catch (chartError) {
      setError(chartError.message);
    } finally {
      setIsLoading(false);
    }
  }

  function updatePerson(role, field, value) {
    setPeople((current) => ({
      ...current,
      [role]: {
        ...updateLocationField(current[role], field, value),
      },
    }));
  }

  function updateSettings(field, value) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateVisibility(field, value) {
    setVisibility((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateSolarReturnLocation(field, value) {
    setSolarReturnLocation((current) => updateLocationField(current, field, value));
  }

  function handleGoHome() {
    setCurrentView("workspace");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (currentView === "result" && result) {
    return (
      <main className="result-page">
        <nav className="result-topbar" aria-label="结果页导航">
          <a className="brand" href="#top" aria-label="Starry首页" onClick={handleGoHome}>
            <span className="brand-mark">✦</span>
            Celestial Starry
          </a>
          <button className="secondary-action" type="button" onClick={() => setCurrentView("workspace")}>
            返回修改资料
          </button>
        </nav>

        <section className="result-stack" id="top">
          <ChartPanel
            result={result}
            visibility={visibility}
            selectedPlacementKey={selectedPlacementKey}
            onPlacementSelect={setSelectedPlacementKey}
          />
          <AgentPanel report={result.report} />
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="hero">
        <nav className="topbar" aria-label="主导航">
          <a className="brand" href="#top" aria-label="Starry首页" onClick={handleGoHome}>
            <span className="brand-mark">✦</span>
            Celestial Starry
          </a>
          <div className="nav-links">
            <a href="#workspace">开始排盘</a>
            <a href="#architecture">查看模块</a>
          </div>
        </nav>

        <div className="hero-content" id="top">
          <p className="eyebrow">Spring Astrology Studio</p>
          <h1>星盘工作台</h1>
          <p className="hero-copy">
            专业排盘流程与AI agent 解读
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#workspace">建立星盘</a>
            <a className="secondary-action" href="#architecture">查看模块</a>
          </div>
        </div>

        <div className="orbital-stage" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="sun-core" />
          <div className="petal petal-a" />
          <div className="petal petal-b" />
          <div className="petal petal-c" />
        </div>
      </section>

      <section className="mode-strip" id="architecture" aria-label="产品模块">
        {readingModes.map((mode) => (
          <article key={mode.id}>
            <span>{mode.eyebrow}</span>
            <h2>{mode.label}</h2>
            <p>{mode.description}</p>
          </article>
        ))}
      </section>

      <section className="workspace" id="workspace">
        <div className="workspace-heading">
          <p className="eyebrow">Chart Workspace</p>
          <h2>开始你的探索之旅</h2>
        </div>

        <div className="workspace-grid">
          <form className="control-panel" onSubmit={handleGenerate}>
            <div className="field-group">
              <label>解读类型</label>
              <div className="segmented">
                {readingModes.map((mode) => (
                  <button
                    className={activeMode === mode.id ? "active" : ""}
                    key={mode.id}
                    onClick={() => handleModeChange(mode.id)}
                    type="button"
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="category">细分盘型</label>
              <select id="category" value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <details className="advanced-settings">
              <summary>高级设置</summary>
              <div className="settings-fields">
                <label>
                  宫位系统
                  <select
                    value={settings.houseSystem}
                    onChange={(event) => updateSettings("houseSystem", event.target.value)}
                  >
                    {houseSystemOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  相位集合
                  <select
                    value={settings.aspectSet}
                    onChange={(event) => updateSettings("aspectSet", event.target.value)}
                  >
                    {aspectSetOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  容许度
                  <select
                    value={settings.orbProfile}
                    onChange={(event) => updateSettings("orbProfile", event.target.value)}
                  >
                    {orbProfileOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="settings-fields">
                <fieldset className="visibility-settings">
                  <legend>显示筛选</legend>
                  <label>
                    <input
                      type="checkbox"
                      checked={visibility.showNodes}
                      onChange={(event) => updateVisibility("showNodes", event.target.checked)}
                    />
                    交点
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={visibility.showSupplementalPoints}
                      onChange={(event) => updateVisibility("showSupplementalPoints", event.target.checked)}
                    />
                    凯龙/莉莉丝/福点/宿命点
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={visibility.showAngles}
                      onChange={(event) => updateVisibility("showAngles", event.target.checked)}
                    />
                    上升点 / 天顶
                  </label>
                </fieldset>
              </div>
            </details>

            <PersonFields person={people.primary} role="primary" title="本人资料" onChange={updatePerson} />

            {needsSecondPerson ? (
              <PersonFields person={people.secondary} role="secondary" title="对方资料" onChange={updatePerson} />
            ) : null}

            {isReturnChartCategory(activeCategory) ? (
              <>
                <fieldset className="person-fields">
                  <legend>{returnChartCopy(activeCategory).timingLegend}</legend>
                  <label>
                    参考日期
                    <input
                      type="date"
                      value={solarReturnAnchorDate}
                      onChange={(event) => setSolarReturnAnchorDate(event.target.value)}
                    />
                  </label>
                  <label>
                    参考时间
                    <input
                      type="time"
                      value={solarReturnAnchorTime}
                      onChange={(event) => setSolarReturnAnchorTime(event.target.value)}
                    />
                  </label>
                </fieldset>
                <ReturnLocationFields
                  title={returnChartCopy(activeCategory).locationLegend}
                  location={solarReturnLocation}
                  onChange={updateSolarReturnLocation}
                />
              </>
            ) : null}

            {needsForecastDate && !isReturnChartCategory(activeCategory) ? (
              <div className="date-time-row">
                <div className="field-group">
                  <label htmlFor="forecastDate">推运日期</label>
                  <input
                    id="forecastDate"
                    type="date"
                    value={forecastDate}
                    onChange={(event) => setForecastDate(event.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="forecastTime">推运时间</label>
                  <input
                    id="forecastTime"
                    type="time"
                    value={forecastTime}
                    onChange={(event) => setForecastTime(event.target.value)}
                  />
                </div>
              </div>
            ) : null}

            {error ? <p className="form-error">{error}</p> : null}

            <button className="generate-button" disabled={isLoading || isPending} type="submit">
              {isLoading || isPending ? "连接后端计算中..." : "生成星盘与解读"}
            </button>
          </form>

          {result ? (
            <ChartPanel
              result={result}
              visibility={visibility}
              selectedPlacementKey={selectedPlacementKey}
              onPlacementSelect={setSelectedPlacementKey}
            />
          ) : null}
        </div>
      </section>

    </main>
  );
}

function PersonFields({ person, role, title, onChange }) {
  const cities = cityOptions(person.countryId);

  return (
    <fieldset className="person-fields">
      <legend>{title}</legend>
      <label>
        姓名
        <input value={person.name} onChange={(event) => onChange(role, "name", event.target.value)} />
      </label>
      <label>
        出生日期
        <input type="date" value={person.date} onChange={(event) => onChange(role, "date", event.target.value)} />
      </label>
      <label>
        出生时间
        <input type="time" value={person.time} onChange={(event) => onChange(role, "time", event.target.value)} />
      </label>
      <label>
        国家
        <select value={person.countryId} onChange={(event) => onChange(role, "countryId", event.target.value)}>
          {countryOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        地区 / 城市
        <select value={person.cityId} onChange={(event) => onChange(role, "cityId", event.target.value)}>
          {cities.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        出生地名称
        <input value={person.location} onChange={(event) => onChange(role, "location", event.target.value)} />
      </label>
      <label>
        纬度
        <input
          type="number"
          step="0.0001"
          value={person.latitude}
          onChange={(event) => onChange(role, "latitude", event.target.value)}
        />
      </label>
      <label>
        经度
        <input
          type="number"
          step="0.0001"
          value={person.longitude}
          onChange={(event) => onChange(role, "longitude", event.target.value)}
        />
      </label>
      <label>
        时区
        <input value={person.timezone} onChange={(event) => onChange(role, "timezone", event.target.value)} />
      </label>
    </fieldset>
  );
}

function ReturnLocationFields({ title, location, onChange }) {
  const cities = cityOptions(location.countryId);

  return (
    <fieldset className="person-fields">
      <legend>{title}</legend>
      <label>
        国家
        <select value={location.countryId} onChange={(event) => onChange("countryId", event.target.value)}>
          {countryOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        地区 / 城市
        <select value={location.cityId} onChange={(event) => onChange("cityId", event.target.value)}>
          {cities.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        地点名称
        <input value={location.location} onChange={(event) => onChange("location", event.target.value)} />
      </label>
      <label>
        纬度
        <input
          type="number"
          step="0.0001"
          value={location.latitude}
          onChange={(event) => onChange("latitude", event.target.value)}
        />
      </label>
      <label>
        经度
        <input
          type="number"
          step="0.0001"
          value={location.longitude}
          onChange={(event) => onChange("longitude", event.target.value)}
        />
      </label>
      <label>
        时区
        <input value={location.timezone} onChange={(event) => onChange("timezone", event.target.value)} />
      </label>
    </fieldset>
  );
}

function updateLocationField(current, field, value) {
  if (field === "countryId") {
    return applyPresetToLocation(current, value, value === "custom" ? "custom" : cityOptions(value)[0].value);
  }

  if (field === "cityId") {
    return applyPresetToLocation(current, current.countryId, value);
  }

  return {
    ...current,
    [field]: value,
  };
}

function isReturnChartCategory(categoryId) {
  return categoryId === "solar-return" || categoryId === "lunar-return";
}

function returnChartCopy(categoryId) {
  if (categoryId === "lunar-return") {
    return {
      timingLegend: "月返参考时间",
      locationLegend: "月返发生地",
    };
  }

  return {
    timingLegend: "日返参考时间",
    locationLegend: "日返发生地",
  };
}

function ChartPanel({ result, visibility, selectedPlacementKey, onPlacementSelect }) {
  const visibleChart = applyVisibilityFilters(result.chart, visibility);
  const [highlightedPlacementKeys, setHighlightedPlacementKeys] = useState([]);
  const activePlacementKeys = highlightedPlacementKeys.length ? highlightedPlacementKeys : selectedPlacementKey ? [selectedPlacementKey] : [];

  return (
    <section className="chart-panel" aria-label="星盘结果">
      <div>
        <p className="eyebrow">Generated Chart</p>
        <h2>{visibleChart.title}</h2>
      </div>

      <ChartWheel
        chart={visibleChart}
        geometrySourceChart={result.chart}
        selectedPlacementKey={selectedPlacementKey}
        highlightedPlacementKeys={highlightedPlacementKeys}
        onPlacementSelect={onPlacementSelect}
      />

      <div className="chart-data">
        <section className="chart-data-section">
          <h3>重点主题</h3>
          <p>{visibleChart.focus.join(" / ")}</p>
        </section>
        {visibleChart.placementGroups.map((group) => (
          <section className="chart-data-section" key={group.id}>
            <h3>{group.title}</h3>
            <StatisticsPanel statistics={group.statistics} />
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>星体</th>
                    <th>星座</th>
                    <th>度数</th>
                    <th>状态</th>
                    <th>宫位</th>
                  </tr>
                </thead>
                <tbody>
                  {group.placements.map((placement, index) => (
                    <tr
                      className={
                        activePlacementKeys.includes(buildPlacementSelectionKey(placement, group.id)) ? "data-row-active" : undefined
                      }
                      key={`${group.id}-${placement.planet}-${index}`}
                      onMouseEnter={() => {
                        setHighlightedPlacementKeys([]);
                        onPlacementSelect(buildPlacementSelectionKey(placement, group.id));
                      }}
                      onMouseLeave={() => onPlacementSelect(null)}
                    >
                      <td>{placement.planet}</td>
                      <td>{placement.sign}</td>
                      <td>
                        {placement.degree}°{placement.minute ? `${placement.minute}'` : ""}
                      </td>
                      <td>{formatMotionState(placement.retrograde)}</td>
                      <td>第 {placement.house} 宫</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
        <section className="chart-data-section">
          <h3>主要相位</h3>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{aspectColumnTitle(visibleChart, "from")}</th>
                  <th>{aspectColumnTitle(visibleChart, "to")}</th>
                  <th>相位类型</th>
                  <th>容许度</th>
                </tr>
              </thead>
              <tbody>
                {visibleChart.aspects.map((aspect, index) => (
                  <tr
                    className={
                      highlightedPlacementKeys.length &&
                      highlightedPlacementKeys.join("|") === buildAspectSelectionKeys(aspect, visibleChart.placementGroups).join("|")
                        ? "aspect-row-active"
                        : undefined
                    }
                    key={`${aspect.from}-${aspect.to}-${index}`}
                    onMouseEnter={() => setHighlightedPlacementKeys(buildAspectSelectionKeys(aspect, visibleChart.placementGroups))}
                    onMouseLeave={() => {
                      setHighlightedPlacementKeys([]);
                      onPlacementSelect(null);
                    }}
                  >
                    <td>{formatAspectParty(aspect, "from")}</td>
                    <td>{formatAspectParty(aspect, "to")}</td>
                    <td>
                      <span className={`aspect-chip aspect-chip-${aspect.tone ?? "neutral"}`}>{aspect.label ?? aspect.type}</span>
                    </td>
                    <td>{aspect.orb}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
        </section>
        {visibleChart.overlays.map((overlay) => (
          <section className="chart-data-section" key={overlay.id}>
            <h3>{overlay.houseTableTitle}</h3>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>星体</th>
                    <th>星座</th>
                    <th>度数</th>
                    <th>状态</th>
                    <th>{overlay.sourceHouseTitle ?? "原本宫位"}</th>
                    <th>飞入宫位</th>
                    <th>飞入宫位宫主星</th>
                  </tr>
                </thead>
                <tbody>
                  {overlay.placements.map((placement, index) => (
                    <tr
                      className={
                        highlightedPlacementKeys.length &&
                        highlightedPlacementKeys.join("|") === buildOverlaySelectionKeys(placement, overlay, visibleChart.placementGroups).join("|")
                          ? "overlay-row-active"
                          : undefined
                      }
                      key={`${overlay.id}-${placement.planet}-${index}`}
                      onMouseEnter={() => setHighlightedPlacementKeys(buildOverlaySelectionKeys(placement, overlay, visibleChart.placementGroups))}
                      onMouseLeave={() => {
                        setHighlightedPlacementKeys([]);
                        onPlacementSelect(null);
                      }}
                    >
                      <td>{placement.planet}</td>
                      <td>{placement.sign}</td>
                      <td>
                        {placement.degree}°{placement.minute ? `${placement.minute}'` : ""}
                      </td>
                      <td>{formatMotionState(placement.retrograde)}</td>
                      <td>{formatHouseValue(placement.sourceHouse)}</td>
                      <td>第 {placement.overlayHouse} 宫</td>
                      <td>{placement.overlayHouseRuler}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function StatisticsPanel({ statistics }) {
  if (!statistics) {
    return null;
  }

  return (
    <div className="chart-statistics" aria-label="统计概览">
      <h4>统计概览</h4>
      <p>统计对象：{statistics.totalBodies} 个核心点位</p>
      <div className="chart-statistics-grid">
        {statistics.sections.map((section) => (
          <div key={section.id}>
            <p>{statisticsSectionTitle(section.id)}</p>
            <p>{section.items.map((item) => `${item.label} ${item.count}`).join(" / ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function statisticsSectionTitle(sectionId) {
  if (sectionId === "elementCounts") {
    return "四象";
  }

  if (sectionId === "modalityCounts") {
    return "三态";
  }

  if (sectionId === "polarityCounts") {
    return "阴阳";
  }

  return "半球";
}

function aspectColumnTitle(chart, side) {
  return `${chart.aspectOwners[side]} 的星体`;
}

function formatAspectParty(aspect, side) {
  const owner = side === "from" ? aspect.fromOwner : aspect.toOwner;
  const planet = side === "from" ? aspect.from : aspect.to;

  if (!owner) {
    return planet;
  }

  return `${owner} · ${planet}`;
}

function formatHouseValue(value) {
  if (value === "-" || value === null || value === undefined) {
    return "-";
  }

  return `第 ${value} 宫`;
}

function formatMotionState(retrograde) {
  return retrograde ? "逆行" : "顺行";
}

function AgentPanel({ report }) {
  return (
    <section className="agent-section" id="agent">
      <div>
        <p className="eyebrow">Interpretation Agent</p>
        <h2>{report.agentName}</h2>
        <p>{report.summary}</p>
      </div>
      <div className="report-list">
        {report.sections.map((section) => (
          <article key={section.id}>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
            {section.citations?.length ? <p>引用依据：{section.citations.join(" / ")}</p> : null}
          </article>
        ))}
      </div>
      <div className="report-list">
        <article>
          <h3>局部解读入口</h3>
          <p>后续 agent 会优先围绕这些局部入口做细读，再拼成整张盘的长文本解读。</p>
          <div className="question-bank">
            {report.entryPoints.map((entryPoint) => (
              <button key={entryPoint.id} type="button">
                {entryPoint.label} · {entryPoint.detail}
              </button>
            ))}
          </div>
        </article>
        <article>
          <h3>检索依据</h3>
          <p>这一层是本地 RAG library 的命中结果，用来给后续 LLM 解读提供稳定、可审计的素材来源。</p>
          <div className="report-list">
            {report.retrievalNotes.map((note) => (
              <article key={note.id}>
                <h3>{note.title}</h3>
                <p>{note.body}</p>
              </article>
            ))}
          </div>
        </article>
        <article>
          <h3>以后问答预留</h3>
          <p>{report.qaBridge.hint}</p>
          <p>当前可复用上下文：{report.qaBridge.reusableContextKeys.join(" / ")}</p>
        </article>
      </div>
      <div className="question-bank">
        <h3>可继续追问</h3>
        {report.recommendedQuestions.map((question) => (
          <button key={question} type="button">
            {question}
          </button>
        ))}
      </div>
    </section>
  );
}

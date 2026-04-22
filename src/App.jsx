import React, { useState, useTransition } from "react";

import { categoriesForMode, readingModes } from "./data/chartCatalog.js";
import { calculateChart } from "./lib/api/chartApi.js";
import { createChartRequest } from "./lib/chartEngine.js";
import { buildInterpretationContext, createInterpretationReport } from "./lib/interpretationAgent.js";

const defaultPeople = {
  primary: {
    name: "古乐兽",
    date: "1996-01-01",
    time: "08:30",
    location: "上海",
    latitude: "31.2304",
    longitude: "121.4737",
    timezone: "Asia/Shanghai",
  },
  secondary: {
    name: "大耳兽",
    date: "2000-01-01",
    time: "21:10",
    location: "北京",
    latitude: "39.9042",
    longitude: "116.4074",
    timezone: "Asia/Shanghai",
  },
};

export default function App() {
  const [activeMode, setActiveMode] = useState("single");
  const [activeCategory, setActiveCategory] = useState("natal");
  const [people, setPeople] = useState(defaultPeople);
  const [forecastDate, setForecastDate] = useState("2026-05-01");
  const [forecastTime, setForecastTime] = useState("12:00");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState("workspace");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const categories = categoriesForMode(activeMode);
  const selectedCategory = categories.find((category) => category.id === activeCategory) || categories[0];
  const needsSecondPerson = selectedCategory?.requiresSecondPerson;
  const needsForecastDate = selectedCategory?.requiresForecastDate;

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
        forecastDate,
        forecastTime,
      });
      const chart = await calculateChart(request);
      const report = createInterpretationReport(buildInterpretationContext(chart));

      startTransition(() => {
        setResult({ chart, report });
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
        ...current[role],
        [field]: value,
      },
    }));
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

        <section className="result-layout" id="top">
          <ChartPanel result={result} />
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

            <PersonFields person={people.primary} role="primary" title="本人资料" onChange={updatePerson} />

            {needsSecondPerson ? (
              <PersonFields person={people.secondary} role="secondary" title="对方资料" onChange={updatePerson} />
            ) : null}

            {needsForecastDate ? (
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

          {result ? <ChartPanel result={result} /> : null}
        </div>
      </section>

    </main>
  );
}

function PersonFields({ person, role, title, onChange }) {
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
        出生地
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

function ChartPanel({ result }) {
  return (
    <section className="chart-panel" aria-label="星盘结果">
      <div>
        <p className="eyebrow">Generated Chart</p>
        <h2>{result.chart.title}</h2>
      </div>

      <div className="chart-visual" aria-label="星盘图占位">
        {result.chart.placements.map((placement, index) => (
          <span
            className="planet-dot"
            key={`${placement.planet}-${index}`}
            style={{
              "--angle": `${index * 58 + 18}deg`,
              "--distance": `${38 + (index % 3) * 13}%`,
            }}
            title={`${placement.planet} ${placement.sign}`}
          >
            {placement.planet.slice(0, 1)}
          </span>
        ))}
        <div className="zodiac-ring" />
      </div>

      <div className="chart-data">
        <div>
          <h3>重点主题</h3>
          <p>{result.chart.focus.join(" / ")}</p>
        </div>
        <div>
          <h3>行星落点</h3>
          <ul>
            {result.chart.placements.map((placement, index) => (
              <li key={`${placement.planet}-${index}`}>
                {placement.planet}：{placement.sign} {placement.degree}°{placement.minute ? `${placement.minute}'` : ""}
                ，第 {placement.house} 宫
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
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
          </article>
        ))}
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

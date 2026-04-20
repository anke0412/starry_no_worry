import React, { useState, useTransition } from "react";

import { categoriesForMode, readingModes } from "./data/chartCatalog.js";
import { createChartRequest, generateChartSnapshot } from "./lib/chartEngine.js";
import { buildInterpretationContext, createInterpretationReport } from "./lib/interpretationAgent.js";

const defaultPeople = {
  primary: {
    name: "Luna",
    date: "1996-04-12",
    time: "08:30",
    location: "上海",
  },
  secondary: {
    name: "Sol",
    date: "1993-09-07",
    time: "21:10",
    location: "北京",
  },
};

export default function App() {
  const [activeMode, setActiveMode] = useState("single");
  const [activeCategory, setActiveCategory] = useState("natal");
  const [people, setPeople] = useState(defaultPeople);
  const [forecastDate, setForecastDate] = useState("2026-05-01");
  const [result, setResult] = useState(() => buildResult("single", "natal", defaultPeople, "2026-05-01"));
  const [error, setError] = useState("");
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

  function handleGenerate(event) {
    event.preventDefault();

    startTransition(() => {
      try {
        setResult(buildResult(activeMode, activeCategory, people, forecastDate));
        setError("");
      } catch (chartError) {
        setError(chartError.message);
      }
    });
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

  return (
    <main>
      <section className="hero">
        <nav className="topbar" aria-label="主导航">
          <a className="brand" href="#top" aria-label="Celestial Spring 首页">
            <span className="brand-mark">✦</span>
            Celestial Spring
          </a>
          <div className="nav-links">
            <a href="#workspace">开始排盘</a>
            <a href="#agent">解读 Agent</a>
          </div>
        </nav>

        <div className="hero-content" id="top">
          <p className="eyebrow">Spring Astrology Studio</p>
          <h1>把星盘、关系和时间趋势放进一个温柔清晰的工作台。</h1>
          <p className="hero-copy">
            先用春天感入口降低门槛，再进入专业排盘流程。当前框架已预留真实天文历算法和 AI agent 接口。
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
          <h2>选择盘型，输入资料，生成解读上下文。</h2>
        </div>

        <div className="workspace-grid">
          <form className="control-panel" onSubmit={handleGenerate}>
            <div className="field-group">
              <label>解读模式</label>
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
              <div className="field-group">
                <label htmlFor="forecastDate">推运日期</label>
                <input
                  id="forecastDate"
                  type="date"
                  value={forecastDate}
                  onChange={(event) => setForecastDate(event.target.value)}
                />
              </div>
            ) : null}

            {error ? <p className="form-error">{error}</p> : null}

            <button className="generate-button" disabled={isPending} type="submit">
              {isPending ? "生成中..." : "生成星盘与解读"}
            </button>
          </form>

          <ChartPanel result={result} />
        </div>
      </section>

      <section className="agent-section" id="agent">
        <div>
          <p className="eyebrow">Interpretation Agent</p>
          <h2>{result.report.agentName}</h2>
          <p>{result.report.summary}</p>
        </div>
        <div className="report-list">
          {result.report.sections.map((section) => (
            <article key={section.id}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
        <div className="question-bank">
          <h3>可继续追问</h3>
          {result.report.recommendedQuestions.map((question) => (
            <button key={question} type="button">
              {question}
            </button>
          ))}
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
            key={placement.planet}
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
            {result.chart.placements.map((placement) => (
              <li key={placement.planet}>
                {placement.planet}：{placement.sign} {placement.degree}°，第 {placement.house} 宫
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function buildResult(mode, category, people, forecastDate) {
  const request = createChartRequest({
    mode,
    category,
    primary: people.primary,
    secondary: people.secondary,
    forecastDate,
  });
  const chart = generateChartSnapshot(request);
  const report = createInterpretationReport(buildInterpretationContext(chart));

  return { chart, report };
}

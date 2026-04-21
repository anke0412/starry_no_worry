import { findCategory } from "../../data/chartCatalog.js";
import {
  buildNatalChartPayload,
  buildSynastryChartPayload,
  buildTransitChartPayload,
} from "./chartContracts.js";

const DEFAULT_API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const SUPPORTED_ENDPOINTS = {
  natal: "/api/charts/natal",
  synastry: "/api/charts/synastry",
  transit: "/api/charts/transit",
};

export async function calculateChart(input, fetcher = fetch) {
  const category = findCategory(input.category);

  if (!category) {
    throw new Error(`Unknown chart category: ${input.category}`);
  }

  const endpoint = SUPPORTED_ENDPOINTS[input.category];

  if (!endpoint) {
    throw new Error(`${category.label} 暂未接入第一阶段后端计算。请先测试本命盘、比较盘或流年盘。`);
  }

  const response = await fetcher(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildPayload(input)),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message ?? "星盘计算失败，请检查后端服务是否已启动。");
  }

  return mapChartResultToWorkspaceChart(data, input, category);
}

function buildPayload(input) {
  if (input.category === "natal") {
    return buildNatalChartPayload(input.primary);
  }

  if (input.category === "synastry") {
    return buildSynastryChartPayload(input.primary, input.secondary);
  }

  return buildTransitChartPayload(input.primary, {
    transitDate: input.forecastDate,
    transitTime: input.forecastTime,
  });
}

export function mapChartResultToWorkspaceChart(result, input, category = findCategory(input.category)) {
  return {
    id: result.chartId,
    title: `${input.people.map((person) => person.name).join(" × ")} 的${category.outputTitle}`,
    mode: input.mode,
    category: input.category,
    categoryLabel: category.label,
    people: input.people,
    forecastDate: input.forecastDate,
    focus: category.focus,
    placements: result.placements.slice(0, 12).map((placement) => ({
      planet: placement.body,
      sign: placement.sign,
      house: placement.house ?? "-",
      degree: placement.degree,
      minute: placement.minute,
    })),
    aspects: result.aspects.slice(0, 8).map((aspect) => ({
      from: aspect.from,
      to: aspect.to,
      type: aspect.type,
      orb: `${aspect.orb}°`,
    })),
    houseNotes: category.focus.map((item, index) => ({
      house: index + 1,
      theme: item,
    })),
    source: "api",
    rawResult: result,
  };
}

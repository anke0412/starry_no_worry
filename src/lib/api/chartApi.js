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

const BODY_LABELS = {
  Sun: "太阳",
  Moon: "月亮",
  Mercury: "水星",
  Venus: "金星",
  Mars: "火星",
  Jupiter: "木星",
  Saturn: "土星",
  Uranus: "天王星",
  Neptune: "海王星",
  Pluto: "冥王星",
  "North Node": "北交点",
  "South Node": "南交点",
  Ascendant: "上升点",
  Midheaven: "天顶",
};

const BODY_SORT_ORDER = [
  "Sun",
  "Moon",
  "Mars",
  "Venus",
  "Mercury",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "North Node",
  "South Node",
  "Ascendant",
  "Midheaven",
];

const SIGN_LABELS = {
  Aries: "白羊",
  Taurus: "金牛",
  Gemini: "双子",
  Cancer: "巨蟹",
  Leo: "狮子",
  Virgo: "处女",
  Libra: "天秤",
  Scorpio: "天蝎",
  Sagittarius: "射手",
  Capricorn: "摩羯",
  Aquarius: "水瓶",
  Pisces: "双鱼",
};

const TRADITIONAL_SIGN_RULERS = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
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
  const people = peopleForResult(input, category);

  return {
    id: result.chartId,
    title: `${people.map((person) => person.name).join(" × ")} 的${category.outputTitle}`,
    mode: input.mode,
    category: input.category,
    categoryLabel: category.label,
    people,
    forecastDate: input.forecastDate,
    focus: category.focus,
    placements: result.placements.slice(0, 14).map((placement) => ({
      ...mapPlacement(placement),
    })),
    placementGroups: mapPlacementGroups(result, input),
    aspectOwners: mapAspectOwners(result, input),
    aspects: sortAspectsByBodyOrder(result.aspects).map(mapAspect),
    overlays: mapOverlays(result.relatedCharts),
    houseNotes: category.focus.map((item, index) => ({
      house: index + 1,
      theme: item,
    })),
    source: "api",
    rawResult: result,
  };
}

function mapPlacementGroups(result, input) {
  const relatedCharts = result.relatedCharts;

  if (input.category === "synastry" && relatedCharts?.primaryNatal && relatedCharts?.secondaryNatal) {
    return [
      mapPlacementGroup(relatedCharts.primaryNatal, `${chartProfileName(relatedCharts.primaryNatal, input.primary.name)} 的本命星体`),
      mapPlacementGroup(relatedCharts.secondaryNatal, `${chartProfileName(relatedCharts.secondaryNatal, input.secondary.name)} 的本命星体`),
    ];
  }

  if (input.category === "transit" && relatedCharts?.primaryNatal && relatedCharts?.transitSky) {
    return [
      mapPlacementGroup(relatedCharts.primaryNatal, `${chartProfileName(relatedCharts.primaryNatal, input.primary.name)} 的本命星体`),
      mapPlacementGroup(relatedCharts.transitSky, "流年天象星体"),
    ];
  }

  return [
    {
      id: result.chartId,
      title: `${input.primary.name} 的星体落点`,
      placements: result.placements.slice(0, 14).map(mapPlacement),
    },
  ];
}

function mapPlacementGroup(chart, title) {
  return {
    id: chart.chartId ?? title,
    title,
    placements: (chart.placements ?? []).slice(0, 14).map(mapPlacement),
  };
}

function mapPlacement(placement) {
  return {
    planet: localizeBody(placement.body),
    sign: localizeSign(placement.sign),
    longitude: placement.longitude,
    house: placement.house ?? "-",
    degree: placement.degree,
    minute: placement.minute,
  };
}

function mapAspectOwners(result, input) {
  const relatedCharts = result.relatedCharts;

  if (relatedCharts?.primaryOverlay) {
    return {
      from: relatedCharts.primaryOverlay.referenceName,
      to: relatedCharts.primaryOverlay.overlayName,
    };
  }

  if (relatedCharts?.transitOverlay) {
    return {
      from: relatedCharts.transitOverlay.referenceName,
      to: "流年",
    };
  }

  return {
    from: input.primary.name,
    to: input.primary.name,
  };
}

function mapOverlays(relatedCharts) {
  if (!relatedCharts) {
    return [];
  }

  return ["primaryOverlay", "secondaryOverlay", "transitOverlay"]
    .map((key) => relatedCharts[key])
    .filter(Boolean)
    .map((overlay) => ({
      id: overlay.overlayId,
      title: `${overlayDisplayName(overlay.overlayName)} 飞入 ${overlay.referenceName}`,
      houseTableTitle: `${overlayDisplayName(overlay.overlayName)} 飞入 ${overlay.referenceName} 的宫位`,
      referenceName: overlay.referenceName,
      overlayName: overlayDisplayName(overlay.overlayName),
      placements: overlay.placements.map((placement) => ({
        planet: localizeBody(placement.body),
        sign: localizeSign(placement.sign),
        longitude: placement.longitude,
        degree: placement.degree,
        minute: placement.minute,
        sourceHouse: placement.sourceHouse ?? "-",
        overlayHouse: placement.overlayHouse,
        overlayHouseRuler: houseRuler(overlay.houses, placement.overlayHouse),
      })),
      aspects: sortAspectsByBodyOrder(overlay.aspects).map(mapAspect),
    }));
}

function mapAspect(aspect) {
  return {
    from: localizeBody(aspect.from),
    to: localizeBody(aspect.to),
    type: aspect.type,
    orb: `${aspect.orb}°`,
  };
}

function peopleForResult(input, category) {
  if (category.requiresSecondPerson) {
    return [input.primary, input.secondary].filter(Boolean);
  }

  return [input.primary].filter(Boolean);
}

function sortAspectsByBodyOrder(aspects) {
  return [...aspects].sort((first, second) => {
    const fromDifference = bodyOrder(first.from) - bodyOrder(second.from);

    if (fromDifference !== 0) {
      return fromDifference;
    }

    return bodyOrder(first.to) - bodyOrder(second.to);
  });
}

function bodyOrder(body) {
  const index = BODY_SORT_ORDER.indexOf(body);
  return index === -1 ? BODY_SORT_ORDER.length : index;
}

function chartProfileName(chart, fallback) {
  return chart.profiles?.[0]?.name ?? fallback;
}

function overlayDisplayName(name) {
  return name === "Transit Sky" ? "流年星体" : name;
}

function houseRuler(houses, houseNumber) {
  const house = houses?.find((item) => item.house === houseNumber);

  if (!house) {
    return "-";
  }

  return localizeBody(TRADITIONAL_SIGN_RULERS[house.sign]) ?? "-";
}

function localizeBody(body) {
  return BODY_LABELS[body] ?? body;
}

function localizeSign(sign) {
  return SIGN_LABELS[sign] ?? sign;
}

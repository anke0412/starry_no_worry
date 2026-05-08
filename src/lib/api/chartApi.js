import { findCategory } from "../../data/chartCatalog.js";
import {
  buildCompositeChartPayload,
  buildDavisonChartPayload,
  buildLunarReturnChartPayload,
  buildMarxChartPayload,
  buildNatalChartPayload,
  buildProgressionChartPayload,
  buildSolarArcChartPayload,
  buildSolarReturnChartPayload,
  buildSynastryChartPayload,
  buildTertiaryProgressionChartPayload,
  buildTransitChartPayload,
} from "./chartContracts.js";

const DEFAULT_API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const SUPPORTED_ENDPOINTS = {
  natal: "/api/charts/natal",
  synastry: "/api/charts/synastry",
  composite: "/api/charts/composite",
  davison: "/api/charts/davison",
  marx: "/api/charts/marx",
  transit: "/api/charts/transit",
  "solar-return": "/api/charts/solar-return",
  "lunar-return": "/api/charts/lunar-return",
  "solar-arc": "/api/charts/solar-arc",
  progression: "/api/charts/progression",
  "tertiary-progression": "/api/charts/tertiary-progression",
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
  Chiron: "凯龙星",
  Lilith: "莉莉丝",
  "North Node": "北交点",
  "South Node": "南交点",
  "Part of Fortune": "福点",
  Vertex: "宿命点",
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
  "Chiron",
  "Lilith",
  "North Node",
  "South Node",
  "Part of Fortune",
  "Vertex",
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

const STATISTIC_LABELS = {
  elementCounts: {
    fire: "火象",
    earth: "土象",
    air: "风象",
    water: "水象",
  },
  modalityCounts: {
    cardinal: "基本宫",
    fixed: "固定宫",
    mutable: "变动宫",
  },
  polarityCounts: {
    yang: "阳性",
    yin: "阴性",
  },
  hemisphereCounts: {
    northern: "北半球",
    southern: "南半球",
    eastern: "东半球",
    western: "西半球",
  },
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
    return buildNatalChartPayload(input.primary, input.settings);
  }

  if (input.category === "synastry") {
    return buildSynastryChartPayload(input.primary, input.secondary, input.settings);
  }

  if (input.category === "composite") {
    return buildCompositeChartPayload(input.primary, input.secondary, input.settings);
  }

  if (input.category === "davison") {
    return buildDavisonChartPayload(input.primary, input.secondary, input.settings);
  }

  if (input.category === "marx") {
    return buildMarxChartPayload(input.primary, input.secondary, input.settings);
  }

  if (input.category === "solar-return") {
    return buildSolarReturnChartPayload(
      input.primary,
      {
        anchorDate: input.solarReturnAnchorDate,
        anchorTime: input.solarReturnAnchorTime,
        returnLocation: input.solarReturnLocation,
      },
      input.settings,
    );
  }

  if (input.category === "lunar-return") {
    return buildLunarReturnChartPayload(
      input.primary,
      {
        anchorDate: input.solarReturnAnchorDate,
        anchorTime: input.solarReturnAnchorTime,
        returnLocation: input.solarReturnLocation,
      },
      input.settings,
    );
  }

  if (input.category === "progression") {
    return buildProgressionChartPayload(
      input.primary,
      {
        progressionDate: input.forecastDate,
        progressionTime: input.forecastTime,
      },
      input.settings,
    );
  }

  if (input.category === "solar-arc") {
    return buildSolarArcChartPayload(
      input.primary,
      {
        solarArcDate: input.forecastDate,
        solarArcTime: input.forecastTime,
      },
      input.settings,
    );
  }

  if (input.category === "tertiary-progression") {
    return buildTertiaryProgressionChartPayload(
      input.primary,
      {
        tertiaryDate: input.forecastDate,
        tertiaryTime: input.forecastTime,
      },
      input.settings,
    );
  }

  return buildTransitChartPayload(
    input.primary,
    {
      transitDate: input.forecastDate,
      transitTime: input.forecastTime,
    },
    input.settings,
  );
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
    forecastDate: input.category === "solar-return" || input.category === "lunar-return" ? input.solarReturnAnchorDate : input.forecastDate,
    focus: category.focus,
    placements: mapWorkspacePlacements(result, input),
    placementGroups: mapPlacementGroups(result, input),
    aspectOwners: mapAspectOwners(result, input),
    aspects: mapWorkspaceAspects(result, input),
    overlays: mapOverlays(result.relatedCharts),
    statistics: mapWorkspaceStatistics(result, input),
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

  if (input.category === "solar-return" && relatedCharts?.primaryNatal && relatedCharts?.solarReturn) {
    return [
      mapPlacementGroup(relatedCharts.primaryNatal, `${chartProfileName(relatedCharts.primaryNatal, input.primary.name)} 的本命星体`),
      mapPlacementGroup(relatedCharts.solarReturn, "日返星体"),
    ];
  }

  if (input.category === "lunar-return" && relatedCharts?.primaryNatal && relatedCharts?.lunarReturn) {
    return [
      mapPlacementGroup(relatedCharts.primaryNatal, `${chartProfileName(relatedCharts.primaryNatal, input.primary.name)} 的本命星体`),
      mapPlacementGroup(relatedCharts.lunarReturn, "月返星体"),
    ];
  }

  if (input.category === "progression" && relatedCharts?.primaryNatal && relatedCharts?.progressedChart) {
    return [
      mapPlacementGroup(relatedCharts.primaryNatal, `${chartProfileName(relatedCharts.primaryNatal, input.primary.name)} 的本命星体`),
      mapPlacementGroup(relatedCharts.progressedChart, "次限星体"),
    ];
  }

  if (input.category === "solar-arc" && relatedCharts?.primaryNatal && relatedCharts?.solarArcChart) {
    return [
      mapPlacementGroup(relatedCharts.primaryNatal, `${chartProfileName(relatedCharts.primaryNatal, input.primary.name)} 的本命星体`),
      mapPlacementGroup(relatedCharts.solarArcChart, "太阳弧星体"),
    ];
  }

  if (input.category === "tertiary-progression" && relatedCharts?.primaryNatal && relatedCharts?.tertiaryProgressedChart) {
    return [
      mapPlacementGroup(relatedCharts.primaryNatal, `${chartProfileName(relatedCharts.primaryNatal, input.primary.name)} 的本命星体`),
      mapPlacementGroup(relatedCharts.tertiaryProgressedChart, "三限星体"),
    ];
  }

  if (input.category === "composite" && relatedCharts?.compositeChart) {
    return [mapPlacementGroup(relatedCharts.compositeChart, "组合盘星体")];
  }

  if (input.category === "davison" && relatedCharts?.davisonChart) {
    return [mapPlacementGroup(relatedCharts.davisonChart, "时空中点盘星体")];
  }

  if (input.category === "marx" && relatedCharts?.primaryMarxChart && relatedCharts?.secondaryMarxChart) {
    return [
      mapPlacementGroup(relatedCharts.primaryMarxChart, `${input.primary.name} 视角马克思盘星体`),
      mapPlacementGroup(relatedCharts.secondaryMarxChart, `${input.secondary.name} 视角马克思盘星体`),
    ];
  }

  return [
    {
      id: result.chartId,
      title: `${input.primary.name} 的星体落点`,
      placements: result.placements.map(mapPlacement),
      statistics: mapStatistics(result.statistics),
    },
  ];
}

function mapPlacementGroup(chart, title) {
  return {
    id: chart.chartId ?? title,
    title,
    placements: (chart.placements ?? []).map(mapPlacement),
    statistics: mapStatistics(chart.statistics),
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
    retrograde: placement.retrograde ?? false,
  };
}

function mapAspectOwners(result, input) {
  const relatedCharts = result.relatedCharts;

  if (input.category === "composite") {
    return {
      from: "组合盘",
      to: "组合盘",
    };
  }

  if (input.category === "davison") {
    return {
      from: "时空中点盘",
      to: "时空中点盘",
    };
  }

  if (input.category === "marx") {
    return {
      from: "马克思盘",
      to: "马克思盘",
    };
  }

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

  if (relatedCharts?.solarReturnOverlay) {
    return {
      from: relatedCharts.solarReturnOverlay.referenceName,
      to: "日返",
    };
  }

  if (relatedCharts?.lunarReturnOverlay) {
    return {
      from: relatedCharts.lunarReturnOverlay.referenceName,
      to: "月返",
    };
  }

  if (relatedCharts?.progressedOverlay) {
    return {
      from: relatedCharts.progressedOverlay.referenceName,
      to: "次限",
    };
  }

  if (relatedCharts?.solarArcOverlay) {
    return {
      from: relatedCharts.solarArcOverlay.referenceName,
      to: "太阳弧",
    };
  }

  if (relatedCharts?.tertiaryProgressedOverlay) {
    return {
      from: relatedCharts.tertiaryProgressedOverlay.referenceName,
      to: "三限",
    };
  }

  return {
    from: input.primary.name,
    to: input.primary.name,
  };
}

function mapWorkspaceAspects(result, input) {
  if (input.category === "marx") {
    return mapMarxAspects(result.relatedCharts, input);
  }

  return sortAspectsByBodyOrder(result.aspects).map(mapAspect);
}

function mapMarxAspects(relatedCharts, input) {
  if (!relatedCharts?.primaryMarxChart || !relatedCharts?.secondaryMarxChart) {
    return [];
  }

  const primaryOwner = `${input.primary.name} 视角`;
  const secondaryOwner = `${input.secondary.name} 视角`;

  return [
    ...sortAspectsByBodyOrder(relatedCharts.primaryMarxChart.aspects ?? []).map((aspect) =>
      mapAspect(aspect, {
        fromGroupId: relatedCharts.primaryMarxChart.chartId,
        toGroupId: relatedCharts.primaryMarxChart.chartId,
        fromOwner: primaryOwner,
        toOwner: primaryOwner,
      }),
    ),
    ...sortAspectsByBodyOrder(relatedCharts.secondaryMarxChart.aspects ?? []).map((aspect) =>
      mapAspect(aspect, {
        fromGroupId: relatedCharts.secondaryMarxChart.chartId,
        toGroupId: relatedCharts.secondaryMarxChart.chartId,
        fromOwner: secondaryOwner,
        toOwner: secondaryOwner,
      }),
    ),
  ];
}

function mapOverlays(relatedCharts) {
  if (!relatedCharts) {
    return [];
  }

  if (relatedCharts.compositeChart) {
    return [];
  }

  return [
    "primaryOverlay",
    "secondaryOverlay",
    "transitOverlay",
    "solarReturnOverlay",
    "lunarReturnOverlay",
    "solarArcOverlay",
    "progressedOverlay",
    "tertiaryProgressedOverlay",
  ]
    .map((key) => relatedCharts[key])
    .filter(Boolean)
    .map((overlay) => ({
      id: overlay.overlayId,
      title: `${overlayDisplayName(overlay.overlayName)} 飞入 ${overlay.referenceName}`,
      houseTableTitle: `${overlayDisplayName(overlay.overlayName)} 飞入 ${overlay.referenceName} 的宫位`,
      referenceName: overlay.referenceName,
      overlayName: overlayDisplayName(overlay.overlayName),
      referenceChartId: overlay.referenceChartId,
      overlayChartId: overlay.overlayChartId,
      placements: overlay.placements.map((placement) => ({
        planet: localizeBody(placement.body),
        sign: localizeSign(placement.sign),
        longitude: placement.longitude,
        degree: placement.degree,
        minute: placement.minute,
        retrograde: placement.retrograde ?? false,
        sourceHouse: overlaySourceHouseValue(overlay, placement),
        overlayHouse: placement.overlayHouse,
        overlayHouseRuler: houseRuler(overlay.houses, placement.overlayHouse),
      })),
      sourceHouseTitle: overlaySourceHouseTitle(overlay),
      aspects: sortAspectsByBodyOrder(overlay.aspects).map(mapAspect),
    }));
}

function mapAspect(aspect, extras = {}) {
  return {
    ...extras,
    from: localizeBody(aspect.from),
    to: localizeBody(aspect.to),
    type: aspect.type,
    label: aspectTypeLabel(aspect.type),
    tone: aspectTone(aspect.type),
    orb: formatAspectOrb(aspect.orb),
  };
}

function mapWorkspacePlacements(result, input) {
  if (
    input.category === "marx"
    && result.relatedCharts?.primaryMarxChart
    && result.relatedCharts?.secondaryMarxChart
  ) {
    return [
      ...result.relatedCharts.primaryMarxChart.placements.map(mapPlacement),
      ...result.relatedCharts.secondaryMarxChart.placements.map(mapPlacement),
    ];
  }

  return result.placements.map((placement) => ({
    ...mapPlacement(placement),
  }));
}

function mapWorkspaceStatistics(result, input) {
  if (input.category === "marx") {
    return null;
  }

  return mapStatistics(result.statistics);
}

function mapStatistics(statistics) {
  if (!statistics) {
    return null;
  }

  return {
    totalBodies: statistics.totalBodies,
    sections: [
      mapStatisticsSection("elementCounts", statistics.elementCounts),
      mapStatisticsSection("modalityCounts", statistics.modalityCounts),
      mapStatisticsSection("polarityCounts", statistics.polarityCounts),
      mapStatisticsSection("hemisphereCounts", statistics.hemisphereCounts),
    ],
  };
}

function mapStatisticsSection(sectionKey, counts = {}) {
  return {
    id: sectionKey,
    items: Object.entries(STATISTIC_LABELS[sectionKey]).map(([key, label]) => ({
      key,
      label,
      count: counts[key] ?? 0,
    })),
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
  if (name === "Transit Sky") {
    return "流年星体";
  }

  if (typeof name === "string" && name.endsWith(" Solar Return")) {
    return "日返星体";
  }

  if (typeof name === "string" && name.endsWith(" Lunar Return")) {
    return "月返星体";
  }

  if (typeof name === "string" && name.endsWith(" Solar Arc")) {
    return "太阳弧星体";
  }

  if (typeof name === "string" && name.endsWith(" Tertiary Progressed")) {
    return "三限星体";
  }

  if (typeof name === "string" && name.endsWith(" Progressed")) {
    return "次限星体";
  }

  return name;
}

function overlaySourceHouseTitle(overlay) {
  if (overlay.overlayId === "transit-in-secondary") {
    return "主参考地流年宫位";
  }

  return "原本宫位";
}

function overlaySourceHouseValue(overlay, placement) {
  if (overlay.overlayId === "transit-in-secondary") {
    return "-";
  }

  return placement.sourceHouse ?? "-";
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

function aspectTypeLabel(type) {
  const labels = {
    conjunction: "合相",
    sextile: "六合",
    trine: "拱相",
    square: "刑相",
    opposition: "冲相",
    quincunx: "梅花相",
  };

  return labels[type] ?? type;
}

function aspectTone(type) {
  if (["conjunction", "sextile", "trine"].includes(type)) {
    return "harmonious";
  }

  if (["square", "opposition"].includes(type)) {
    return "challenging";
  }

  return "neutral";
}

function formatAspectOrb(orb) {
  const value = Number(orb);

  if (!Number.isFinite(value)) {
    return "-";
  }

  return `${value.toFixed(2)}°`;
}

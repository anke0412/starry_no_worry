export const readingModes = [
  {
    id: "single",
    label: "单人星盘",
    eyebrow: "Natal",
    description: "适合本命盘、自我探索、性格结构与人生主题。",
  },
  {
    id: "couple",
    label: "双人合盘",
    eyebrow: "Relationship",
    description: "适合关系互动、吸引模式、冲突协商与长期相处。",
  },
  {
    id: "forecast",
    label: "推运排盘",
    eyebrow: "Timing",
    description: "适合流年、次限、关系推运和阶段性趋势观察。",
  },
];

export const chartCategories = [
  {
    id: "natal",
    mode: "single",
    label: "本命盘",
    outputTitle: "本命星盘",
    requiresSecondPerson: false,
    requiresForecastDate: false,
    focus: ["核心性格", "情绪需求", "事业方向", "关系模式"],
  },
  {
    id: "synastry",
    mode: "couple",
    label: "比较盘",
    outputTitle: "双人比较盘",
    requiresSecondPerson: true,
    requiresForecastDate: false,
    focus: ["吸引力", "沟通触发", "情绪安全", "长期协作"],
  },
  {
    id: "composite",
    mode: "couple",
    label: "组合盘",
    outputTitle: "关系组合盘",
    requiresSecondPerson: true,
    requiresForecastDate: false,
    focus: ["关系主题", "共同目标", "外显气质", "成长课题"],
  },
  {
    id: "transit",
    mode: "forecast",
    label: "流年盘",
    outputTitle: "流年推运盘",
    requiresSecondPerson: false,
    requiresForecastDate: true,
    focus: ["近期机会", "压力来源", "行动窗口", "身心节奏"],
  },
  {
    id: "progression",
    mode: "forecast",
    label: "次限盘",
    outputTitle: "次限推运盘",
    requiresSecondPerson: false,
    requiresForecastDate: true,
    focus: ["内在成熟", "人生阶段", "情感变化", "长期趋势"],
  },
  {
    id: "relationship-transit",
    mode: "forecast",
    label: "关系推运",
    outputTitle: "关系推运盘",
    requiresSecondPerson: true,
    requiresForecastDate: true,
    focus: ["关系时机", "承诺议题", "沟通窗口", "共同选择"],
  },
];

export function categoriesForMode(mode) {
  return chartCategories.filter((category) => category.mode === mode);
}

export function findCategory(categoryId) {
  return chartCategories.find((category) => category.id === categoryId);
}

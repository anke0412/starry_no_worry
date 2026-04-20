import { findCategory } from "../data/chartCatalog.js";

const SIGNS = ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"];
const PLANETS = ["太阳", "月亮", "水星", "金星", "火星", "上升"];
const ASPECTS = ["合相", "六合", "四分", "三分", "对分"];

export function createChartRequest(input) {
  const category = findCategory(input.category);

  if (!category) {
    throw new Error(`Unknown chart category: ${input.category}`);
  }

  if (!input.primary?.date || !input.primary?.time || !input.primary?.location) {
    throw new Error("Primary person requires date, time, and location.");
  }

  if (category.requiresSecondPerson && !input.secondary) {
    throw new Error("This chart requires a second person.");
  }

  if (category.requiresForecastDate && !input.forecastDate) {
    throw new Error("This chart requires a forecast date.");
  }

  return {
    mode: input.mode,
    category: input.category,
    people: [normalizePerson(input.primary), input.secondary ? normalizePerson(input.secondary) : null].filter(Boolean),
    forecastDate: input.forecastDate || "",
    categoryMeta: category,
    createdAt: new Date().toISOString(),
  };
}

export function generateChartSnapshot(request) {
  const seed = hashSeed(
    `${request.mode}:${request.category}:${request.people.map((person) => person.date).join(":")}:${request.forecastDate}`,
  );

  return {
    id: `chart-${seed}`,
    title: createSnapshotTitle(request),
    mode: request.mode,
    category: request.category,
    categoryLabel: request.categoryMeta.label,
    people: request.people,
    forecastDate: request.forecastDate,
    focus: request.categoryMeta.focus,
    placements: PLANETS.map((planet, index) => ({
      planet,
      sign: SIGNS[(seed + index * 3) % SIGNS.length],
      house: ((seed + index * 2) % 12) + 1,
      degree: (seed + index * 17) % 30,
    })),
    aspects: [0, 1, 2, 3].map((offset) => ({
      from: PLANETS[offset],
      to: PLANETS[(offset + 2) % PLANETS.length],
      type: ASPECTS[(seed + offset) % ASPECTS.length],
      orb: `${((seed + offset) % 5) + 1}.${(seed + offset) % 9}°`,
    })),
    houseNotes: request.categoryMeta.focus.map((item, index) => ({
      house: ((seed + index) % 12) + 1,
      theme: item,
    })),
  };
}

function normalizePerson(person) {
  return {
    name: person.name?.trim() || "未命名",
    date: person.date,
    time: person.time,
    location: person.location.trim(),
  };
}

function createSnapshotTitle(request) {
  const names = request.people.map((person) => person.name).join(" × ");
  return `${names} 的${request.categoryMeta.outputTitle}`;
}

function hashSeed(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 9973;
  }

  return Math.abs(hash);
}

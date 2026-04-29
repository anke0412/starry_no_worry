export const defaultChartSettings = {
  houseSystem: "placidus",
  zodiac: "tropical",
  aspectSet: "major",
  orbProfile: "default",
};

export const houseSystemOptions = [
  { value: "placidus", label: "普拉西德制" },
  { value: "whole-sign", label: "整宫制" },
  { value: "equal", label: "等宫制" },
];

export const aspectSetOptions = [
  { value: "major", label: "主要相位" },
  { value: "major_extended", label: "主要相位 + 梅花相" },
];

export const orbProfileOptions = [
  { value: "tight", label: "严格容许度" },
  { value: "default", label: "标准容许度" },
  { value: "wide", label: "宽松容许度" },
];

export function buildNatalChartPayload(primary, settings = defaultChartSettings) {
  return {
    primary: normalizeBirthProfile(primary),
    settings: normalizeSettings(settings),
  };
}

export function buildSynastryChartPayload(primary, secondary, settings = defaultChartSettings) {
  return {
    primary: normalizeBirthProfile(primary),
    secondary: normalizeBirthProfile(secondary),
    settings: normalizeSettings(settings),
  };
}

export function buildCompositeChartPayload(primary, secondary, settings = defaultChartSettings) {
  return buildSynastryChartPayload(primary, secondary, settings);
}

export function buildDavisonChartPayload(primary, secondary, settings = defaultChartSettings) {
  return buildSynastryChartPayload(primary, secondary, settings);
}

export function buildTransitChartPayload(primary, transit, settings = defaultChartSettings) {
  return {
    primary: normalizeBirthProfile(primary),
    transitDate: transit.transitDate,
    transitTime: transit.transitTime,
    settings: normalizeSettings(settings),
  };
}

export function buildSolarReturnChartPayload(primary, solarReturn, settings = defaultChartSettings) {
  return {
    primary: normalizeBirthProfile(primary),
    anchorDate: solarReturn.anchorDate,
    anchorTime: solarReturn.anchorTime,
    returnLocation: normalizeReturnLocation(solarReturn.returnLocation),
    settings: normalizeSettings(settings),
  };
}

function normalizeSettings(settings) {
  return {
    ...defaultChartSettings,
    ...settings,
  };
}

function normalizeBirthProfile(profile) {
  return compactObject({
    id: profile.id,
    name: profile.name,
    date: profile.date,
    time: profile.time,
    locationName: profile.locationName ?? profile.location,
    latitude: normalizeCoordinate(profile.latitude),
    longitude: normalizeCoordinate(profile.longitude),
    timezone: profile.timezone,
  });
}

function normalizeReturnLocation(location) {
  return compactObject({
    locationName: location.locationName ?? location.location,
    latitude: normalizeCoordinate(location.latitude),
    longitude: normalizeCoordinate(location.longitude),
    timezone: location.timezone,
  });
}

function normalizeCoordinate(value) {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  return Number(value);
}

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined));
}

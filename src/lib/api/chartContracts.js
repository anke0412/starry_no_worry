export const defaultChartSettings = {
  houseSystem: "placidus",
  zodiac: "tropical",
  aspectSet: "major",
  orbProfile: "default",
};

export function buildNatalChartPayload(primary, settings = defaultChartSettings) {
  return {
    primary: normalizeBirthProfile(primary),
    settings,
  };
}

export function buildSynastryChartPayload(primary, secondary, settings = defaultChartSettings) {
  return {
    primary: normalizeBirthProfile(primary),
    secondary: normalizeBirthProfile(secondary),
    settings,
  };
}

export function buildTransitChartPayload(primary, transit, settings = defaultChartSettings) {
  return {
    primary: normalizeBirthProfile(primary),
    transitDate: transit.transitDate,
    transitTime: transit.transitTime,
    settings,
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

function normalizeCoordinate(value) {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  return Number(value);
}

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined));
}

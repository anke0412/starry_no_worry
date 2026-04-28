export const CUSTOM_COUNTRY_ID = "custom";
export const CUSTOM_CITY_ID = "custom";

const LOCATION_CATALOG = [
  {
    id: "china",
    label: "中国",
    timezone: "Asia/Shanghai",
    cities: [
      { id: "shanghai", label: "上海", locationName: "上海", latitude: "31.2304", longitude: "121.4737", timezone: "Asia/Shanghai" },
      { id: "beijing", label: "北京", locationName: "北京", latitude: "39.9042", longitude: "116.4074", timezone: "Asia/Shanghai" },
      { id: "guangzhou", label: "广州", locationName: "广州", latitude: "23.1291", longitude: "113.2644", timezone: "Asia/Shanghai" },
      { id: "shenzhen", label: "深圳", locationName: "深圳", latitude: "22.5431", longitude: "114.0579", timezone: "Asia/Shanghai" },
    ],
  },
  {
    id: "usa",
    label: "美国",
    timezone: "America/New_York",
    cities: [
      { id: "new-york", label: "纽约", locationName: "New York", latitude: "40.7128", longitude: "-74.0060", timezone: "America/New_York" },
      { id: "los-angeles", label: "洛杉矶", locationName: "Los Angeles", latitude: "34.0522", longitude: "-118.2437", timezone: "America/Los_Angeles" },
      { id: "san-francisco", label: "旧金山", locationName: "San Francisco", latitude: "37.7749", longitude: "-122.4194", timezone: "America/Los_Angeles" },
      { id: "chicago", label: "芝加哥", locationName: "Chicago", latitude: "41.8781", longitude: "-87.6298", timezone: "America/Chicago" },
    ],
  },
  {
    id: CUSTOM_COUNTRY_ID,
    label: "自定义地点",
    timezone: "Asia/Shanghai",
    cities: [
      { id: CUSTOM_CITY_ID, label: "自定义地点", locationName: "", latitude: "", longitude: "", timezone: "Asia/Shanghai" },
    ],
  },
];

export function countryOptions() {
  return LOCATION_CATALOG.map((country) => ({
    value: country.id,
    label: country.label,
  }));
}

export function cityOptions(countryId) {
  const country = findCountry(countryId);
  const baseCities = country?.cities ?? [];
  const customOption = { id: CUSTOM_CITY_ID, label: "自定义地点", locationName: "", latitude: "", longitude: "", timezone: country?.timezone ?? "Asia/Shanghai" };

  if (countryId === CUSTOM_COUNTRY_ID) {
    return [customOption];
  }

  return [
    ...baseCities.map((city) => ({ value: city.id, label: city.label })),
    { value: CUSTOM_CITY_ID, label: "自定义地点" },
  ];
}

export function defaultLocationState(countryId = "china", cityId = "shanghai") {
  return applyPresetToLocation(
    {
      countryId,
      cityId,
      location: "",
      latitude: "",
      longitude: "",
      timezone: "",
    },
    countryId,
    cityId,
  );
}

export function applyPresetToLocation(current, countryId, cityId) {
  const country = findCountry(countryId);
  const city = findCity(countryId, cityId);

  if (!country) {
    return current;
  }

  if (!city || cityId === CUSTOM_CITY_ID || countryId === CUSTOM_COUNTRY_ID) {
    return {
      ...current,
      countryId,
      cityId: CUSTOM_CITY_ID,
      timezone: current.timezone || country.timezone,
      location: current.location ?? "",
      latitude: current.latitude ?? "",
      longitude: current.longitude ?? "",
    };
  }

  return {
    ...current,
    countryId,
    cityId,
    location: city.locationName,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
  };
}

export function isCustomLocation(location) {
  return location.countryId === CUSTOM_COUNTRY_ID || location.cityId === CUSTOM_CITY_ID;
}

export function locationSummary(location) {
  if (isCustomLocation(location)) {
    return "";
  }

  return `${location.latitude}, ${location.longitude} · ${location.timezone}`;
}

function findCountry(countryId) {
  return LOCATION_CATALOG.find((country) => country.id === countryId);
}

function findCity(countryId, cityId) {
  return findCountry(countryId)?.cities.find((city) => city.id === cityId);
}

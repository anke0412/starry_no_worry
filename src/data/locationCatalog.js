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
    id: "japan",
    label: "日本",
    timezone: "Asia/Tokyo",
    cities: [
      { id: "tokyo", label: "东京", locationName: "Tokyo", latitude: "35.6762", longitude: "139.6503", timezone: "Asia/Tokyo" },
      { id: "osaka", label: "大阪", locationName: "Osaka", latitude: "34.6937", longitude: "135.5023", timezone: "Asia/Tokyo" },
      { id: "kyoto", label: "京都", locationName: "Kyoto", latitude: "35.0116", longitude: "135.7681", timezone: "Asia/Tokyo" },
      { id: "fukuoka", label: "福冈", locationName: "Fukuoka", latitude: "33.5904", longitude: "130.4017", timezone: "Asia/Tokyo" },
    ],
  },
  {
    id: "south-korea",
    label: "韩国",
    timezone: "Asia/Seoul",
    cities: [
      { id: "seoul", label: "首尔", locationName: "Seoul", latitude: "37.5665", longitude: "126.9780", timezone: "Asia/Seoul" },
      { id: "busan", label: "釜山", locationName: "Busan", latitude: "35.1796", longitude: "129.0756", timezone: "Asia/Seoul" },
      { id: "incheon", label: "仁川", locationName: "Incheon", latitude: "37.4563", longitude: "126.7052", timezone: "Asia/Seoul" },
      { id: "jeju", label: "济州", locationName: "Jeju", latitude: "33.4996", longitude: "126.5312", timezone: "Asia/Seoul" },
    ],
  },
  {
    id: "singapore",
    label: "新加坡",
    timezone: "Asia/Singapore",
    cities: [
      { id: "singapore", label: "新加坡", locationName: "Singapore", latitude: "1.3521", longitude: "103.8198", timezone: "Asia/Singapore" },
    ],
  },
  {
    id: "united-kingdom",
    label: "英国",
    timezone: "Europe/London",
    cities: [
      { id: "london", label: "伦敦", locationName: "London", latitude: "51.5072", longitude: "-0.1276", timezone: "Europe/London" },
      { id: "manchester", label: "曼彻斯特", locationName: "Manchester", latitude: "53.4808", longitude: "-2.2426", timezone: "Europe/London" },
      { id: "edinburgh", label: "爱丁堡", locationName: "Edinburgh", latitude: "55.9533", longitude: "-3.1883", timezone: "Europe/London" },
      { id: "birmingham", label: "伯明翰", locationName: "Birmingham", latitude: "52.4862", longitude: "-1.8904", timezone: "Europe/London" },
    ],
  },
  {
    id: "canada",
    label: "加拿大",
    timezone: "America/Toronto",
    cities: [
      { id: "toronto", label: "多伦多", locationName: "Toronto", latitude: "43.6532", longitude: "-79.3832", timezone: "America/Toronto" },
      { id: "vancouver", label: "温哥华", locationName: "Vancouver", latitude: "49.2827", longitude: "-123.1207", timezone: "America/Vancouver" },
      { id: "montreal", label: "蒙特利尔", locationName: "Montreal", latitude: "45.5017", longitude: "-73.5673", timezone: "America/Toronto" },
      { id: "calgary", label: "卡尔加里", locationName: "Calgary", latitude: "51.0447", longitude: "-114.0719", timezone: "America/Edmonton" },
    ],
  },
  {
    id: "australia",
    label: "澳大利亚",
    timezone: "Australia/Sydney",
    cities: [
      { id: "sydney", label: "悉尼", locationName: "Sydney", latitude: "-33.8688", longitude: "151.2093", timezone: "Australia/Sydney" },
      { id: "melbourne", label: "墨尔本", locationName: "Melbourne", latitude: "-37.8136", longitude: "144.9631", timezone: "Australia/Melbourne" },
      { id: "brisbane", label: "布里斯班", locationName: "Brisbane", latitude: "-27.4698", longitude: "153.0251", timezone: "Australia/Brisbane" },
      { id: "perth", label: "珀斯", locationName: "Perth", latitude: "-31.9523", longitude: "115.8613", timezone: "Australia/Perth" },
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

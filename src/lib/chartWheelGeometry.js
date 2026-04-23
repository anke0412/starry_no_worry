const ZODIAC_SIGNS = [
  "白羊",
  "金牛",
  "双子",
  "巨蟹",
  "狮子",
  "处女",
  "天秤",
  "天蝎",
  "射手",
  "摩羯",
  "水瓶",
  "双鱼",
];

const ASPECT_COLORS = {
  conjunction: "#d7a84f",
  opposition: "#c56b67",
  square: "#d8897c",
  trine: "#6f9f6a",
  sextile: "#7fae9a",
};

const AXIS_NAMES = new Set(["上升点", "天顶", "Ascendant", "Midheaven"]);
const CLUSTER_RADIUS_OFFSETS = [0, 12, -12, 24, -24];

export function normalizeLongitude(longitude) {
  return ((Number(longitude) % 360) + 360) % 360;
}

export function angleForLongitude(longitude, ascendantLongitude = 0) {
  return normalizeLongitude(normalizeLongitude(longitude) - normalizeLongitude(ascendantLongitude) + 180);
}

export function pointOnWheel({ longitude, ascendantLongitude = 0, radius, center = 200 }) {
  const angle = (angleForLongitude(longitude, ascendantLongitude) * Math.PI) / 180;

  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

export function zodiacSegments(ascendantLongitude = 0, center = 200) {
  return ZODIAC_SIGNS.map((label, index) => {
    const startLongitude = index * 30;
    const endLongitude = startLongitude + 30;
    const labelPoint = pointOnWheel({
      longitude: startLongitude + 15,
      ascendantLongitude,
      radius: 181,
      center,
    });

    return {
      id: label,
      label,
      startLongitude,
      endLongitude,
      startAngle: angleForLongitude(startLongitude, ascendantLongitude),
      endAngle: angleForLongitude(endLongitude, ascendantLongitude),
      labelPoint,
    };
  });
}

export function buildChartWheelModel(chart, { center = 200 } = {}) {
  const groups = chart.placementGroups?.length
    ? chart.placementGroups
    : [{ id: "placements", title: chart.title, placements: chart.placements ?? [] }];
  const allPlacements = groups.flatMap((group) => group.placements ?? []);
  const ascendant = findPlacement(allPlacements, "上升点");
  const midheaven = findPlacement(allPlacements, "天顶");
  const ascendantLongitude = validLongitude(ascendant?.longitude) ? ascendant.longitude : 0;

  const layers = groups.map((group, index) => {
    const baseRadius = index === 0 ? 126 : 154;
    const visiblePlacements = (group.placements ?? []).filter(
      (placement) => validLongitude(placement.longitude) && !AXIS_NAMES.has(placement.planet),
    );

    return {
      id: group.id ?? `layer-${index}`,
      title: group.title,
      radius: baseRadius,
      placements: visiblePlacements
        .map((placement, placementIndex) => {
          const radius = baseRadius + clusterOffset(placement, visiblePlacements, placementIndex);

          return {
          ...placement,
          radius,
          point: pointOnWheel({
            longitude: placement.longitude,
            ascendantLongitude,
            radius,
            center,
          }),
          };
        }),
    };
  });

  const placementIndex = layers.flatMap((layer) =>
    layer.placements.map((placement) => ({
      ...placement,
      layerId: layer.id,
    })),
  );

  return {
    center,
    ascendantLongitude,
    zodiac: zodiacSegments(ascendantLongitude, center),
    layers,
    axes: {
      ascendant: axisModel("ASC", ascendant?.longitude, ascendant, ascendantLongitude, center),
      descendant: axisModel("DSC", ascendant ? ascendant.longitude + 180 : null, null, ascendantLongitude, center),
      midheaven: axisModel("MC", midheaven?.longitude, midheaven, ascendantLongitude, center),
      imumCoeli: axisModel("IC", midheaven ? midheaven.longitude + 180 : null, null, ascendantLongitude, center),
    },
    aspectLines: (chart.aspects ?? [])
      .map((aspect) => aspectLineModel(aspect, placementIndex))
      .filter(Boolean),
  };
}

function axisModel(label, longitude, placement, ascendantLongitude, center) {
  if (!validLongitude(longitude)) {
    return null;
  }

  return {
    label,
    placement,
    longitude: normalizeLongitude(longitude),
    inner: pointOnWheel({ longitude, ascendantLongitude, radius: 34, center }),
    outer: pointOnWheel({ longitude, ascendantLongitude, radius: 177, center }),
    labelPoint: pointOnWheel({ longitude, ascendantLongitude, radius: 190, center }),
  };
}

function clusterOffset(placement, placements, placementIndex) {
  const clusterPosition = placements
    .slice(0, placementIndex + 1)
    .filter((candidate) => longitudeDistance(candidate.longitude, placement.longitude) <= 6).length - 1;

  return CLUSTER_RADIUS_OFFSETS[clusterPosition % CLUSTER_RADIUS_OFFSETS.length];
}

function longitudeDistance(first, second) {
  const difference = Math.abs(normalizeLongitude(first) - normalizeLongitude(second));

  return Math.min(difference, 360 - difference);
}

function aspectLineModel(aspect, placements) {
  const from = placements.find((placement) => placement.planet === aspect.from);
  const to = placements.find((placement) => placement.planet === aspect.to && placement !== from);

  if (!from || !to) {
    return null;
  }

  return {
    ...aspect,
    color: ASPECT_COLORS[aspect.type] ?? "#9aa979",
    from,
    to,
  };
}

function findPlacement(placements, planet) {
  return placements.find((placement) => placement.planet === planet && validLongitude(placement.longitude));
}

function validLongitude(longitude) {
  return Number.isFinite(Number(longitude));
}

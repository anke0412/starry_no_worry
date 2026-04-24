const ZODIAC_SIGNS = [
  { id: "aries", name: "白羊" },
  { id: "taurus", name: "金牛" },
  { id: "gemini", name: "双子" },
  { id: "cancer", name: "巨蟹" },
  { id: "leo", name: "狮子" },
  { id: "virgo", name: "处女" },
  { id: "libra", name: "天秤" },
  { id: "scorpio", name: "天蝎" },
  { id: "sagittarius", name: "射手" },
  { id: "capricorn", name: "摩羯" },
  { id: "aquarius", name: "水瓶" },
  { id: "pisces", name: "双鱼" },
];

const ASPECT_COLORS = {
  conjunction: "#d7a84f",
  opposition: "#c56b67",
  square: "#d8897c",
  trine: "#6f9f6a",
  sextile: "#7fae9a",
};

const AXIS_NAMES = new Set(["上升点", "下降点", "天顶", "天底", "Ascendant", "Descendant", "Midheaven", "Imum Coeli"]);
const CLUSTER_RADIUS_OFFSETS = [0, 12, -12, 24, -24];
const INNER_ANCHOR_RADIUS = 104;
const INNER_LABEL_RADIUS = 126;
const COMPACT_INNER_ANCHOR_RADIUS = 85;
const COMPACT_INNER_LABEL_RADIUS = 100;
const OUTER_ANCHOR_RADIUS = 128;
const OUTER_LABEL_RADIUS = 150;
const COMPACT_OUTER_ANCHOR_RADIUS = 120;
const COMPACT_OUTER_LABEL_RADIUS = 135;
const HOUSE_LINE_INNER_RADIUS = 146;
const HOUSE_LINE_OUTER_RADIUS = 164;
const HOUSE_LABEL_RADIUS = 155;
const HOUSE_AXIS_OUTER_RADIUS = INNER_ANCHOR_RADIUS;

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
  return ZODIAC_SIGNS.map((sign, index) => {
    const startLongitude = index * 30;
    const endLongitude = startLongitude + 30;
    const labelPoint = pointOnWheel({
      longitude: startLongitude + 15,
      ascendantLongitude,
      radius: 181,
      center,
    });

    return {
      id: sign.id,
      name: sign.name,
      symbolId: sign.id,
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
  const usesDualRings = groups.length > 1;
  const allPlacements = groups.flatMap((group) => group.placements ?? []);
  const ascendant = findPlacement(allPlacements, "上升点");
  const midheaven = findPlacement(allPlacements, "天顶");
  const ascendantLongitude = validLongitude(ascendant?.longitude) ? ascendant.longitude : 0;
  const angleMarkers = {
    ascendant: angleMarkerModel("上升点", "ASC", ascendant?.longitude, ascendant, ascendantLongitude, center, usesDualRings),
    descendant: angleMarkerModel("下降点", "DSC", ascendant ? ascendant.longitude + 180 : null, null, ascendantLongitude, center, usesDualRings),
    midheaven: angleMarkerModel("天顶", "MC", midheaven?.longitude, midheaven, ascendantLongitude, center, usesDualRings),
    imumCoeli: angleMarkerModel("天底", "IC", midheaven ? midheaven.longitude + 180 : null, null, ascendantLongitude, center, usesDualRings),
  };

  const layers = groups.map((group, index) => {
    const baseAnchorRadius = index === 0 ? innerAnchorRadius(usesDualRings) : outerAnchorRadius(usesDualRings);
    const baseLabelRadius = index === 0 ? innerLabelRadius(usesDualRings) : outerLabelRadius(usesDualRings);
    const visiblePlacements = (group.placements ?? []).filter(
      (placement) => validLongitude(placement.longitude) && !AXIS_NAMES.has(placement.planet),
    );

    return {
      id: group.id ?? `layer-${index}`,
      title: group.title,
      index,
      anchorRadius: baseAnchorRadius,
      labelRadius: baseLabelRadius,
      placements: visiblePlacements
        .map((placement, placementIndex) => {
          const labelRadius = baseLabelRadius + clusterOffset(placement, visiblePlacements, placementIndex);

          return {
            ...placement,
            anchorRadius: baseAnchorRadius,
            labelRadius,
            layerId: group.id ?? `layer-${index}`,
            layerTitle: group.title,
            layerIndex: index,
            ...placementPointModel(placement.longitude, ascendantLongitude, baseAnchorRadius, labelRadius, center),
          };
        }),
    };
  });

  const placementIndex = [
    ...layers.flatMap((layer) =>
      layer.placements.map((placement) => ({
        ...placement,
        layerId: layer.id,
        layerTitle: layer.title,
        layerIndex: layer.index,
      })),
    ),
    ...Object.values(angleMarkers).filter(Boolean),
  ];

  return {
    center,
    ascendantLongitude,
    zodiac: zodiacSegments(ascendantLongitude, center),
    layers,
    angleMarkers,
    axes: {
      midheaven: axisModel("MC", midheaven?.longitude, midheaven, ascendantLongitude, center),
      imumCoeli: axisModel("IC", midheaven ? midheaven.longitude + 180 : null, null, ascendantLongitude, center),
    },
    aspectLines: (chart.aspects ?? [])
      .map((aspect) => aspectLineModel(aspect, placementIndex))
      .filter(Boolean),
  };
}

export function buildHouseLineModel({ house, longitude, ascendantLongitude, center = 200 }) {
  const inner = pointOnWheel({
    longitude,
    ascendantLongitude,
    radius: HOUSE_LINE_INNER_RADIUS,
    center,
  });
  const outer = pointOnWheel({
    longitude,
    ascendantLongitude,
    radius: HOUSE_LINE_OUTER_RADIUS,
    center,
  });
  const axisInner = { x: center, y: center };
  const axisOuter = pointOnWheel({
    longitude,
    ascendantLongitude,
    radius: HOUSE_AXIS_OUTER_RADIUS,
    center,
  });
  const labelPoint = pointOnWheel({
    longitude: longitude + 15,
    ascendantLongitude,
    radius: HOUSE_LABEL_RADIUS,
    center,
  });

  return {
    house,
    longitude,
    innerRadius: HOUSE_LINE_INNER_RADIUS,
    outerRadius: HOUSE_LINE_OUTER_RADIUS,
    labelRadius: HOUSE_LABEL_RADIUS,
    axisOuterRadius: HOUSE_AXIS_OUTER_RADIUS,
    inner,
    outer,
    labelPoint,
    axisInner,
    axisOuter,
  };
}

function angleMarkerModel(planet, label, longitude, placement, ascendantLongitude, center, usesDualRings = false) {
  if (!validLongitude(longitude)) {
    return null;
  }

  const normalizedLongitude = normalizeLongitude(longitude);
  const anchorRadius = innerAnchorRadius(usesDualRings);
  const labelRadius = innerLabelRadius(usesDualRings);

  return {
    ...(placement ?? {}),
    planet,
    label,
    longitude: normalizedLongitude,
    anchorRadius,
    labelRadius,
    ...placementPointModel(normalizedLongitude, ascendantLongitude, anchorRadius, labelRadius, center),
  };
}

function innerAnchorRadius(usesDualRings) {
  return usesDualRings ? COMPACT_INNER_ANCHOR_RADIUS : INNER_ANCHOR_RADIUS;
}

function innerLabelRadius(usesDualRings) {
  return usesDualRings ? COMPACT_INNER_LABEL_RADIUS : INNER_LABEL_RADIUS;
}

function outerAnchorRadius(usesDualRings) {
  return usesDualRings ? COMPACT_OUTER_ANCHOR_RADIUS : OUTER_ANCHOR_RADIUS;
}

function outerLabelRadius(usesDualRings) {
  return usesDualRings ? COMPACT_OUTER_LABEL_RADIUS : OUTER_LABEL_RADIUS;
}

function placementPointModel(longitude, ascendantLongitude, anchorRadius, labelRadius, center) {
  const anchorPoint = pointOnWheel({
    longitude,
    ascendantLongitude,
    radius: anchorRadius,
    center,
  });
  const labelPoint = pointOnWheel({
    longitude,
    ascendantLongitude,
    radius: labelRadius,
    center,
  });

  return {
    point: anchorPoint,
    anchorPoint,
    labelPoint,
    leaderLine: {
      x1: labelPoint.x,
      y1: labelPoint.y,
      x2: anchorPoint.x,
      y2: anchorPoint.y,
    },
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
    inner: pointOnWheel({ longitude, ascendantLongitude, radius: 122, center }),
    outer: pointOnWheel({ longitude, ascendantLongitude, radius: 158, center }),
    labelPoint: pointOnWheel({ longitude, ascendantLongitude, radius: 168, center }),
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
  const fromCandidates = placements.filter((placement) => placement.planet === aspect.from);
  const toCandidates = placements.filter((placement) => placement.planet === aspect.to);
  const from = fromCandidates[0];
  const to =
    placements.some((placement) => placement.layerIndex === 1) && toCandidates.some((placement) => placement.layerIndex === 1)
      ? toCandidates.find((placement) => placement.layerIndex === 1)
      : toCandidates.find((placement) => placement !== from);

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

import React from "react";

import { buildChartWheelModel, buildHouseLineModel, pointOnWheel } from "../../lib/chartWheelGeometry.js";

const VIEWBOX_SIZE = 400;
const CENTER = 200;
const HOUSE_LABEL_RADIUS = 147;
const ASPECT_LEGEND = [
  { label: "合相", className: "legend-conjunction" },
  { label: "刑冲", className: "legend-hard" },
  { label: "和谐相位", className: "legend-soft" },
];

export function ChartWheel({ chart }) {
  const wheel = buildChartWheelModel(chart, { center: CENTER });
  const houseCusps = housesFromChart(chart);

  return (
    <figure className="chart-wheel-frame" aria-label={`${chart.title} 星盘轮盘`}>
      <svg className="chart-wheel" viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} role="img">
        <title>{chart.title} 星盘轮盘</title>
        <defs>
          <radialGradient id="wheelGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#fff8ea" />
            <stop offset="58%" stopColor="#f6ead2" />
            <stop offset="100%" stopColor="#dceccf" />
          </radialGradient>
        </defs>

        <circle className="wheel-surface" cx={CENTER} cy={CENTER} r="190" />
        <circle className="wheel-zodiac-band" cx={CENTER} cy={CENTER} r="181" />
        <circle className="wheel-house-outer" cx={CENTER} cy={CENTER} r="164" />
        <circle className="wheel-house-band" cx={CENTER} cy={CENTER} r="146" />
        <circle className="wheel-aspect-field" cx={CENTER} cy={CENTER} r="104" />

        {wheel.zodiac.map((segment, index) => (
          <g className={`wheel-zodiac-sector wheel-zodiac-sector-${index % 4}`} key={segment.id}>
            <path d={ringSegmentPath(segment.startLongitude, segment.endLongitude, wheel.ascendantLongitude)} />
            <line className="wheel-zodiac-tick" {...linePoints(segment.startLongitude, wheel.ascendantLongitude, 160, 190)} />
            <text className="wheel-zodiac-label" x={segment.labelPoint.x} y={segment.labelPoint.y}>
              {segment.label}
            </text>
          </g>
        ))}

        {houseCusps.map((house) => {
          const line = buildHouseLineModel({
            house: house.house,
            longitude: house.longitude,
            ascendantLongitude: wheel.ascendantLongitude,
            center: CENTER,
          });
          const label = pointOnWheel({
            longitude: house.longitude + 15,
            ascendantLongitude: wheel.ascendantLongitude,
            radius: HOUSE_LABEL_RADIUS,
            center: CENTER,
          });

          return (
            <g key={house.house}>
              <line
                className={`wheel-house-axis wheel-house-axis-${house.house}`}
                x1={line.axisInner.x}
                y1={line.axisInner.y}
                x2={line.axisOuter.x}
                y2={line.axisOuter.y}
              />
              <line className="wheel-house-line" x1={line.inner.x} y1={line.inner.y} x2={line.outer.x} y2={line.outer.y} />
              <text className="wheel-house-label" x={label.x} y={label.y}>
                {house.house}
              </text>
            </g>
          );
        })}

        {wheel.aspectLines.map((aspect, index) =>
          aspect.type === "conjunction" ? (
            <path
              className={`wheel-aspect-line wheel-aspect-${aspect.type}`}
              d={conjunctionArcPath(aspect.from.anchorPoint, aspect.to.anchorPoint)}
              key={`${aspect.from.planet}-${aspect.to.planet}-${index}`}
              stroke={aspect.color}
            />
          ) : (
            <line
              className={`wheel-aspect-line wheel-aspect-${aspect.type}`}
              key={`${aspect.from.planet}-${aspect.to.planet}-${index}`}
              stroke={aspect.color}
              x1={aspect.from.anchorPoint.x}
              y1={aspect.from.anchorPoint.y}
              x2={aspect.to.anchorPoint.x}
              y2={aspect.to.anchorPoint.y}
            />
          ),
        )}

        {Object.values(wheel.angleMarkers).map((marker) =>
          marker ? (
            <g className="wheel-angle-marker" key={marker.label}>
              <title>{placementTitle(marker, "四轴点")}</title>
              <line className="wheel-placement-leader" {...marker.leaderLine} />
              <circle className="wheel-placement-dot" cx={marker.anchorPoint.x} cy={marker.anchorPoint.y} r="1.8" />
              <text x={marker.labelPoint.x} y={marker.labelPoint.y}>
                {planetGlyph(marker.planet)}
              </text>
            </g>
          ) : null,
        )}

        {Object.values(wheel.axes).map((axis) =>
          axis ? (
            <g className={`wheel-axis wheel-axis-${axis.label.toLowerCase()}`} key={axis.label}>
              <line x1={axis.inner.x} y1={axis.inner.y} x2={axis.outer.x} y2={axis.outer.y} />
              <text x={axis.labelPoint.x} y={axis.labelPoint.y}>
                {axis.label}
              </text>
            </g>
          ) : null,
        )}

        {wheel.layers.map((layer, layerIndex) => (
          <g className={`wheel-layer wheel-layer-${layerIndex + 1}`} key={layer.id}>
            {layer.placements.map((placement, index) => (
              <g className="wheel-placement" key={`${layer.id}-${placement.planet}-${index}`}>
                <title>{placementTitle(placement, layer.title)}</title>
                <line className="wheel-placement-leader" {...placement.leaderLine} />
                <circle className="wheel-placement-dot" cx={placement.anchorPoint.x} cy={placement.anchorPoint.y} r="1.8" />
                <text x={placement.labelPoint.x} y={placement.labelPoint.y}>
                  {planetGlyph(placement.planet)}
                </text>
              </g>
            ))}
          </g>
        ))}
      </svg>

      <figcaption className="chart-wheel-caption">
        <span>内圈：{wheel.layers[0]?.title ?? "主体星盘"}</span>
        {wheel.layers[1] ? <span>外圈：{wheel.layers[1].title}</span> : null}
      </figcaption>
      <div className="chart-wheel-aspect-legend" aria-label="相位颜色图例">
        {ASPECT_LEGEND.map((item) => (
          <span className={item.className} key={item.label}>
            {item.label}
          </span>
        ))}
      </div>
    </figure>
  );
}

function linePoints(longitude, ascendantLongitude, innerRadius, outerRadius) {
  const inner = pointOnWheel({ longitude, ascendantLongitude, radius: innerRadius, center: CENTER });
  const outer = pointOnWheel({ longitude, ascendantLongitude, radius: outerRadius, center: CENTER });

  return {
    x1: inner.x,
    y1: inner.y,
    x2: outer.x,
    y2: outer.y,
  };
}

function ringSegmentPath(startLongitude, endLongitude, ascendantLongitude) {
  const outerStart = pointOnWheel({ longitude: startLongitude, ascendantLongitude, radius: 192, center: CENTER });
  const outerEnd = pointOnWheel({ longitude: endLongitude, ascendantLongitude, radius: 192, center: CENTER });
  const innerEnd = pointOnWheel({ longitude: endLongitude, ascendantLongitude, radius: 164, center: CENTER });
  const innerStart = pointOnWheel({ longitude: startLongitude, ascendantLongitude, radius: 164, center: CENTER });

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A 192 192 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A 164 164 0 0 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function conjunctionArcPath(from, to) {
  const control = {
    x: (from.x + to.x) / 2 + (CENTER - (from.x + to.x) / 2) * 0.08,
    y: (from.y + to.y) / 2 + (CENTER - (from.y + to.y) / 2) * 0.08,
  };

  return `M ${from.x} ${from.y} Q ${control.x} ${control.y} ${to.x} ${to.y}`;
}

function housesFromChart(chart) {
  const houses = chart.rawResult?.houses ?? chart.rawResult?.relatedCharts?.primaryNatal?.houses ?? [];

  if (houses.length >= 12) {
    return houses.slice(0, 12).map((house) => ({
      house: house.house,
      longitude: house.longitude,
    }));
  }

  return Array.from({ length: 12 }, (_, index) => ({
    house: index + 1,
    longitude: wheelFallbackLongitude(chart) + index * 30,
  }));
}

function wheelFallbackLongitude(chart) {
  return chart.placementGroups?.[0]?.placements?.find((placement) => placement.planet === "上升点")?.longitude ?? 0;
}

function planetGlyph(planet) {
  const labels = {
    太阳: "☉",
    月亮: "☽",
    水星: "☿",
    金星: "♀",
    火星: "♂",
    木星: "♃",
    土星: "♄",
    天王星: "♅",
    海王星: "♆",
    冥王星: "♇",
    北交点: "☊",
    南交点: "☋",
    上升点: "ASC",
    下降点: "DSC",
  };

  return labels[planet] ?? planet.slice(0, 1);
}

function placementTitle(placement, layerTitle) {
  const minute = placement.minute ? `${placement.minute}'` : "";
  const house = placement.house && placement.house !== "-" ? `第 ${placement.house} 宫` : "宫位未定";

  return `${layerTitle}：${placement.planet} ${placement.sign} ${placement.degree}°${minute} ${house}`;
}

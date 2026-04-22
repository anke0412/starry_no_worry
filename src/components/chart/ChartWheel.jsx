import React from "react";

import { buildChartWheelModel, pointOnWheel } from "../../lib/chartWheelGeometry.js";

const VIEWBOX_SIZE = 400;
const CENTER = 200;
const HOUSE_LINE_RADIUS = 170;
const HOUSE_LABEL_RADIUS = 103;

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
        <circle className="wheel-house-band" cx={CENTER} cy={CENTER} r="142" />
        <circle className="wheel-aspect-field" cx={CENTER} cy={CENTER} r="86" />

        {wheel.zodiac.map((segment) => (
          <g key={segment.id}>
            <line
              className="wheel-zodiac-tick"
              x1={pointOnWheel({ longitude: segment.startLongitude, ascendantLongitude: wheel.ascendantLongitude, radius: 164, center: CENTER }).x}
              y1={pointOnWheel({ longitude: segment.startLongitude, ascendantLongitude: wheel.ascendantLongitude, radius: 164, center: CENTER }).y}
              x2={pointOnWheel({ longitude: segment.startLongitude, ascendantLongitude: wheel.ascendantLongitude, radius: 190, center: CENTER }).x}
              y2={pointOnWheel({ longitude: segment.startLongitude, ascendantLongitude: wheel.ascendantLongitude, radius: 190, center: CENTER }).y}
            />
            <text className="wheel-zodiac-label" x={segment.labelPoint.x} y={segment.labelPoint.y}>
              {segment.label}
            </text>
          </g>
        ))}

        {houseCusps.map((house) => {
          const outer = pointOnWheel({
            longitude: house.longitude,
            ascendantLongitude: wheel.ascendantLongitude,
            radius: HOUSE_LINE_RADIUS,
            center: CENTER,
          });
          const inner = pointOnWheel({
            longitude: house.longitude,
            ascendantLongitude: wheel.ascendantLongitude,
            radius: 78,
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
              <line className="wheel-house-line" x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} />
              <text className="wheel-house-label" x={label.x} y={label.y}>
                {house.house}
              </text>
            </g>
          );
        })}

        {wheel.aspectLines.map((aspect, index) => (
          <line
            className={`wheel-aspect-line wheel-aspect-${aspect.type}`}
            key={`${aspect.from.planet}-${aspect.to.planet}-${index}`}
            stroke={aspect.color}
            x1={aspect.from.point.x}
            y1={aspect.from.point.y}
            x2={aspect.to.point.x}
            y2={aspect.to.point.y}
          />
        ))}

        {Object.values(wheel.axes).map((axis) =>
          axis ? (
            <g className="wheel-axis" key={axis.label}>
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
                <circle cx={placement.point.x} cy={placement.point.y} r={layerIndex === 0 ? 11 : 9} />
                <text x={placement.point.x} y={placement.point.y}>
                  {planetShortLabel(placement.planet)}
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
    </figure>
  );
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

function planetShortLabel(planet) {
  const labels = {
    太阳: "日",
    月亮: "月",
    水星: "水",
    金星: "金",
    火星: "火",
    木星: "木",
    土星: "土",
    天王星: "天",
    海王星: "海",
    冥王星: "冥",
    北交点: "北",
    南交点: "南",
  };

  return labels[planet] ?? planet.slice(0, 1);
}

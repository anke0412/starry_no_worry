export function collectSignals(context) {
  const placements = context.placements.filter((placement) => placement?.planet && placement?.sign);
  const aspects = [...context.aspects].sort((first, second) => orbValue(first.orb) - orbValue(second.orb));
  const statisticItems = context.statistics?.sections?.flatMap((section) => section.items ?? []) ?? [];
  const dominantStatistic = statisticItems.reduce(
    (best, current) => (!best || (current.count ?? 0) > (best.count ?? 0) ? current : best),
    null,
  );

  return {
    leadPlacement: placements[0] ?? null,
    supportPlacement: placements[1] ?? null,
    leadAspect: aspects[0] ?? null,
    dominantStatistic,
    overlayTitle: context.overlays?.[0]?.title ?? null,
  };
}

function orbValue(value) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number.parseFloat(value.replace("°", "")) || Number.POSITIVE_INFINITY;
  }

  return Number.POSITIVE_INFINITY;
}

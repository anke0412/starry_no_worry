import { interpretationLibrary } from "./library.js";

export function retrieveInterpretationNotes(context, signals) {
  const matches = interpretationLibrary
    .map((item) => ({
      ...item,
      score: scoreLibraryItem(item, context, signals),
    }))
    .filter((item) => item.score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, 4);

  return matches.map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body,
    sectionId: item.sectionId,
    tags: item.tags,
    score: item.score,
  }));
}

function scoreLibraryItem(item, context, signals) {
  let score = 0;

  if (item.audience === context.audience) {
    score += 4;
  }

  if (item.categories.includes(context.category)) {
    score += 5;
  }

  if (item.tags.some((tag) => context.chartTags.includes(tag))) {
    score += 3;
  }

  if (item.entryPointKind && context.entryPoints.some((entryPoint) => entryPoint.kind === item.entryPointKind)) {
    score += 2;
  }

  if (signals.overlayTitle && item.tags.includes("overlay")) {
    score += 2;
  }

  if (signals.leadAspect && item.entryPointKind === "aspect") {
    score += 1;
  }

  if (signals.leadPlacement && item.entryPointKind === "placement") {
    score += 1;
  }

  return score;
}

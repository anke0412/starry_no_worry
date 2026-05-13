import { buildInterpretationContext } from "./interpretation/context.js";
import { retrieveInterpretationNotes } from "./interpretation/retrieval.js";
import { createInterpretationReport as composeInterpretationReport } from "./interpretation/report.js";
import { collectSignals } from "./interpretation/signals.js";

export { buildInterpretationContext };

export function createInterpretationReport(context) {
  const signals = collectSignals(context);
  const retrievedNotes = retrieveInterpretationNotes(context, signals);
  return composeInterpretationReport(context, signals, retrievedNotes);
}

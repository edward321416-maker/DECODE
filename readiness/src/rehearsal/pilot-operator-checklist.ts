import { REHEARSAL_ARTIFACT, type RehearsalArtifact } from "./artifact.js";
import { PILOT_OPERATOR_CHECKLIST_ITEM_VALUES, type PilotOperatorChecklistItemName } from "../fixtures/contracts.js";

/** Protocol §23's required Pilot Operator readiness categories. */
export const PILOT_OPERATOR_CHECKLIST_ITEMS = PILOT_OPERATOR_CHECKLIST_ITEM_VALUES;

export type PilotOperatorChecklistItem = PilotOperatorChecklistItemName;

export interface PilotOperatorChecklistInput {
  completedItems: readonly PilotOperatorChecklistItem[];
}

export interface PilotOperatorChecklistResult {
  status: "READY" | "BLOCKED";
  missingItems: PilotOperatorChecklistItem[];
  reasonCodes: string[];
  artifact: RehearsalArtifact;
}

/**
 * Protocol §23: a synthetic rehearsal of the Pilot Operator readiness
 * checklist only — it never claims a real legal/ethical/rights
 * determination occurred. Any missing required item blocks the checklist;
 * there is deliberately no override mechanism (the only input is which
 * items are actually completed).
 */
export function rehearsePilotOperatorChecklist(input: PilotOperatorChecklistInput): PilotOperatorChecklistResult {
  const missingItems = PILOT_OPERATOR_CHECKLIST_ITEMS.filter((item) => !input.completedItems.includes(item));
  return {
    status: missingItems.length === 0 ? "READY" : "BLOCKED",
    missingItems: [...missingItems],
    reasonCodes: missingItems.length > 0 ? ["PILOT_OPERATOR_CHECKLIST_INCOMPLETE"] : [],
    artifact: REHEARSAL_ARTIFACT,
  };
}

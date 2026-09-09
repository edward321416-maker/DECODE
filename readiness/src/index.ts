import { validateEvidenceRecord, type EvidenceRecord } from "./foundation-api.js";
import type { ReadinessRun } from "./domain/contracts.js";

export * from "./domain/contracts.js";
export * from "./domain/run-id.js";
export * from "./runner/readiness-runner.js";
export * from "./runner/current-readiness.js";
export { getGateCatalog, MANDATORY_GATE_IDS, type GateContext, type GateDefinition, type MandatoryGateId } from "./gates/gate-catalog.js";

const INITIAL_EVIDENCE: EvidenceRecord = Object.freeze({
  evaluationMode: "SELF_BENCHMARK",
  dataOrigin: "SIMULATED",
  executionStatus: "NOT_TESTED",
});

export function createInitialReadinessRun(runId: string): ReadinessRun {
  const evidence: EvidenceRecord = { ...INITIAL_EVIDENCE };
  validateEvidenceRecord(evidence);
  return {
    runId,
    startedAt: null,
    completedAt: null,
    state: "NOT_STARTED",
    gates: [],
    readinessVerdict: null,
    evidence,
    frozenHashes: null,
    staleness: { stale: false, reasonCodes: [] },
  };
}

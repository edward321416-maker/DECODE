import { validateEvidenceRecord, type EvidenceRecord, type ExecutionStatus } from "../foundation-api.js";
import type { GateResult, ReadinessRun, ReadinessVerdict } from "../domain/contracts.js";
import { generateReadinessRunId } from "../domain/run-id.js";
import { computeFrozenHashesForFixture } from "../domain/frozen-hash-inputs.js";
import { loadFixtureSet, type FixtureId } from "../fixtures/registry.js";
import { getGateCatalog, type GateContext } from "../gates/gate-catalog.js";

export interface RunReadinessInput {
  fixtureId: FixtureId;
}

export interface D037Classification {
  executionStatus: ExecutionStatus;
  readinessVerdict: ReadinessVerdict;
}

/**
 * D037: every mandatory gate PASS -> PASSED + DRY_READY. An executed gate
 * that detects a real defect (FAIL) demonstrates the defect, so it wins
 * over an unavailable prerequisite (UNKNOWN/NOT_EXECUTED) when both occur.
 * No defect demonstrated but a mandatory gate unavailable -> BLOCKED (not
 * FAILED) + BLOCKED. `readiness_verdict` and `ExecutionStatus` are computed
 * together here but remain independent fields on the returned run.
 */
export function classifyExecutionStatus(gates: readonly GateResult[]): D037Classification {
  const mandatoryGates = gates.filter((g) => g.mandatory);
  if (mandatoryGates.some((g) => g.status === "FAIL")) {
    return { executionStatus: "FAILED", readinessVerdict: "BLOCKED" };
  }
  if (mandatoryGates.some((g) => g.status === "UNKNOWN" || g.status === "NOT_EXECUTED")) {
    return { executionStatus: "BLOCKED", readinessVerdict: "BLOCKED" };
  }
  return { executionStatus: "PASSED", readinessVerdict: "DRY_READY" };
}

/**
 * Runner attempts every gate in catalog order (non-short-circuit): an
 * earlier FAIL never aborts the run, so a single run always shows the
 * complete picture. A thrown exception means the process did not produce a
 * trustworthy valid completed run — it propagates rather than being
 * serialized as a completed artifact.
 */
export async function runReadiness(input: RunReadinessInput): Promise<ReadinessRun> {
  const runId = generateReadinessRunId();
  const fixture = loadFixtureSet(input.fixtureId);
  const frozenHashes = computeFrozenHashesForFixture(fixture);
  const startedAt = new Date().toISOString();
  const context: GateContext = { fixture, frozenHashes };
  const catalog = getGateCatalog();
  const gates: GateResult[] = [];
  for (const gate of catalog) {
    gates.push(await gate.execute(context, gates));
  }
  const completedAt = new Date().toISOString();
  const { executionStatus, readinessVerdict } = classifyExecutionStatus(gates);
  const evidence: EvidenceRecord = {
    evaluationMode: "SELF_BENCHMARK",
    dataOrigin: "SIMULATED",
    executionStatus,
  };
  validateEvidenceRecord(evidence);
  return {
    runId,
    startedAt,
    completedAt,
    state: "COMPLETED",
    gates,
    readinessVerdict,
    evidence,
    frozenHashes,
    staleness: { stale: false, reasonCodes: [] },
  };
}

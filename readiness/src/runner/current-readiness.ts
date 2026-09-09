import type { ExecutionStatus } from "../foundation-api.js";
import type { FrozenHashSet, ReadinessRun, ReadinessVerdict } from "../domain/contracts.js";
import { frozenHashSetsEqual } from "../domain/frozen-hashes.js";

export interface CurrentReadiness {
  readinessVerdict: ReadinessVerdict;
  executionStatus: ExecutionStatus;
  reasonCodes: string[];
}

/**
 * D034: current readiness comes from the latest valid canonical run whose
 * frozen hashes still match current canonical state. A mismatch reports
 * current readiness as BLOCKED/STALE_RUN — the historical run's own
 * recorded verdict and evidence are read-only here, never mutated.
 */
export function evaluateCurrentReadiness(
  latest: ReadinessRun,
  currentHashes: FrozenHashSet,
): CurrentReadiness {
  if (!latest.frozenHashes || !frozenHashSetsEqual(latest.frozenHashes, currentHashes)) {
    return { readinessVerdict: "BLOCKED", executionStatus: "BLOCKED", reasonCodes: ["STALE_RUN"] };
  }
  return {
    readinessVerdict: latest.readinessVerdict ?? "BLOCKED",
    executionStatus: latest.evidence.executionStatus,
    reasonCodes: [],
  };
}

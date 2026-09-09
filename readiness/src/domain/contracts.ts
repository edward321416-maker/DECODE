import type { EvidenceRecord } from "../foundation-api.js";

export type GateStatus = "PASS" | "FAIL" | "UNKNOWN" | "NOT_EXECUTED";
export type ReadinessVerdict = "DRY_READY" | "BLOCKED";
export type ReadinessRunState = "NOT_STARTED" | "RUNNING" | "COMPLETED";

export interface GateResult {
  gateId: string;
  mandatory: boolean;
  status: GateStatus;
  reasonCodes: string[];
  detail?: string;
}

export interface FrozenHashSet {
  readinessSource: string;
  foundationSource: string;
  protocol: string;
  schema: string;
  fixtureSet: string;
  gateDefinition: string;
}

export interface ReadinessRun {
  runId: string;
  startedAt: string | null;
  completedAt: string | null;
  state: ReadinessRunState;
  gates: GateResult[];
  readinessVerdict: ReadinessVerdict | null;
  evidence: EvidenceRecord;
  frozenHashes: FrozenHashSet | null;
  staleness: { stale: boolean; reasonCodes: string[] };
}

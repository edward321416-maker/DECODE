export type EvaluationMode = "ACTUAL_TEST" | "SELF_BENCHMARK" | "N_A";
export type DataOrigin = "REAL" | "SIMULATED" | "UNKNOWN";
export type ExecutionStatus = "NOT_TESTED" | "RUNNING" | "PASSED" | "FAILED" | "BLOCKED";

export interface EvidenceRecord {
  evaluationMode: EvaluationMode;
  dataOrigin: DataOrigin;
  executionStatus: ExecutionStatus;
  evaluationSubtype?: "MODEL_BAKE_OFF";
}

export class EvidenceRecordError extends Error {}

export function validateEvidenceRecord(record: EvidenceRecord): void {
  if (record.evaluationSubtype === "MODEL_BAKE_OFF" && record.evaluationMode !== "SELF_BENCHMARK") {
    throw new EvidenceRecordError("evaluation_subtype=MODEL_BAKE_OFF is only valid under SELF-BENCHMARK");
  }
  if (record.evaluationMode === "ACTUAL_TEST" && record.dataOrigin !== "REAL") {
    throw new EvidenceRecordError("ACTUAL TEST requires DataOrigin=REAL");
  }
}

export function isPreExecutionRecord(record: EvidenceRecord): boolean {
  return (
    record.evaluationMode === "ACTUAL_TEST" &&
    record.dataOrigin === "REAL" &&
    record.executionStatus === "NOT_TESTED"
  );
}

export function excludeFromExecutedDenominator(records: EvidenceRecord[]): EvidenceRecord[] {
  return records.filter((record) => !isPreExecutionRecord(record));
}

export function selfPromoteToActualTest(): never {
  throw new EvidenceRecordError(
    "SELF-BENCHMARK and other engineering/static results cannot self-promote to ACTUAL TEST",
  );
}

const DATA_ORIGIN_VALUES: readonly DataOrigin[] = ["REAL", "SIMULATED", "UNKNOWN"];

export function assertValidDataOrigin(value: string): asserts value is DataOrigin {
  if (!(DATA_ORIGIN_VALUES as readonly string[]).includes(value)) {
    throw new EvidenceRecordError(`invalid DataOrigin: ${value}`);
  }
}

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
  // Runtime boundary enforcement lives here too, not only in separate helpers callers might
  // forget to invoke: every canonical dimension (D023-locked) is checked against its exact
  // membership set — an untyped/unknown value arriving from outside the type system (e.g.
  // evaluationMode="MODEL_BAKE_OFF" as a top-level mode, or an unknown ExecutionStatus like
  // "EXECUTED") must never pass validation.
  assertValidEvaluationMode(record.evaluationMode);
  assertValidDataOrigin(record.dataOrigin);
  assertValidExecutionStatus(record.executionStatus);
  assertValidEvaluationSubtype(record.evaluationSubtype);
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

const EVALUATION_MODE_VALUES: readonly EvaluationMode[] = ["ACTUAL_TEST", "SELF_BENCHMARK", "N_A"];

export function assertValidEvaluationMode(value: string): asserts value is EvaluationMode {
  if (!(EVALUATION_MODE_VALUES as readonly string[]).includes(value)) {
    throw new EvidenceRecordError(`invalid EvaluationMode: ${value}`);
  }
}

const EXECUTION_STATUS_VALUES: readonly ExecutionStatus[] = [
  "NOT_TESTED",
  "RUNNING",
  "PASSED",
  "FAILED",
  "BLOCKED",
];

export function assertValidExecutionStatus(value: string): asserts value is ExecutionStatus {
  if (!(EXECUTION_STATUS_VALUES as readonly string[]).includes(value)) {
    throw new EvidenceRecordError(`invalid ExecutionStatus: ${value}`);
  }
}

export function assertValidEvaluationSubtype(
  value: string | undefined,
): asserts value is "MODEL_BAKE_OFF" | undefined {
  if (value !== undefined && value !== "MODEL_BAKE_OFF") {
    throw new EvidenceRecordError(`invalid evaluation_subtype: ${value}`);
  }
}

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertValidDataOrigin,
  excludeFromExecutedDenominator,
  isPreExecutionRecord,
  selfPromoteToActualTest,
  validateEvidenceRecord,
  type EvidenceRecord,
} from "../src/shared/provenance.js";

// Invariant 3: SELF-BENCHMARK + SIMULATED is valid.
test("invariant 3: SELF-BENCHMARK + SIMULATED is valid", () => {
  assert.doesNotThrow(() =>
    validateEvidenceRecord({ evaluationMode: "SELF_BENCHMARK", dataOrigin: "SIMULATED", executionStatus: "PASSED" }),
  );
});

// SELF-BENCHMARK + REAL is valid where appropriate.
test("SELF-BENCHMARK + REAL is valid", () => {
  assert.doesNotThrow(() =>
    validateEvidenceRecord({ evaluationMode: "SELF_BENCHMARK", dataOrigin: "REAL", executionStatus: "PASSED" }),
  );
});

// Invariant 4: ACTUAL TEST requires DataOrigin=REAL; ACTUAL TEST + SIMULATED rejected.
test("invariant 4: ACTUAL TEST requires DataOrigin=REAL", () => {
  assert.doesNotThrow(() =>
    validateEvidenceRecord({ evaluationMode: "ACTUAL_TEST", dataOrigin: "REAL", executionStatus: "NOT_TESTED" }),
  );
  assert.throws(() =>
    validateEvidenceRecord({ evaluationMode: "ACTUAL_TEST", dataOrigin: "SIMULATED", executionStatus: "NOT_TESTED" }),
  );
});

// evaluation_subtype=MODEL_BAKE_OFF is allowed only under SELF-BENCHMARK, never changes ACTUAL TEST eligibility.
test("evaluation_subtype=MODEL_BAKE_OFF allowed only under SELF-BENCHMARK", () => {
  assert.doesNotThrow(() =>
    validateEvidenceRecord({
      evaluationMode: "SELF_BENCHMARK",
      dataOrigin: "SIMULATED",
      executionStatus: "PASSED",
      evaluationSubtype: "MODEL_BAKE_OFF",
    }),
  );
  assert.throws(() =>
    validateEvidenceRecord({
      evaluationMode: "ACTUAL_TEST",
      dataOrigin: "REAL",
      executionStatus: "NOT_TESTED",
      evaluationSubtype: "MODEL_BAKE_OFF",
    }),
  );
});

// Invariant 5 (D024): a persisted ACTUAL TEST + REAL + NOT TESTED record is a valid pre-execution record,
// excluded from executed-sample-size/expert-agreement/threshold/GO-REVISE-STOP calculations.
test("invariant 5: ACTUAL TEST + REAL + NOT TESTED is a valid pre-execution record", () => {
  const record: EvidenceRecord = { evaluationMode: "ACTUAL_TEST", dataOrigin: "REAL", executionStatus: "NOT_TESTED" };
  assert.doesNotThrow(() => validateEvidenceRecord(record));
  assert.equal(isPreExecutionRecord(record), true);
});

test("invariant 5: pre-execution records excluded from the executed denominator", () => {
  const preExecution: EvidenceRecord = {
    evaluationMode: "ACTUAL_TEST",
    dataOrigin: "REAL",
    executionStatus: "NOT_TESTED",
  };
  const executed: EvidenceRecord = { evaluationMode: "ACTUAL_TEST", dataOrigin: "REAL", executionStatus: "PASSED" };
  const denominator = excludeFromExecutedDenominator([preExecution, executed]);
  assert.deepEqual(denominator, [executed]);
});

test("invariant 5: RUNNING/PASSED/FAILED/BLOCKED are not pre-execution records", () => {
  for (const executionStatus of ["RUNNING", "PASSED", "FAILED", "BLOCKED"] as const) {
    assert.equal(
      isPreExecutionRecord({ evaluationMode: "ACTUAL_TEST", dataOrigin: "REAL", executionStatus }),
      false,
    );
  }
});

// Invariant 6: no evidence record may set DataOrigin=MIXED; runtime input is validated against the canonical enum.
test("invariant 6: DataOrigin=MIXED is rejected at the runtime boundary", () => {
  assert.doesNotThrow(() => assertValidDataOrigin("REAL"));
  assert.doesNotThrow(() => assertValidDataOrigin("SIMULATED"));
  assert.doesNotThrow(() => assertValidDataOrigin("UNKNOWN"));
  assert.throws(() => assertValidDataOrigin("MIXED"));
});

// Invariant 7: no SELF-BENCHMARK (or other engineering/static) result can self-promote to ACTUAL TEST.
test("invariant 7: SELF-BENCHMARK results cannot self-promote to ACTUAL TEST", () => {
  assert.throws(() => selfPromoteToActualTest());
});

// PR-A review finding 8: validateEvidenceRecord() must itself reject non-canonical runtime
// values (e.g. an untyped/unknown-origin record with dataOrigin="MIXED") — callers must not have
// to separately remember to call assertValidDataOrigin first.
test("finding 8: validateEvidenceRecord rejects a runtime record with a non-canonical DataOrigin", () => {
  const untyped: EvidenceRecord = {
    evaluationMode: "SELF_BENCHMARK",
    dataOrigin: "MIXED" as unknown as EvidenceRecord["dataOrigin"],
    executionStatus: "PASSED",
  };
  assert.throws(() => validateEvidenceRecord(untyped));
});

test("finding 8: validateEvidenceRecord still accepts every canonical DataOrigin value", () => {
  for (const dataOrigin of ["REAL", "SIMULATED", "UNKNOWN"] as const) {
    assert.doesNotThrow(() =>
      validateEvidenceRecord({ evaluationMode: "SELF_BENCHMARK", dataOrigin, executionStatus: "PASSED" }),
    );
  }
});

test("finding 8: validateEvidenceRecord still preserves D023/D024 and MODEL_BAKE_OFF subtype semantics", () => {
  // D024 pre-execution record remains valid.
  assert.doesNotThrow(() =>
    validateEvidenceRecord({ evaluationMode: "ACTUAL_TEST", dataOrigin: "REAL", executionStatus: "NOT_TESTED" }),
  );
  // MODEL_BAKE_OFF subtype remains valid only under SELF-BENCHMARK.
  assert.doesNotThrow(() =>
    validateEvidenceRecord({
      evaluationMode: "SELF_BENCHMARK",
      dataOrigin: "SIMULATED",
      executionStatus: "PASSED",
      evaluationSubtype: "MODEL_BAKE_OFF",
    }),
  );
});

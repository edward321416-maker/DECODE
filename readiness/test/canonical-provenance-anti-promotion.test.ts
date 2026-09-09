import assert from "node:assert/strict";
import test from "node:test";
import { validateEvidenceRecord, EvidenceRecordError, type EvidenceRecord } from "../src/foundation-api.js";

/**
 * Finding 5 correction: the negative-mutation proof that Foundation's
 * validateEvidenceRecord() rejects a forbidden ACTUAL_TEST/SIMULATED
 * combination lives here, in a test-only file, never in readiness
 * production source. Production's canonical-provenance-anti-promotion gate
 * proves the same invariant a different way (structural field-separation),
 * without ever constructing this literal itself.
 */
test("Foundation's validateEvidenceRecord rejects ACTUAL_TEST + SIMULATED (never DataOrigin=REAL is required for ACTUAL_TEST)", () => {
  const validRecord: EvidenceRecord = {
    evaluationMode: "SELF_BENCHMARK",
    dataOrigin: "SIMULATED",
    executionStatus: "NOT_TESTED",
  };
  assert.doesNotThrow(() => validateEvidenceRecord(validRecord));

  const forbiddenRecord = { ...validRecord, evaluationMode: "ACTUAL_TEST" } as EvidenceRecord;
  assert.throws(() => validateEvidenceRecord(forbiddenRecord), EvidenceRecordError);
});

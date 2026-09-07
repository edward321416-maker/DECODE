import { test } from "node:test";
import assert from "node:assert/strict";
import { TestClock } from "../src/shared/clock.js";
import { generateId } from "../src/shared/ids.js";
import { DurableJob, DurableJobError } from "../src/jobs/durable-job.js";

function makeJob(clock = new TestClock(new Date("2026-01-01T00:00:00Z"))) {
  return { job: new DurableJob(generateId("job"), clock), clock };
}

// Invariants 40-41: normal RUNNING job succeeds; successful attempt preserves result evidence.
test("invariants 40-41: normal RUNNING job succeeds and preserves result evidence", () => {
  const { job } = makeJob();
  job.start();
  job.succeed({ ok: true });
  assert.equal(job.getState(), "SUCCEEDED");
  assert.deepEqual(job.getAttempts()[0]?.resultEvidence, { ok: true });
  assert.equal(job.getAttemptCount(), 1);
});

// Invariants 42-43: normal RUNNING job definitively fails; failed attempt preserves failure evidence.
test("invariants 42-43: normal RUNNING job fails and preserves failure evidence", () => {
  const { job } = makeJob();
  job.start();
  job.fail({ error: "boom" });
  assert.equal(job.getState(), "FAILED");
  assert.deepEqual(job.getAttempts()[0]?.failureEvidence, { error: "boom" });
  assert.equal(job.getAttemptCount(), 1);
});

// Invariant 44: normal completion from invalid state rejected.
test("invariant 44: normal completion from invalid state rejected", () => {
  const { job } = makeJob();
  assert.throws(() => job.succeed({}), DurableJobError);
  assert.throws(() => job.fail({}), DurableJobError);
});

// Invariant 45: UNKNOWN_RESULT cannot directly retry.
test("invariant 45: UNKNOWN_RESULT cannot directly retry without recorded reconciliation", () => {
  const { job } = makeJob();
  job.start();
  job.markUnknownResult();
  assert.equal(job.getState(), "UNKNOWN_RESULT");
  assert.throws(() => job.retry(), DurableJobError);
});

// Invariants 46-47: reconciliation requires a non-empty ref and reason.
test("invariants 46-47: reconciliation requires reconciliationRef and reason", () => {
  const { job } = makeJob();
  job.start();
  job.markUnknownResult();
  job.requireReconciliation();
  assert.throws(
    () => job.reconcile({ decision: "CONFIRMED_SUCCEEDED", reconciliationRef: "", reason: "confirmed" }),
    DurableJobError,
  );
  assert.throws(
    () => job.reconcile({ decision: "CONFIRMED_SUCCEEDED", reconciliationRef: "ref-1", reason: "" }),
    DurableJobError,
  );
});

// Invariant 48: canonical reconciliation timestamp comes from the Foundation Clock.
test("invariant 48: reconciliation timestamp comes from the Foundation Clock", () => {
  const clock = new TestClock(new Date("2026-01-01T00:00:00Z"));
  const { job } = makeJob(clock);
  job.start();
  job.markUnknownResult();
  job.requireReconciliation();
  clock.advance(5000);
  job.reconcile({ decision: "CONFIRMED_SUCCEEDED", reconciliationRef: "ref-1", reason: "verified externally" });
  const reconciliation = job.getReconciliations()[0];
  assert.equal(reconciliation?.recordedAt.getTime(), new Date("2026-01-01T00:00:05Z").getTime());
});

// Invariant 49: external observed timestamp remains separately attributable.
test("invariant 49: externalObservedAt is preserved separately from the Foundation timestamp", () => {
  const clock = new TestClock(new Date("2026-01-01T00:00:00Z"));
  const { job } = makeJob(clock);
  job.start();
  job.markUnknownResult();
  job.requireReconciliation();
  const externalObservedAt = new Date("2025-12-31T23:00:00Z");
  job.reconcile({
    decision: "CONFIRMED_SUCCEEDED",
    reconciliationRef: "ref-1",
    reason: "verified externally",
    externalObservedAt,
  });
  const reconciliation = job.getReconciliations()[0];
  assert.equal(reconciliation?.externalObservedAt?.getTime(), externalObservedAt.getTime());
  assert.notEqual(reconciliation?.externalObservedAt?.getTime(), reconciliation?.recordedAt.getTime());
});

// Invariant 50: reconciled success does not increment attempt count.
test("invariant 50: reconciled success does not increment attempt count", () => {
  const { job } = makeJob();
  job.start();
  job.markUnknownResult();
  job.requireReconciliation();
  job.reconcile({ decision: "CONFIRMED_SUCCEEDED", reconciliationRef: "ref-1", reason: "verified" });
  assert.equal(job.getState(), "SUCCEEDED");
  assert.equal(job.getAttemptCount(), 1);
});

// Invariant 51: reconciled failure becomes terminal FAILED.
test("invariant 51: reconciled failure becomes terminal FAILED", () => {
  const { job } = makeJob();
  job.start();
  job.markUnknownResult();
  job.requireReconciliation();
  job.reconcile({ decision: "CONFIRMED_FAILED", reconciliationRef: "ref-1", reason: "confirmed failed" });
  assert.equal(job.getState(), "FAILED");
});

// Invariant 52: retry requires a recorded RETRY_ALLOWED reconciliation.
test("invariant 52: retry requires a recorded RETRY_ALLOWED reconciliation", () => {
  const { job } = makeJob();
  job.start();
  job.markUnknownResult();
  job.requireReconciliation();
  job.reconcile({ decision: "RETRY_ALLOWED", reconciliationRef: "ref-1", reason: "retry authorized" });
  assert.equal(job.getState(), "RETRY_ALLOWED");
  assert.doesNotThrow(() => job.retry());
});

// Invariants 53-55: actual retry increments attempt count, preserves prior attempt as historical,
// and the fresh attempt carries no stale failure metadata.
test("invariants 53-55: retry creates a fresh attempt, preserves history, carries no stale metadata", () => {
  const { job } = makeJob();
  job.start();
  job.markUnknownResult();
  job.requireReconciliation();
  job.reconcile({ decision: "RETRY_ALLOWED", reconciliationRef: "ref-1", reason: "retry authorized" });
  job.retry();
  assert.equal(job.getAttemptCount(), 2);
  assert.equal(job.getAttempts()[0]?.state, "UNKNOWN_RESULT");
  assert.equal(job.getAttempts()[1]?.state, "RUNNING");
  assert.equal(job.getAttempts()[1]?.failureEvidence, undefined);
  job.succeed({ ok: true });
  assert.equal(job.getState(), "SUCCEEDED");
});

// PR-A review finding 7: DurableJob must reject a wrong-namespace id (e.g. a Permit id) at
// construction, not silently accept it as a valid Job id.
test("finding 7: DurableJob rejects a non-'job'-namespace id", () => {
  const clock = new TestClock(new Date("2026-01-01T00:00:00Z"));
  assert.throws(() => new DurableJob(generateId("permit"), clock), DurableJobError);
  assert.throws(() => new DurableJob("not-namespaced", clock), DurableJobError);
  assert.doesNotThrow(() => new DurableJob(generateId("job"), clock));
});

// PR-A review finding 9: getAttempts()/getReconciliations() must not expose the mutable
// authoritative internal records — external mutation of the returned arrays/objects must not
// alter stored history/evidence/timestamps.
test("finding 9: mutating the returned attempts/reconciliations does not alter stored history", () => {
  const { job } = makeJob();
  job.start();
  job.markUnknownResult();
  job.requireReconciliation();
  job.reconcile({ decision: "RETRY_ALLOWED", reconciliationRef: "ref-1", reason: "retry authorized" });

  const attempts = job.getAttempts() as unknown as Array<Record<string, unknown>>;
  attempts[0]!.state = "SUCCEEDED";
  attempts[0]!.failureEvidence = { tampered: true };
  attempts.push({ attemptNumber: 99, state: "SUCCEEDED", startedAt: new Date() });

  const reconciliations = job.getReconciliations() as unknown as Array<Record<string, unknown>>;
  reconciliations[0]!.reason = "tampered";
  (reconciliations[0]!.recordedAt as Date).setFullYear(1999);

  assert.equal(job.getAttempts()[0]?.state, "UNKNOWN_RESULT");
  assert.equal(job.getAttempts()[0]?.failureEvidence, undefined);
  assert.equal(job.getAttemptCount(), 1);
  assert.equal(job.getReconciliations()[0]?.reason, "retry authorized");
  assert.equal(job.getReconciliations()[0]?.recordedAt.getFullYear(), 2026);
});

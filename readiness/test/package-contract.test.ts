import assert from "node:assert/strict";
import test from "node:test";
import {
  createInitialReadinessRun,
  generateReadinessRunId,
} from "../src/index.js";

test("run ids are readiness-prefixed and distinct from foundation namespaces", () => {
  const id = generateReadinessRunId();
  assert.match(id, /^readiness_[0-9a-f-]{36}$/);
  assert.equal(id.startsWith("permit_"), false);
  assert.equal(id.startsWith("job_"), false);
  assert.equal(id.startsWith("command_"), false);
});

test("initial run evidence is SELF_BENCHMARK + SIMULATED + NOT_TESTED", () => {
  const run = createInitialReadinessRun("readiness_00000000-0000-4000-8000-000000000001");
  assert.deepEqual(run.evidence, {
    evaluationMode: "SELF_BENCHMARK",
    dataOrigin: "SIMULATED",
    executionStatus: "NOT_TESTED",
  });
});

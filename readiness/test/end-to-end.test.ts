import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { runReadiness, classifyExecutionStatus } from "../src/runner/readiness-runner.js";
import { evaluateCurrentReadiness } from "../src/runner/current-readiness.js";
import { writeRunArtifact } from "../src/persistence/run-artifact.js";
import { runCli } from "../src/cli.js";
import { MANDATORY_GATE_IDS } from "../src/gates/gate-catalog.js";
import type { GateResult, FrozenHashSet } from "../src/domain/contracts.js";

test("full default end-to-end path: every mandatory gate produces a terminal record", async () => {
  const run = await runReadiness({ fixtureId: "full-ready-v1" });
  assert.equal(run.gates.length, MANDATORY_GATE_IDS.length);
  for (const gate of run.gates) {
    assert.ok(["PASS", "FAIL", "UNKNOWN", "NOT_EXECUTED"].includes(gate.status));
  }
  const localTranscription = run.gates.find((g) => g.gateId === "local-transcription-port");
  assert.ok(localTranscription);
  assert.equal(localTranscription.status, "NOT_EXECUTED");
  assert.deepEqual(localTranscription.reasonCodes, ["LOCAL_TRANSCRIPTION_UNAVAILABLE"]);
  for (const gate of run.gates) {
    if (gate.gateId !== "local-transcription-port") {
      assert.equal(gate.status, "PASS", `${gate.gateId}: ${JSON.stringify(gate.reasonCodes)}`);
    }
  }
  assert.equal(run.evidence.evaluationMode, "SELF_BENCHMARK");
  assert.equal(run.evidence.dataOrigin, "SIMULATED");
  assert.equal(run.evidence.executionStatus, "BLOCKED");
  assert.equal(run.readinessVerdict, "BLOCKED");
});

test("aggregation-only DRY_READY possibility: 22 pure PASS stubs classify as PASSED + DRY_READY", () => {
  const stubs: GateResult[] = MANDATORY_GATE_IDS.map((id) => ({
    gateId: id,
    mandatory: true,
    status: "PASS",
    reasonCodes: [],
  }));
  const result = classifyExecutionStatus(stubs);
  assert.deepEqual(result, { executionStatus: "PASSED", readinessVerdict: "DRY_READY" });
  // This proves the aggregation algebra only — it does not claim this
  // implementation has a qualifying local STT adapter anywhere.
});

test("replacement-unavailable-v1: reserve gate PASSes with REPLACEMENT_UNAVAILABLE, no redraw, overall BLOCKED", async () => {
  const run = await runReadiness({ fixtureId: "replacement-unavailable-v1" });
  const reserve = run.gates.find((g) => g.gateId === "reserve-replacement");
  assert.ok(reserve);
  assert.equal(reserve.status, "PASS");
  assert.deepEqual(reserve.reasonCodes, ["REPLACEMENT_UNAVAILABLE"]);
  assert.equal(run.readinessVerdict, "BLOCKED");
});

test("anti-optimization: overwriting an old run artifact is rejected", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "readiness-e2e-"));
  try {
    const run = await runReadiness({ fixtureId: "full-ready-v1" });
    await writeRunArtifact(run, dir);
    await assert.rejects(() => writeRunArtifact(run, dir));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("anti-optimization: a run is never treated as current readiness without a frozen-hash match", async () => {
  const run = await runReadiness({ fixtureId: "full-ready-v1" });
  const staleHashes: FrozenHashSet = { ...(run.frozenHashes as FrozenHashSet), protocol: "1".repeat(64) };
  const current = evaluateCurrentReadiness(run, staleHashes);
  assert.equal(current.readinessVerdict, "BLOCKED");
  assert.deepEqual(current.reasonCodes, ["STALE_RUN"]);
});

test("CLI end-to-end: unknown fixture rejected, valid fixture produces a written artifact", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "readiness-e2e-cli-"));
  try {
    const bad = await runCli(["run", "--scenario", "not-a-real-fixture"]);
    assert.equal(bad.exitCode, 1);

    const good = await runCli(["run", "--scenario", "full-ready-v1", "--output-dir", dir]);
    assert.equal(good.exitCode, 0);
    assert.ok(good.artifactPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

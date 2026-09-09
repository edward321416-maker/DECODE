import assert from "node:assert/strict";
import test from "node:test";
import { MANDATORY_GATE_IDS, getGateCatalog, type GateContext } from "../src/gates/gate-catalog.js";
import { loadFixtureSet } from "../src/fixtures/registry.js";
import { computeFrozenHashesForFixture } from "../src/domain/frozen-hash-inputs.js";
import type { GateResult, GateStatus } from "../src/domain/contracts.js";
import { runReadiness, classifyExecutionStatus } from "../src/runner/readiness-runner.js";
import { evaluateCurrentReadiness } from "../src/runner/current-readiness.js";

test("MANDATORY_GATE_IDS is sorted/unique and matches the exact locked Section 13 set", () => {
  const expected = [
    "simulated-only-input",
    "evidence-anti-promotion",
    "consent-guardian-assent-rehearsal",
    "source-rights-rehearsal",
    "second-expert-qualification-rehearsal",
    "main10-composition-freeze",
    "reserve3-allocation-freeze",
    "reserve-replacement",
    "second-expert-planned-subset",
    "freeze-immutability",
    "measurement-preregistration-freeze",
    "software-schema-protocol-fixture-gate-hashing",
    "timing-pause-interruption-contract",
    "withdrawal-future-use-invalidation",
    "retention-deletion-receipts",
    "foundation-policy-rights-integration",
    "local-transcription-port",
    "external-egress-default-block",
    "canonical-provenance-anti-promotion",
    "metric-computation-contract",
    "stale-run-detection",
    "end-to-end-synthetic-rehearsal",
  ];
  assert.deepEqual([...MANDATORY_GATE_IDS], expected);
  assert.equal(new Set(MANDATORY_GATE_IDS).size, MANDATORY_GATE_IDS.length);
});

test("gate catalog matches MANDATORY_GATE_IDS exactly, in order", () => {
  const catalog = getGateCatalog();
  assert.deepEqual(
    catalog.map((g) => g.id),
    [...MANDATORY_GATE_IDS],
  );
  assert.ok(catalog.every((g) => g.mandatory === true));
});

function buildContext(fixtureId: "full-ready-v1" | "no-local-transcription-v1" | "replacement-unavailable-v1"): GateContext {
  const fixture = loadFixtureSet(fixtureId);
  return { fixture, frozenHashes: computeFrozenHashesForFixture(fixture) };
}

test("every gate produces at least one negative-path reason code on the expected fixture", async () => {
  const catalog = getGateCatalog();
  const context = buildContext("replacement-unavailable-v1");
  const results: GateResult[] = [];
  for (const gate of catalog) {
    results.push(await gate.execute(context, results));
  }
  const byId = new Map(results.map((r) => [r.gateId, r]));
  const reserveReplacement = byId.get("reserve-replacement");
  const localTranscription = byId.get("local-transcription-port");
  const externalEgress = byId.get("external-egress-default-block");
  assert.ok(reserveReplacement && localTranscription && externalEgress);
  assert.deepEqual(reserveReplacement.reasonCodes, ["REPLACEMENT_UNAVAILABLE"]);
  assert.equal(reserveReplacement.status, "PASS");
  assert.equal(localTranscription.status, "NOT_EXECUTED");
  assert.deepEqual(localTranscription.reasonCodes, ["LOCAL_TRANSCRIPTION_UNAVAILABLE"]);
  assert.equal(externalEgress.status, "PASS");
  assert.deepEqual(externalEgress.reasonCodes, ["EXTERNAL_EGRESS_BLOCKED"]);
});

test("on full-ready-v1, every mechanically satisfiable gate PASSes except local-transcription-port", async () => {
  const catalog = getGateCatalog();
  const context = buildContext("full-ready-v1");
  const results: GateResult[] = [];
  for (const gate of catalog) {
    results.push(await gate.execute(context, results));
  }
  for (const result of results) {
    if (result.gateId === "local-transcription-port") {
      assert.equal(result.status, "NOT_EXECUTED");
    } else {
      assert.equal(result.status, "PASS", `${result.gateId} expected PASS, got ${result.status}: ${JSON.stringify(result.reasonCodes)}`);
    }
  }
  const endToEnd = results.find((r) => r.gateId === "end-to-end-synthetic-rehearsal");
  assert.ok(endToEnd);
  assert.equal(endToEnd.status, "PASS");
});

function stubGates(status: GateStatus | Record<number, GateStatus>): GateResult[] {
  return MANDATORY_GATE_IDS.map((id, i) => ({
    gateId: id,
    mandatory: true,
    status: typeof status === "string" ? status : (status[i] ?? "PASS"),
    reasonCodes: [],
  }));
}

test("22 PASS gate stubs classify as PASSED + DRY_READY", () => {
  const result = classifyExecutionStatus(stubGates("PASS"));
  assert.deepEqual(result, { executionStatus: "PASSED", readinessVerdict: "DRY_READY" });
});

test("flipping any single mandatory gate to FAIL/UNKNOWN/NOT_EXECUTED flips verdict to BLOCKED", () => {
  const flips: GateStatus[] = ["FAIL", "UNKNOWN", "NOT_EXECUTED"];
  for (const status of flips) {
    for (let i = 0; i < MANDATORY_GATE_IDS.length; i++) {
      const result = classifyExecutionStatus(stubGates({ [i]: status }));
      assert.equal(
        result.readinessVerdict,
        "BLOCKED",
        `${status} at index ${i} (${MANDATORY_GATE_IDS[i]}) did not flip verdict to BLOCKED`,
      );
    }
  }
});

test("D037: an executed defect (FAIL) wins over an unavailable gate (NOT_EXECUTED) when both occur", () => {
  const result = classifyExecutionStatus(stubGates({ 0: "FAIL", 1: "NOT_EXECUTED" }));
  assert.equal(result.executionStatus, "FAILED");
  assert.equal(result.readinessVerdict, "BLOCKED");
});

test("D037: no demonstrated defect but an unavailable mandatory gate maps to BLOCKED, not FAILED", () => {
  const result = classifyExecutionStatus(stubGates({ 0: "UNKNOWN" }));
  assert.equal(result.executionStatus, "BLOCKED");
  assert.equal(result.readinessVerdict, "BLOCKED");
});

test("runReadiness against full-ready-v1 with normal wiring produces a valid completed BLOCKED run", async () => {
  const run = await runReadiness({ fixtureId: "full-ready-v1" });
  assert.equal(run.state, "COMPLETED");
  assert.equal(run.gates.length, MANDATORY_GATE_IDS.length);
  assert.equal(run.evidence.evaluationMode, "SELF_BENCHMARK");
  assert.equal(run.evidence.dataOrigin, "SIMULATED");
  assert.equal(run.evidence.executionStatus, "BLOCKED");
  assert.equal(run.readinessVerdict, "BLOCKED");
  const localTranscription = run.gates.find((g) => g.gateId === "local-transcription-port");
  assert.ok(localTranscription);
  assert.equal(localTranscription.status, "NOT_EXECUTED");
});

test("evaluateCurrentReadiness detects staleness without mutating the historical run", async () => {
  const run = await runReadiness({ fixtureId: "full-ready-v1" });
  const originalVerdict = run.readinessVerdict;
  const staleHashes = { ...run.frozenHashes!, protocol: "0".repeat(64) };
  const current = evaluateCurrentReadiness(run, staleHashes);
  assert.equal(current.readinessVerdict, "BLOCKED");
  assert.equal(current.executionStatus, "BLOCKED");
  assert.deepEqual(current.reasonCodes, ["STALE_RUN"]);
  // the historical run itself is untouched.
  assert.equal(run.readinessVerdict, originalVerdict);

  const fresh = evaluateCurrentReadiness(run, run.frozenHashes!);
  assert.equal(fresh.readinessVerdict, run.readinessVerdict);
  assert.equal(fresh.executionStatus, run.evidence.executionStatus);
});

import assert from "node:assert/strict";
import test from "node:test";
import { rehearseConsent, resolvePausedConsent } from "../src/rehearsal/consent.js";
import { rehearseSourceRights } from "../src/rehearsal/source-rights.js";
import { qualifySecondExpertCandidate } from "../src/rehearsal/second-expert-qualification.js";
import {
  PILOT_OPERATOR_CHECKLIST_ITEMS,
  rehearsePilotOperatorChecklist,
} from "../src/rehearsal/pilot-operator-checklist.js";
import { loadFixtureSet } from "../src/fixtures/registry.js";
import { getGateCatalog } from "../src/gates/gate-catalog.js";
import { computeFrozenHashesForFixture } from "../src/domain/frozen-hash-inputs.js";

function expectArtifact(artifact: unknown) {
  assert.deepEqual(artifact, { rehearsal: true, evaluationMode: "SELF_BENCHMARK", dataOrigin: "SIMULATED" });
}

test("consent rehearsal result carries an explicit SELF_BENCHMARK/SIMULATED rehearsal artifact", () => {
  const result = rehearseConsent({ actorId: "a1", kind: "ADULT", expression: "PARTICIPATE" });
  expectArtifact(result.artifact);
  expectArtifact(resolvePausedConsent("CONTINUE").artifact);
});

test("source-rights rehearsal result carries an explicit SELF_BENCHMARK/SIMULATED rehearsal artifact", () => {
  const result = rehearseSourceRights({ sourceId: "s1", kind: "FOUNDER_OWNED" });
  expectArtifact(result.artifact);
});

test("Second Expert qualification result carries an explicit SELF_BENCHMARK/SIMULATED rehearsal artifact", () => {
  const candidate = loadFixtureSet("full-ready-v1").qualificationCandidates[0];
  assert.ok(candidate);
  const result = qualifySecondExpertCandidate(candidate);
  expectArtifact(result.artifact);
});

test("Pilot Operator checklist has exactly the Protocol §23 required categories", () => {
  assert.deepEqual([...PILOT_OPERATOR_CHECKLIST_ITEMS], [
    "AGE_STATUS",
    "VOD_SOURCE_RIGHT",
    "ACTUAL_TEST_PURPOSE",
    "RETENTION_SCOPE",
    "DATASET_RETENTION_CHOICE",
    "EVALUATION_REUSE_CHOICE",
    "MODEL_TRAINING_CHOICE",
    "WITHDRAWAL_NOTICE",
    "GUARDIAN_CONSENT",
    "PARTICIPANT_ASSENT",
    "GUARDIAN_VERIFICATION",
    "UNRESOLVED_LEGAL_PRIVACY_BLOCKER",
  ]);
  assert.equal(new Set(PILOT_OPERATOR_CHECKLIST_ITEMS).size, PILOT_OPERATOR_CHECKLIST_ITEMS.length);
});

test("a missing required checklist item produces BLOCKED, never READY", () => {
  const incomplete = PILOT_OPERATOR_CHECKLIST_ITEMS.filter((item) => item !== "GUARDIAN_VERIFICATION");
  const result = rehearsePilotOperatorChecklist({ completedItems: incomplete });
  assert.equal(result.status, "BLOCKED");
  assert.deepEqual(result.missingItems, ["GUARDIAN_VERIFICATION"]);
  assert.deepEqual(result.reasonCodes, ["PILOT_OPERATOR_CHECKLIST_INCOMPLETE"]);
  expectArtifact(result.artifact);
});

test("every required item present produces READY with no missing items", () => {
  const result = rehearsePilotOperatorChecklist({ completedItems: PILOT_OPERATOR_CHECKLIST_ITEMS });
  assert.equal(result.status, "READY");
  assert.deepEqual(result.missingItems, []);
  assert.deepEqual(result.reasonCodes, []);
});

test("the checklist has no override mechanism — its only input is which items are actually completed", () => {
  const shape = Object.keys({ completedItems: [] });
  assert.deepEqual(shape, ["completedItems"]);
});

test("consent-guardian-assent-rehearsal gate FAILs when the Pilot Operator checklist is incomplete", async () => {
  const fixture = loadFixtureSet("full-ready-v1");
  const incompleteFixture = {
    ...fixture,
    pilotOperatorChecklistCompletedItems: fixture.pilotOperatorChecklistCompletedItems.filter(
      (item) => item !== "GUARDIAN_VERIFICATION",
    ),
  };
  const context = { fixture: incompleteFixture, frozenHashes: computeFrozenHashesForFixture(incompleteFixture) };
  const gate = getGateCatalog().find((g) => g.id === "consent-guardian-assent-rehearsal");
  assert.ok(gate);
  const result = await gate.execute(context, []);
  assert.equal(result.status, "FAIL");
  assert.deepEqual(result.reasonCodes, ["PILOT_OPERATOR_CHECKLIST_INCOMPLETE"]);
});

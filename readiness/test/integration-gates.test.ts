import assert from "node:assert/strict";
import test from "node:test";
import {
  InMemoryPolicyRightsGate,
  InMemoryRightsStore,
  TestClock,
  AuthorizationDeniedError,
  type ProtectedAction,
} from "../src/foundation-api.js";
import {
  REHEARSED_PROTECTED_ACTIONS,
  buildSyntheticPolicySnapshot,
  buildSyntheticActorVerifier,
  buildAuthorizationRequest,
  rehearseProtectedAction,
  rehearseExternalEgressDefaultBlock,
} from "../src/gates/integration-gates.js";
import { withdrawSyntheticSource, reportPostFreezeWithdrawalLimitation } from "../src/rehearsal/withdrawal.js";
import {
  rehearseRawAudioRetention,
  rehearseUnusedReserveDeletion,
  rehearseFullVodDeletionAfterGold,
} from "../src/rehearsal/retention.js";
import { createTestLocalTranscriptionAdapter } from "../src/ports/local-transcription-port.js";

const ACTOR_ID = "synthetic-actor-1";
const DESTINATION = "synthetic-provider-endpoint";

function buildHarness() {
  const clock = new TestClock(new Date("2026-01-01T00:00:00.000Z"));
  const rightsStore = new InMemoryRightsStore();
  rightsStore.set(ACTOR_ID, { eligibility: "EXECUTABLE", revision: 1 });
  const gate = new InMemoryPolicyRightsGate(
    buildSyntheticActorVerifier(ACTOR_ID),
    rightsStore,
    buildSyntheticPolicySnapshot(DESTINATION),
    clock,
  );
  return { clock, rightsStore, gate };
}

for (const action of REHEARSED_PROTECTED_ACTIONS as ProtectedAction[]) {
  test(`${action}: authorize then revalidate immediately before the simulated action`, async () => {
    const { gate } = buildHarness();
    const request = buildAuthorizationRequest(ACTOR_ID, action, DESTINATION);
    const outcome = await rehearseProtectedAction(gate, request);
    assert.equal(outcome.status, "PASS");
  });

  test(`${action}: unauthorized actor is denied`, async () => {
    const { rightsStore } = buildHarness();
    const clock = new TestClock(new Date("2026-01-01T00:00:00.000Z"));
    const gate = new InMemoryPolicyRightsGate(
      buildSyntheticActorVerifier("someone-else"),
      rightsStore,
      buildSyntheticPolicySnapshot(DESTINATION),
      clock,
    );
    const request = buildAuthorizationRequest(ACTOR_ID, action, DESTINATION);
    await assert.rejects(() => gate.authorize(request), AuthorizationDeniedError);
  });

  test(`${action}: changed execution binding at revalidate is denied`, async () => {
    const { gate } = buildHarness();
    const request = buildAuthorizationRequest(ACTOR_ID, action, DESTINATION);
    const permit = await gate.authorize(request);
    const changedRequest = { ...request, payloadHash: "different-payload-hash" };
    await assert.rejects(() => gate.revalidate(permit.permitId, changedRequest), AuthorizationDeniedError);
  });

  test(`${action}: withdrawn rights deny revalidation`, async () => {
    const { gate, rightsStore, clock } = buildHarness();
    const request = buildAuthorizationRequest(ACTOR_ID, action, DESTINATION);
    const permit = await gate.authorize(request);
    withdrawSyntheticSource({ rightsStore, gate, actorId: ACTOR_ID, permitId: permit.permitId, clock });
    await assert.rejects(() => gate.revalidate(permit.permitId, request), AuthorizationDeniedError);
  });

  test(`${action}: expired permit is denied`, async () => {
    const { gate, clock } = buildHarness();
    const request = buildAuthorizationRequest(ACTOR_ID, action, DESTINATION);
    const permit = await gate.authorize(request);
    clock.advance(3_600_000 + 1);
    await assert.rejects(() => gate.revalidate(permit.permitId, request), AuthorizationDeniedError);
  });
}

test("EXTERNAL_EGRESS: unsatisfied destination is denied at authorize time", async () => {
  const { gate } = buildHarness();
  const request = buildAuthorizationRequest(ACTOR_ID, "EXTERNAL_EGRESS", undefined);
  await assert.rejects(() => gate.authorize(request), AuthorizationDeniedError);
});

test("external egress defaults BLOCKED and is never an automatic fallback", async () => {
  const { gate } = buildHarness();
  const outcome = await rehearseExternalEgressDefaultBlock(gate, ACTOR_ID);
  assert.equal(outcome.status, "PASS");
  assert.deepEqual(outcome.reasonCodes, ["EXTERNAL_EGRESS_BLOCKED"]);
});

test("withdrawal preserves only a tombstone and invalidates future-use eligibility", async () => {
  const { gate, rightsStore, clock } = buildHarness();
  const request = buildAuthorizationRequest(ACTOR_ID, "EVIDENCE_INGESTION", DESTINATION);
  const permit = await gate.authorize(request);
  const tombstone = withdrawSyntheticSource({
    rightsStore,
    gate,
    actorId: ACTOR_ID,
    permitId: permit.permitId,
    clock,
  });
  assert.deepEqual(Object.keys(tombstone).sort(), [
    "deletionCompletedAt",
    "receiptId",
    "referenceId",
    "state",
    "withdrawalAt",
  ]);
  assert.equal(tombstone.state, "WITHDRAWN");
});

test("post-freeze withdrawal adjusts/reports denominator without selecting a replacement", () => {
  const result = reportPostFreezeWithdrawalLimitation("C1", 10);
  assert.equal(result.adjustedDenominator, 9);
  assert.deepEqual(result.reasonCodes, ["POST_FREEZE_WITHDRAWAL_LIMITATION"]);
});

test("retention rehearsals produce sanitized rehearsal-only receipts", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  const audio = rehearseRawAudioRetention("audio-fixture-1", now);
  assert.equal(audio.receipt.rehearsal, true);
  assert.equal(audio.graceHoursElapsed, 0);

  const reserve = rehearseUnusedReserveDeletion("R-CLEAR-FIGHT_SELECTION-1", now);
  assert.equal(reserve.rehearsal, true);

  const vod = rehearseFullVodDeletionAfterGold("synthetic-vod-1", now);
  assert.equal(vod.rehearsal, true);
});

test("local transcription port: test-only adapter proves the contract without production STT", async () => {
  const adapter = createTestLocalTranscriptionAdapter();
  assert.equal(await adapter.isAvailable(), true);
  const result = await adapter.transcribe({
    fixtureId: "audio-fixture-1",
    pcm16le: new Uint8Array([0, 0, 0, 0]),
    sampleRateHz: 16000,
  });
  assert.equal(typeof result.text, "string");
});

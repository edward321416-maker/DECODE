import { test } from "node:test";
import assert from "node:assert/strict";
import { TestClock } from "../src/shared/clock.js";
import {
  AuthorizationDeniedError,
  type ActorVerifier,
  type AuthorizationRequest,
  type PolicySnapshot,
} from "../src/policy/contracts.js";
import {
  InMemoryPolicyRightsGate,
  InMemoryRightsStore,
  normalizeSourceRefs,
  permitMatchesRequest,
} from "../src/policy/in-memory-policy-rights-gate.js";

function policySnapshot(overrides: Partial<PolicySnapshot> = {}): PolicySnapshot {
  return {
    id: "policy-1",
    hash: "hash-1",
    rules: [
      {
        action: "EVIDENCE_INGESTION",
        allowedPurposes: ["COACHING"],
        allowedDataClasses: ["VOD"],
      },
      {
        action: "EXTERNAL_EGRESS",
        allowedPurposes: ["COACHING"],
        allowedDataClasses: ["VOD"],
        allowedDestinations: ["partner-cdn"],
      },
    ],
    ...overrides,
  };
}

function allowAllVerifier(allowed = true): ActorVerifier {
  return { verify: () => allowed };
}

function baseRequest(overrides: Partial<AuthorizationRequest> = {}): AuthorizationRequest {
  return {
    actorId: "actor-1",
    action: "EVIDENCE_INGESTION",
    purpose: "COACHING",
    sourceRefs: ["ref-b", "ref-a", "ref-a"],
    payloadHash: "hash-1",
    dataClass: "VOD",
    ...overrides,
  };
}

function makeGate(overrides: { verifier?: ActorVerifier; snapshot?: PolicySnapshot; clock?: TestClock } = {}) {
  const clock = overrides.clock ?? new TestClock(new Date("2026-01-01T00:00:00Z"));
  const rightsStore = new InMemoryRightsStore();
  const gate = new InMemoryPolicyRightsGate(
    overrides.verifier ?? allowAllVerifier(true),
    rightsStore,
    overrides.snapshot ?? policySnapshot(),
    clock,
    3_600_000,
  );
  return { gate, rightsStore, clock };
}

// Invariant 30: equivalent reordered/duplicate source input normalizes.
test("invariant 30: source refs are deduplicated and sorted", () => {
  assert.deepEqual(normalizeSourceRefs(["b", "a", "a", "c"]), ["a", "b", "c"]);
});

// Invariant 17: authorized actor required.
test("invariant 17: authorized actor can obtain a permit when all other gates allow", async () => {
  const { gate } = makeGate();
  const permit = await gate.authorize(baseRequest());
  assert.equal(permit.actorId, "actor-1");
  assert.deepEqual(permit.sourceRefs, ["ref-a", "ref-b"]);
});

// Invariant 18: unauthorized actor cannot obtain a permit.
test("invariant 18: unauthorized actor cannot obtain a permit", async () => {
  const { gate } = makeGate({ verifier: allowAllVerifier(false) });
  await assert.rejects(() => gate.authorize(baseRequest()), AuthorizationDeniedError);
});

// Invariant 20: policy must explicitly allow action.
test("invariant 21: unapproved action denied", async () => {
  const { gate } = makeGate();
  await assert.rejects(() => gate.authorize(baseRequest({ action: "PLAYER_OUTPUT" })), AuthorizationDeniedError);
});

// Invariant 22: unapproved purpose denied.
test("invariant 22: unapproved purpose denied", async () => {
  const { gate } = makeGate();
  await assert.rejects(() => gate.authorize(baseRequest({ purpose: "MARKETING" })), AuthorizationDeniedError);
});

// Invariant 23: unapproved data class denied.
test("invariant 23: unapproved data class denied", async () => {
  const { gate } = makeGate();
  await assert.rejects(() => gate.authorize(baseRequest({ dataClass: "AUDIO" })), AuthorizationDeniedError);
});

// Invariant 24/25: unapproved egress destination denied; egress requires a destination.
test("invariant 25: external egress requires a destination", async () => {
  const { gate } = makeGate();
  await assert.rejects(
    () => gate.authorize(baseRequest({ action: "EXTERNAL_EGRESS" })),
    AuthorizationDeniedError,
  );
});

test("invariant 24: unapproved egress destination denied", async () => {
  const { gate } = makeGate();
  await assert.rejects(
    () => gate.authorize(baseRequest({ action: "EXTERNAL_EGRESS", destination: "unknown-cdn" })),
    AuthorizationDeniedError,
  );
});

test("egress with an approved destination succeeds", async () => {
  const { gate } = makeGate();
  const permit = await gate.authorize(
    baseRequest({ action: "EXTERNAL_EGRESS", destination: "partner-cdn" }),
  );
  assert.equal(permit.destination, "partner-cdn");
});

// Invariants 26-29, 32-34: permit binds actor/action/purpose/payload/dataClass/destination.
test("invariants 26-34: permit binds request fields, and changes are detected by permitMatchesRequest", async () => {
  const { gate } = makeGate();
  const request = baseRequest();
  const permit = await gate.authorize(request);
  assert.equal(permitMatchesRequest(permit, request), true);
  assert.equal(permitMatchesRequest(permit, { ...request, actorId: "actor-2" }), false);
  assert.equal(permitMatchesRequest(permit, { ...request, purpose: "MARKETING" }), false);
  assert.equal(permitMatchesRequest(permit, { ...request, payloadHash: "hash-2" }), false);
  assert.equal(permitMatchesRequest(permit, { ...request, dataClass: "AUDIO" }), false);
});

// Invariant 31: changed source scope rejected.
test("invariant 31: changed source scope is rejected by permitMatchesRequest", async () => {
  const { gate } = makeGate();
  const request = baseRequest();
  const permit = await gate.authorize(request);
  assert.equal(permitMatchesRequest(permit, { ...request, sourceRefs: ["ref-a"] }), false);
});

// Invariant 19: actor revoked after permit issuance fails execution revalidation.
test("invariant 19: actor revocation invalidates issued permit at execution", async () => {
  let allowed = true;
  const verifier: ActorVerifier = { verify: () => allowed };
  const { gate } = makeGate({ verifier });
  const permit = await gate.authorize(baseRequest());
  await assert.doesNotReject(() => gate.revalidate(permit.permitId));
  allowed = false;
  await assert.rejects(() => gate.revalidate(permit.permitId), AuthorizationDeniedError);
});

// Invariant 35: withdrawal invalidates permit.
test("invariant 35: withdrawal invalidates permit", async () => {
  const { gate } = makeGate();
  const permit = await gate.authorize(baseRequest());
  gate.withdraw(permit.permitId);
  await assert.rejects(() => gate.revalidate(permit.permitId), AuthorizationDeniedError);
});

// Invariant 36: rights revision after re-enable invalidates old permit.
test("invariant 36: rights revision after re-enable invalidates old permit", async () => {
  const { gate, rightsStore } = makeGate();
  const permit = await gate.authorize(baseRequest());
  rightsStore.set("actor-1", { eligibility: "WITHDRAWN", revision: 1 });
  rightsStore.set("actor-1", { eligibility: "EXECUTABLE", revision: 2 });
  await assert.rejects(() => gate.revalidate(permit.permitId), AuthorizationDeniedError);
});

// Invariant 37: policy snapshot change invalidates permit.
test("invariant 37: policy snapshot change invalidates permit", async () => {
  const { gate } = makeGate();
  const permit = await gate.authorize(baseRequest());
  gate.setPolicySnapshot(policySnapshot({ id: "policy-2", hash: "hash-2" }));
  await assert.rejects(() => gate.revalidate(permit.permitId), AuthorizationDeniedError);
});

// Invariant 38: same policy ID with changed rule content invalidates permit.
test("invariant 38: same policy id with changed rule content invalidates permit", async () => {
  const { gate } = makeGate();
  const permit = await gate.authorize(baseRequest());
  gate.setPolicySnapshot(policySnapshot({ id: "policy-1", hash: "hash-changed" }));
  await assert.rejects(() => gate.revalidate(permit.permitId), AuthorizationDeniedError);
});

// Invariant 39: expiry invalidates permit.
test("invariant 39: expiry invalidates permit", async () => {
  const clock = new TestClock(new Date("2026-01-01T00:00:00Z"));
  const { gate } = makeGate({ clock });
  const permit = await gate.authorize(baseRequest());
  clock.advance(3_600_001);
  await assert.rejects(() => gate.revalidate(permit.permitId), AuthorizationDeniedError);
});

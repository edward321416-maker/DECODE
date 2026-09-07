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

// Finding 5 (fail-closed rights): every test that expects a *successful* authorization must
// explicitly establish EXECUTABLE rights first — a missing rights record is not EXECUTABLE.
function grantExecutableRights(rightsStore: InMemoryRightsStore, actorId = "actor-1"): void {
  rightsStore.set(actorId, { eligibility: "EXECUTABLE", revision: 0 });
}

// Invariant 30: equivalent reordered/duplicate source input normalizes.
test("invariant 30: source refs are deduplicated and sorted", () => {
  assert.deepEqual(normalizeSourceRefs(["b", "a", "a", "c"]), ["a", "b", "c"]);
});

// Invariant 17: authorized actor required.
test("invariant 17: authorized actor can obtain a permit when all other gates allow", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  const permit = await gate.authorize(baseRequest());
  assert.equal(permit.actorId, "actor-1");
  assert.deepEqual(permit.sourceRefs, ["ref-a", "ref-b"]);
});

// Invariant 18: unauthorized actor cannot obtain a permit.
test("invariant 18: unauthorized actor cannot obtain a permit", async () => {
  const { gate, rightsStore } = makeGate({ verifier: allowAllVerifier(false) });
  grantExecutableRights(rightsStore);
  await assert.rejects(() => gate.authorize(baseRequest()), AuthorizationDeniedError);
});

// Invariant 20: policy must explicitly allow action.
test("invariant 21: unapproved action denied", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  await assert.rejects(() => gate.authorize(baseRequest({ action: "PLAYER_OUTPUT" })), AuthorizationDeniedError);
});

// Invariant 22: unapproved purpose denied.
test("invariant 22: unapproved purpose denied", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  await assert.rejects(() => gate.authorize(baseRequest({ purpose: "MARKETING" })), AuthorizationDeniedError);
});

// Invariant 23: unapproved data class denied.
test("invariant 23: unapproved data class denied", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  await assert.rejects(() => gate.authorize(baseRequest({ dataClass: "AUDIO" })), AuthorizationDeniedError);
});

// Invariant 24/25: unapproved egress destination denied; egress requires a destination.
test("invariant 25: external egress requires a destination", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  await assert.rejects(
    () => gate.authorize(baseRequest({ action: "EXTERNAL_EGRESS" })),
    AuthorizationDeniedError,
  );
});

test("invariant 24: unapproved egress destination denied", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  await assert.rejects(
    () => gate.authorize(baseRequest({ action: "EXTERNAL_EGRESS", destination: "unknown-cdn" })),
    AuthorizationDeniedError,
  );
});

test("egress with an approved destination succeeds", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  const permit = await gate.authorize(
    baseRequest({ action: "EXTERNAL_EGRESS", destination: "partner-cdn" }),
  );
  assert.equal(permit.destination, "partner-cdn");
});

// Invariants 26-29, 32-34: permit binds actor/action/purpose/payload/dataClass/destination.
test("invariants 26-34: permit binds request fields, and changes are detected by permitMatchesRequest", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
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
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  const request = baseRequest();
  const permit = await gate.authorize(request);
  assert.equal(permitMatchesRequest(permit, { ...request, sourceRefs: ["ref-a"] }), false);
});

// Invariant 19: actor revoked after permit issuance fails execution revalidation.
test("invariant 19: actor revocation invalidates issued permit at execution", async () => {
  let allowed = true;
  const verifier: ActorVerifier = { verify: () => allowed };
  const { gate, rightsStore } = makeGate({ verifier });
  grantExecutableRights(rightsStore);
  const request = baseRequest();
  const permit = await gate.authorize(request);
  await assert.doesNotReject(() => gate.revalidate(permit.permitId, request));
  allowed = false;
  await assert.rejects(() => gate.revalidate(permit.permitId, request), AuthorizationDeniedError);
});

// Invariant 35: withdrawal invalidates permit.
test("invariant 35: withdrawal invalidates permit", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  const request = baseRequest();
  const permit = await gate.authorize(request);
  gate.withdraw(permit.permitId);
  await assert.rejects(() => gate.revalidate(permit.permitId, request), AuthorizationDeniedError);
});

// Invariant 36: rights revision after re-enable invalidates old permit.
test("invariant 36: rights revision after re-enable invalidates old permit", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  const request = baseRequest();
  const permit = await gate.authorize(request);
  rightsStore.set("actor-1", { eligibility: "WITHDRAWN", revision: 1 });
  rightsStore.set("actor-1", { eligibility: "EXECUTABLE", revision: 2 });
  await assert.rejects(() => gate.revalidate(permit.permitId, request), AuthorizationDeniedError);
});

// Invariant 37: policy snapshot change invalidates permit.
test("invariant 37: policy snapshot change invalidates permit", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  const request = baseRequest();
  const permit = await gate.authorize(request);
  gate.setPolicySnapshot(policySnapshot({ id: "policy-2", hash: "hash-2" }));
  await assert.rejects(() => gate.revalidate(permit.permitId, request), AuthorizationDeniedError);
});

// Invariant 38: same policy ID with changed rule content invalidates permit — genuine content
// drift, not merely a changed caller-supplied hash label. id AND supplied hash stay identical;
// only the rule content (an additional allowed data class) changes.
test("invariant 38: same policy id and same supplied hash, but drifted rule content, invalidates permit", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  const request = baseRequest();
  const permit = await gate.authorize(request);
  const drifted = policySnapshot({ id: "policy-1", hash: "hash-1" });
  drifted.rules[0]!.allowedDataClasses.push("AUDIO");
  gate.setPolicySnapshot(drifted);
  await assert.rejects(() => gate.revalidate(permit.permitId, request), AuthorizationDeniedError);
});

test("invariant 38: identical policy content under the same id/hash does not invalidate the permit", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  const request = baseRequest();
  const permit = await gate.authorize(request);
  // A fresh but content-identical snapshot object (defensive re-application) must not trip drift.
  gate.setPolicySnapshot(policySnapshot({ id: "policy-1", hash: "hash-1" }));
  await assert.doesNotReject(() => gate.revalidate(permit.permitId, request));
});

// Invariant 39 / finding 10: expiry invalidates permit, including exactly at the expiry instant.
test("invariant 39: expiry invalidates permit", async () => {
  const clock = new TestClock(new Date("2026-01-01T00:00:00Z"));
  const { gate, rightsStore } = makeGate({ clock });
  grantExecutableRights(rightsStore);
  const request = baseRequest();
  const permit = await gate.authorize(request);
  clock.advance(3_600_001);
  await assert.rejects(() => gate.revalidate(permit.permitId, request), AuthorizationDeniedError);
});

test("finding 10: a permit is no longer executable at exactly its expiry instant", async () => {
  const clock = new TestClock(new Date("2026-01-01T00:00:00Z"));
  const { gate, rightsStore } = makeGate({ clock });
  grantExecutableRights(rightsStore);
  const request = baseRequest();
  const permit = await gate.authorize(request);
  assert.equal(clock.now().getTime() + 3_600_000, permit.expiresAt.getTime());
  clock.advance(3_600_000);
  assert.equal(clock.now().getTime(), permit.expiresAt.getTime());
  await assert.rejects(() => gate.revalidate(permit.permitId, request), AuthorizationDeniedError);
});

// Finding 1: execution-time binding must be enforced by the Foundation revalidation path itself.
// Calling revalidate(permitId, request) with any bound field changed from the issued permit must
// be rejected — a caller must not be able to succeed merely by calling revalidate(permitId) and
// omitting the permitMatchesRequest check.
test("finding 1: revalidate rejects execution requests whose bound fields changed from the issued permit", async () => {
  const { gate, rightsStore } = makeGate();
  grantExecutableRights(rightsStore);
  const request = baseRequest();
  const permit = await gate.authorize(request);

  await assert.doesNotReject(() => gate.revalidate(permit.permitId, request));

  const mutations: Array<Partial<AuthorizationRequest>> = [
    { actorId: "actor-2" },
    { action: "EVALUATION_USE" },
    { purpose: "MARKETING" },
    { payloadHash: "hash-2" },
    { dataClass: "AUDIO" },
    { sourceRefs: ["ref-a"] },
    { destination: "unknown-cdn" },
  ];
  for (const mutation of mutations) {
    await assert.rejects(
      () => gate.revalidate(permit.permitId, { ...request, ...mutation }),
      AuthorizationDeniedError,
      `execution request mutation ${JSON.stringify(mutation)} must be rejected`,
    );
  }
});

// Finding 2: Permit state must be tamper-resistant. Mutating the object returned from
// authorization (including its nested array and Date fields) must not mutate the stored
// authoritative permit or let a caller bypass later checks (e.g. self-extend expiry).
test("finding 2: mutating the returned permit does not affect the stored authoritative permit", async () => {
  const clock = new TestClock(new Date("2026-01-01T00:00:00Z"));
  const { gate, rightsStore } = makeGate({ clock });
  grantExecutableRights(rightsStore);
  const request = baseRequest();
  const permit = await gate.authorize(request);

  const mutable = permit as unknown as Record<string, unknown>;
  mutable.actorId = "actor-2";
  mutable.action = "EVALUATION_USE";
  mutable.purpose = "MARKETING";
  mutable.payloadHash = "tampered-hash";
  mutable.dataClass = "AUDIO";
  mutable.destination = "unknown-cdn";
  mutable.rightsRevisionAtIssuance = 999;
  mutable.policySnapshotId = "tampered-policy";
  mutable.policySnapshotHash = "tampered-hash";
  (permit.sourceRefs as string[]).push("injected-ref");
  permit.issuedAt.setFullYear(1999);
  permit.expiresAt.setFullYear(2999); // attempt to self-extend expiry far into the future

  // The stored authoritative permit must still validate the ORIGINAL request untouched.
  await assert.doesNotReject(() => gate.revalidate(permit.permitId, request));

  // And must not have silently adopted the tampered expiry: advancing past the ORIGINAL
  // (untampered) expiry must still invalidate it.
  clock.advance(3_600_001);
  await assert.rejects(() => gate.revalidate(permit.permitId, request), AuthorizationDeniedError);
});

// Finding 5: a missing rights record must fail closed, not default to EXECUTABLE.
test("finding 5: an actor with no rights record cannot obtain a permit", async () => {
  const { gate } = makeGate(); // no grantExecutableRights call — no rights record exists
  await assert.rejects(() => gate.authorize(baseRequest()), AuthorizationDeniedError);
});

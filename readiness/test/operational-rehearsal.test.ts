import assert from "node:assert/strict";
import test from "node:test";
import { rehearseConsent, resolvePausedConsent } from "../src/rehearsal/consent.js";
import { rehearseSourceRights, enumerateAllowedPool } from "../src/rehearsal/source-rights.js";
import { qualifySecondExpertCandidate } from "../src/rehearsal/second-expert-qualification.js";
import { loadFixtureSet } from "../src/fixtures/registry.js";

const fixture = loadFixtureSet("full-ready-v1");

test("adult PARTICIPATE is accepted when the synthetic checklist passes", () => {
  const result = rehearseConsent({ actorId: "a1", kind: "ADULT", expression: "PARTICIPATE" });
  assert.equal(result.decision, "ACCEPTED");
});

test("participant DO_NOT_PARTICIPATE always rejects, even if guardian says consent", () => {
  const result = rehearseConsent({
    actorId: "m1",
    kind: "MINOR",
    expression: "DO_NOT_PARTICIPATE",
    guardianConsent: true,
    guardianVerified: true,
  });
  assert.equal(result.decision, "REJECTED");
  assert.deepEqual(result.reasonCodes, ["PARTICIPANT_REFUSED"]);
});

test("minor requires participant assent + guardian consent + guardian verification", () => {
  const missingVerification = rehearseConsent({
    actorId: "m2",
    kind: "MINOR",
    expression: "PARTICIPATE",
    guardianConsent: true,
    guardianVerified: false,
  });
  assert.equal(missingVerification.decision, "REJECTED");

  const complete = rehearseConsent({
    actorId: "m3",
    kind: "MINOR",
    expression: "PARTICIPATE",
    guardianConsent: true,
    guardianVerified: true,
  });
  assert.equal(complete.decision, "ACCEPTED");
});

test("ambiguous expression transitions to PAUSED and cannot process affected next step until explicit CONTINUE/WITHDRAW", () => {
  const paused = rehearseConsent({ actorId: "amb1", kind: "ADULT", expression: "AMBIGUOUS" });
  assert.equal(paused.decision, "PAUSED");

  const continued = resolvePausedConsent("CONTINUE");
  assert.equal(continued.decision, "ACCEPTED");

  const withdrawn = resolvePausedConsent("WITHDRAW");
  assert.equal(withdrawn.decision, "REJECTED");
  assert.deepEqual(withdrawn.reasonCodes, ["WITHDRAWN"]);
});

test("only FOUNDER_OWNED, FOUNDER_AUTHORIZED, and CONSENTED_PILOT sources are accepted", () => {
  const founderOwned = rehearseSourceRights({ sourceId: "s1", kind: "FOUNDER_OWNED" });
  assert.equal(founderOwned.accepted, true);

  const publicScrape = rehearseSourceRights({ sourceId: "s2", kind: "PUBLIC_SCRAPE" });
  assert.equal(publicScrape.accepted, false);
  assert.deepEqual(publicScrape.reasonCodes, ["FORBIDDEN_SOURCE"]);

  const unconsentedPilot = rehearseSourceRights({ sourceId: "s3", kind: "UNCONSENTED_PILOT" });
  assert.equal(unconsentedPilot.accepted, false);
});

test("no rule forces a Founder/Pilot ratio in pool enumeration", () => {
  const allPilot = [
    { sourceId: "p1", kind: "CONSENTED_PILOT" as const },
    { sourceId: "p2", kind: "CONSENTED_PILOT" as const },
  ];
  const pool = enumerateAllowedPool(allPilot);
  assert.equal(pool.length, 2);
});

test("qualification returns exactly ELIGIBLE | NOT_ELIGIBLE | INSUFFICIENT_EVIDENCE", () => {
  const eligible = fixture.qualificationCandidates.find((c) => c.candidateId === "expert-eligible-1");
  assert.ok(eligible);
  assert.equal(qualifySecondExpertCandidate(eligible).verdict, "ELIGIBLE");

  const insufficient = fixture.qualificationCandidates.find((c) => c.candidateId === "expert-insufficient-1");
  assert.ok(insufficient);
  assert.equal(qualifySecondExpertCandidate(insufficient).verdict, "INSUFFICIENT_EVIDENCE");

  const disqualified = fixture.qualificationCandidates.find((c) => c.candidateId === "expert-disqualified-1");
  assert.ok(disqualified);
  assert.equal(qualifySecondExpertCandidate(disqualified).verdict, "NOT_ELIGIBLE");
});

test("Founder recommendation alone cannot produce ELIGIBLE", () => {
  const founderOnly = fixture.qualificationCandidates.find((c) => c.candidateId === "expert-founder-only-1");
  assert.ok(founderOnly);
  const result = qualifySecondExpertCandidate(founderOnly);
  assert.notEqual(result.verdict, "ELIGIBLE");
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  RELATIONSHIP_PROVENANCE_VALUES,
  assertValidRelationshipProvenance,
  FixtureValidationError,
} from "../src/fixtures/contracts.js";
import { loadFixtureSet } from "../src/fixtures/registry.js";

test("relationship provenance is exactly the Protocol §8 canonical six-value enum", () => {
  assert.deepEqual([...RELATIONSHIP_PROVENANCE_VALUES], [
    "NONE",
    "FORMER_TEAMMATE",
    "CURRENT_TEAMMATE",
    "FORMER_COACHING_RELATION",
    "CURRENT_COACHING_RELATION",
    "OTHER",
  ]);
  assert.equal(new Set(RELATIONSHIP_PROVENANCE_VALUES).size, RELATIONSHIP_PROVENANCE_VALUES.length);
});

test("assertValidRelationshipProvenance accepts only the canonical six values", () => {
  for (const value of RELATIONSHIP_PROVENANCE_VALUES) {
    assert.doesNotThrow(() => assertValidRelationshipProvenance(value));
  }
  assert.throws(() => assertValidRelationshipProvenance("INDEPENDENT_ANALYST"), FixtureValidationError);
  assert.throws(() => assertValidRelationshipProvenance("TRAINING_PARTNER"), FixtureValidationError);
});

test("every fixture's qualification candidates use only canonical relationship provenance values", () => {
  for (const fixtureId of ["full-ready-v1", "no-local-transcription-v1", "replacement-unavailable-v1"] as const) {
    const fixture = loadFixtureSet(fixtureId);
    for (const candidate of fixture.qualificationCandidates) {
      assert.doesNotThrow(
        () => assertValidRelationshipProvenance(candidate.relationshipProvenance),
        `${fixtureId}/${candidate.candidateId}: ${candidate.relationshipProvenance}`,
      );
    }
  }
});

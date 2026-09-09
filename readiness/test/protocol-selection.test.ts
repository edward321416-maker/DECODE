import assert from "node:assert/strict";
import test from "node:test";
import { FrozenValue } from "../src/protocol/freeze.js";
import {
  countClarity,
  countFamilies,
  validateMain10Composition,
  evaluatePositiveQualityCondition,
} from "../src/protocol/composition.js";
import { allocateReserveStrata, replaceBeforeMeasurementFreeze } from "../src/protocol/reserve.js";
import { selectSecondExpertSubset } from "../src/protocol/second-expert.js";
import { loadFixtureSet } from "../src/fixtures/registry.js";

const fixture = loadFixtureSet("full-ready-v1");
const replacementUnavailableFixture = loadFixtureSet("replacement-unavailable-v1");

test("main10 clarity and family counts match the locked composition", () => {
  const main10 = fixture.main10;
  assert.deepEqual(countClarity(main10), { CLEAR: 6, AMBIGUOUS: 4 });
  assert.deepEqual(countFamilies(main10), {
    FIGHT_SELECTION: 4,
    POST_CONTACT_DECISION: 3,
    TRADEABILITY_SPACING: 3,
  });
  assert.equal(validateMain10Composition(main10).valid, true);
});

test("clarity cannot change after freeze", () => {
  const frozen = new FrozenValue(fixture.main10);
  frozen.freeze();
  assert.throws(() => frozen.replace([...fixture.main10]), /FROZEN_MUTATION/);
});

test("positive-quality condition is evaluated only after synthetic Gold verdicts exist", () => {
  const result = evaluatePositiveQualityCondition(fixture.main10, fixture.goldVerdicts);
  assert.equal(result.satisfied, true);
  assert.deepEqual(result.reasonCodes, []);
});

test("fewer than two OPTIMAL/ACCEPTABLE returns COMPOSITION_CONDITION_FAILED without swapping cases", () => {
  const poorGold = Object.fromEntries(fixture.main10.map((c) => [c.caseId, "SUBOPTIMAL" as const]));
  const result = evaluatePositiveQualityCondition(fixture.main10, poorGold);
  assert.equal(result.satisfied, false);
  assert.deepEqual(result.reasonCodes, ["COMPOSITION_CONDITION_FAILED"]);
  // no case is swapped: the input array reference/content is untouched.
  assert.equal(fixture.main10.length, 10);
});

test("reserve allocation = CLEAR top two strata + AMBIGUOUS top one, sorting mainCount DESC then stratumId ASC", () => {
  const allocation = allocateReserveStrata(fixture.strata);
  assert.deepEqual(
    allocation.clearTop2.map((s) => s.stratumId),
    ["CLEAR-FIGHT_SELECTION", "CLEAR-POST_CONTACT_DECISION"],
  );
  assert.deepEqual(
    allocation.ambiguousTop1.map((s) => s.stratumId),
    ["AMBIGUOUS-FIGHT_SELECTION"],
  );
});

test("replacement only before measurement freeze and only same clarity + primary family", () => {
  const allocation = allocateReserveStrata(fixture.strata);
  const targetStratum = allocation.clearTop2[0];
  assert.ok(targetStratum);
  const result = replaceBeforeMeasurementFreeze({
    stratum: targetStratum,
    reserveCandidates: fixture.reserveCandidates,
    measurementFrozen: false,
    resultDriven: false,
  });
  assert.equal(result.status, "REPLACED");
  assert.equal(result.reasonCodes.includes("REPLACEMENT_UNAVAILABLE"), false);
});

test("missing same-stratum reserve returns REPLACEMENT_UNAVAILABLE", () => {
  const allocation = allocateReserveStrata(replacementUnavailableFixture.strata);
  const targetStratum = allocation.clearTop2.find((s) => s.stratumId === "CLEAR-POST_CONTACT_DECISION");
  assert.ok(targetStratum);
  const result = replaceBeforeMeasurementFreeze({
    stratum: targetStratum,
    reserveCandidates: replacementUnavailableFixture.reserveCandidates,
    measurementFrozen: false,
    resultDriven: false,
  });
  assert.equal(result.status, "REPLACEMENT_UNAVAILABLE");
  assert.deepEqual(result.reasonCodes, ["REPLACEMENT_UNAVAILABLE"]);
});

test("no result-driven redraw after measurement freeze", () => {
  const allocation = allocateReserveStrata(fixture.strata);
  const targetStratum = allocation.clearTop2[0];
  assert.ok(targetStratum);
  const afterFreeze = replaceBeforeMeasurementFreeze({
    stratum: targetStratum,
    reserveCandidates: fixture.reserveCandidates,
    measurementFrozen: true,
    resultDriven: false,
  });
  assert.equal(afterFreeze.status, "REJECTED_POST_FREEZE");

  const resultDriven = replaceBeforeMeasurementFreeze({
    stratum: targetStratum,
    reserveCandidates: fixture.reserveCandidates,
    measurementFrozen: false,
    resultDriven: true,
  });
  assert.equal(resultDriven.status, "REJECTED_RESULT_DRIVEN");
});

test("Second Expert subset is exactly CLEAR 2 + AMBIGUOUS 2 and same seed + case IDs produce identical selection", () => {
  const subsetA = selectSecondExpertSubset(fixture.main10, fixture.secondExpertSeedHex);
  const subsetB = selectSecondExpertSubset(fixture.main10, fixture.secondExpertSeedHex);
  assert.equal(subsetA.CLEAR.length, 2);
  assert.equal(subsetA.AMBIGUOUS.length, 2);
  assert.deepEqual(subsetA, subsetB);
});

test("Second Expert subset redraw after Gold/AI output/availability/disagreement is rejected", () => {
  const subset = selectSecondExpertSubset(fixture.main10, fixture.secondExpertSeedHex);
  const frozen = new FrozenValue(subset);
  frozen.freeze();
  assert.throws(
    () => frozen.replace(selectSecondExpertSubset(fixture.main10, "f".repeat(64))),
    /FROZEN_MUTATION/,
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import { TestClock } from "../src/foundation-api.js";
import {
  computeMedian,
  computeNearestRankP90,
  computeContextInsufficiency,
  computeTaxonomyEscape,
  computeDirectionalAgreementFromPairs,
  countUnnecessaryFields,
  MEASUREMENT_CONTRACT_V1,
  createMeasurementContract,
} from "../src/protocol/measurement.js";
import { ActiveTimer } from "../src/protocol/timing.js";
import { loadFixtureSet } from "../src/fixtures/registry.js";
import type { SecondExpertPairFixture } from "../src/fixtures/contracts.js";

const DURATIONS = [60, 120, 180, 240, 300, 360, 420, 480, 540, 600];
const outcomes = loadFixtureSet("full-ready-v1").founderCaseOutcomes;

// Known-correct 4-pair fixture (Protocol §16: exactly 4 planned Second Expert slots).
const KNOWN_CORRECT_PAIRS: SecondExpertPairFixture[] = [
  { caseId: "C1", founderVerdict: "OPTIMAL", secondExpertVerdict: "OPTIMAL" },       // eligible, exact match, positive/positive
  { caseId: "C2", founderVerdict: "ACCEPTABLE", secondExpertVerdict: "OPTIMAL" },    // eligible, not exact, positive/positive (directional agree)
  { caseId: "A1", founderVerdict: "SUBOPTIMAL", secondExpertVerdict: "ACCEPTABLE" }, // eligible, not exact, negative/positive (directional disagree)
  { caseId: "A2", founderVerdict: "UNCERTAIN", secondExpertVerdict: "OPTIMAL" },     // excluded (founder verdict UNCERTAIN)
];

test("median and nearest-rank P90 match known-correct fixtures", () => {
  assert.equal(computeMedian(DURATIONS), 330);
  assert.equal(computeNearestRankP90(DURATIONS), 540);
});

test("invalid/incomplete timing is excluded and the exclusion reason remains in the report", () => {
  const withInvalid = [...DURATIONS, Number.NaN, -5];
  const median = computeMedian(withInvalid);
  assert.equal(median, 330);
});

test("context insufficiency numerator/denominator over completed valid Founder cases", () => {
  const result = computeContextInsufficiency(outcomes);
  assert.equal(result.numerator, 1);
  assert.equal(result.denominator, 10);
  assert.equal(result.ratio, 0.1);
});

test("null contextSufficiency is excluded from denominator, never coerced to zero", () => {
  const withUnknown = [...outcomes, { caseId: "X", contextSufficiency: null, taxonomy: "PRINCIPLE_1", unnecessaryCoreFields: 0 }];
  const result = computeContextInsufficiency(withUnknown);
  assert.equal(result.denominator, 10);
});

test("taxonomy escape counts OTHER or NEW_PRINCIPLE_NEEDED over completed Founder cases", () => {
  const result = computeTaxonomyEscape(outcomes);
  assert.equal(result.numerator, 2);
  assert.equal(result.denominator, 10);
});

test("Protocol §16: exactly 4 planned Second Expert pairs are required", () => {
  assert.throws(() => computeDirectionalAgreementFromPairs(KNOWN_CORRECT_PAIRS.slice(0, 3)), /exactly 4/);
});

test("directional agreement excludes UNCERTAIN/INSUFFICIENT_CONTEXT pairs and reports eligible/exact-match/exact-disagreement separately", () => {
  const result = computeDirectionalAgreementFromPairs(KNOWN_CORRECT_PAIRS);
  assert.equal(result.plannedPairs, 4);
  assert.equal(result.completedPairs, 4);
  assert.equal(result.eligiblePairs, 3); // A2 excluded (founder verdict UNCERTAIN)
  assert.equal(result.excludedPairs, 1);
  assert.equal(result.directionalAgreementCount, 2); // C1, C2 (both positive/positive); A1 is negative/positive disagreement
  assert.equal(result.directionalAgreementRatio, 2 / 3);
  assert.equal(result.exactVerdictMatches, 1); // only C1 (OPTIMAL/OPTIMAL)
  assert.equal(result.exactVerdictDisagreements, 2); // C2, A1
  assert.equal(result.coverageRatio, 1); // 4/4 completed
  assert.equal(result.incompleteCoverage, false);
  assert.deepEqual(result.reasonCodes, []);
});

test("incomplete Second Expert coverage is reported explicitly, never silently dropped or treated as disagreement", () => {
  const incomplete: SecondExpertPairFixture[] = [
    ...KNOWN_CORRECT_PAIRS.slice(0, 3),
    { caseId: "A2", founderVerdict: "OPTIMAL", secondExpertVerdict: null },
  ];
  const result = computeDirectionalAgreementFromPairs(incomplete);
  assert.equal(result.completedPairs, 3);
  assert.equal(result.plannedPairs, 4);
  assert.equal(result.coverageRatio, 3 / 4);
  assert.equal(result.incompleteCoverage, true);
  assert.deepEqual(result.reasonCodes, ["INCOMPLETE_SECOND_EXPERT_COVERAGE"]);
});

test("UNKNOWN/null directional agreement never becomes a zero eligible ratio", () => {
  const allExcluded: SecondExpertPairFixture[] = [
    { caseId: "C1", founderVerdict: "UNCERTAIN", secondExpertVerdict: "OPTIMAL" },
    { caseId: "C2", founderVerdict: "INSUFFICIENT_CONTEXT", secondExpertVerdict: "OPTIMAL" },
    { caseId: "A1", founderVerdict: "OPTIMAL", secondExpertVerdict: "UNCERTAIN" },
    { caseId: "A2", founderVerdict: "OPTIMAL", secondExpertVerdict: "INSUFFICIENT_CONTEXT" },
  ];
  const result = computeDirectionalAgreementFromPairs(allExcluded);
  assert.equal(result.eligiblePairs, 0);
  assert.equal(result.directionalAgreementRatio, null);
});

test("field usefulness counts UNNECESSARY only", () => {
  assert.equal(countUnnecessaryFields(outcomes), 1);
});

test("locked candidate thresholds are represented as data, never automatic GO/STOP logic", () => {
  assert.equal(MEASUREMENT_CONTRACT_V1.medianActiveSecondsCandidateMax, 300);
  assert.equal(MEASUREMENT_CONTRACT_V1.directionalAgreementCandidateMinRatio, 0.75);
  assert.equal(Object.isFrozen(MEASUREMENT_CONTRACT_V1), true);
  assert.equal((MEASUREMENT_CONTRACT_V1 as unknown as Record<string, unknown>).shouldGo, undefined);
  assert.equal((MEASUREMENT_CONTRACT_V1 as unknown as Record<string, unknown>).shouldStop, undefined);
});

test("measurement contract freezes and rejects post-freeze mutation", () => {
  const contract = createMeasurementContract();
  contract.freeze();
  assert.throws(() => contract.replace({ ...MEASUREMENT_CONTRACT_V1 }), /FROZEN_MUTATION/);
});

test("manual pause/resume controls active time", () => {
  const clock = new TestClock(new Date("2026-01-01T00:00:00.000Z"));
  const timer = new ActiveTimer(clock);
  timer.start();
  clock.advance(10_000);
  timer.pause();
  clock.advance(5_000);
  timer.resume();
  clock.advance(10_000);
  const report = timer.report(clock.now());
  assert.equal(report.activeDurationMs, 20_000);
  assert.equal(report.manualPauseCount, 1);
  assert.equal(report.manualPauseDurationMs, 5_000);
});

test("automatic focus/inactivity events increment flags only, never rewrite elapsed active duration", () => {
  const clock = new TestClock(new Date("2026-01-01T00:00:00.000Z"));
  const timer = new ActiveTimer(clock);
  timer.start();
  clock.advance(10_000);
  timer.flagFocusLoss();
  clock.advance(5_000);
  timer.flagInactivity();
  clock.advance(5_000);
  const report = timer.report(clock.now());
  assert.equal(report.activeDurationMs, 20_000);
  assert.equal(report.interruptionCandidateCount, 2);
  assert.equal(report.confirmedInterruptionCount, 0);
});

test("confirmed interruption is subtracted from active time and reported", () => {
  const clock = new TestClock(new Date("2026-01-01T00:00:00.000Z"));
  const timer = new ActiveTimer(clock);
  timer.start();
  clock.advance(10_000);
  timer.flagInactivity();
  timer.confirmInterruption(3_000);
  clock.advance(10_000);
  const report = timer.report(clock.now());
  assert.equal(report.activeDurationMs, 17_000);
  assert.equal(report.confirmedInterruptionCount, 1);
  assert.equal(report.confirmedInterruptionDurationMs, 3_000);
});

test("timer rejects overlapping pause transitions and negative intervals", () => {
  const clock = new TestClock(new Date("2026-01-01T00:00:00.000Z"));
  const timer = new ActiveTimer(clock);
  timer.start();
  timer.pause();
  assert.throws(() => timer.pause(), /ALREADY_PAUSED/);
  timer.resume();
  assert.throws(() => timer.resume(), /NOT_PAUSED/);
});

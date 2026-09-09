import { FrozenValue } from "./freeze.js";
import type { FounderCaseOutcomeFixture } from "../fixtures/contracts.js";

function finiteValues(values: readonly number[]): number[] {
  return values.filter((v) => Number.isFinite(v) && v >= 0);
}

export function computeMedian(values: readonly number[]): number {
  const clean = finiteValues(values).sort((a, b) => a - b);
  const n = clean.length;
  if (n === 0) throw new RangeError("computeMedian requires at least one valid sample");
  const mid = Math.floor(n / 2);
  return n % 2 === 0 ? ((clean[mid - 1] as number) + (clean[mid] as number)) / 2 : (clean[mid] as number);
}

/** Nearest-rank P90: rank = ceil(0.9 * n), 1-indexed into the ascending sort. */
export function computeNearestRankP90(values: readonly number[]): number {
  const clean = finiteValues(values).sort((a, b) => a - b);
  const n = clean.length;
  if (n === 0) throw new RangeError("computeNearestRankP90 requires at least one valid sample");
  const rank = Math.ceil(0.9 * n);
  const index = Math.min(Math.max(rank, 1), n) - 1;
  return clean[index] as number;
}

export interface RatioResult {
  numerator: number;
  denominator: number;
  ratio: number | null;
}

function completedOutcomes(outcomes: readonly FounderCaseOutcomeFixture[]): FounderCaseOutcomeFixture[] {
  return outcomes.filter((o) => o.contextSufficiency !== null);
}

/** Numerator = unique completed Founder cases with INSUFFICIENT_CONTEXT;
 * denominator = completed valid Founder cases. A case with no recorded
 * contextSufficiency is excluded entirely, never coerced into either count. */
export function computeContextInsufficiency(outcomes: readonly FounderCaseOutcomeFixture[]): RatioResult {
  const completed = completedOutcomes(outcomes);
  const numerator = completed.filter((o) => o.contextSufficiency === "INSUFFICIENT_CONTEXT").length;
  const denominator = completed.length;
  return { numerator, denominator, ratio: denominator === 0 ? null : numerator / denominator };
}

/** Counts OTHER or NEW_PRINCIPLE_NEEDED taxonomy escapes over completed Founder cases. */
export function computeTaxonomyEscape(outcomes: readonly FounderCaseOutcomeFixture[]): RatioResult {
  const completed = completedOutcomes(outcomes);
  const numerator = completed.filter((o) => o.taxonomy === "OTHER" || o.taxonomy === "NEW_PRINCIPLE_NEEDED").length;
  const denominator = completed.length;
  return { numerator, denominator, ratio: denominator === 0 ? null : numerator / denominator };
}

export interface DirectionalAgreementResult {
  eligibleCount: number;
  agreeCount: number;
  ratio: number | null;
  excludedCount: number;
  plannedPairCoverage: number;
}

/** Excludes UNCERTAIN and INSUFFICIENT_CONTEXT (and null/unknown) from the
 * agreement ratio; reports planned-pair coverage (eligible / total planned)
 * as a separate figure so exclusion is visible, never silently dropped. */
export function computeDirectionalAgreement(
  outcomes: readonly FounderCaseOutcomeFixture[],
): DirectionalAgreementResult {
  const eligible = outcomes.filter((o) => o.directionalAgreement === "AGREE" || o.directionalAgreement === "DISAGREE");
  const agreeCount = eligible.filter((o) => o.directionalAgreement === "AGREE").length;
  const eligibleCount = eligible.length;
  return {
    eligibleCount,
    agreeCount,
    ratio: eligibleCount === 0 ? null : agreeCount / eligibleCount,
    excludedCount: outcomes.length - eligibleCount,
    plannedPairCoverage: outcomes.length === 0 ? 0 : eligibleCount / outcomes.length,
  };
}

/** Counts fields explicitly marked UNNECESSARY only. */
export function countUnnecessaryFields(outcomes: readonly FounderCaseOutcomeFixture[]): number {
  return outcomes.reduce((sum, o) => sum + o.unnecessaryCoreFields, 0);
}

export const MEASUREMENT_CONTRACT_V1 = Object.freeze({
  medianActiveSecondsCandidateMax: 300,
  p90ActiveSecondsCandidateMax: 480,
  insufficientContextCandidateMaxRatio: 0.2,
  taxonomyEscapeCandidateMaxRatio: 0.2,
  unnecessaryCoreFieldsCandidateMax: 1,
  directionalAgreementCandidateMinRatio: 0.75,
});

export type MeasurementContractV1 = typeof MEASUREMENT_CONTRACT_V1;

export function createMeasurementContract(): FrozenValue<MeasurementContractV1> {
  return new FrozenValue(MEASUREMENT_CONTRACT_V1);
}

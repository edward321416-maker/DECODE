import { FrozenValue } from "./freeze.js";
import type { FounderCaseOutcomeFixture, GoldVerdictLabel, SecondExpertPairFixture } from "../fixtures/contracts.js";

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

const POSITIVE_CATEGORY: readonly GoldVerdictLabel[] = ["OPTIMAL", "ACCEPTABLE"];
const NEGATIVE_CATEGORY: readonly GoldVerdictLabel[] = ["SUBOPTIMAL", "ERROR"];
const EXCLUDED_CATEGORY: readonly GoldVerdictLabel[] = ["UNCERTAIN", "INSUFFICIENT_CONTEXT"];
const PLANNED_SECOND_EXPERT_PAIRS = 4;

function verdictCategory(verdict: GoldVerdictLabel): "POSITIVE" | "NEGATIVE" | "EXCLUDED" {
  if (POSITIVE_CATEGORY.includes(verdict)) return "POSITIVE";
  if (NEGATIVE_CATEGORY.includes(verdict)) return "NEGATIVE";
  return "EXCLUDED";
}

export interface DirectionalAgreementReport {
  plannedPairs: number;
  completedPairs: number;
  eligiblePairs: number;
  excludedPairs: number;
  directionalAgreementCount: number;
  directionalAgreementRatio: number | null;
  exactVerdictMatches: number;
  exactVerdictDisagreements: number;
  coverageRatio: number;
  incompleteCoverage: boolean;
  reasonCodes: string[];
}

/**
 * Protocol §16: directional agreement is computed from the exactly 4
 * planned Second Expert pairs' real Founder/Second-Expert verdicts, never
 * from a pre-baked AGREE/DISAGREE field. Positive = OPTIMAL/ACCEPTABLE,
 * Negative = SUBOPTIMAL/ERROR; UNCERTAIN/INSUFFICIENT_CONTEXT on either
 * side excludes the pair from the directional denominator. Exact-verdict
 * matches/disagreements are reported separately from directional
 * (category-level) agreement. Incomplete Second Expert coverage
 * (`secondExpertVerdict: null`) is reported explicitly, never silently
 * dropped or coerced into a disagreement.
 */
export function computeDirectionalAgreementFromPairs(
  pairs: readonly SecondExpertPairFixture[],
): DirectionalAgreementReport {
  if (pairs.length !== PLANNED_SECOND_EXPERT_PAIRS) {
    throw new RangeError(`expected exactly 4 planned Second Expert pairs, got ${pairs.length}`);
  }
  const completed = pairs.filter((p): p is SecondExpertPairFixture & { secondExpertVerdict: GoldVerdictLabel } =>
    p.secondExpertVerdict !== null,
  );
  const eligible = completed.filter(
    (p) => verdictCategory(p.founderVerdict) !== "EXCLUDED" && verdictCategory(p.secondExpertVerdict) !== "EXCLUDED",
  );
  const directionalAgreementCount = eligible.filter(
    (p) => verdictCategory(p.founderVerdict) === verdictCategory(p.secondExpertVerdict),
  ).length;
  const exactVerdictMatches = eligible.filter((p) => p.founderVerdict === p.secondExpertVerdict).length;
  const incompleteCoverage = completed.length < PLANNED_SECOND_EXPERT_PAIRS;
  return {
    plannedPairs: PLANNED_SECOND_EXPERT_PAIRS,
    completedPairs: completed.length,
    eligiblePairs: eligible.length,
    excludedPairs: completed.length - eligible.length,
    directionalAgreementCount,
    directionalAgreementRatio: eligible.length === 0 ? null : directionalAgreementCount / eligible.length,
    exactVerdictMatches,
    exactVerdictDisagreements: eligible.length - exactVerdictMatches,
    coverageRatio: completed.length / PLANNED_SECOND_EXPERT_PAIRS,
    incompleteCoverage,
    reasonCodes: incompleteCoverage ? ["INCOMPLETE_SECOND_EXPERT_COVERAGE"] : [],
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

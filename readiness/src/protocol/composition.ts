import type { GoldVerdictLabel, Main10CaseFixture, PrimaryFamily } from "../fixtures/contracts.js";

export interface ClarityCounts {
  CLEAR: number;
  AMBIGUOUS: number;
}

export interface FamilyCounts {
  FIGHT_SELECTION: number;
  POST_CONTACT_DECISION: number;
  TRADEABILITY_SPACING: number;
}

export function countClarity(cases: readonly Main10CaseFixture[]): ClarityCounts {
  const counts: ClarityCounts = { CLEAR: 0, AMBIGUOUS: 0 };
  for (const c of cases) counts[c.clarity] += 1;
  return counts;
}

export function countFamilies(cases: readonly Main10CaseFixture[]): FamilyCounts {
  const counts: FamilyCounts = {
    FIGHT_SELECTION: 0,
    POST_CONTACT_DECISION: 0,
    TRADEABILITY_SPACING: 0,
  };
  for (const c of cases) counts[c.family] += 1;
  return counts;
}

const LOCKED_CLARITY: ClarityCounts = { CLEAR: 6, AMBIGUOUS: 4 };
const LOCKED_FAMILIES: Record<PrimaryFamily, number> = {
  FIGHT_SELECTION: 4,
  POST_CONTACT_DECISION: 3,
  TRADEABILITY_SPACING: 3,
};

export interface CompositionValidation {
  valid: boolean;
  reasonCodes: string[];
}

/** D005 (locked): CLEAR 6 / AMBIGUOUS 4, family allocation 4/3/3. */
export function validateMain10Composition(cases: readonly Main10CaseFixture[]): CompositionValidation {
  const reasonCodes: string[] = [];
  if (cases.length !== 10) reasonCodes.push("COMPOSITION_WRONG_COUNT");
  const clarity = countClarity(cases);
  if (clarity.CLEAR !== LOCKED_CLARITY.CLEAR || clarity.AMBIGUOUS !== LOCKED_CLARITY.AMBIGUOUS) {
    reasonCodes.push("COMPOSITION_WRONG_CLARITY_SPLIT");
  }
  const families = countFamilies(cases);
  for (const family of Object.keys(LOCKED_FAMILIES) as PrimaryFamily[]) {
    if (families[family] !== LOCKED_FAMILIES[family]) {
      reasonCodes.push("COMPOSITION_WRONG_FAMILY_SPLIT");
      break;
    }
  }
  return { valid: reasonCodes.length === 0, reasonCodes };
}

export interface PositiveQualityResult {
  satisfied: boolean;
  reasonCodes: string[];
}

const POSITIVE_VERDICTS: readonly GoldVerdictLabel[] = ["OPTIMAL", "ACCEPTABLE"];

/**
 * Correction 2 (design spec Section 12 row 7): this condition is evaluated
 * only after synthetic Gold verdicts exist for every case — it is a
 * post-Gold structural check, never a pre-selection eligibility gate. A
 * shortfall never triggers case swapping/reselection; the input composition
 * is read-only to this function.
 */
export function evaluatePositiveQualityCondition(
  cases: readonly Main10CaseFixture[],
  goldVerdicts: Readonly<Record<string, GoldVerdictLabel>>,
): PositiveQualityResult {
  const positiveCount = cases.filter((c) => {
    const verdict = goldVerdicts[c.caseId];
    return verdict !== undefined && POSITIVE_VERDICTS.includes(verdict);
  }).length;
  const satisfied = positiveCount >= 2;
  return { satisfied, reasonCodes: satisfied ? [] : ["COMPOSITION_CONDITION_FAILED"] };
}

import type { ReserveCandidateFixture, StratumFixture } from "../fixtures/contracts.js";

function sortStrata(strata: readonly StratumFixture[]): StratumFixture[] {
  return [...strata].sort((a, b) => {
    if (a.mainCount !== b.mainCount) return b.mainCount - a.mainCount;
    return a.stratumId < b.stratumId ? -1 : a.stratumId > b.stratumId ? 1 : 0;
  });
}

export interface ReserveAllocation {
  clearTop2: StratumFixture[];
  ambiguousTop1: StratumFixture[];
}

/** Protocol §5: CLEAR top-2 strata + AMBIGUOUS top-1 stratum, sorted by
 * mainCount DESC then canonical stratumId ASC. */
export function allocateReserveStrata(strata: readonly StratumFixture[]): ReserveAllocation {
  const clear = sortStrata(strata.filter((s) => s.clarity === "CLEAR"));
  const ambiguous = sortStrata(strata.filter((s) => s.clarity === "AMBIGUOUS"));
  return {
    clearTop2: clear.slice(0, 2),
    ambiguousTop1: ambiguous.slice(0, 1),
  };
}

export type ReplacementStatus =
  | "REPLACED"
  | "REPLACEMENT_UNAVAILABLE"
  | "REJECTED_POST_FREEZE"
  | "REJECTED_RESULT_DRIVEN";

export interface ReplacementResult {
  status: ReplacementStatus;
  reasonCodes: string[];
  replacementCaseId?: string;
}

export interface ReplacementInput {
  stratum: StratumFixture;
  reserveCandidates: readonly ReserveCandidateFixture[];
  measurementFrozen: boolean;
  resultDriven: boolean;
}

/** Protocol §5/§21: replacement only before measurement freeze, only from a
 * same-clarity + same-primary-family reserve candidate, never result-driven
 * (no redraw based on observed disagreement/availability/AI output). */
export function replaceBeforeMeasurementFreeze(input: ReplacementInput): ReplacementResult {
  if (input.measurementFrozen) {
    return { status: "REJECTED_POST_FREEZE", reasonCodes: ["FROZEN_MUTATION"] };
  }
  if (input.resultDriven) {
    return { status: "REJECTED_RESULT_DRIVEN", reasonCodes: ["RESULT_DRIVEN_REDRAW_REJECTED"] };
  }
  const candidate = input.reserveCandidates.find(
    (c) =>
      c.stratumId === input.stratum.stratumId &&
      c.clarity === input.stratum.clarity &&
      c.family === input.stratum.family,
  );
  if (!candidate) {
    return { status: "REPLACEMENT_UNAVAILABLE", reasonCodes: ["REPLACEMENT_UNAVAILABLE"] };
  }
  return { status: "REPLACED", reasonCodes: [], replacementCaseId: candidate.caseId };
}

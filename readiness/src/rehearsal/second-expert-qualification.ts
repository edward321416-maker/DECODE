import type { QualificationCandidateFixture } from "../fixtures/contracts.js";

export type QualificationVerdict = "ELIGIBLE" | "NOT_ELIGIBLE" | "INSUFFICIENT_EVIDENCE";

export interface QualificationResult {
  verdict: QualificationVerdict;
  reasonCodes: string[];
}

/**
 * Protocol §8: Founder recommendation is recorded as input provenance only
 * — it can never itself produce ELIGIBLE. The verdict is driven entirely by
 * evidenceLevel and any explicit disqualification.
 */
export function qualifySecondExpertCandidate(candidate: QualificationCandidateFixture): QualificationResult {
  if (candidate.disqualified) {
    return { verdict: "NOT_ELIGIBLE", reasonCodes: ["DISQUALIFIED"] };
  }
  if (candidate.evidenceLevel === "NONE") {
    return {
      verdict: "INSUFFICIENT_EVIDENCE",
      reasonCodes: candidate.founderRecommended
        ? ["FOUNDER_RECOMMENDATION_INSUFFICIENT_ALONE"]
        : ["NO_EVIDENCE"],
    };
  }
  if (candidate.evidenceLevel === "INSUFFICIENT") {
    return { verdict: "INSUFFICIENT_EVIDENCE", reasonCodes: ["EVIDENCE_INSUFFICIENT"] };
  }
  return { verdict: "ELIGIBLE", reasonCodes: [] };
}

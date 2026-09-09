import { assertValidRelationshipProvenance, type QualificationCandidateFixture } from "../fixtures/contracts.js";
import { REHEARSAL_ARTIFACT, type RehearsalArtifact } from "./artifact.js";

export type QualificationVerdict = "ELIGIBLE" | "NOT_ELIGIBLE" | "INSUFFICIENT_EVIDENCE";

export interface QualificationResult {
  verdict: QualificationVerdict;
  reasonCodes: string[];
  artifact: RehearsalArtifact;
}

/**
 * Protocol §8: Founder recommendation is recorded as input provenance only
 * — it can never itself produce ELIGIBLE. The verdict is driven entirely by
 * evidenceLevel and any explicit disqualification.
 */
export function qualifySecondExpertCandidate(candidate: QualificationCandidateFixture): QualificationResult {
  assertValidRelationshipProvenance(candidate.relationshipProvenance);
  if (candidate.disqualified) {
    return { verdict: "NOT_ELIGIBLE", reasonCodes: ["DISQUALIFIED"], artifact: REHEARSAL_ARTIFACT };
  }
  if (candidate.evidenceLevel === "NONE") {
    return {
      verdict: "INSUFFICIENT_EVIDENCE",
      reasonCodes: candidate.founderRecommended
        ? ["FOUNDER_RECOMMENDATION_INSUFFICIENT_ALONE"]
        : ["NO_EVIDENCE"],
      artifact: REHEARSAL_ARTIFACT,
    };
  }
  if (candidate.evidenceLevel === "INSUFFICIENT") {
    return { verdict: "INSUFFICIENT_EVIDENCE", reasonCodes: ["EVIDENCE_INSUFFICIENT"], artifact: REHEARSAL_ARTIFACT };
  }
  return { verdict: "ELIGIBLE", reasonCodes: [], artifact: REHEARSAL_ARTIFACT };
}

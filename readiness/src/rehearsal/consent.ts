import type { ConsentActorFixture } from "../fixtures/contracts.js";
import { REHEARSAL_ARTIFACT, type RehearsalArtifact } from "./artifact.js";

export type ConsentDecision = "ACCEPTED" | "REJECTED" | "PAUSED";

export interface ConsentRehearsalResult {
  decision: ConsentDecision;
  reasonCodes: string[];
  artifact: RehearsalArtifact;
}

/**
 * Synthetic-only consent/guardian/assent state machine (Protocol §17,
 * §24-26). No real actor fields exist here — actorId is a fixture-local
 * synthetic identifier only.
 */
export function rehearseConsent(actor: ConsentActorFixture): ConsentRehearsalResult {
  if (actor.expression === "DO_NOT_PARTICIPATE") {
    return { decision: "REJECTED", reasonCodes: ["PARTICIPANT_REFUSED"], artifact: REHEARSAL_ARTIFACT };
  }
  if (actor.expression === "AMBIGUOUS") {
    return { decision: "PAUSED", reasonCodes: ["AMBIGUOUS_EXPRESSION_PAUSED"], artifact: REHEARSAL_ARTIFACT };
  }
  if (actor.kind === "MINOR") {
    if (actor.guardianConsent === true && actor.guardianVerified === true) {
      return { decision: "ACCEPTED", reasonCodes: [], artifact: REHEARSAL_ARTIFACT };
    }
    return { decision: "REJECTED", reasonCodes: ["GUARDIAN_CONSENT_INCOMPLETE"], artifact: REHEARSAL_ARTIFACT };
  }
  return { decision: "ACCEPTED", reasonCodes: [], artifact: REHEARSAL_ARTIFACT };
}

export type PausedResolution = "CONTINUE" | "WITHDRAW";

/** A PAUSED (ambiguous-expression) state cannot advance until this explicit
 * resolution is applied; WITHDRAW always stops future affected processing. */
export function resolvePausedConsent(resolution: PausedResolution): ConsentRehearsalResult {
  if (resolution === "WITHDRAW") {
    return { decision: "REJECTED", reasonCodes: ["WITHDRAWN"], artifact: REHEARSAL_ARTIFACT };
  }
  return { decision: "ACCEPTED", reasonCodes: ["RESOLVED_CONTINUE"], artifact: REHEARSAL_ARTIFACT };
}

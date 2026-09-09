import type { GateDefinition } from "./gate-catalog-types.js";
import { rehearseConsent, resolvePausedConsent } from "../rehearsal/consent.js";
import { rehearseSourceRights } from "../rehearsal/source-rights.js";
import { qualifySecondExpertCandidate } from "../rehearsal/second-expert-qualification.js";
import {
  withdrawSyntheticSource,
  reportPostFreezeWithdrawalLimitation,
} from "../rehearsal/withdrawal.js";
import {
  rehearseRawAudioRetention,
  rehearseUnusedReserveDeletion,
  rehearseFullVodDeletionAfterGold,
} from "../rehearsal/retention.js";
import {
  buildSyntheticPolicySnapshot,
  buildSyntheticActorVerifier,
  buildAuthorizationRequest,
} from "./integration-gates.js";
import { InMemoryPolicyRightsGate, InMemoryRightsStore, TestClock } from "../foundation-api.js";

export const consentGuardianAssentRehearsalGate: GateDefinition = {
  id: "consent-guardian-assent-rehearsal",
  mandatory: true,
  async execute(context) {
    const invariantViolations: string[] = [];
    for (const actor of context.fixture.consentActors) {
      const result = rehearseConsent(actor);
      if (actor.expression === "DO_NOT_PARTICIPATE" && result.decision !== "REJECTED") {
        invariantViolations.push("PARTICIPANT_REFUSAL_NOT_HONORED");
      }
      if (actor.kind === "MINOR" && actor.expression === "PARTICIPATE") {
        const complete = actor.guardianConsent === true && actor.guardianVerified === true;
        if (complete !== (result.decision === "ACCEPTED")) {
          invariantViolations.push("GUARDIAN_INVARIANT_VIOLATED");
        }
      }
      if (actor.expression === "AMBIGUOUS") {
        if (result.decision !== "PAUSED") invariantViolations.push("AMBIGUOUS_NOT_PAUSED");
        const withdrawn = resolvePausedConsent("WITHDRAW");
        if (withdrawn.decision !== "REJECTED") invariantViolations.push("PAUSE_WITHDRAW_NOT_HONORED");
      }
    }
    if (invariantViolations.length > 0) {
      return {
        gateId: "consent-guardian-assent-rehearsal",
        mandatory: true,
        status: "FAIL",
        reasonCodes: [...new Set(invariantViolations)],
      };
    }
    return { gateId: "consent-guardian-assent-rehearsal", mandatory: true, status: "PASS", reasonCodes: [] };
  },
};

export const sourceRightsRehearsalGate: GateDefinition = {
  id: "source-rights-rehearsal",
  mandatory: true,
  async execute(context) {
    const forbiddenKinds = new Set(["PUBLIC_SCRAPE", "UNCONSENTED_PILOT"]);
    const violations: string[] = [];
    for (const record of context.fixture.sourceRecords) {
      const result = rehearseSourceRights(record);
      const shouldBeForbidden = forbiddenKinds.has(record.kind);
      if (shouldBeForbidden === result.accepted) {
        violations.push("SOURCE_RIGHTS_INVARIANT_VIOLATED");
      }
    }
    if (violations.length > 0) {
      return {
        gateId: "source-rights-rehearsal",
        mandatory: true,
        status: "FAIL",
        reasonCodes: [...new Set(violations)],
      };
    }
    return { gateId: "source-rights-rehearsal", mandatory: true, status: "PASS", reasonCodes: [] };
  },
};

export const secondExpertQualificationRehearsalGate: GateDefinition = {
  id: "second-expert-qualification-rehearsal",
  mandatory: true,
  async execute(context) {
    const violations: string[] = [];
    for (const candidate of context.fixture.qualificationCandidates) {
      const result = qualifySecondExpertCandidate(candidate);
      if (candidate.evidenceLevel === "NONE" && candidate.founderRecommended && result.verdict === "ELIGIBLE") {
        violations.push("FOUNDER_RECOMMENDATION_PRODUCED_ELIGIBLE");
      }
      if (candidate.evidenceLevel === "INSUFFICIENT" && result.verdict !== "INSUFFICIENT_EVIDENCE") {
        violations.push("INSUFFICIENT_EVIDENCE_NOT_HONORED");
      }
    }
    if (violations.length > 0) {
      return {
        gateId: "second-expert-qualification-rehearsal",
        mandatory: true,
        status: "FAIL",
        reasonCodes: [...new Set(violations)],
      };
    }
    return { gateId: "second-expert-qualification-rehearsal", mandatory: true, status: "PASS", reasonCodes: [] };
  },
};

export const withdrawalFutureUseInvalidationGate: GateDefinition = {
  id: "withdrawal-future-use-invalidation",
  mandatory: true,
  async execute(context) {
    const clock = new TestClock(new Date("2026-01-01T00:00:00.000Z"));
    const rightsStore = new InMemoryRightsStore();
    rightsStore.set(context.fixture.actorId, { eligibility: "EXECUTABLE", revision: 1 });
    const gate = new InMemoryPolicyRightsGate(
      buildSyntheticActorVerifier(context.fixture.actorId),
      rightsStore,
      buildSyntheticPolicySnapshot(context.fixture.externalEgressDestination),
      clock,
    );
    const request = buildAuthorizationRequest(context.fixture.actorId, "EVIDENCE_INGESTION", undefined);
    const permit = await gate.authorize(request);
    withdrawSyntheticSource({ rightsStore, gate, actorId: context.fixture.actorId, permitId: permit.permitId, clock });
    let revalidationDenied = false;
    try {
      await gate.revalidate(permit.permitId, request);
    } catch {
      revalidationDenied = true;
    }
    if (!revalidationDenied) {
      return {
        gateId: "withdrawal-future-use-invalidation",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["WITHDRAWAL_DID_NOT_INVALIDATE"],
      };
    }
    const limitation = reportPostFreezeWithdrawalLimitation("C1", context.fixture.main10.length);
    if (limitation.adjustedDenominator !== context.fixture.main10.length - 1) {
      return {
        gateId: "withdrawal-future-use-invalidation",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["DENOMINATOR_NOT_ADJUSTED"],
      };
    }
    return { gateId: "withdrawal-future-use-invalidation", mandatory: true, status: "PASS", reasonCodes: [] };
  },
};

export const retentionDeletionReceiptsGate: GateDefinition = {
  id: "retention-deletion-receipts",
  mandatory: true,
  async execute(context) {
    const now = new Date();
    const audioFixtureId = context.fixture.localTranscription?.fixtureId ?? "audio-fixture-unavailable";
    const audio = rehearseRawAudioRetention(audioFixtureId, now);
    const reserveCandidate = context.fixture.reserveCandidates[0];
    const reserve = reserveCandidate
      ? rehearseUnusedReserveDeletion(reserveCandidate.caseId, now)
      : rehearseUnusedReserveDeletion("no-reserve-candidate", now);
    const vod = rehearseFullVodDeletionAfterGold("synthetic-vod-1", now);
    if (!audio.receipt.rehearsal || !reserve.rehearsal || !vod.rehearsal) {
      return {
        gateId: "retention-deletion-receipts",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["RECEIPT_NOT_SANITIZED"],
      };
    }
    return { gateId: "retention-deletion-receipts", mandatory: true, status: "PASS", reasonCodes: [] };
  },
};

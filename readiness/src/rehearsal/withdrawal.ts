import type { Clock, InMemoryPolicyRightsGate, InMemoryRightsStore } from "../foundation-api.js";

export interface WithdrawalTombstone {
  referenceId: string;
  state: "WITHDRAWN";
  withdrawalAt: string;
  deletionCompletedAt: string | null;
  receiptId: string;
}

export interface WithdrawalContext {
  rightsStore: InMemoryRightsStore;
  gate: InMemoryPolicyRightsGate;
  actorId: string;
  permitId: string;
  clock: Clock;
}

/**
 * Withdrawal (Protocol §20-21, §28): marks the synthetic actor WITHDRAWN,
 * bumps the rights revision (so any permit issued at a prior revision fails
 * revalidation even if it somehow survives the explicit gate withdrawal),
 * and withdraws the specific permit. Only a sanitized tombstone is
 * preserved — no raw actor/source detail.
 */
export function withdrawSyntheticSource(context: WithdrawalContext): WithdrawalTombstone {
  const prior = context.rightsStore.get(context.actorId);
  const nextRevision = (prior?.revision ?? 0) + 1;
  context.rightsStore.set(context.actorId, { eligibility: "WITHDRAWN", revision: nextRevision });
  context.gate.withdraw(context.permitId);
  const now = context.clock.now();
  return {
    referenceId: context.actorId,
    state: "WITHDRAWN",
    withdrawalAt: now.toISOString(),
    deletionCompletedAt: null,
    receiptId: `receipt_${context.actorId}_${now.getTime()}`,
  };
}

export interface PostFreezeWithdrawalLimitation {
  adjustedDenominator: number;
  reasonCodes: string[];
}

/** After measurement freeze, a withdrawal adjusts/reports the denominator
 * and limitation explicitly — it never selects a replacement based on
 * observed results (that would be a result-driven redraw). */
export function reportPostFreezeWithdrawalLimitation(
  _withdrawnCaseId: string,
  plannedDenominator: number,
): PostFreezeWithdrawalLimitation {
  return {
    adjustedDenominator: plannedDenominator - 1,
    reasonCodes: ["POST_FREEZE_WITHDRAWAL_LIMITATION"],
  };
}

export interface PendingReferenceInvalidationResult {
  invalidatedJobIds: string[];
}

/** Invalidates pending synthetic job/cache references tied to a withdrawn
 * actor/source; nothing here reaches into `foundation/`'s durable job
 * internals — it only records which ids are no longer usable. */
export function invalidatePendingReferences(pendingJobIds: readonly string[]): PendingReferenceInvalidationResult {
  return { invalidatedJobIds: [...pendingJobIds] };
}

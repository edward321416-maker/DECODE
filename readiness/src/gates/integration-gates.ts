import {
  InMemoryPolicyRightsGate,
  type ActorVerifier,
  type AuthorizationRequest,
  type PolicySnapshot,
  type ProtectedAction,
} from "../foundation-api.js";

export const REHEARSED_PROTECTED_ACTIONS: readonly ProtectedAction[] = [
  "EVIDENCE_INGESTION",
  "EXPERT_VOICE_STORAGE",
  "EXTERNAL_EGRESS",
  "EVALUATION_USE",
  "PLAYER_OUTPUT",
];

const REHEARSAL_PURPOSE = "dry-readiness-rehearsal";
const REHEARSAL_DATA_CLASS = "SIMULATED";

export function buildSyntheticPolicySnapshot(destination: string): PolicySnapshot {
  return {
    id: "readiness-policy-v1",
    hash: "readiness-policy-v1-hash",
    rules: REHEARSED_PROTECTED_ACTIONS.map((action) => ({
      action,
      allowedPurposes: [REHEARSAL_PURPOSE],
      allowedDataClasses: [REHEARSAL_DATA_CLASS],
      allowedDestinations: action === "EXTERNAL_EGRESS" ? [destination] : undefined,
    })),
  };
}

export function buildSyntheticActorVerifier(authorizedActorId: string): ActorVerifier {
  return {
    verify: ({ actorId }) => actorId === authorizedActorId,
  };
}

export function buildAuthorizationRequest(
  actorId: string,
  action: ProtectedAction,
  destination: string | undefined,
): AuthorizationRequest {
  return {
    actorId,
    action,
    purpose: REHEARSAL_PURPOSE,
    sourceRefs: ["synthetic-source-1"],
    payloadHash: "synthetic-payload-hash",
    dataClass: REHEARSAL_DATA_CLASS,
    destination: action === "EXTERNAL_EGRESS" ? destination : undefined,
  };
}

export interface RehearsalOutcome {
  status: "PASS" | "FAIL";
  reasonCodes: string[];
}

/** Every protected-action rehearsal calls authorize() and then revalidates
 * immediately before the simulated action (Protocol §28). */
export async function rehearseProtectedAction(
  gate: InMemoryPolicyRightsGate,
  request: AuthorizationRequest,
): Promise<RehearsalOutcome> {
  const permit = await gate.authorize(request);
  await gate.revalidate(permit.permitId, request);
  return { status: "PASS", reasonCodes: [] };
}

/** External egress defaults BLOCKED (D036): the readiness harness never
 * sends real bytes anywhere. The negative/default path — no satisfied
 * destination — is expected to be denied by Foundation's own policy check. */
export async function rehearseExternalEgressDefaultBlock(
  gate: InMemoryPolicyRightsGate,
  actorId: string,
): Promise<RehearsalOutcome> {
  try {
    await gate.authorize(buildAuthorizationRequest(actorId, "EXTERNAL_EGRESS", undefined));
    return { status: "FAIL", reasonCodes: ["EXPECTED_BLOCK_BUT_ALLOWED"] };
  } catch {
    return { status: "PASS", reasonCodes: ["EXTERNAL_EGRESS_BLOCKED"] };
  }
}

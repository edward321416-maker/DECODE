export type Eligibility = "EXECUTABLE" | "RESTRICTED" | "WITHDRAWN" | "POLICY_BLOCKED";

export type ProtectedAction =
  | "EVIDENCE_INGESTION"
  | "EXPERT_VOICE_STORAGE"
  | "EXTERNAL_EGRESS"
  | "EVALUATION_USE"
  | "PLAYER_OUTPUT";

export interface ActorVerifier {
  verify(input: { actorId: string; action: ProtectedAction; purpose: string }): Promise<boolean> | boolean;
}

export interface PolicyRule {
  action: ProtectedAction;
  allowedPurposes: string[];
  allowedDataClasses: string[];
  allowedDestinations?: string[];
}

export interface PolicySnapshot {
  id: string;
  hash: string;
  rules: PolicyRule[];
}

export interface RightsState {
  eligibility: Eligibility;
  revision: number;
}

export interface AuthorizationRequest {
  actorId: string;
  action: ProtectedAction;
  purpose: string;
  sourceRefs: string[];
  payloadHash: string;
  dataClass: string;
  destination?: string;
}

export interface Permit {
  permitId: string;
  actorId: string;
  action: ProtectedAction;
  purpose: string;
  sourceRefs: string[];
  payloadHash: string;
  dataClass: string;
  destination?: string;
  rightsRevisionAtIssuance: number;
  policySnapshotId: string;
  policySnapshotHash: string;
  issuedAt: Date;
  expiresAt: Date;
}

export class AuthorizationDeniedError extends Error {
  constructor(public readonly reason: string) {
    super(reason);
  }
}

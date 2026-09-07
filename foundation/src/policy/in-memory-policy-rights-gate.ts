import type { Clock } from "../shared/clock.js";
import { generateId } from "../shared/ids.js";
import {
  AuthorizationDeniedError,
  type ActorVerifier,
  type AuthorizationRequest,
  type Permit,
  type PolicyRule,
  type PolicySnapshot,
  type ProtectedAction,
  type RightsState,
} from "./contracts.js";

export function normalizeSourceRefs(refs: string[]): string[] {
  return Array.from(new Set(refs)).sort();
}

export class InMemoryRightsStore {
  private state = new Map<string, RightsState>();

  set(actorId: string, state: RightsState): void {
    this.state.set(actorId, state);
  }

  get(actorId: string): RightsState {
    return this.state.get(actorId) ?? { eligibility: "EXECUTABLE", revision: 0 };
  }
}

export class InMemoryPolicyRightsGate {
  private permits = new Map<string, Permit>();
  private withdrawn = new Set<string>();
  private policySnapshot: PolicySnapshot;

  constructor(
    private readonly actorVerifier: ActorVerifier,
    private readonly rightsStore: InMemoryRightsStore,
    policySnapshot: PolicySnapshot,
    private readonly clock: Clock,
    private readonly permitTtlMs = 3_600_000,
  ) {
    this.policySnapshot = policySnapshot;
  }

  setPolicySnapshot(snapshot: PolicySnapshot): void {
    this.policySnapshot = snapshot;
  }

  private findRule(action: ProtectedAction): PolicyRule | undefined {
    return this.policySnapshot.rules.find((rule) => rule.action === action);
  }

  async authorize(request: AuthorizationRequest): Promise<Permit> {
    const verified = await this.actorVerifier.verify({
      actorId: request.actorId,
      action: request.action,
      purpose: request.purpose,
    });
    if (!verified) {
      throw new AuthorizationDeniedError("actor not authorized");
    }

    const rule = this.findRule(request.action);
    if (!rule) {
      throw new AuthorizationDeniedError(`action ${request.action} is not allowed by policy`);
    }
    if (!rule.allowedPurposes.includes(request.purpose)) {
      throw new AuthorizationDeniedError(`purpose ${request.purpose} is not allowed for ${request.action}`);
    }
    if (!rule.allowedDataClasses.includes(request.dataClass)) {
      throw new AuthorizationDeniedError(`data class ${request.dataClass} is not allowed for ${request.action}`);
    }
    if (request.action === "EXTERNAL_EGRESS") {
      if (!request.destination) {
        throw new AuthorizationDeniedError("external egress requires a non-empty destination");
      }
      if (!rule.allowedDestinations || !rule.allowedDestinations.includes(request.destination)) {
        throw new AuthorizationDeniedError(`destination ${request.destination} is not allowed`);
      }
    }

    const rights = this.rightsStore.get(request.actorId);
    if (rights.eligibility !== "EXECUTABLE") {
      throw new AuthorizationDeniedError(`rights are not EXECUTABLE: ${rights.eligibility}`);
    }

    const now = this.clock.now();
    const permit: Permit = {
      permitId: generateId("permit"),
      actorId: request.actorId,
      action: request.action,
      purpose: request.purpose,
      sourceRefs: normalizeSourceRefs(request.sourceRefs),
      payloadHash: request.payloadHash,
      dataClass: request.dataClass,
      destination: request.destination,
      rightsRevisionAtIssuance: rights.revision,
      policySnapshotId: this.policySnapshot.id,
      policySnapshotHash: this.policySnapshot.hash,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + this.permitTtlMs),
    };
    this.permits.set(permit.permitId, permit);
    return permit;
  }

  withdraw(permitId: string): void {
    this.withdrawn.add(permitId);
  }

  async revalidate(permitId: string): Promise<void> {
    const permit = this.permits.get(permitId);
    if (!permit) {
      throw new AuthorizationDeniedError("permit not found");
    }
    if (this.withdrawn.has(permitId)) {
      throw new AuthorizationDeniedError("permit withdrawn");
    }

    const now = this.clock.now();
    if (now.getTime() > permit.expiresAt.getTime()) {
      throw new AuthorizationDeniedError("permit expired");
    }

    const verified = await this.actorVerifier.verify({
      actorId: permit.actorId,
      action: permit.action,
      purpose: permit.purpose,
    });
    if (!verified) {
      throw new AuthorizationDeniedError("actor is no longer authorized");
    }

    if (
      this.policySnapshot.id !== permit.policySnapshotId ||
      this.policySnapshot.hash !== permit.policySnapshotHash
    ) {
      throw new AuthorizationDeniedError("policy snapshot changed since permit issuance");
    }

    const rule = this.findRule(permit.action);
    if (!rule || !rule.allowedPurposes.includes(permit.purpose) || !rule.allowedDataClasses.includes(permit.dataClass)) {
      throw new AuthorizationDeniedError("policy no longer authorizes this permit's binding");
    }
    if (permit.action === "EXTERNAL_EGRESS") {
      if (!permit.destination || !rule.allowedDestinations?.includes(permit.destination)) {
        throw new AuthorizationDeniedError("destination no longer authorized");
      }
    }

    const rights = this.rightsStore.get(permit.actorId);
    if (rights.eligibility !== "EXECUTABLE") {
      throw new AuthorizationDeniedError(`rights are not EXECUTABLE: ${rights.eligibility}`);
    }
    if (rights.revision !== permit.rightsRevisionAtIssuance) {
      throw new AuthorizationDeniedError("rights revision changed since permit issuance");
    }
  }
}

export function permitMatchesRequest(permit: Permit, request: AuthorizationRequest): boolean {
  return (
    permit.actorId === request.actorId &&
    permit.action === request.action &&
    permit.purpose === request.purpose &&
    permit.payloadHash === request.payloadHash &&
    permit.dataClass === request.dataClass &&
    permit.destination === request.destination &&
    JSON.stringify(permit.sourceRefs) === JSON.stringify(normalizeSourceRefs(request.sourceRefs))
  );
}

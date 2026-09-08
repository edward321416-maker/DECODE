import { createHash } from "node:crypto";
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

  // Finding 5: fail closed. A missing rights record is not EXECUTABLE — it is simply absent,
  // and callers (the gate) must treat absence as an explicit denial, not a default grant.
  get(actorId: string): RightsState | undefined {
    const state = this.state.get(actorId);
    return state ? { ...state } : undefined;
  }
}

function cloneRule(rule: PolicyRule): PolicyRule {
  return {
    action: rule.action,
    allowedPurposes: [...rule.allowedPurposes],
    allowedDataClasses: [...rule.allowedDataClasses],
    allowedDestinations: rule.allowedDestinations ? [...rule.allowedDestinations] : undefined,
  };
}

function clonePolicySnapshot(snapshot: PolicySnapshot): PolicySnapshot {
  return { id: snapshot.id, hash: snapshot.hash, rules: snapshot.rules.map(cloneRule) };
}

// Finding 3: content-derived hash, independent of the caller-supplied `hash` label, so genuine
// rule-content drift is detected even when a caller changes rules without updating `hash` (or
// leaves id/hash identical). Field order/list order is canonicalized so semantically identical
// content always hashes identically.
function computePolicyContentHash(snapshot: PolicySnapshot): string {
  const canonical = snapshot.rules
    .map((rule) => ({
      action: rule.action,
      allowedPurposes: [...rule.allowedPurposes].sort(),
      allowedDataClasses: [...rule.allowedDataClasses].sort(),
      allowedDestinations: rule.allowedDestinations ? [...rule.allowedDestinations].sort() : [],
    }))
    .sort((a, b) => a.action.localeCompare(b.action));
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

// Finding 2: the object returned to callers must never be the mutable authoritative object the
// gate uses internally. Deep-clones every mutable field (array, Date) so caller mutation of the
// returned value cannot reach stored state or bypass later checks (e.g. self-extending expiry).
function clonePermit(permit: Permit): Permit {
  return {
    ...permit,
    sourceRefs: [...permit.sourceRefs],
    issuedAt: new Date(permit.issuedAt.getTime()),
    expiresAt: new Date(permit.expiresAt.getTime()),
  };
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

export class InMemoryPolicyRightsGate {
  private permits = new Map<string, Permit>();
  private permitContentHashes = new Map<string, string>();
  private withdrawn = new Set<string>();
  private policySnapshot: PolicySnapshot;
  private policyContentHash: string;

  constructor(
    private readonly actorVerifier: ActorVerifier,
    private readonly rightsStore: InMemoryRightsStore,
    policySnapshot: PolicySnapshot,
    private readonly clock: Clock,
    private readonly permitTtlMs = 3_600_000,
  ) {
    this.policySnapshot = clonePolicySnapshot(policySnapshot);
    this.policyContentHash = computePolicyContentHash(this.policySnapshot);
  }

  setPolicySnapshot(snapshot: PolicySnapshot): void {
    this.policySnapshot = clonePolicySnapshot(snapshot);
    this.policyContentHash = computePolicyContentHash(this.policySnapshot);
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

    // Finding 5: fail closed on a missing rights record.
    const rights = this.rightsStore.get(request.actorId);
    if (!rights) {
      throw new AuthorizationDeniedError(`no rights record found for actor ${request.actorId}`);
    }
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
    // Store the canonical object internally; it is never exposed to callers directly (finding 2).
    this.permits.set(permit.permitId, permit);
    this.permitContentHashes.set(permit.permitId, this.policyContentHash);
    return clonePermit(permit);
  }

  withdraw(permitId: string): void {
    this.withdrawn.add(permitId);
  }

  // Finding 1: execution-time binding is enforced HERE, against the caller's execution request,
  // using the internally stored authoritative permit (never a caller-supplied object) — a caller
  // cannot succeed merely by calling revalidate(permitId) with a changed request.
  async revalidate(permitId: string, request: AuthorizationRequest): Promise<void> {
    const permit = this.permits.get(permitId);
    if (!permit) {
      throw new AuthorizationDeniedError("permit not found");
    }
    if (this.withdrawn.has(permitId)) {
      throw new AuthorizationDeniedError("permit withdrawn");
    }

    const now = this.clock.now();
    if (now.getTime() >= permit.expiresAt.getTime()) {
      throw new AuthorizationDeniedError("permit expired");
    }

    if (!permitMatchesRequest(permit, request)) {
      throw new AuthorizationDeniedError("execution request does not match the issued permit's bindings");
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
    // Finding 3: content-derived drift detection, independent of the caller-supplied id/hash
    // labels — catches a caller changing rule content without updating `hash`.
    if (this.policyContentHash !== this.permitContentHashes.get(permitId)) {
      throw new AuthorizationDeniedError("policy rule content changed since permit issuance");
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
    if (!rights) {
      throw new AuthorizationDeniedError(`no rights record found for actor ${permit.actorId}`);
    }
    if (rights.eligibility !== "EXECUTABLE") {
      throw new AuthorizationDeniedError(`rights are not EXECUTABLE: ${rights.eligibility}`);
    }
    if (rights.revision !== permit.rightsRevisionAtIssuance) {
      throw new AuthorizationDeniedError("rights revision changed since permit issuance");
    }
  }
}

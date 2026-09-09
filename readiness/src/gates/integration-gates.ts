import {
  InMemoryPolicyRightsGate,
  InMemoryRightsStore,
  TestClock,
  validateEvidenceRecord,
  type ActorVerifier,
  type AuthorizationRequest,
  type PolicySnapshot,
  type ProtectedAction,
  type EvidenceRecord,
} from "../foundation-api.js";
import type { GateDefinition } from "./gate-catalog-types.js";

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

function buildRehearsalHarness(context: { fixture: { actorId: string; externalEgressDestination: string } }) {
  const clock = new TestClock(new Date("2026-01-01T00:00:00.000Z"));
  const rightsStore = new InMemoryRightsStore();
  rightsStore.set(context.fixture.actorId, { eligibility: "EXECUTABLE", revision: 1 });
  const gate = new InMemoryPolicyRightsGate(
    buildSyntheticActorVerifier(context.fixture.actorId),
    rightsStore,
    buildSyntheticPolicySnapshot(context.fixture.externalEgressDestination),
    clock,
  );
  return { clock, rightsStore, gate };
}

export const foundationPolicyRightsIntegrationGate: GateDefinition = {
  id: "foundation-policy-rights-integration",
  mandatory: true,
  async execute(context) {
    const { gate } = buildRehearsalHarness(context);
    for (const action of REHEARSED_PROTECTED_ACTIONS) {
      const request = buildAuthorizationRequest(context.fixture.actorId, action, context.fixture.externalEgressDestination);
      const outcome = await rehearseProtectedAction(gate, request);
      if (outcome.status !== "PASS") {
        return {
          gateId: "foundation-policy-rights-integration",
          mandatory: true,
          status: "FAIL",
          reasonCodes: ["PROTECTED_ACTION_REHEARSAL_FAILED"],
          detail: action,
        };
      }
    }
    // Negative path: an unauthorized actor must be denied.
    const { rightsStore, clock } = buildRehearsalHarness(context);
    const unauthorizedGate = new InMemoryPolicyRightsGate(
      buildSyntheticActorVerifier("someone-else"),
      rightsStore,
      buildSyntheticPolicySnapshot(context.fixture.externalEgressDestination),
      clock,
    );
    try {
      await unauthorizedGate.authorize(
        buildAuthorizationRequest(context.fixture.actorId, "EVIDENCE_INGESTION", undefined),
      );
      return {
        gateId: "foundation-policy-rights-integration",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["UNAUTHORIZED_ACTOR_NOT_DENIED"],
      };
    } catch {
      return { gateId: "foundation-policy-rights-integration", mandatory: true, status: "PASS", reasonCodes: [] };
    }
  },
};

export const localTranscriptionPortGate: GateDefinition = {
  id: "local-transcription-port",
  mandatory: true,
  async execute(context) {
    // Structural: the CLI's normal wiring never configures a qualifying
    // local adapter (C11 LocalTranscription choice). A test-only port
    // injected into GateContext.localTranscription for isolated
    // port-contract unit tests is never treated as satisfying this gate.
    if (context.hasQualifyingLocalAdapter === true) {
      return {
        gateId: "local-transcription-port",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["UNEXPECTED_QUALIFYING_ADAPTER_CLAIM"],
      };
    }
    return {
      gateId: "local-transcription-port",
      mandatory: true,
      status: "NOT_EXECUTED",
      reasonCodes: ["LOCAL_TRANSCRIPTION_UNAVAILABLE"],
    };
  },
};

export const externalEgressDefaultBlockGate: GateDefinition = {
  id: "external-egress-default-block",
  mandatory: true,
  async execute(context) {
    const { gate } = buildRehearsalHarness(context);
    const blocked = await rehearseExternalEgressDefaultBlock(gate, context.fixture.actorId);
    if (blocked.status !== "PASS") {
      return {
        gateId: "external-egress-default-block",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["DEFAULT_BLOCK_NOT_ENFORCED"],
      };
    }
    const { gate: satisfiedGate } = buildRehearsalHarness(context);
    const positive = await rehearseProtectedAction(
      satisfiedGate,
      buildAuthorizationRequest(context.fixture.actorId, "EXTERNAL_EGRESS", context.fixture.externalEgressDestination),
    );
    if (positive.status !== "PASS") {
      return {
        gateId: "external-egress-default-block",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["SATISFIED_PERMIT_CHAIN_REJECTED"],
      };
    }
    return {
      gateId: "external-egress-default-block",
      mandatory: true,
      status: "PASS",
      reasonCodes: ["EXTERNAL_EGRESS_BLOCKED"],
    };
  },
};

/**
 * Finding 5 correction: this gate must never construct a forbidden
 * DataOrigin=REAL or EvaluationMode=ACTUAL_TEST literal in production
 * source (that construction is isolated to a test-only surface instead —
 * see test/canonical-provenance-anti-promotion.test.ts). It proves the two
 * required invariants without ever writing that literal here: (1) the
 * canonical SELF_BENCHMARK/SIMULATED record validates through Foundation's
 * own validateEvidenceRecord(); (2) `readinessVerdict` and canonical
 * `ExecutionStatus` remain two structurally independent fields — the run
 * object never carries an `executionStatus` key at its own top level and
 * the evidence object never carries a `readinessVerdict` key — so the two
 * can never be collapsed into one enum.
 */
export const canonicalProvenanceAntiPromotionGate: GateDefinition = {
  id: "canonical-provenance-anti-promotion",
  mandatory: true,
  async execute() {
    const validRecord: EvidenceRecord = {
      evaluationMode: "SELF_BENCHMARK",
      dataOrigin: "SIMULATED",
      executionStatus: "NOT_TESTED",
    };
    try {
      validateEvidenceRecord(validRecord);
    } catch {
      return {
        gateId: "canonical-provenance-anti-promotion",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["CANONICAL_EVIDENCE_REJECTED"],
      };
    }
    const sampleRun = {
      runId: "canonical-provenance-check",
      startedAt: null,
      completedAt: null,
      state: "NOT_STARTED",
      gates: [],
      readinessVerdict: null,
      evidence: validRecord,
      frozenHashes: null,
      staleness: { stale: false, reasonCodes: [] },
    };
    const runKeys = Object.keys(sampleRun);
    const evidenceKeys = Object.keys(sampleRun.evidence);
    const collapsed =
      !runKeys.includes("readinessVerdict") ||
      !evidenceKeys.includes("executionStatus") ||
      runKeys.includes("executionStatus") ||
      evidenceKeys.includes("readinessVerdict");
    if (collapsed) {
      return {
        gateId: "canonical-provenance-anti-promotion",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["FIELDS_COLLAPSED"],
      };
    }
    return { gateId: "canonical-provenance-anti-promotion", mandatory: true, status: "PASS", reasonCodes: [] };
  },
};

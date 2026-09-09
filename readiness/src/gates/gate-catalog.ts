import {
  MANDATORY_GATE_IDS,
  type MandatoryGateId,
  type GateContext,
  type GateDefinition,
} from "./gate-catalog-types.js";
import { simulatedOnlyInputGate, evidenceAntiPromotionGate } from "./input-gates.js";
import {
  main10CompositionFreezeGate,
  reserve3AllocationFreezeGate,
  reserveReplacementGate,
  secondExpertPlannedSubsetGate,
  freezeImmutabilityGate,
  measurementPreregistrationFreezeGate,
  softwareSchemaProtocolFixtureGateHashingGate,
  timingPauseInterruptionContractGate,
} from "./protocol-gates.js";
import {
  consentGuardianAssentRehearsalGate,
  sourceRightsRehearsalGate,
  secondExpertQualificationRehearsalGate,
  withdrawalFutureUseInvalidationGate,
  retentionDeletionReceiptsGate,
} from "./operational-gates.js";
import {
  foundationPolicyRightsIntegrationGate,
  localTranscriptionPortGate,
  externalEgressDefaultBlockGate,
  canonicalProvenanceAntiPromotionGate,
} from "./integration-gates.js";
import { metricComputationContractGate, staleRunDetectionGate } from "./metric-gates.js";

export { MANDATORY_GATE_IDS };
export type { MandatoryGateId, GateContext, GateDefinition };

const END_TO_END_GATE_ID: MandatoryGateId = "end-to-end-synthetic-rehearsal";

/** Meta-gate over the accumulated prior gate records. It never calls
 * runReadiness() recursively and never converts a prior PASS/FAIL/UNKNOWN/
 * NOT_EXECUTED into PASS — it only checks that every other mandatory gate
 * produced a terminal record. */
const endToEndGate: GateDefinition = {
  id: END_TO_END_GATE_ID,
  mandatory: true,
  async execute(_context, priorResults) {
    const expectedIds = MANDATORY_GATE_IDS.filter((id) => id !== END_TO_END_GATE_ID);
    const seenIds = new Set(priorResults.map((r) => r.gateId));
    const missing = expectedIds.filter((id) => !seenIds.has(id));
    if (missing.length > 0) {
      return {
        gateId: END_TO_END_GATE_ID,
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["MISSING_GATE_RECORD"],
        detail: `missing: ${missing.join(", ")}`,
      };
    }
    return { gateId: END_TO_END_GATE_ID, mandatory: true, status: "PASS", reasonCodes: [] };
  },
};

export function getGateCatalog(): GateDefinition[] {
  const catalog: GateDefinition[] = [
    simulatedOnlyInputGate,
    evidenceAntiPromotionGate,
    consentGuardianAssentRehearsalGate,
    sourceRightsRehearsalGate,
    secondExpertQualificationRehearsalGate,
    main10CompositionFreezeGate,
    reserve3AllocationFreezeGate,
    reserveReplacementGate,
    secondExpertPlannedSubsetGate,
    freezeImmutabilityGate,
    measurementPreregistrationFreezeGate,
    softwareSchemaProtocolFixtureGateHashingGate,
    timingPauseInterruptionContractGate,
    withdrawalFutureUseInvalidationGate,
    retentionDeletionReceiptsGate,
    foundationPolicyRightsIntegrationGate,
    localTranscriptionPortGate,
    externalEgressDefaultBlockGate,
    canonicalProvenanceAntiPromotionGate,
    metricComputationContractGate,
    staleRunDetectionGate,
    endToEndGate,
  ];
  const ids = catalog.map((g) => g.id);
  const expected = [...MANDATORY_GATE_IDS];
  if (ids.length !== expected.length || ids.some((id, i) => id !== expected[i])) {
    throw new Error(
      `gate catalog does not match MANDATORY_GATE_IDS exactly: got [${ids.join(", ")}], expected [${expected.join(", ")}]`,
    );
  }
  return catalog;
}

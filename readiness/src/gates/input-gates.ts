import { validateSyntheticFixtureRecord, FixtureValidationError } from "../fixtures/contracts.js";
import { selfPromoteToActualTest } from "../foundation-api.js";
import type { GateDefinition } from "./gate-catalog-types.js";

export const simulatedOnlyInputGate: GateDefinition = {
  id: "simulated-only-input",
  mandatory: true,
  async execute(context) {
    try {
      validateSyntheticFixtureRecord(context.fixture);
    } catch (err) {
      const reason = err instanceof FixtureValidationError ? err.message : "SIMULATED_ONLY: invalid fixture";
      return { gateId: "simulated-only-input", mandatory: true, status: "FAIL", reasonCodes: ["SIMULATED_ONLY"], detail: reason };
    }
    return { gateId: "simulated-only-input", mandatory: true, status: "PASS", reasonCodes: [] };
  },
};

export const evidenceAntiPromotionGate: GateDefinition = {
  id: "evidence-anti-promotion",
  mandatory: true,
  async execute() {
    try {
      selfPromoteToActualTest();
      // selfPromoteToActualTest() is typed `never` — reaching here is itself the defect.
      return {
        gateId: "evidence-anti-promotion",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["ANTI_PROMOTION_GUARD_MISSING"],
      };
    } catch {
      return { gateId: "evidence-anti-promotion", mandatory: true, status: "PASS", reasonCodes: [] };
    }
  },
};

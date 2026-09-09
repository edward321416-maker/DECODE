import type { GateDefinition } from "./gate-catalog-types.js";
import {
  computeMedian,
  computeNearestRankP90,
  computeContextInsufficiency,
  computeTaxonomyEscape,
  computeDirectionalAgreement,
  countUnnecessaryFields,
} from "../protocol/measurement.js";
import { frozenHashSetsEqual } from "../domain/frozen-hashes.js";
import { computeFrozenHashesForFixture } from "../domain/frozen-hash-inputs.js";

const KNOWN_CORRECT_DURATIONS = [60, 120, 180, 240, 300, 360, 420, 480, 540, 600];
const EXPECTED_MEDIAN = 330;
const EXPECTED_P90 = 540;

export const metricComputationContractGate: GateDefinition = {
  id: "metric-computation-contract",
  mandatory: true,
  async execute(context) {
    if (
      computeMedian(KNOWN_CORRECT_DURATIONS) !== EXPECTED_MEDIAN ||
      computeNearestRankP90(KNOWN_CORRECT_DURATIONS) !== EXPECTED_P90
    ) {
      return {
        gateId: "metric-computation-contract",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["TIMING_COMPUTATION_INCORRECT"],
      };
    }
    const outcomes = context.fixture.founderCaseOutcomes;
    const contextInsufficiency = computeContextInsufficiency(outcomes);
    const taxonomyEscape = computeTaxonomyEscape(outcomes);
    const directionalAgreement = computeDirectionalAgreement(outcomes);
    const unnecessary = countUnnecessaryFields(outcomes);
    const ratiosValid = [contextInsufficiency.ratio, taxonomyEscape.ratio, directionalAgreement.ratio].every(
      (r) => r === null || (r >= 0 && r <= 1),
    );
    if (!ratiosValid || unnecessary < 0) {
      return {
        gateId: "metric-computation-contract",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["METRIC_COMPUTATION_OUT_OF_RANGE"],
      };
    }
    return { gateId: "metric-computation-contract", mandatory: true, status: "PASS", reasonCodes: [] };
  },
};

export const staleRunDetectionGate: GateDefinition = {
  id: "stale-run-detection",
  mandatory: true,
  async execute(context) {
    const freshRecompute = computeFrozenHashesForFixture(context.fixture);
    if (!frozenHashSetsEqual(context.frozenHashes, freshRecompute)) {
      return {
        gateId: "stale-run-detection",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["FRESH_HASH_MISMATCH"],
      };
    }
    const mutated = { ...freshRecompute, protocol: "0".repeat(64) };
    if (frozenHashSetsEqual(context.frozenHashes, mutated)) {
      return {
        gateId: "stale-run-detection",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["STALE_HASH_NOT_DETECTED"],
      };
    }
    return { gateId: "stale-run-detection", mandatory: true, status: "PASS", reasonCodes: [] };
  },
};

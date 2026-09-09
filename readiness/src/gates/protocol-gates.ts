import type { GateDefinition } from "./gate-catalog-types.js";
import { FrozenValue } from "../protocol/freeze.js";
import { validateMain10Composition, evaluatePositiveQualityCondition } from "../protocol/composition.js";
import { allocateReserveStrata, replaceBeforeMeasurementFreeze } from "../protocol/reserve.js";
import { selectSecondExpertSubset } from "../protocol/second-expert.js";
import { createMeasurementContract } from "../protocol/measurement.js";
import { ActiveTimer } from "../protocol/timing.js";
import { TestClock } from "../foundation-api.js";

export const main10CompositionFreezeGate: GateDefinition = {
  id: "main10-composition-freeze",
  mandatory: true,
  async execute(context) {
    const validation = validateMain10Composition(context.fixture.main10);
    if (!validation.valid) {
      return {
        gateId: "main10-composition-freeze",
        mandatory: true,
        status: "FAIL",
        reasonCodes: validation.reasonCodes,
      };
    }
    const frozen = new FrozenValue(context.fixture.main10);
    frozen.freeze();
    let postFreezeRejected = false;
    try {
      frozen.replace([...context.fixture.main10]);
    } catch {
      postFreezeRejected = true;
    }
    if (!postFreezeRejected) {
      return {
        gateId: "main10-composition-freeze",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["POST_FREEZE_RECLASSIFICATION_ALLOWED"],
      };
    }
    // Positive-quality is checked post hoc (Correction 2): a shortfall is
    // recorded as a reason code, it never fails this structural gate on its
    // own and never triggers case-swap/reselection.
    const quality = evaluatePositiveQualityCondition(context.fixture.main10, context.fixture.goldVerdicts);
    return {
      gateId: "main10-composition-freeze",
      mandatory: true,
      status: "PASS",
      reasonCodes: quality.reasonCodes,
    };
  },
};

export const reserve3AllocationFreezeGate: GateDefinition = {
  id: "reserve3-allocation-freeze",
  mandatory: true,
  async execute(context) {
    const allocation = allocateReserveStrata(context.fixture.strata);
    if (allocation.clearTop2.length !== 2 || allocation.ambiguousTop1.length !== 1) {
      return {
        gateId: "reserve3-allocation-freeze",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["RESERVE_ALLOCATION_WRONG_SIZE"],
      };
    }
    const frozen = new FrozenValue(allocation);
    frozen.freeze();
    try {
      frozen.replace(allocateReserveStrata(context.fixture.strata));
      return {
        gateId: "reserve3-allocation-freeze",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["POST_FREEZE_MUTATION_ALLOWED"],
      };
    } catch {
      return { gateId: "reserve3-allocation-freeze", mandatory: true, status: "PASS", reasonCodes: [] };
    }
  },
};

export const reserveReplacementGate: GateDefinition = {
  id: "reserve-replacement",
  mandatory: true,
  async execute(context) {
    const allocation = allocateReserveStrata(context.fixture.strata);
    const targets = [...allocation.clearTop2, ...allocation.ambiguousTop1];
    if (targets.length === 0) {
      return { gateId: "reserve-replacement", mandatory: true, status: "UNKNOWN", reasonCodes: ["NO_ALLOCATED_STRATUM"] };
    }
    // Attempt an accepted-path replacement for every allocated stratum:
    // a REPLACEMENT_UNAVAILABLE outcome, when correctly detected, is a PASS
    // with a reason code — it is never treated as a software defect.
    const acceptedReasonCodes = new Set<string>();
    for (const target of targets) {
      const accepted = replaceBeforeMeasurementFreeze({
        stratum: target,
        reserveCandidates: context.fixture.reserveCandidates,
        measurementFrozen: false,
        resultDriven: false,
      });
      for (const code of accepted.reasonCodes) acceptedReasonCodes.add(code);
    }
    const representative = targets[0];
    if (!representative) {
      return { gateId: "reserve-replacement", mandatory: true, status: "UNKNOWN", reasonCodes: ["NO_ALLOCATED_STRATUM"] };
    }
    const afterFreeze = replaceBeforeMeasurementFreeze({
      stratum: representative,
      reserveCandidates: context.fixture.reserveCandidates,
      measurementFrozen: true,
      resultDriven: false,
    });
    const resultDriven = replaceBeforeMeasurementFreeze({
      stratum: representative,
      reserveCandidates: context.fixture.reserveCandidates,
      measurementFrozen: false,
      resultDriven: true,
    });
    if (afterFreeze.status !== "REJECTED_POST_FREEZE" || resultDriven.status !== "REJECTED_RESULT_DRIVEN") {
      return {
        gateId: "reserve-replacement",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["NO_REDRAW_INVARIANT_VIOLATED"],
      };
    }
    return { gateId: "reserve-replacement", mandatory: true, status: "PASS", reasonCodes: [...acceptedReasonCodes] };
  },
};

export const secondExpertPlannedSubsetGate: GateDefinition = {
  id: "second-expert-planned-subset",
  mandatory: true,
  async execute(context) {
    const subsetA = selectSecondExpertSubset(context.fixture.main10, context.fixture.secondExpertSeedHex);
    const subsetB = selectSecondExpertSubset(context.fixture.main10, context.fixture.secondExpertSeedHex);
    if (subsetA.CLEAR.length !== 2 || subsetA.AMBIGUOUS.length !== 2) {
      return {
        gateId: "second-expert-planned-subset",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["SUBSET_WRONG_SIZE"],
      };
    }
    if (JSON.stringify(subsetA) !== JSON.stringify(subsetB)) {
      return {
        gateId: "second-expert-planned-subset",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["NON_DETERMINISTIC_SELECTION"],
      };
    }
    const frozen = new FrozenValue(subsetA);
    frozen.freeze();
    try {
      frozen.replace(selectSecondExpertSubset(context.fixture.main10, "f".repeat(64)));
      return {
        gateId: "second-expert-planned-subset",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["POST_FREEZE_REDRAW_ALLOWED"],
      };
    } catch {
      return { gateId: "second-expert-planned-subset", mandatory: true, status: "PASS", reasonCodes: [] };
    }
  },
};

export const freezeImmutabilityGate: GateDefinition = {
  id: "freeze-immutability",
  mandatory: true,
  async execute(context) {
    const checks: Array<() => void> = [
      () => {
        const v = new FrozenValue(context.fixture.main10);
        v.freeze();
        v.replace([...context.fixture.main10]);
      },
      () => {
        const v = new FrozenValue(selectSecondExpertSubset(context.fixture.main10, context.fixture.secondExpertSeedHex));
        v.freeze();
        v.replace({ CLEAR: [], AMBIGUOUS: [] });
      },
      () => {
        const v = createMeasurementContract();
        v.freeze();
        v.replace({ ...v.read() });
      },
    ];
    for (const check of checks) {
      try {
        check();
        return {
          gateId: "freeze-immutability",
          mandatory: true,
          status: "FAIL",
          reasonCodes: ["POST_FREEZE_MUTATION_ALLOWED"],
        };
      } catch {
        // expected: FROZEN_MUTATION
      }
    }
    return { gateId: "freeze-immutability", mandatory: true, status: "PASS", reasonCodes: [] };
  },
};

export const measurementPreregistrationFreezeGate: GateDefinition = {
  id: "measurement-preregistration-freeze",
  mandatory: true,
  async execute() {
    const contract = createMeasurementContract();
    contract.freeze();
    try {
      contract.replace({ ...contract.read() });
      return {
        gateId: "measurement-preregistration-freeze",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["POST_FREEZE_MUTATION_ALLOWED"],
      };
    } catch {
      return { gateId: "measurement-preregistration-freeze", mandatory: true, status: "PASS", reasonCodes: [] };
    }
  },
};

const HEX64 = /^[0-9a-f]{64}$/;

export const softwareSchemaProtocolFixtureGateHashingGate: GateDefinition = {
  id: "software-schema-protocol-fixture-gate-hashing",
  mandatory: true,
  async execute(context) {
    const values = Object.values(context.frozenHashes);
    if (values.length !== 6 || values.some((v) => !HEX64.test(v))) {
      return {
        gateId: "software-schema-protocol-fixture-gate-hashing",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["INCOMPLETE_FROZEN_HASHES"],
      };
    }
    return { gateId: "software-schema-protocol-fixture-gate-hashing", mandatory: true, status: "PASS", reasonCodes: [] };
  },
};

export const timingPauseInterruptionContractGate: GateDefinition = {
  id: "timing-pause-interruption-contract",
  mandatory: true,
  async execute() {
    const clock = new TestClock(new Date("2026-01-01T00:00:00.000Z"));
    const timer = new ActiveTimer(clock);
    timer.start();
    clock.advance(10_000);
    timer.pause();
    clock.advance(5_000);
    timer.resume();
    clock.advance(10_000);
    timer.flagFocusLoss();
    const report = timer.report(clock.now());
    if (report.activeDurationMs !== 20_000 || report.manualPauseDurationMs !== 5_000) {
      return {
        gateId: "timing-pause-interruption-contract",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["TIMING_INVARIANT_VIOLATED"],
      };
    }
    if (report.interruptionCandidateCount !== 1 || report.confirmedInterruptionCount !== 0) {
      return {
        gateId: "timing-pause-interruption-contract",
        mandatory: true,
        status: "FAIL",
        reasonCodes: ["AUTOMATIC_SIGNAL_REWROTE_ACTIVE_TIME"],
      };
    }
    return { gateId: "timing-pause-interruption-contract", mandatory: true, status: "PASS", reasonCodes: [] };
  },
};

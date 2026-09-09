import type { GateResult, FrozenHashSet } from "../domain/contracts.js";
import type { SyntheticFixtureSet } from "../fixtures/contracts.js";
import type { LocalTranscriptionPort } from "../ports/local-transcription-port.js";

export const MANDATORY_GATE_IDS = [
  "simulated-only-input",
  "evidence-anti-promotion",
  "consent-guardian-assent-rehearsal",
  "source-rights-rehearsal",
  "second-expert-qualification-rehearsal",
  "main10-composition-freeze",
  "reserve3-allocation-freeze",
  "reserve-replacement",
  "second-expert-planned-subset",
  "freeze-immutability",
  "measurement-preregistration-freeze",
  "software-schema-protocol-fixture-gate-hashing",
  "timing-pause-interruption-contract",
  "withdrawal-future-use-invalidation",
  "retention-deletion-receipts",
  "foundation-policy-rights-integration",
  "local-transcription-port",
  "external-egress-default-block",
  "canonical-provenance-anti-promotion",
  "metric-computation-contract",
  "stale-run-detection",
  "end-to-end-synthetic-rehearsal",
] as const;

export type MandatoryGateId = (typeof MANDATORY_GATE_IDS)[number];

export interface GateContext {
  fixture: SyntheticFixtureSet;
  frozenHashes: FrozenHashSet;
  /** Never set to true anywhere in this implementation (C11 LocalTranscription
   * choice): production/default wiring has no qualifying local adapter. A
   * test-only port injected for isolated port-contract unit tests is never
   * accepted here as satisfying the mandatory gate. */
  hasQualifyingLocalAdapter?: boolean;
  localTranscription?: LocalTranscriptionPort;
}

export interface GateDefinition {
  id: MandatoryGateId;
  mandatory: true;
  execute(context: GateContext, priorResults: readonly GateResult[]): Promise<GateResult>;
}

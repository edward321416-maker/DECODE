export type ClarityLabel = "CLEAR" | "AMBIGUOUS";
export type PrimaryFamily =
  | "FIGHT_SELECTION"
  | "POST_CONTACT_DECISION"
  | "TRADEABILITY_SPACING";
export type GoldVerdictLabel = "OPTIMAL" | "ACCEPTABLE" | "SUBOPTIMAL" | "POOR";

export interface Main10CaseFixture {
  caseId: string;
  clarity: ClarityLabel;
  family: PrimaryFamily;
  stratumId: string;
}

export interface StratumFixture {
  stratumId: string;
  clarity: ClarityLabel;
  family: PrimaryFamily;
  mainCount: number;
}

export interface ReserveCandidateFixture {
  caseId: string;
  stratumId: string;
  clarity: ClarityLabel;
  family: PrimaryFamily;
}

export type ConsentExpression = "PARTICIPATE" | "DO_NOT_PARTICIPATE" | "AMBIGUOUS";

export interface ConsentActorFixture {
  actorId: string;
  kind: "ADULT" | "MINOR";
  expression: ConsentExpression;
  guardianConsent?: boolean;
  guardianVerified?: boolean;
}

export type SyntheticSourceKind =
  | "FOUNDER_OWNED"
  | "FOUNDER_AUTHORIZED"
  | "CONSENTED_PILOT"
  | "PUBLIC_SCRAPE"
  | "UNCONSENTED_PILOT";

export interface SourceRecordFixture {
  sourceId: string;
  kind: SyntheticSourceKind;
}

export type RelationshipProvenance =
  | "TRAINING_PARTNER"
  | "COACHING_STAFF"
  | "SANCTIONING_OFFICIAL"
  | "INDEPENDENT_ANALYST"
  | "FORMER_COMPETITOR"
  | "OTHER_QUALIFIED";

export interface QualificationCandidateFixture {
  candidateId: string;
  relationshipProvenance: RelationshipProvenance;
  founderRecommended: boolean;
  evidenceLevel: "SUFFICIENT" | "INSUFFICIENT" | "NONE";
}

export interface FounderCaseOutcomeFixture {
  caseId: string;
  contextSufficiency: "SUFFICIENT" | "INSUFFICIENT_CONTEXT" | null;
  taxonomy: string;
  directionalAgreement: "AGREE" | "DISAGREE" | "UNCERTAIN" | "INSUFFICIENT_CONTEXT" | null;
  unnecessaryCoreFields: number;
}

export interface LocalTranscriptionFixtureData {
  fixtureId: string;
  pcm16leBase64: string;
  sampleRateHz: 16000;
}

export interface SyntheticFixtureSet {
  fixtureVersion: string;
  evaluationMode: "SELF_BENCHMARK";
  dataOrigin: "SIMULATED";
  rehearsal: true;
  main10: Main10CaseFixture[];
  strata: StratumFixture[];
  reserveCandidates: ReserveCandidateFixture[];
  secondExpertSeedHex: string;
  goldVerdicts: Record<string, GoldVerdictLabel>;
  consentActors: ConsentActorFixture[];
  sourceRecords: SourceRecordFixture[];
  qualificationCandidates: QualificationCandidateFixture[];
  founderCaseOutcomes: FounderCaseOutcomeFixture[];
  localTranscription: LocalTranscriptionFixtureData | null;
  actorId: string;
  externalEgressDestination: string;
}

export class FixtureValidationError extends Error {}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Structural allowlist boundary (D025/D026, Correction 7): validates only the
 * canonical SELF_BENCHMARK/SIMULATED/rehearsal envelope. This is never a
 * heuristic "does this look real" classifier — a value outside the exact
 * allowed set is rejected outright.
 */
export function validateSyntheticFixtureRecord(record: unknown): asserts record is SyntheticFixtureSet {
  if (!isPlainRecord(record)) {
    throw new FixtureValidationError("SIMULATED_ONLY: fixture record must be a plain object");
  }
  if (record.evaluationMode !== "SELF_BENCHMARK") {
    throw new FixtureValidationError("SIMULATED_ONLY: evaluationMode must be SELF_BENCHMARK");
  }
  if (record.dataOrigin !== "SIMULATED") {
    throw new FixtureValidationError("SIMULATED_ONLY: dataOrigin must be SIMULATED");
  }
  if (record.rehearsal !== true) {
    throw new FixtureValidationError("SIMULATED_ONLY: rehearsal must be true");
  }
  if (typeof record.fixtureVersion !== "string" || record.fixtureVersion.length === 0) {
    throw new FixtureValidationError("SIMULATED_ONLY: fixtureVersion is required");
  }
  if (!Array.isArray(record.main10)) {
    throw new FixtureValidationError("SIMULATED_ONLY: main10 must be an array");
  }
}

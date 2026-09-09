export type ClarityLabel = "CLEAR" | "AMBIGUOUS";
export type PrimaryFamily =
  | "FIGHT_SELECTION"
  | "POST_CONTACT_DECISION"
  | "TRADEABILITY_SPACING";
/** Canonical verdict vocabulary (Founder Gold and Second Expert alike). */
export const CANONICAL_VERDICT_VALUES = [
  "OPTIMAL",
  "ACCEPTABLE",
  "SUBOPTIMAL",
  "ERROR",
  "UNCERTAIN",
  "INSUFFICIENT_CONTEXT",
] as const;

export type GoldVerdictLabel = (typeof CANONICAL_VERDICT_VALUES)[number];

export function assertValidGoldVerdict(value: string): asserts value is GoldVerdictLabel {
  if (!(CANONICAL_VERDICT_VALUES as readonly string[]).includes(value)) {
    throw new FixtureValidationError(`invalid canonical verdict: ${value}`);
  }
}

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

/** Protocol §8's exact canonical relationship-provenance enum — six values only. */
export const RELATIONSHIP_PROVENANCE_VALUES = [
  "NONE",
  "FORMER_TEAMMATE",
  "CURRENT_TEAMMATE",
  "FORMER_COACHING_RELATION",
  "CURRENT_COACHING_RELATION",
  "OTHER",
] as const;

export type RelationshipProvenance = (typeof RELATIONSHIP_PROVENANCE_VALUES)[number];

export function assertValidRelationshipProvenance(value: string): asserts value is RelationshipProvenance {
  if (!(RELATIONSHIP_PROVENANCE_VALUES as readonly string[]).includes(value)) {
    throw new FixtureValidationError(`invalid RelationshipProvenance: ${value}`);
  }
}

export interface QualificationCandidateFixture {
  candidateId: string;
  relationshipProvenance: RelationshipProvenance;
  founderRecommended: boolean;
  evidenceLevel: "SUFFICIENT" | "INSUFFICIENT" | "NONE";
  disqualified?: boolean;
}

export interface FounderCaseOutcomeFixture {
  caseId: string;
  contextSufficiency: "SUFFICIENT" | "INSUFFICIENT_CONTEXT" | null;
  taxonomy: string;
  unnecessaryCoreFields: number;
}

/**
 * Protocol §16: one of the exactly 4 planned Second Expert slots. Each pair
 * preserves the Founder verdict and the Second Expert verdict separately —
 * directional agreement is computed from real verdict pairs, never from a
 * pre-baked AGREE/DISAGREE field. `secondExpertVerdict: null` means the
 * pair has not yet completed (incomplete coverage), never treated as a
 * disagreement or excluded silently.
 */
export interface SecondExpertPairFixture {
  caseId: string;
  founderVerdict: GoldVerdictLabel;
  secondExpertVerdict: GoldVerdictLabel | null;
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
  secondExpertPairs: SecondExpertPairFixture[];
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

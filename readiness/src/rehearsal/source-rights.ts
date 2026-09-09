import type { SourceRecordFixture, SyntheticSourceKind } from "../fixtures/contracts.js";
import { REHEARSAL_ARTIFACT, type RehearsalArtifact } from "./artifact.js";

const ALLOWED_KINDS: readonly SyntheticSourceKind[] = [
  "FOUNDER_OWNED",
  "FOUNDER_AUTHORIZED",
  "CONSENTED_PILOT",
];

export interface SourceRightsResult {
  accepted: boolean;
  reasonCodes: string[];
  artifact: RehearsalArtifact;
}

/** Protocol §3-4: only the explicitly allowed source pool is accepted;
 * arbitrary public scraping and unconsented Pilot sources are rejected. */
export function rehearseSourceRights(record: SourceRecordFixture): SourceRightsResult {
  if (ALLOWED_KINDS.includes(record.kind)) {
    return { accepted: true, reasonCodes: [], artifact: REHEARSAL_ARTIFACT };
  }
  return { accepted: false, reasonCodes: ["FORBIDDEN_SOURCE"], artifact: REHEARSAL_ARTIFACT };
}

/** Enumerates the allowed subset of a synthetic source pool. No rule here
 * forces any Founder/Pilot ratio — composition is accepted purely on a
 * per-record basis. */
export function enumerateAllowedPool(records: readonly SourceRecordFixture[]): SourceRecordFixture[] {
  return records.filter((r) => rehearseSourceRights(r).accepted);
}

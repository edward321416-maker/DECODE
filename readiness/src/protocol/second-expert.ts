import { createHash } from "node:crypto";
import type { ClarityLabel, Main10CaseFixture } from "../fixtures/contracts.js";

export class SecondExpertSeedError extends Error {}

function assertValidSeedHex(seedHex: string): void {
  if (!/^[0-9a-f]{64}$/.test(seedHex)) {
    throw new SecondExpertSeedError("selection seed must be exactly 64 lowercase hex characters (256 bits)");
  }
}

/**
 * Protocol §6: digest = SHA-256(selection_seed || case_id), byte-unambiguous:
 * the seed is decoded from its fixed 64-hex-char form to raw bytes and
 * concatenated with the UTF-8 bytes of the case id — never a delimited
 * string form, which the Protocol text's "||" is only shorthand for.
 */
export function secondExpertDigest(seedHex: string, caseId: string): string {
  assertValidSeedHex(seedHex);
  const bytes = Buffer.concat([Buffer.from(seedHex, "hex"), Buffer.from(caseId, "utf8")]);
  return createHash("sha256").update(bytes).digest("hex");
}

export interface SecondExpertSubset {
  CLEAR: string[];
  AMBIGUOUS: string[];
}

function selectByClarity(
  cases: readonly Main10CaseFixture[],
  clarity: ClarityLabel,
  seedHex: string,
): string[] {
  return cases
    .filter((c) => c.clarity === clarity)
    .map((c) => ({ caseId: c.caseId, digest: secondExpertDigest(seedHex, c.caseId) }))
    .sort((a, b) => (a.digest < b.digest ? -1 : a.digest > b.digest ? 1 : 0))
    .slice(0, 2)
    .map((entry) => entry.caseId);
}

/** Protocol §6: deterministic CLEAR-2 + AMBIGUOUS-2 selection; the same seed
 * and case set always reproduce the identical selection. */
export function selectSecondExpertSubset(
  cases: readonly Main10CaseFixture[],
  seedHex: string,
): SecondExpertSubset {
  return {
    CLEAR: selectByClarity(cases, "CLEAR", seedHex),
    AMBIGUOUS: selectByClarity(cases, "AMBIGUOUS", seedHex),
  };
}

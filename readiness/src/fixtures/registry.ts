import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { validateSyntheticFixtureRecord, type SyntheticFixtureSet } from "./contracts.js";

const FIXTURE_REGISTRY = {
  "full-ready-v1": new URL("../../fixtures/v1/full-ready.json", import.meta.url),
  "no-local-transcription-v1": new URL("../../fixtures/v1/no-local-transcription.json", import.meta.url),
  "replacement-unavailable-v1": new URL("../../fixtures/v1/replacement-unavailable.json", import.meta.url),
} as const;

export type FixtureId = keyof typeof FIXTURE_REGISTRY;

export class FixtureRegistryError extends Error {}

/**
 * The registry is a closed allowlist keyed by exact fixture id. An input is
 * never inspected as a filesystem path or URL — an unregistered id is
 * rejected outright, structurally, before any file access is attempted.
 */
export function loadFixtureSet(fixtureId: string): SyntheticFixtureSet {
  if (!(fixtureId in FIXTURE_REGISTRY)) {
    throw new FixtureRegistryError(`UNREGISTERED_FIXTURE: ${fixtureId}`);
  }
  const url = FIXTURE_REGISTRY[fixtureId as FixtureId];
  const raw = readFileSync(fileURLToPath(url), "utf8");
  const parsed: unknown = JSON.parse(raw);
  validateSyntheticFixtureRecord(parsed);
  return parsed;
}

export function listFixtureIds(): FixtureId[] {
  return Object.keys(FIXTURE_REGISTRY) as FixtureId[];
}

export function serializedFixtureBytes(fixtureId: FixtureId): string {
  const url = FIXTURE_REGISTRY[fixtureId];
  return readFileSync(fileURLToPath(url), "utf8");
}

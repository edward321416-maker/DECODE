import { computeFrozenHashes, type FrozenHashInput } from "./frozen-hashes.js";
import type { FrozenHashSet } from "./contracts.js";
import type { SyntheticFixtureSet } from "../fixtures/contracts.js";

/** Static components of the frozen-hash input set. These identify the
 * readiness/foundation source, protocol, and gate-catalog versions this
 * implementation was built against — bumped only when those actually
 * change, never per-run. */
export const STATIC_FROZEN_HASH_INPUTS = {
  readinessSourceManifest: "readiness-source-v1",
  foundationSourceManifest: "foundation-source-v1",
  protocolDocument: "protocol-v1",
  schemaVersion: "1.0.0",
  gateCatalogBytes: "gate-catalog-v1",
} as const;

export function buildFrozenHashInput(fixture: SyntheticFixtureSet): FrozenHashInput {
  return {
    ...STATIC_FROZEN_HASH_INPUTS,
    fixtureSetBytes: JSON.stringify(fixture),
  };
}

export function computeFrozenHashesForFixture(fixture: SyntheticFixtureSet): FrozenHashSet {
  return computeFrozenHashes(buildFrozenHashInput(fixture));
}

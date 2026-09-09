import { createHash } from "node:crypto";
import type { FrozenHashSet } from "./contracts.js";

export function sha256Utf8(value: string): string {
  return createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");
}

/** Recursively sorts object keys so semantically identical content always
 * serializes identically, regardless of construction/traversal order. */
export function canonicalJsonStringify(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortDeep);
  }
  if (value !== null && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

export interface FrozenHashInput {
  readinessSourceManifest: string;
  foundationSourceManifest: string;
  protocolDocument: string;
  schemaVersion: string;
  fixtureSetBytes: string;
  gateCatalogBytes: string;
}

export function computeFrozenHashes(input: FrozenHashInput): FrozenHashSet {
  return {
    readinessSource: sha256Utf8(input.readinessSourceManifest),
    foundationSource: sha256Utf8(input.foundationSourceManifest),
    protocol: sha256Utf8(input.protocolDocument),
    schema: sha256Utf8(input.schemaVersion),
    fixtureSet: sha256Utf8(input.fixtureSetBytes),
    gateDefinition: sha256Utf8(input.gateCatalogBytes),
  };
}

export function frozenHashSetsEqual(a: FrozenHashSet, b: FrozenHashSet): boolean {
  return (
    a.readinessSource === b.readinessSource &&
    a.foundationSource === b.foundationSource &&
    a.protocol === b.protocol &&
    a.schema === b.schema &&
    a.fixtureSet === b.fixtureSet &&
    a.gateDefinition === b.gateDefinition
  );
}

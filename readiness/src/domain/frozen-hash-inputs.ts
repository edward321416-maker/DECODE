import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { computeFrozenHashes, canonicalJsonStringify, type FrozenHashInput } from "./frozen-hashes.js";
import type { FrozenHashSet } from "./contracts.js";
import type { SyntheticFixtureSet } from "../fixtures/contracts.js";

const here = path.dirname(fileURLToPath(import.meta.url)); // readiness/src/domain
const DEFAULT_READINESS_SRC_DIR = path.resolve(here, ".."); // readiness/src
const DEFAULT_GATE_CATALOG_DIR = path.resolve(here, "..", "gates"); // readiness/src/gates
const DEFAULT_FOUNDATION_SRC_DIR = path.resolve(here, "..", "..", "..", "foundation", "src");
const DEFAULT_PROTOCOL_DOC_PATH = path.resolve(
  here,
  "..",
  "..",
  "..",
  "docs",
  "superpowers",
  "specs",
  "2026-09-06-decode-10-case-actual-test-protocol-v1.md",
);

export const SCHEMA_VERSION = "1.0.0";

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function listFilesSorted(dir: string): string[] {
  const files: string[] = [];
  const walk = (d: string): void => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push(full);
    }
  };
  walk(dir);
  return files.sort();
}

/**
 * Deterministic, content-derived manifest over every file in `dir`: sorted
 * relative paths concatenated with each file's actual normalized bytes.
 * Any real content change anywhere in the tree changes this manifest —
 * traversal order never affects the result (Task 2's original design note).
 */
function directoryManifest(dir: string): string {
  return listFilesSorted(dir)
    .map((f) => `${path.relative(dir, f).replace(/\\/g, "/")}:${normalizeText(readFileSync(f, "utf8"))}`)
    .join("\n---\n");
}

/** D034 input 1: readiness/ source, content-derived (defaults to the actual live readiness/src tree). */
export function readinessSourceManifest(dir: string = DEFAULT_READINESS_SRC_DIR): string {
  return directoryManifest(dir);
}

/** D034 input 2: foundation/ dependency source, content-derived (defaults to the actual live foundation/src tree). */
export function foundationSourceManifest(dir: string = DEFAULT_FOUNDATION_SRC_DIR): string {
  return directoryManifest(dir);
}

/** D034 input 3: the actual approved 10-Case ACTUAL TEST Protocol document bytes. */
export function protocolDocumentContent(filePath: string = DEFAULT_PROTOCOL_DOC_PATH): string {
  return normalizeText(readFileSync(filePath, "utf8"));
}

/** D034 input 6: the actual canonical gate-definition source (readiness/src/gates/), content-derived. */
export function gateCatalogManifest(dir: string = DEFAULT_GATE_CATALOG_DIR): string {
  return directoryManifest(dir);
}

export interface FrozenHashInputOverrides {
  readinessSourceDir?: string;
  foundationSourceDir?: string;
  protocolDocPath?: string;
  gateCatalogDir?: string;
}

/**
 * All six D034 inputs are content-derived from the actual canonical
 * artifacts they name — never manually-bumped placeholder strings. Any
 * genuine change to readiness/ source, the foundation/ dependency, the
 * approved Protocol document, the schema version, the serialized canonical
 * fixture, or the gate-definition source changes its corresponding hash,
 * which is exactly what stale-run detection (D034) depends on.
 */
export function buildFrozenHashInput(
  fixture: SyntheticFixtureSet,
  overrides: FrozenHashInputOverrides = {},
): FrozenHashInput {
  return {
    readinessSourceManifest: readinessSourceManifest(overrides.readinessSourceDir),
    foundationSourceManifest: foundationSourceManifest(overrides.foundationSourceDir),
    protocolDocument: protocolDocumentContent(overrides.protocolDocPath),
    schemaVersion: SCHEMA_VERSION,
    fixtureSetBytes: canonicalJsonStringify(fixture),
    gateCatalogBytes: gateCatalogManifest(overrides.gateCatalogDir),
  };
}

export function computeFrozenHashesForFixture(
  fixture: SyntheticFixtureSet,
  overrides: FrozenHashInputOverrides = {},
): FrozenHashSet {
  return computeFrozenHashes(buildFrozenHashInput(fixture, overrides));
}

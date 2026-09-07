import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MigrationManifestError,
  assertNonDestructive,
  assertRollbackSafe,
  compareSemver,
  parseSemver,
  validateManifestEntry,
  type MigrationManifestEntry,
} from "../src/migrations/manifest.js";

function entry(overrides: Partial<MigrationManifestEntry> = {}): MigrationManifestEntry {
  return {
    migrationId: "m1",
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    backwardReadCompatible: true,
    forwardReadCompatible: true,
    minimumCodeVersion: "1.0.0",
    rollbackCodeVersionMin: "1.0.0",
    destructive: false,
    status: "PENDING",
    ...overrides,
  };
}

// Invariant 56: full semver comparison works.
test("invariant 56: semver comparison orders major/minor/patch correctly", () => {
  assert.equal(compareSemver("1.0.0", "1.0.0"), 0);
  assert.ok(compareSemver("2.0.0", "1.9.9") > 0);
  assert.ok(compareSemver("1.2.0", "1.10.0") < 0);
  assert.ok(compareSemver("1.0.1", "1.0.0") > 0);
});

// Invariant 57: malformed semver rejected.
test("invariant 57: malformed semver is rejected", () => {
  assert.throws(() => parseSemver("1.0"), MigrationManifestError);
  assert.throws(() => parseSemver("v1.0.0"), MigrationManifestError);
  assert.throws(() => parseSemver("1.0.0-beta"), MigrationManifestError);
});

// Invariant 58: unsafe rollback rejected.
test("invariant 58: unsafe rollback is rejected", () => {
  assert.doesNotThrow(() => assertRollbackSafe("1.1.0", "1.0.0"));
  assert.throws(() => assertRollbackSafe("0.9.0", "1.0.0"), MigrationManifestError);
});

// Invariant 59: destructive migration rejected by non-destructive guard.
test("invariant 59: destructive migration is rejected by the non-destructive guard", () => {
  assert.doesNotThrow(() => assertNonDestructive(entry({ destructive: false })));
  assert.throws(() => assertNonDestructive(entry({ destructive: true })), MigrationManifestError);
});

test("validateManifestEntry rejects a destructive entry with otherwise-valid versions", () => {
  assert.throws(() => validateManifestEntry(entry({ destructive: true })), MigrationManifestError);
  assert.doesNotThrow(() => validateManifestEntry(entry()));
});

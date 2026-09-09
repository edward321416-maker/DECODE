import assert from "node:assert/strict";
import test from "node:test";
import { loadFixtureSet } from "../src/fixtures/registry.js";
import { validateSyntheticFixtureRecord, type SyntheticFixtureSet } from "../src/fixtures/contracts.js";
import { computeFrozenHashes, sha256Utf8, canonicalJsonStringify } from "../src/domain/frozen-hashes.js";

function validFixtureRecord(): SyntheticFixtureSet {
  return loadFixtureSet("full-ready-v1");
}

test("unknown fixture id is rejected instead of inspected heuristically", () => {
  assert.throws(() => loadFixtureSet("/tmp/player.vod"), /UNREGISTERED_FIXTURE/);
  assert.throws(() => loadFixtureSet("https://example.com/vod"), /UNREGISTERED_FIXTURE/);
});

test("REAL origin cannot enter the readiness fixture schema", () => {
  const unsafe = { ...validFixtureRecord(), dataOrigin: "REAL" };
  assert.throws(() => validateSyntheticFixtureRecord(unsafe), /SIMULATED_ONLY/);
});

test("registered fixture ids load and validate", () => {
  const fixture = loadFixtureSet("full-ready-v1");
  assert.equal(fixture.dataOrigin, "SIMULATED");
  assert.equal(fixture.evaluationMode, "SELF_BENCHMARK");
  assert.equal(fixture.rehearsal, true);
  assert.equal(fixture.main10.length, 10);
});

test("frozen hashes are deterministic and independent of key order", () => {
  const inputA = {
    readinessSourceManifest: "a",
    foundationSourceManifest: "b",
    protocolDocument: "c",
    schemaVersion: "1.0.0",
    fixtureSetBytes: canonicalJsonStringify({ z: 1, a: 2 }),
    gateCatalogBytes: "gate-catalog",
  };
  const inputB = {
    readinessSourceManifest: "a",
    foundationSourceManifest: "b",
    protocolDocument: "c",
    schemaVersion: "1.0.0",
    fixtureSetBytes: canonicalJsonStringify({ a: 2, z: 1 }),
    gateCatalogBytes: "gate-catalog",
  };
  assert.deepEqual(computeFrozenHashes(inputA), computeFrozenHashes(inputB));
  assert.equal(sha256Utf8("x").length, 64);
});

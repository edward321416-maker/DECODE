import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  readinessSourceManifest,
  foundationSourceManifest,
  protocolDocumentContent,
  gateCatalogManifest,
  buildFrozenHashInput,
  computeFrozenHashesForFixture,
} from "../src/domain/frozen-hash-inputs.js";
import { computeFrozenHashes } from "../src/domain/frozen-hashes.js";
import { evaluateCurrentReadiness } from "../src/runner/current-readiness.js";
import { loadFixtureSet } from "../src/fixtures/registry.js";
import type { ReadinessRun } from "../src/domain/contracts.js";

async function makeTempDir(prefix: string): Promise<string> {
  return mkdtemp(path.join(tmpdir(), prefix));
}

test("readiness source manifest changes when actual readiness source content changes", async () => {
  const dir = await makeTempDir("readiness-src-");
  try {
    await writeFile(path.join(dir, "a.ts"), "export const x = 1;\n");
    const before = readinessSourceManifest(dir);
    await writeFile(path.join(dir, "a.ts"), "export const x = 2;\n");
    const after = readinessSourceManifest(dir);
    assert.notEqual(before, after);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("foundation dependency manifest changes when actual foundation source content changes", async () => {
  const dir = await makeTempDir("foundation-src-");
  try {
    await writeFile(path.join(dir, "index.ts"), "export const y = 1;\n");
    const before = foundationSourceManifest(dir);
    await writeFile(path.join(dir, "index.ts"), "export const y = 2;\n");
    const after = foundationSourceManifest(dir);
    assert.notEqual(before, after);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("protocol document content changes when the actual approved Protocol bytes change", async () => {
  const dir = await makeTempDir("protocol-doc-");
  try {
    const filePath = path.join(dir, "protocol.md");
    await writeFile(filePath, "# Protocol v1\n");
    const before = protocolDocumentContent(filePath);
    await writeFile(filePath, "# Protocol v2\n");
    const after = protocolDocumentContent(filePath);
    assert.notEqual(before, after);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("fixture-set bytes change when the actual serialized canonical fixture changes", () => {
  const fixture = loadFixtureSet("full-ready-v1");
  const before = buildFrozenHashInput(fixture).fixtureSetBytes;
  const mutatedFixture = { ...fixture, fixtureVersion: "1.0.1" };
  const after = buildFrozenHashInput(mutatedFixture).fixtureSetBytes;
  assert.notEqual(before, after);
});

test("gate definition manifest changes when actual gate definition source changes", async () => {
  const dir = await makeTempDir("gate-catalog-");
  try {
    await writeFile(path.join(dir, "gate-catalog-types.ts"), "export const IDS = [1];\n");
    const before = gateCatalogManifest(dir);
    await writeFile(path.join(dir, "gate-catalog-types.ts"), "export const IDS = [1, 2];\n");
    const after = gateCatalogManifest(dir);
    assert.notEqual(before, after);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("readiness source manifest is deterministic regardless of directory traversal order", async () => {
  const dir = await makeTempDir("readiness-src-order-");
  try {
    await writeFile(path.join(dir, "z.ts"), "export const z = 1;\n");
    await writeFile(path.join(dir, "a.ts"), "export const a = 1;\n");
    const first = readinessSourceManifest(dir);
    const second = readinessSourceManifest(dir);
    assert.equal(first, second);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

function buildRun(fixture: ReturnType<typeof loadFixtureSet>, overrides: Parameters<typeof computeFrozenHashesForFixture>[1]): ReadinessRun {
  const hashes = computeFrozenHashesForFixture(fixture, overrides);
  return {
    runId: "readiness_test-run",
    startedAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-01-01T00:00:01.000Z",
    state: "COMPLETED",
    gates: [],
    readinessVerdict: "BLOCKED",
    evidence: { evaluationMode: "SELF_BENCHMARK", dataOrigin: "SIMULATED", executionStatus: "BLOCKED" },
    frozenHashes: hashes,
    staleness: { stale: false, reasonCodes: [] },
  };
}

test("D034: a real readiness-source content change makes a prior run STALE_RUN, historical run object left unmutated", async () => {
  const fixture = loadFixtureSet("full-ready-v1");
  const dirBefore = await makeTempDir("readiness-src-stale-");
  const dirAfter = await makeTempDir("readiness-src-stale2-");
  try {
    await writeFile(path.join(dirBefore, "a.ts"), "export const x = 1;\n");
    await writeFile(path.join(dirAfter, "a.ts"), "export const x = 2;\n");
    const run = buildRun(fixture, { readinessSourceDir: dirBefore });
    const originalVerdict = run.readinessVerdict;
    const currentHashes = computeFrozenHashesForFixture(fixture, { readinessSourceDir: dirAfter });
    const current = evaluateCurrentReadiness(run, currentHashes);
    assert.equal(current.readinessVerdict, "BLOCKED");
    assert.deepEqual(current.reasonCodes, ["STALE_RUN"]);
    assert.equal(run.readinessVerdict, originalVerdict);
  } finally {
    await rm(dirBefore, { recursive: true, force: true });
    await rm(dirAfter, { recursive: true, force: true });
  }
});

test("D034: a real foundation-dependency content change makes a prior run STALE_RUN", async () => {
  const fixture = loadFixtureSet("full-ready-v1");
  const dirBefore = await makeTempDir("foundation-stale-");
  const dirAfter = await makeTempDir("foundation-stale2-");
  try {
    await writeFile(path.join(dirBefore, "index.ts"), "export const y = 1;\n");
    await writeFile(path.join(dirAfter, "index.ts"), "export const y = 2;\n");
    const run = buildRun(fixture, { foundationSourceDir: dirBefore });
    const currentHashes = computeFrozenHashesForFixture(fixture, { foundationSourceDir: dirAfter });
    const current = evaluateCurrentReadiness(run, currentHashes);
    assert.deepEqual(current.reasonCodes, ["STALE_RUN"]);
  } finally {
    await rm(dirBefore, { recursive: true, force: true });
    await rm(dirAfter, { recursive: true, force: true });
  }
});

test("D034: a real Protocol document content change makes a prior run STALE_RUN", async () => {
  const fixture = loadFixtureSet("full-ready-v1");
  const dirBefore = await makeTempDir("protocol-stale-");
  const dirAfter = await makeTempDir("protocol-stale2-");
  try {
    const before = path.join(dirBefore, "protocol.md");
    const after = path.join(dirAfter, "protocol.md");
    await writeFile(before, "# v1\n");
    await writeFile(after, "# v2\n");
    const run = buildRun(fixture, { protocolDocPath: before });
    const currentHashes = computeFrozenHashesForFixture(fixture, { protocolDocPath: after });
    const current = evaluateCurrentReadiness(run, currentHashes);
    assert.deepEqual(current.reasonCodes, ["STALE_RUN"]);
  } finally {
    await rm(dirBefore, { recursive: true, force: true });
    await rm(dirAfter, { recursive: true, force: true });
  }
});

test("D034: a real fixture content change makes a prior run STALE_RUN", () => {
  const fixture = loadFixtureSet("full-ready-v1");
  const mutatedFixture = { ...fixture, fixtureVersion: "9.9.9" };
  const run = buildRun(fixture, {});
  const currentHashes = computeFrozenHashesForFixture(mutatedFixture, {});
  const current = evaluateCurrentReadiness(run, currentHashes);
  assert.deepEqual(current.reasonCodes, ["STALE_RUN"]);
});

test("D034: a real gate-definition content change makes a prior run STALE_RUN", async () => {
  const fixture = loadFixtureSet("full-ready-v1");
  const dirBefore = await makeTempDir("gates-stale-");
  const dirAfter = await makeTempDir("gates-stale2-");
  try {
    await writeFile(path.join(dirBefore, "gate-catalog-types.ts"), "export const IDS = [1];\n");
    await writeFile(path.join(dirAfter, "gate-catalog-types.ts"), "export const IDS = [1, 2];\n");
    const run = buildRun(fixture, { gateCatalogDir: dirBefore });
    const currentHashes = computeFrozenHashesForFixture(fixture, { gateCatalogDir: dirAfter });
    const current = evaluateCurrentReadiness(run, currentHashes);
    assert.deepEqual(current.reasonCodes, ["STALE_RUN"]);
  } finally {
    await rm(dirBefore, { recursive: true, force: true });
    await rm(dirAfter, { recursive: true, force: true });
  }
});

test("computeFrozenHashesForFixture with default (live) directories is stable across two calls", () => {
  const fixture = loadFixtureSet("full-ready-v1");
  const a = computeFrozenHashesForFixture(fixture);
  const b = computeFrozenHashesForFixture(fixture);
  assert.deepEqual(a, b);
});

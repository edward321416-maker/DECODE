import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseCliArgs, runCli, CliArgumentError } from "../src/cli.js";
import { writeRunArtifact, serializeRunArtifact, RunArtifactError } from "../src/persistence/run-artifact.js";
import { runReadiness } from "../src/runner/readiness-runner.js";

test("only command 'run' exists", () => {
  assert.throws(() => parseCliArgs(["scan"]), CliArgumentError);
  assert.throws(() => parseCliArgs([]), CliArgumentError);
});

test("--scenario is required and must resolve through the registry", () => {
  assert.throws(() => parseCliArgs(["run"]), CliArgumentError);
  assert.throws(() => parseCliArgs(["run", "--scenario", "not-a-real-fixture"]), CliArgumentError);
  const parsed = parseCliArgs(["run", "--scenario", "full-ready-v1"]);
  assert.equal(parsed.scenario, "full-ready-v1");
});

test("no --vod, --url, --input-file, or arbitrary media argument exists", () => {
  assert.throws(() => parseCliArgs(["run", "--scenario", "full-ready-v1", "--vod", "/tmp/x.mp4"]), CliArgumentError);
  assert.throws(() => parseCliArgs(["run", "--scenario", "full-ready-v1", "--url", "https://example.com"]), CliArgumentError);
  assert.throws(() => parseCliArgs(["run", "--scenario", "full-ready-v1", "--input-file", "/tmp/x"]), CliArgumentError);
});

test("unknown arguments exit non-zero without creating an artifact", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "readiness-cli-"));
  try {
    const result = await runCli(["run", "--scenario", "full-ready-v1", "--bogus", "x", "--output-dir", dir]);
    assert.equal(result.exitCode, 1);
    const { readdir } = await import("node:fs/promises");
    const entries = await readdir(dir);
    assert.deepEqual(entries, []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("writeRunArtifact uses exclusive create and never overwrites", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "readiness-artifact-"));
  try {
    const run = await runReadiness({ fixtureId: "full-ready-v1" });
    const first = await writeRunArtifact(run, dir);
    await assert.rejects(() => writeRunArtifact(run, dir), RunArtifactError);
    const content = await readFile(first, "utf8");
    assert.ok(content.endsWith("\n"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("serialized envelope includes exactly the stable schema fields", async () => {
  const run = await runReadiness({ fixtureId: "full-ready-v1" });
  const json = serializeRunArtifact(run);
  const parsed = JSON.parse(json);
  assert.deepEqual(Object.keys(parsed).sort(), [
    "completedAt",
    "evidence",
    "frozenHashes",
    "gates",
    "readinessVerdict",
    "runId",
    "schemaVersion",
    "staleness",
    "startedAt",
  ]);
  assert.equal(parsed.schemaVersion, "1.0.0");
});

test("CLI default local-transcription behavior: normal wiring completes as BLOCKED", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "readiness-cli-"));
  try {
    const result = await runCli(["run", "--scenario", "full-ready-v1", "--output-dir", dir]);
    assert.equal(result.exitCode, 0);
    assert.ok(result.run);
    assert.equal(result.run.readinessVerdict, "BLOCKED");
    const localTranscription = result.run.gates.find((g) => g.gateId === "local-transcription-port");
    assert.ok(localTranscription);
    assert.equal(localTranscription.status, "NOT_EXECUTED");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

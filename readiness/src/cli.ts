import { pathToFileURL } from "node:url";
import type { ReadinessRun } from "./domain/contracts.js";
import { runReadiness } from "./runner/readiness-runner.js";
import { writeRunArtifact, serializeRunArtifact } from "./persistence/run-artifact.js";
import { listFixtureIds, type FixtureId } from "./fixtures/registry.js";

export class CliArgumentError extends Error {}

export interface ParsedCliArgs {
  command: "run";
  scenario: FixtureId;
  outputDir?: string;
}

const KNOWN_FLAGS = new Set(["--scenario", "--output-dir"]);

/** Structural CLI surface: exactly one command ("run"), exactly two known
 * flags. There is no --vod/--url/--input-file or any other arbitrary
 * media/path/URL entry point — an unrecognized flag is rejected outright. */
export function parseCliArgs(argv: readonly string[]): ParsedCliArgs {
  const [command, ...rest] = argv;
  if (command !== "run") {
    throw new CliArgumentError(`unknown command: ${command ?? "<none>"}`);
  }
  let scenario: string | undefined;
  let outputDir: string | undefined;
  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    if (token === undefined || !KNOWN_FLAGS.has(token)) {
      throw new CliArgumentError(`unknown argument: ${token}`);
    }
    const value = rest[i + 1];
    if (value === undefined) {
      throw new CliArgumentError(`missing value for ${token}`);
    }
    if (token === "--scenario") scenario = value;
    if (token === "--output-dir") outputDir = value;
    i += 1;
  }
  if (!scenario) {
    throw new CliArgumentError("--scenario is required");
  }
  const fixtureIds: readonly string[] = listFixtureIds();
  if (!fixtureIds.includes(scenario)) {
    throw new CliArgumentError(`UNREGISTERED_FIXTURE: ${scenario}`);
  }
  return { command: "run", scenario: scenario as FixtureId, outputDir };
}

export interface CliResult {
  exitCode: number;
  run?: ReadinessRun;
  artifactPath?: string;
  output: string;
}

export async function runCli(argv: readonly string[]): Promise<CliResult> {
  let parsed: ParsedCliArgs;
  try {
    parsed = parseCliArgs(argv);
  } catch (err) {
    return { exitCode: 1, output: err instanceof Error ? err.message : String(err) };
  }
  const run = await runReadiness({ fixtureId: parsed.scenario });
  const output = serializeRunArtifact(run);
  let artifactPath: string | undefined;
  if (parsed.outputDir) {
    artifactPath = await writeRunArtifact(run, parsed.outputDir);
  }
  return { exitCode: 0, run, artifactPath, output };
}

// Executes only when invoked directly as a script (`npm run readiness -- ...`),
// never when imported by tests.
const isDirectExecution = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(entry).href;
})();

if (isDirectExecution) {
  const argv = process.argv.slice(2);
  const result = await runCli(argv);
  process.stdout.write(result.output);
  process.exitCode = result.exitCode;
}

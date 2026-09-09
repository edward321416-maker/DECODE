import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { ReadinessRun } from "../domain/contracts.js";

export class RunArtifactError extends Error {}

export interface RunArtifactEnvelope {
  schemaVersion: string;
  runId: string;
  startedAt: string | null;
  completedAt: string | null;
  gates: ReadinessRun["gates"];
  readinessVerdict: ReadinessRun["readinessVerdict"];
  evidence: ReadinessRun["evidence"];
  frozenHashes: ReadinessRun["frozenHashes"];
  staleness: ReadinessRun["staleness"];
}

export function toRunArtifactEnvelope(run: ReadinessRun): RunArtifactEnvelope {
  return {
    schemaVersion: "1.0.0",
    runId: run.runId,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    gates: run.gates,
    readinessVerdict: run.readinessVerdict,
    evidence: run.evidence,
    frozenHashes: run.frozenHashes,
    staleness: run.staleness,
  };
}

export function serializeRunArtifact(run: ReadinessRun): string {
  return JSON.stringify(toRunArtifactEnvelope(run), null, 2) + "\n";
}

/** Exclusive create only — a same-path artifact is never overwritten
 * (D033: valid completed runs are immutable history). */
export async function writeRunArtifact(run: ReadinessRun, outputDir: string): Promise<string> {
  const filePath = path.join(outputDir, `${run.runId}.json`);
  const content = serializeRunArtifact(run);
  try {
    await writeFile(filePath, content, { encoding: "utf8", flag: "wx" });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "EEXIST") {
      throw new RunArtifactError("RUN_ARTIFACT_EXISTS");
    }
    throw err;
  }
  return filePath;
}

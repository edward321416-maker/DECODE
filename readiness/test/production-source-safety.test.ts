import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src");

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listTsFiles(full));
    else if (entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

test("no readiness production source file constructs an assignable REAL or ACTUAL_TEST provenance literal", () => {
  const offenders: string[] = [];
  for (const file of listTsFiles(srcDir)) {
    const content = readFileSync(file, "utf8");
    if (content.includes('"REAL"') || content.includes('"ACTUAL_TEST"')) {
      offenders.push(path.relative(srcDir, file));
    }
  }
  assert.deepEqual(offenders, [], `production source must never construct DataOrigin=REAL or EvaluationMode=ACTUAL_TEST: ${offenders.join(", ")}`);
});

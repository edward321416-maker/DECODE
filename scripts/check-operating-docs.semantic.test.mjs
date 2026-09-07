/**
 * Team OS Stage 3 semantic mutation tests.
 * Usage: node scripts/check-operating-docs.semantic.test.mjs
 * Node built-ins only (node:test, node:assert). Importing check-operating-docs.mjs here
 * does not execute the CLI checker — main() only runs under direct execution.
 *
 * Validates repository text/contracts only. Does not prove Codex/Claude Code/human
 * obedience, runtime/application behavior, or ACTUAL TEST success.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalTexts, collectTeamOsSemanticChecks } from "./check-operating-docs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Every file collectTeamOsSemanticChecks reads, built independently of docs/PUBLICATION_FILES.json
// so this test does not depend on that inventory being updated first.
const SEMANTIC_FILES = [
  "docs/PROJECT_OPERATING_MANUAL.md", "docs/COLLABORATION_RULES.md",
  "AGENTS.md", "CLAUDE.md",
  "docs/templates/CHANGE_REPORT_TEMPLATE.md", "docs/templates/DECISION_RECORD_TEMPLATE.md",
  "docs/templates/DESIGN_SPEC_TEMPLATE.md", "docs/templates/HANDOFF_TEMPLATE.md",
  "docs/templates/IMPLEMENTATION_PLAN_TEMPLATE.md", "docs/templates/PLANNING_BRIEF_TEMPLATE.md",
  "docs/templates/README.md", "docs/templates/RESEARCH_NOTE_TEMPLATE.md",
  "docs/templates/TASK_BRIEF_TEMPLATE.md", "docs/templates/TEST_EVIDENCE_TEMPLATE.md",
  "docs/DEVELOPMENT_RULES.md", "docs/DOCUMENTATION_RULES.md",
  "docs/AI_OPERATING_POLICY.md", "docs/PUBLICATION_POLICY.md",
  ".github/system_prompts/codex_system_prompt.md", ".github/system_prompts/chatgpt_custom_instructions.md",
  "handoff/CHATGPT_TO_CODEX.md", "handoff/CODEX_TO_CHATGPT.md",
  "README.md", "docs/PROJECT_BRIEF.md", "docs/PRODUCT_SPEC.md", "docs/DECISION_DATASET_SPEC.md",
  "data/schemas/README.md", "docs/EXPERIMENT_PROTOCOL.md",
  "docs/DECISIONS.md", "docs/CURRENT_STATUS.md",
];

const baseline = loadCanonicalTexts(root, SEMANTIC_FILES);

function withMutation(file, mutate) {
  const m = new Map(baseline);
  const current = m.get(file);
  assert.ok(current !== undefined, `baseline must contain ${file}`);
  const mutated = mutate(current);
  assert.notEqual(mutated, current, `mutation for ${file} must actually change the content`);
  m.set(file, mutated);
  return m;
}

function findCheck(results, id) {
  return results.find((r) => r.id === id);
}

// --- Positive / control cases -------------------------------------------------------

test("baseline: every Team OS semantic check passes on unmutated repository content", () => {
  const results = collectTeamOsSemanticChecks(baseline);
  assert.ok(results.length > 0, "collectTeamOsSemanticChecks must return checks");
  const failed = results.filter((r) => !r.passed);
  assert.deepEqual(failed, [], `expected no failures on baseline, got: ${JSON.stringify(failed)}`);
});

test("positive control: concise historical EXPERIMENT_PROTOCOL.md passes all protocol-* checks", () => {
  const results = collectTeamOsSemanticChecks(baseline);
  for (const id of [
    "protocol-status-historical", "protocol-no-slot-table", "protocol-no-execution-heading",
    "protocol-no-measurement-heading", "protocol-no-go-stop-heading",
    "protocol-no-required-outputs-heading", "protocol-concise-size",
  ]) {
    const r = findCheck(results, id);
    assert.ok(r, `check ${id} must exist`);
    assert.equal(r.passed, true, `expected ${id} to pass on the concise historical shim (not just any "historical" text)`);
  }
});

test("positive control: docs/DECISIONS.md D001 historical Codex-provenance wording does not trip stale-codex-exclusive", () => {
  // DECISIONS.md is deliberately outside the group-E scan (it preserves historical decision
  // text by design). Inserting the exact banned phrase there must not fail the check — this
  // guards the exclusion itself against an accidental future regression.
  const mutated = withMutation("docs/DECISIONS.md", (c) => c + "\nCodex is the AI/Engineering Lead.\n");
  const results = collectTeamOsSemanticChecks(mutated);
  assert.equal(findCheck(results, "stale-codex-exclusive").passed, true);
});

test("positive control: handoff/CODEX_TO_CHATGPT.md's own audit-trail phrasing does not trip stale-codex-exclusive", () => {
  // Completion reports narrate what stale phrasing was found/fixed in past stages; they are
  // not instruction sources, so they are excluded from the group-E scan.
  const mutated = withMutation("handoff/CODEX_TO_CHATGPT.md", (c) => c + "\nCodex is the AI/Engineering Lead.\n");
  const results = collectTeamOsSemanticChecks(mutated);
  assert.equal(findCheck(results, "stale-codex-exclusive").passed, true);
});

// --- RED mutation scenarios -----------------------------------------------------------

const MUTATIONS = [
  { name: "1. Manual ACTIVE status removed", file: "docs/PROJECT_OPERATING_MANUAL.md",
    mutate: (c) => c.replace("Status: ACTIVE OPERATING POLICY", "Status: DRAFT POLICY"),
    expectId: "pom-status-active" },
  { name: "2. Manual D021 authority removed", file: "docs/PROJECT_OPERATING_MANUAL.md",
    mutate: (c) => c.replace("Authority: D021 / U-DECODE-TEAM-OS-2026-09-06", "Authority: D999 / U-DECODE-TEAM-OS-2026-09-06"),
    expectId: "pom-authority-d021" },
  { name: "3. Task-specific precedence removed", file: "docs/PROJECT_OPERATING_MANUAL.md",
    mutate: (c) => c.replace("4. An approved task-specific Spec / Plan / Handoff.\n", ""),
    expectId: "pom-precedence-task-contract" },
  { name: "4. One C1-C11 heading removed", file: "docs/COLLABORATION_RULES.md",
    mutate: (c) => c.replace("## C4 — Self-merge\n\n", ""),
    expectId: "col-c-headings-order" },
  { name: "5. PR made universally mandatory", file: "docs/COLLABORATION_RULES.md",
    mutate: (c) => c.replace("PR is optional.", "PR is required."),
    expectId: "col-pr-optional" },
  { name: "6. Direct-main option removed", file: "docs/COLLABORATION_RULES.md",
    mutate: (c) => c.replace("Direct-main workflow is allowed", "Direct-main workflow is disallowed"),
    expectId: "col-direct-main-allowed" },
  { name: "7. PLAN 1A stricter override removed", file: "docs/COLLABORATION_RULES.md",
    mutate: (c) => c.replaceAll("PLAN 1A", "PLAN ZZ"),
    expectId: "col-precedence-stricter" },
  { name: "8. AGENTS manual route broken", file: "AGENTS.md",
    mutate: (c) => c.replaceAll("docs/PROJECT_OPERATING_MANUAL.md", "docs/SOMEWHERE_ELSE.md"),
    expectId: "router-agents-to-manual" },
  { name: "9. CLAUDE manual route broken", file: "CLAUDE.md",
    mutate: (c) => c.replaceAll("docs/PROJECT_OPERATING_MANUAL.md", "docs/SOMEWHERE_ELSE.md"),
    expectId: "router-claude-to-manual" },
  { name: "10. CLAUDE ChatGPT-prompt separation removed", file: "CLAUDE.md",
    mutate: (c) => c.replace("not a Claude Code instruction set", "a Claude Code instruction set"),
    expectId: "router-claude-chatgpt-separation" },
  { name: "11. One active template reverted to DRAFT", file: "docs/templates/TASK_BRIEF_TEMPLATE.md",
    // Deliberately not the literal "DRAFT SCAFFOLD / NOT ACTIVE" phrase here — that string is
    // itself banned by stale-draft-scaffold and would legitimately flip two checks at once
    // (both real regressions, but this scenario isolates tmpl-all-active specifically).
    mutate: (c) => c.replace("Status: ACTIVE TEMPLATE", "Status: DRAFT"),
    expectId: "tmpl-all-active:docs/templates/TASK_BRIEF_TEMPLATE.md" },
  { name: "12. Evidence dimensions collapsed", file: "docs/PROJECT_OPERATING_MANUAL.md",
    mutate: (c) => c.replace("| Evaluation purpose/mode | ACTUAL TEST · SELF-BENCHMARK · N/A (the artifact is not an evaluation) |\n", ""),
    expectId: "pom-evidence-not-collapsed" },
  { name: "13. Stale 'first engineering request' inserted into an active prompt", file: ".github/system_prompts/codex_system_prompt.md",
    mutate: (c) => c + "\nThe first engineering request is annotation infrastructure.\n",
    expectId: "stale-first-engineering-request" },
  { name: "14. Codex-exclusive Engineering wording inserted into an active source", file: ".github/system_prompts/chatgpt_custom_instructions.md",
    mutate: (c) => c + "\nCodex is the AI/Engineering Lead.\n",
    expectId: "stale-codex-exclusive" },
  { name: "15. Historical EXPERIMENT_PROTOCOL regains an executable Execution section", file: "docs/EXPERIMENT_PROTOCOL.md",
    mutate: (c) => c + "\n## Execution\n\n1. Do the thing.\n",
    expectId: "protocol-no-execution-heading" },
  { name: "16. D021 removed/gutted", file: "docs/DECISIONS.md",
    mutate: (c) => c.replace("| D021 | LOCKED OPERATING POLICY |", "| D021 | DRAFT |"),
    expectId: "d021-contract" },
  { name: "17. D022 removed/gutted", file: "docs/DECISIONS.md",
    mutate: (c) => c.replace(
      "Team OS Stage 1 → Stage 2 → Stage 3 must complete before PR-A begins.",
      "Team OS stages are optional."),
    expectId: "d022-sequence" },
  { name: "18. ACTUAL TEST boundary removed from current status", file: "docs/CURRENT_STATUS.md",
    mutate: (c) => c.replaceAll("NOT YET TESTED", "TESTED"),
    expectId: "status-actual-test-not-yet-tested" },
  { name: "19. 'UNKNOWN/null means missing, never zero' removed", file: "docs/DOCUMENTATION_RULES.md",
    mutate: (c) => c.replace("UNKNOWN/null means missing, never zero.", "UNKNOWN/null means zero."),
    expectId: "evidence-unknown-not-zero" },
  { name: "20. PR-A = NOT STARTED removed while D022 base gate is still unsatisfied", file: "docs/CURRENT_STATUS.md",
    mutate: (c) => c.replaceAll("PR-A = NOT STARTED", "PR-A = STARTED"),
    expectId: "status-pr-a-not-started" },
  { name: "21. Stale queue instruction inserted into the current executable request", file: "handoff/CHATGPT_TO_CODEX.md",
    mutate: (c) => c + "\nThe first handoff establishes the engineering queue.\n",
    expectId: "stale-first-handoff" },
];

for (const scenario of MUTATIONS) {
  test(`RED mutation: ${scenario.name}`, () => {
    const mutated = withMutation(scenario.file, scenario.mutate);
    const before = collectTeamOsSemanticChecks(baseline);
    const after = collectTeamOsSemanticChecks(mutated);
    assert.equal(after.length, before.length, "mutation must not change which checks run, only their outcome");

    const beforePassed = new Map(before.map((r) => [r.id, r.passed]));
    const flipped = after.filter((r) => r.passed !== beforePassed.get(r.id)).map((r) => r.id);

    const target = findCheck(after, scenario.expectId);
    assert.ok(target, `check id ${scenario.expectId} must exist in the semantic check output`);
    assert.equal(target.passed, false, `expected ${scenario.expectId} to fail after mutating ${scenario.file}`);
    assert.deepEqual(flipped, [scenario.expectId],
      `expected exactly one check to flip (${scenario.expectId}); got ${JSON.stringify(flipped)} — ` +
      "a mutation that flips more than its intended check is either too broad or the checks overlap unexpectedly");
  });
}

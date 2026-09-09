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
  "docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md",
  "foundation/src/index.ts", "foundation/package.json",
  "readiness/src/cli.ts",
  "readiness/src/domain/contracts.ts", "readiness/src/domain/frozen-hashes.ts",
  "readiness/src/domain/frozen-hash-inputs.ts", "readiness/src/domain/run-id.ts",
  "readiness/src/fixtures/contracts.ts", "readiness/src/fixtures/registry.ts",
  "readiness/src/foundation-api.ts",
  "readiness/src/gates/gate-catalog.ts", "readiness/src/gates/gate-catalog-types.ts",
  "readiness/src/gates/input-gates.ts", "readiness/src/gates/integration-gates.ts",
  "readiness/src/gates/metric-gates.ts", "readiness/src/gates/operational-gates.ts",
  "readiness/src/gates/protocol-gates.ts",
  "readiness/src/index.ts", "readiness/src/persistence/run-artifact.ts",
  "readiness/src/ports/local-transcription-port.ts",
  "readiness/src/protocol/composition.ts", "readiness/src/protocol/freeze.ts",
  "readiness/src/protocol/measurement.ts", "readiness/src/protocol/reserve.ts",
  "readiness/src/protocol/second-expert.ts", "readiness/src/protocol/timing.ts",
  "readiness/src/rehearsal/consent.ts", "readiness/src/rehearsal/retention.ts",
  "readiness/src/rehearsal/second-expert-qualification.ts", "readiness/src/rehearsal/source-rights.ts",
  "readiness/src/rehearsal/withdrawal.ts",
  "readiness/src/runner/current-readiness.ts", "readiness/src/runner/readiness-runner.ts",
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

test("positive control: changing only a HISTORICAL ACTUAL TEST/PR-A occurrence leaves the current-state checks passing", () => {
  // docs/CURRENT_STATUS.md line 34 ("`ACTUAL TEST = NOT YET TESTED`. `PR-A = NOT STARTED`.")
  // sits inside a section explicitly marked "(historical, prior to Stage 3)". Mutating only
  // that historical line must not affect the current-state checks, which read the region
  // before the first "(historical" marker.
  const mutated = withMutation("docs/CURRENT_STATUS.md", (c) =>
    c.replace("- `ACTUAL TEST = NOT YET TESTED`. `PR-A = NOT STARTED`.\n",
      "- `ACTUAL TEST = TESTED`. `PR-A = STARTED`.\n"));
  const results = collectTeamOsSemanticChecks(mutated);
  assert.equal(findCheck(results, "status-actual-test-not-yet-tested").passed, true,
    "a historical-only edit must not affect the current-state ACTUAL TEST check");
  assert.equal(findCheck(results, "status-pr-a-merged").passed, true,
    "a historical-only edit must not affect the current-state PR-A check");
});

test("positive control: D022's own future-base scan ignores a later, separate, approved decision row with a literal SHA", () => {
  // A future separate Product-approved decision may legitimately record a literal PR-A base
  // after external verification. The scoped check must only inspect D022's own clause, not
  // the whole DECISIONS.md file. This does not add a real decision to the repository.
  const mutated = withMutation("docs/DECISIONS.md", (c) =>
    c + "\n| D999 | LOCKED | PR-A base 1234567890abcdef1234567890abcdef12345678 approved after external verification | U-HYPOTHETICAL-FUTURE |\n");
  const results = collectTeamOsSemanticChecks(mutated);
  assert.equal(findCheck(results, "d022-no-future-base-assignment").passed, true,
    "a later, separate, approved decision row must not trip D022's own scoped future-base guard");
});

test("positive control: evaluation_subtype=MODEL_BAKE_OFF is allowed as metadata when the canonical mode remains SELF-BENCHMARK", () => {
  const results = collectTeamOsSemanticChecks(baseline);
  const plan1a = baseline.get("docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md");
  assert.ok(plan1a.includes("evaluation_subtype=MODEL_BAKE_OFF"),
    "baseline PLAN 1A must still mention evaluation_subtype=MODEL_BAKE_OFF as allowed metadata");
  assert.equal(findCheck(results, "plan1a-mode-no-bakeoff").passed, true,
    "the subtype mention must not trip the top-level-mode guard");
});

test("positive control: a summary referencing one REAL and one SIMULATED evidence record does not constitute DataOrigin=MIXED", () => {
  const mutated = withMutation("docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md", (c) =>
    c + "\n\nExample: a bake-off summary references one REAL evidence record and one SIMULATED evidence record for the same workflow.\n");
  const results = collectTeamOsSemanticChecks(mutated);
  assert.equal(findCheck(results, "plan1a-origin-no-mixed").passed, true,
    "referencing two separate REAL/SIMULATED records must not trip the no-MIXED guard");
});

test("positive control: an ACTUAL TEST + REAL + NOT TESTED pre-execution record is accepted (D024)", () => {
  const results = collectTeamOsSemanticChecks(baseline);
  assert.equal(findCheck(results, "plan1a-preexecution-record-allowed").passed, true);
  assert.equal(findCheck(results, "plan1a-preexecution-requires-real").passed, true);
  assert.equal(findCheck(results, "plan1a-preexecution-excluded-from-denominator").passed, true);
});

test("positive control: SELF-BENCHMARK + SIMULATED remains accepted independently of D024", () => {
  const plan1a = baseline.get("docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md");
  assert.ok(plan1a.includes("SELF-BENCHMARK + SIMULATED is valid."),
    "D024's ACTUAL TEST pre-execution amendment must not disturb the unrelated SELF-BENCHMARK + SIMULATED invariant");
});

test("positive control: no ActualTestStatus axis is needed to represent the D024 pre-execution state", () => {
  const results = collectTeamOsSemanticChecks(baseline);
  assert.equal(findCheck(results, "plan1a-no-actualteststatus-axis").passed, true,
    "the pre-execution record is representable with EvaluationMode + ExecutionStatus alone, no fourth axis");
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
  { name: "20. Current PR-A phase changed to an unrecognized value", file: "docs/CURRENT_STATUS.md",
    mutate: (c) => c.replaceAll("PR-A = MERGED", "PR-A = STARTED"),
    expectId: "status-pr-a-merged" },
  { name: "21. Stale queue instruction inserted into the current executable request", file: "handoff/CHATGPT_TO_CODEX.md",
    mutate: (c) => c + "\nThe first handoff establishes the engineering queue.\n",
    expectId: "stale-first-handoff" },

  // --- Post-merge audit correction scenarios (22-29) ---

  { name: "22. Current ACTUAL TEST state changed surgically, historical occurrences left intact", file: "docs/CURRENT_STATUS.md",
    // Two distinct phrasings of the current-state fact exist in the current region (the D024
    // explanatory sentence and the bullet marker); both must be neutralized for a genuine
    // regression, while the differently-worded historical-section occurrences stay untouched.
    mutate: (c) => c
      .replace("- `ACTUAL TEST = NOT YET TESTED` (current state).\n", "- `ACTUAL TEST = TESTED` (current state).\n")
      .replace("`ACTUAL TEST = NOT YET TESTED` remains explanatory prose for this state.", "`ACTUAL TEST = TESTED` remains explanatory prose for this state."),
    expectId: "status-actual-test-not-yet-tested" },
  { name: "23. Current PR-A state reverts to a stale pre-merge phrase, historical occurrences left intact", file: "docs/CURRENT_STATUS.md",
    mutate: (c) => c.replace(
      "- `PR-A = MERGED` (current state).",
      "- `PR-A = IMPLEMENTATION READY FOR PRODUCT REVIEW` (current state)."),
    expectId: "status-pr-a-merged" },
  { name: "24. Destructive-reset prohibition removed while C10's force-push sentence stays intact", file: "docs/COLLABORATION_RULES.md",
    mutate: (c) => c.replace("Force push and destructive reset remain prohibited.", "Force push remains prohibited."),
    expectId: "col-no-destructive-reset" },
  { name: "25. Another domain-policy read-flow link removed (Documentation Rules), Development Rules left intact", file: "docs/PROJECT_OPERATING_MANUAL.md",
    mutate: (c) => c.replace("[Documentation Rules](DOCUMENTATION_RULES.md), ", ""),
    expectId: "pom-read-flow-complete" },
  { name: "26. Several C1-C11 rule-body sentences copied into a router without headings", file: "AGENTS.md",
    mutate: (c) => c + "\n\nPeer approval is not required. Free parallel development is allowed. No fixed small-PR size rule.\n",
    expectId: "router-no-body-copy" },
  { name: "27. Alternate-wording universal-mandatory-PR policy inserted into an active source", file: "docs/PUBLICATION_POLICY.md",
    mutate: (c) => c + "\nAll changes require a PR.\n",
    expectId: "stale-universal-pr" },
  { name: "28. D022's own future-base clause gets a premature literal SHA", file: "docs/DECISIONS.md",
    mutate: (c) => c.replace(
      "The replacement PR-A base is the exact actual",
      "The replacement PR-A base is 1234567890abcdef1234567890abcdef12345678, the exact actual"),
    expectId: "d022-no-future-base-assignment" },
  { name: "29. Protocol authority/link statement removed, historical status/headings left intact", file: "docs/EXPERIMENT_PROTOCOL.md",
    mutate: (c) => c.replace("**It is not an executable protocol.** ", ""),
    expectId: "protocol-authority-link" },

  // --- D023 evidence/provenance contract scenarios (30-34) ---

  { name: "30. PLAN 1A reintroduces MODEL_BAKE_OFF as a top-level Evaluation purpose/mode", file: "docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md",
    mutate: (c) => c.replace("- ACTUAL TEST\n- SELF-BENCHMARK\n- N/A\n", "- ACTUAL TEST\n- SELF-BENCHMARK\n- MODEL_BAKE_OFF\n- N/A\n"),
    expectId: "plan1a-mode-no-bakeoff" },
  { name: "31. PLAN 1A reintroduces MIXED as a canonical Data origin", file: "docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md",
    mutate: (c) => c.replace("- REAL\n- SIMULATED\n- UNKNOWN\n", "- REAL\n- SIMULATED\n- MIXED\n- UNKNOWN\n"),
    expectId: "plan1a-origin-no-mixed" },
  { name: "32. PLAN 1A reintroduces ActualTestStatus as a fourth evidence/status dimension", file: "docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md",
    mutate: (c) => c + "\n\nActualTestStatus:\n\n- NOT YET TESTED\n- EXECUTED\n",
    expectId: "plan1a-no-actualteststatus-axis" },
  { name: "33. PLAN 1A loses the ACTUAL TEST + REAL requirement", file: "docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md",
    mutate: (c) => c.replaceAll("ACTUAL TEST requires DataOrigin=REAL", "ACTUAL TEST does not require DataOrigin=REAL"),
    expectId: "plan1a-actual-requires-real" },
  { name: "34. PLAN 1A loses the separate REAL/SIMULATED-record requirement", file: "docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md",
    mutate: (c) => c.replace(
      "create separate evidence records for the REAL portion and the SIMULATED portion",
      "record both origins together"),
    expectId: "plan1a-separate-records-required" },

  // --- D024 ACTUAL TEST pre-execution record semantics scenarios (35-37) ---

  { name: "35. PLAN 1A reverts to 'NOT TESTED means no ACTUAL TEST record may exist'", file: "docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md",
    // Minimal, isolated mutation: reinsert the banned absence-of-record phrase as a
    // contradicting addendum, without touching the "is valid as a pre-execution..." sentence
    // that check #37's own anchor phrase also depends on.
    mutate: (c) => c.replace(
      "Such a record is excluded from executed sample size",
      "ExecutionStatus=NOT TESTED otherwise means no ACTUAL TEST record exists yet. Such a record is excluded from executed sample size"),
    expectId: "plan1a-preexecution-record-allowed" },
  { name: "36. Exclusion of pre-execution records from executed denominators is removed", file: "docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md",
    mutate: (c) => c.replace(
      "Such a record is excluded from executed sample size, expert agreement, threshold calculations, GO/REVISE/STOP evidence, and does not authorize 50/150 expansion.",
      "Such a record counts toward executed sample size."),
    expectId: "plan1a-preexecution-excluded-from-denominator" },
  { name: "37. ACTUAL TEST pre-execution DataOrigin changed from REAL to SIMULATED", file: "docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md",
    mutate: (c) => c.replace(
      "ACTUAL TEST + DataOrigin=REAL + ExecutionStatus=NOT TESTED record is valid",
      "ACTUAL TEST + DataOrigin=SIMULATED + ExecutionStatus=NOT TESTED record is valid"),
    expectId: "plan1a-preexecution-requires-real" },

  // --- Final pre-PR-A gate correction scenarios (38-40) ---

  { name: "38. D024 exclusion set loses only the expert-agreement exclusion, sample-size exclusion left intact", file: "docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md",
    mutate: (c) => c.replace(
      "excluded from executed sample size, expert agreement, threshold calculations, GO/REVISE/STOP evidence, and does not authorize 50/150 expansion",
      "excluded from executed sample size, threshold calculations, GO/REVISE/STOP evidence, and does not authorize 50/150 expansion"),
    expectId: "plan1a-preexecution-excluded-from-denominator" },
  { name: "39. D024 exclusion set loses only the GO/REVISE/STOP + 50/150 exclusions, sample-size exclusion left intact", file: "docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md",
    mutate: (c) => c.replace(
      ", GO/REVISE/STOP evidence, and does not authorize 50/150 expansion.",
      "."),
    expectId: "plan1a-preexecution-excluded-from-denominator" },
  { name: "40. Current status overclaims deployment alongside an otherwise-valid MERGED PR-A phase phrase", file: "docs/CURRENT_STATUS.md",
    // Isolated from #20/#23: the valid MERGED phase phrase stays intact, only a forbidden
    // DEPLOYED overclaim is added, proving the negative branch is independently enforced.
    mutate: (c) => c.replace(
      "- `PR-A = MERGED` (current state).",
      "- `PR-A = MERGED` (current state). PR-A = DEPLOYED to production."),
    expectId: "status-pr-a-merged" },

  // --- Post-merge canonical receipt scenarios (41-42) ---

  { name: "41. Current handoff reverts to authorizing the already-completed PR-A implementation", file: "handoff/CHATGPT_TO_CODEX.md",
    mutate: (c) => c.replace(
      "No engineering implementation is currently authorized.",
      "Implement PLAN 1A Canonical Foundation. Start from base 4e006c9512e7665cd9195c42c508435092cb672d."),
    expectId: "handoff-post-pr-a-gate" },
  { name: "42. Current status loses the no-next-implementation-authorized statement while remaining otherwise MERGED", file: "docs/CURRENT_STATUS.md",
    mutate: (c) => c.replaceAll("no next implementation task is currently authorized", "further scope is pending"),
    expectId: "status-no-next-scope-overclaim" },

  // --- DRY Readiness implementation anti-drift scenarios (43-48) ---

  { name: "43. foundation/src/index.ts changes as part of readiness implementation", file: "foundation/src/index.ts",
    mutate: (c) => c + "\nexport * from \"./extra.js\";\n",
    expectId: "readiness-foundation-index-unchanged" },
  { name: "44. foundation/package.json changes as part of readiness implementation", file: "foundation/package.json",
    mutate: (c) => c.replace("\"version\": \"0.1.0\"", "\"version\": \"0.2.0\""),
    expectId: "readiness-foundation-package-unchanged" },
  { name: "45. gate catalog drops a mandatory Section 13 gate ID", file: "readiness/src/gates/gate-catalog-types.ts",
    mutate: (c) => c.replace("  \"stale-run-detection\",\n", ""),
    expectId: "readiness-gate-catalog-exact-ids" },
  { name: "46. CLI adds an arbitrary media/path/URL entry point", file: "readiness/src/cli.ts",
    mutate: (c) => c.replace(
      "const KNOWN_FLAGS = new Set([\"--scenario\", \"--output-dir\"]);",
      "const KNOWN_FLAGS = new Set([\"--scenario\", \"--output-dir\", \"--vod\"]);"),
    expectId: "readiness-cli-known-flags-exact" },
  { name: "47. run artifact schema collapses readinessVerdict into evidence/executionStatus", file: "readiness/src/persistence/run-artifact.ts",
    mutate: (c) => c.replace("readinessVerdict: run.readinessVerdict,\n    evidence: run.evidence,\n", "evidence: run.evidence,\n"),
    expectId: "readiness-run-artifact-schema-not-collapsed" },
  { name: "48. readiness domain source introduces an assignable REAL/ACTUAL_TEST provenance literal", file: "readiness/src/domain/contracts.ts",
    mutate: (c) => c + "\nexport const LEAK = \"ACTUAL_TEST\";\n",
    expectId: "readiness-no-forbidden-provenance-literal" },
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

# Implementation Plan — Team OS Stage 3: semantic checker hardening

Template Version: 1.0 | Updated: 2026-09-07 | Owner: AI/Engineering Lead
Status: ACTIVE TEMPLATE
Scope: skeleton for a step-by-step engineering plan for approved scope
Authority: D021 / U-DECODE-TEAM-OS-2026-09-06

Owner: AI/Engineering Lead | Date: 2026-09-07 | Status: **DRAFT — for Product review before implementation** (revision 2, per Product's plan-review corrections)

## Exact approved base

`origin/main = f22cceedf369d4b0b2419314f824e12f7563526c` (verified Team OS Stage 2 merge, PR #9). Re-verify with `git rev-parse origin/main` immediately before implementation starts, not from this document.

## Spec reference

This plan itself is the spec — it operationalizes the Stage 3 requirements Product specified directly (sections A–H, mutation scenarios, file set, verification commands, and this revision's seven corrections) rather than a separate Design Spec document.

## Global constraints

- Node.js built-ins only — no new dependency.
- No destructive Git operations, no recursive temp-directory deletion.
- `scripts/check-operating-docs.mjs`'s existing CLI interface (`node scripts/check-operating-docs.mjs [--index|--tracked]`) and every existing pre-Stage-3 check must continue to run unchanged and pass on unmodified input — Stage 3 adds checks, it does not remove or weaken any existing one.
- Stage 3 validates repository text/contracts only. It does not prove Codex/Claude Code/human obedience, runtime/application/model behavior, or ACTUAL TEST success.
- Integration method for *this task* is `PR_MERGE` (Product-specified, overriding the Collaboration Rules PR-optional default for this task specifically).
- Importing `scripts/check-operating-docs.mjs` from the semantic test file must not execute the CLI checker as a side effect (see "Test-seam design" below) — this is itself a checked requirement of the refactor, not just a style preference.

## Exact files / symbols affected

Create:
- `docs/superpowers/plans/2026-09-06-decode-team-os-stage3-semantic-checker-hardening.md` (this file)
- `scripts/check-operating-docs.semantic.test.mjs`

Modify:
- `handoff/CHATGPT_TO_CODEX.md` — already drafted in this plan-review pass.
- `scripts/check-operating-docs.mjs` — behavior-preserving extraction of `loadCanonicalTexts` and a new pure `collectTeamOsSemanticChecks(texts)`, called from an explicit `main()` guarded by direct-execution detection so importing the module performs no CLI side effect.
- `docs/PUBLICATION_FILES.json` — version 4 → 5, add the two new files (49 → 51).
- `docs/CURRENT_STATUS.md` — Stage 3 status per "Stage 3 completion semantics," plus whatever minimal current-phase wording the new `status-*` checks below require to already be true (verified, not invented, before the checks are written against it).
- `handoff/CODEX_TO_CHATGPT.md` — fresh eight-section Stage 3 completion report.
- `experiments/ai_execution_log.pending.csv` — one new deduplicated event row, `event_id=decode-team-os-stage3-20260906-01`.

**Complete Stage 3 PR file set: 8 files** — the 2 created above plus these 6 modified: `handoff/CHATGPT_TO_CODEX.md`, `scripts/check-operating-docs.mjs`, `docs/PUBLICATION_FILES.json`, `docs/CURRENT_STATUS.md`, `handoff/CODEX_TO_CHATGPT.md`, `experiments/ai_execution_log.pending.csv`. No `docs/DECISIONS.md` change unless D017 triggers during implementation (none has so far).

Symbols (new, in `scripts/check-operating-docs.mjs`):
- `loadCanonicalTexts(root, files)` — unchanged behavior from the prior plan revision, extracted from the existing inline read/decode/normalize loop.
- `collectTeamOsSemanticChecks(texts)` — pure function, no I/O, no `process.exit`, takes `texts: Map<path, content>` and returns `Array<{ id: string, passed: boolean }>`. It builds and returns its own local check list — it does not read or mutate the CLI's top-level `checks` array, so the semantic test can call it in isolation. Groups A–H, F (protocol), G (D021/D022), H (evidence/status) all live inside this one function.
- `main()` (or equivalently named) — the existing top-level script body, wrapped so it runs only under direct execution (e.g. `if (import.meta.url === \`file://${process.argv[1]}\`) main();`), calling both `loadCanonicalTexts` and `collectTeamOsSemanticChecks` and merging results into the printed report. `import`-ing the module for the semantic test must trigger neither the CLI's file-system inventory walk against `--index`/`--tracked` git state nor its `process.exit`.

## Exact ACTIVE/current stale-instruction-scan file set (correction 1)

Not "all `handoff/*.md` excluded." The scan protects **currently executable instruction sources** — anything a tool or person is meant to read and act on right now:

- `docs/PROJECT_OPERATING_MANUAL.md`
- `docs/COLLABORATION_RULES.md`
- `docs/DEVELOPMENT_RULES.md`
- `docs/DOCUMENTATION_RULES.md`
- `docs/AI_OPERATING_POLICY.md`
- `docs/PUBLICATION_POLICY.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.github/system_prompts/codex_system_prompt.md`
- `.github/system_prompts/chatgpt_custom_instructions.md`
- `handoff/CHATGPT_TO_CODEX.md` — **included**: this is the current executable Engineering request and must be protected against a stale queue instruction being reintroduced into it.
- `README.md`, `docs/PROJECT_BRIEF.md`, `docs/PRODUCT_SPEC.md`, `docs/DECISION_DATASET_SPEC.md`, `data/schemas/README.md`, `docs/templates/*.md` (10 files) — carried over from the prior plan revision, still in scope as currently-read reference/template sources.

Deliberately **not** in the generic stale-string scan, each for a stated reason rather than a blanket exclusion:

- `handoff/CODEX_TO_CHATGPT.md` — a completion **report**, not an instruction; it legitimately narrates what stale phrasing was found/fixed in past stages (as this very report does). Scanning it for the same literal substrings would false-positive on its own audit trail.
- Historical `handoff/DECODE-*.md` files — already marked `HISTORICAL SNAPSHOT`, explicitly not current.
- `docs/DECISIONS.md` — preserves historical decision text (e.g. D001's original Codex-role wording) by design; excluded from the *generic* stale-string scan, but covered instead by dedicated D021/D022 semantic checks (section G below) and a positive control test (section "Positive/control cases," item 3) that specifically asserts D001's historical Codex-provenance wording does **not** trip a Codex-exclusivity check.
- `docs/CURRENT_STATUS.md` — not excluded from protection, but protected differently: instead of a whole-file literal-substring scan (which would misfire on its intentionally-retained "historical, prior to Team OS" section), it gets **focused structural checks** on its current-phase and next-gate semantics — `status-actual-test-not-yet-tested` and `status-pr-a-not-started` (section 2 below).
- `docs/EXPERIMENT_PROTOCOL.md` — covered by its own dedicated group-F protocol-shape checks, not the generic scan, since its entire purpose is to discuss what was historically superseded.

## Task-by-task implementation sequence

1. **Extract `loadCanonicalTexts`** (pure refactor, no behavior change). Verify `node scripts/check-operating-docs.mjs` and `--index` report byte-identical check counts to pre-refactor.
2. **Add the `main()` execution guard** around the existing top-level script body, with no change to CLI output. Verify: (a) running `node scripts/check-operating-docs.mjs` still behaves identically; (b) `node -e "await import('./scripts/check-operating-docs.mjs')"` (or the test file doing the same) produces **no stdout, no exit-code side effect, no file-system git-status calls** — this is the "importable without executing" requirement.
3. **Write the first semantic mutation test** — exactly one scenario, e.g. mutation #1 (`pom-status-active`) — against a `collectTeamOsSemanticChecks` that does not exist yet. This import/reference failure is the honest RED, but per correction 6 it must be a **meaningful** RED at the assertion level once the function exists-but-is-empty, not just an import error: concretely, first make `collectTeamOsSemanticChecks` exist and return `[]` (a stub), confirm the test fails because the expected check ID is simply absent from the empty array (meaningful: "the invariant isn't checked at all"), *then* implement the real `pom-status-active` assertion and confirm GREEN.
4. **Repeat step 3's RED→GREEN cycle per check ID**, not all at once — implement one semantic assertion, run its test, confirm GREEN, move to the next. Group order: A (Project Operating Manual) → B (Collaboration Rules) → C (router parity) → D (templates) → E (stale-scan) → F (protocol) → G (D021/D022) → H (evidence/status).
5. **Add positive/control tests** (section below) once the corresponding group's assertions exist — each control test runs the same `collectTeamOsSemanticChecks` against the *unmutated* baseline `texts` Map and asserts the relevant IDs are `true`, plus the three specific non-over-blocking assertions Product named (untouched-baseline-all-pass; historical EXPERIMENT_PROTOCOL still allowed; D001's historical Codex wording does not trip the exclusivity check).
6. **Wire `collectTeamOsSemanticChecks` into the CLI's `main()`**, merging its results into the printed report's `checks` array, once all groups are GREEN in isolation.
7. **Update `docs/PUBLICATION_FILES.json`.** Bump to version 5, add the two new files, verify actual count is 51 with `node -e "console.log(require('./docs/PUBLICATION_FILES.json').files.length)"`.
8. **Reconcile `docs/CURRENT_STATUS.md`, `handoff/CODEX_TO_CHATGPT.md`, `experiments/ai_execution_log.pending.csv`** per "Stage 3 completion semantics" and "Execution logging."
9. **Fresh verification, PR, Product review.** No merge without Product's explicit MERGE decision.

## Test-seam design (correction 6)

- `collectTeamOsSemanticChecks(texts)` is exported and pure — no hidden dependency on a module-level `checks` array; it builds and returns its own list.
- The CLI's existing checks remain exactly where they are today; `main()` calls both the existing inline logic and `collectTeamOsSemanticChecks(texts)`, then concatenates results before the final tally — the semantic checks are additive, not a replacement.
- Direct-execution guard: `main()` runs only when the file is executed directly (not on `import`), so `scripts/check-operating-docs.semantic.test.mjs` can `import { loadCanonicalTexts, collectTeamOsSemanticChecks } from './check-operating-docs.mjs'` and call them against an in-memory, hand-built or file-loaded `texts` Map without triggering the CLI's git/`--index`/`--tracked` logic or `process.exit`.
- RED→GREEN sequence restated per correction 6:
  1. Existing checker GREEN on canonical baseline (pre-refactor count, recorded).
  2. Behavior-preserving extraction (`loadCanonicalTexts`, `main()` guard) lands; existing checker remains GREEN, identical count.
  3. First semantic mutation test written against not-yet-implemented `collectTeamOsSemanticChecks`.
  4. Meaningful RED established — the stub returns `[]`/omits the ID, so the test fails because the invariant genuinely isn't checked, not because of an import crash.
  5. Minimal semantic assertion implemented for that one ID.
  6. GREEN for that one scenario.
  7. Repeat 3–6 for every remaining scenario and positive/control case; no semantic enforcement is added before its own meaningful RED exists.

## Semantic check ID groups (revised)

**A — Project Operating Manual** (`docs/PROJECT_OPERATING_MANUAL.md`): `pom-status-active`, `pom-authority-d021`, `pom-router-role`, `pom-read-flow-complete`, `pom-precedence-task-contract`, `pom-plan1a-override`, `pom-evidence-not-collapsed`. (Unchanged from revision 1.)

**B — Collaboration Rules** (`docs/COLLABORATION_RULES.md`): `col-c-headings-order`, `col-branch-optional`, `col-pr-optional`, `col-direct-main-allowed`, `col-free-parallel`, `col-no-ownership`, `col-c6-verification-split`, `col-c7-recovery`, `col-no-force-push`, `col-d017-boundary`, `col-precedence-stricter`. (Unchanged.)

**C — Router parity** (`AGENTS.md`, `CLAUDE.md`): `router-agents-to-manual`, `router-claude-to-manual`, `router-no-duplicate-c-headings`, `router-claude-chatgpt-separation`, `router-no-hardcoded-queue`. (Unchanged.)

**D — Active templates** (`docs/templates/*.md`, 10 files): `tmpl-all-active`, `tmpl-planning-brief-fields`, `tmpl-research-note-fields`, `tmpl-design-spec-fields`, `tmpl-impl-plan-fields`, `tmpl-test-evidence-fields`, `tmpl-change-report-neutral`, `tmpl-handoff-eight-sections`. (Unchanged.)

**E — Stale executable instruction detection**, scoped to the file set defined above (now **includes** `handoff/CHATGPT_TO_CODEX.md`): `stale-first-engineering-request`, `stale-first-handoff`, `stale-codex-exclusive`, `stale-primary-expert-all-ten`, `stale-second-expert-fixed`, `stale-universal-pr`, `stale-draft-scaffold`. (Same IDs as revision 1; scope corrected.)

**F — Protocol authority** (`docs/EXPERIMENT_PROTOCOL.md`): `protocol-status-historical`, `protocol-no-slot-table`, `protocol-no-execution-heading`, `protocol-no-measurement-heading`, `protocol-no-go-stop-heading`, `protocol-no-required-outputs-heading`, `protocol-concise-size`. (Unchanged.)

**G — D021 / D022, strengthened** (`docs/DECISIONS.md`) — replaces the revision-1 `d021-present`/`d022-present` pair with anchored checks:

- `d021-contract` — D021's row/footnote text is `LOCKED OPERATING POLICY` **and** names the Project Operating Manual and Collaboration Rules C1–C11 as the Team OS contract **and** states material decisions remain under D017 **and** states a stricter approved task-specific Spec/Plan/Handoff overrides general defaults. (One check asserting four anchors present in the D021 text block — implementation may split into 4 sub-checks if that gives clearer failure diagnostics; naming is a C11 choice.)
- `d022-sequence` — D022's text states Stage 1 → Stage 2 → Stage 3 precede PR-A, and that the prior M0 receipt SHA is historical evidence rather than the PR-A start base.
- `d022-product-approved-base` — D022's text states the replacement PR-A base is the actual `origin/main` HEAD after final Team OS completion, requiring external verification and explicit Product approval before branch creation.
- `d022-no-future-base-assignment` — defensive: no 40-hex-character string appears adjacent to a "PR-A base" phrase anywhere in `docs/DECISIONS.md`, guarding against ever hard-coding the unknown future SHA in advance.

**H — Evidence and status boundaries, completed** (correction 4):

- `evidence-no-promotion-safeguard` — `docs/PROJECT_OPERATING_MANUAL.md` still contains its "never becomes ACTUAL TEST evidence" safeguard sentence (unchanged from revision 1).
- `evidence-unknown-not-zero` — **new**: `docs/DOCUMENTATION_RULES.md` DOC-05 still states the "UNKNOWN/null means missing, never zero" invariant (exact current wording: "UNKNOWN/null means missing, never zero").
- `status-actual-test-not-yet-tested` — **new, replaces mutation #18's ad hoc reuse of the CLI-level `actual-unexecuted:*` ID.** This is the single shared-underlying-logic point correction 2 asked for: instead of the semantic function relying on the *existing* per-file `actual-unexecuted:*` regex loop (which lives in the CLI's inline per-file logic today, outside `collectTeamOsSemanticChecks`), Stage 3 adds this one stable ID *inside* `collectTeamOsSemanticChecks`, checking `docs/CURRENT_STATUS.md` specifically for the ACTUAL-TEST-NOT-YET-TESTED pattern via the same regex the CLI already uses (`/ACTUAL TEST[\s\S]{0,100}NOT YET TESTED/`), applied to `texts.get('docs/CURRENT_STATUS.md')`. The pre-existing `actual-unexecuted:*` checks for the *other* files (README, handoffs, spec docs) are untouched and continue to live in the CLI's existing per-file loop — only `docs/CURRENT_STATUS.md`'s instance is additionally, redundantly asserted inside the pure semantic function so mutation #18 has a stable ID sourced from the same shared code path the semantic test imports. (If Product prefers the *existing* `actual-unexecuted:docs/CURRENT_STATUS.md` check itself moved bodily into `collectTeamOsSemanticChecks` instead of duplicated, that is an equally valid C11 implementation choice — flagged here as the one open implementation-style fork, not a material decision, since both approaches produce the same enforcement.)
- `status-pr-a-not-started` — **new**: `docs/CURRENT_STATUS.md` (and/or `handoff/CHATGPT_TO_CODEX.md`) states `PR-A = NOT STARTED` / `PR-A NOT STARTED`, enforcing the D022 gate until it is actually satisfied and lifted by a future, separate, explicit change.

## 20 required RED mutation scenarios (18 required + 2 new, correction 4)

| # | Scenario | Mutated file | Expected failing check ID |
| --- | --- | --- | --- |
| 1 | Manual ACTIVE status removed | `docs/PROJECT_OPERATING_MANUAL.md` | `pom-status-active` |
| 2 | Manual D021 authority removed | `docs/PROJECT_OPERATING_MANUAL.md` | `pom-authority-d021` |
| 3 | Task-specific precedence removed | `docs/PROJECT_OPERATING_MANUAL.md` | `pom-precedence-task-contract` |
| 4 | One C1–C11 heading removed | `docs/COLLABORATION_RULES.md` | `col-c-headings-order` |
| 5 | PR made universally mandatory | `docs/COLLABORATION_RULES.md` | `col-pr-optional` |
| 6 | Direct-main option removed | `docs/COLLABORATION_RULES.md` | `col-direct-main-allowed` |
| 7 | PLAN 1A stricter override removed | `docs/COLLABORATION_RULES.md` | `col-precedence-stricter` |
| 8 | AGENTS manual route broken | `AGENTS.md` | `router-agents-to-manual` |
| 9 | CLAUDE manual route broken | `CLAUDE.md` | `router-claude-to-manual` |
| 10 | CLAUDE ChatGPT-prompt separation removed | `CLAUDE.md` | `router-claude-chatgpt-separation` |
| 11 | One active template reverted to DRAFT | `docs/templates/TASK_BRIEF_TEMPLATE.md` (representative; test parametrizes across all 10) | `tmpl-all-active` |
| 12 | Evidence dimensions collapsed | `docs/PROJECT_OPERATING_MANUAL.md` | `pom-evidence-not-collapsed` |
| 13 | Stale `first engineering request` inserted into an active prompt | `.github/system_prompts/codex_system_prompt.md` | `stale-first-engineering-request` |
| 14 | Codex-exclusive Engineering wording inserted into an active source | `.github/system_prompts/chatgpt_custom_instructions.md` | `stale-codex-exclusive` |
| 15 | Historical EXPERIMENT_PROTOCOL regains an executable `## Execution` section | `docs/EXPERIMENT_PROTOCOL.md` | `protocol-no-execution-heading` |
| 16 | D021 removed/gutted | `docs/DECISIONS.md` | `d021-contract` |
| 17 | D022 removed/gutted | `docs/DECISIONS.md` | `d022-sequence` (and/or `d022-product-approved-base`, whichever anchor was removed) |
| 18 | ACTUAL TEST boundary removed from current status | `docs/CURRENT_STATUS.md` | `status-actual-test-not-yet-tested` |
| 19 | **(new)** `UNKNOWN/null means missing, never zero` removed | `docs/DOCUMENTATION_RULES.md` | `evidence-unknown-not-zero` |
| 20 | **(new)** `PR-A = NOT STARTED` removed while D022 base gate is still unsatisfied | `docs/CURRENT_STATUS.md` | `status-pr-a-not-started` |

Additional scenario implied by correction 3's stale queue instruction protecting the current handoff:

| 21 | **(new)** Stale `the first handoff` / hard-coded queue instruction inserted into the current executable request | `handoff/CHATGPT_TO_CODEX.md` | `stale-first-handoff` (or `stale-first-engineering-request`, depending on exact inserted phrase) |

## Positive/control cases (correction 7)

In addition to the 21 RED mutation scenarios, the test file asserts:

1. **Baseline-all-pass**: `collectTeamOsSemanticChecks(baselineTexts)` on the real, unmutated repository content returns `passed: true` for every check ID in groups A–H. This is the single most important control — a checker that never runs this against real content could pass every mutation test while being wrong about the baseline.
2. **Historical-allowed**: the concise, current `docs/EXPERIMENT_PROTOCOL.md` (HISTORICAL CANDIDATE SUMMARY / SUPERSEDED FOR EXECUTION, no slot table, no Execution/Measurement/GO-STOP/Required-outputs headings) passes all `protocol-*` checks — proving the checker distinguishes "historical and concise" (allowed) from "historical but still contains executable-looking content" (group F's actual target) rather than just rejecting the word "historical."
3. **D001-provenance-not-flagged**: `docs/DECISIONS.md`'s D001 row (`"Codex=AI/Engineering Lead"` in its original 2026-09-02 historical wording) does **not** trip `stale-codex-exclusive`, because `docs/DECISIONS.md` is outside the group-E generic scan by design (see the ACTIVE-file-set section above) — this control test exists specifically to prove that exclusion doesn't accidentally get reversed by a future refactor, and that if D021's `d021-contract` check is ever mistakenly pointed at scanning `docs/DECISIONS.md` broadly for "Codex exclusive" phrasing, this control would catch that regression.
4. **Handoff-report-not-scanned**: `handoff/CODEX_TO_CHATGPT.md`'s own text — which legitimately contains the literal phrase "Codex-exclusive Engineering framing" and similar quoted-audit phrasing when describing what a past stale-scan found — does **not** trip any `stale-*` check, confirming the E-group scope correctly excludes completion reports.

## Inventory v5/51 rationale

Current merged main (`f22ccee`): version 4, 49 files (re-verified this revision: `node -e "..."` → `4 49`). Stage 3 adds exactly two new tracked files (plan doc, semantic test script): 49 + 2 = 51, version 4 → 5. Verified for real immediately before commit per task 7, not assumed.

## Interfaces consumed / produced

Unchanged from revision 1: `loadCanonicalTexts` produces the `texts` Map consumed by the CLI's existing per-file checks and by `collectTeamOsSemanticChecks`; `collectTeamOsSemanticChecks` produces `{id, passed}[]` consumed by the CLI's final tally and by the semantic test's assertions.

## TDD / regression cycle

See "Test-seam design" above for the full RED→GREEN sequence (this supersedes the coarser "test-first, one scenario per case" description in plan revision 1). Regression check: after the `main()` guard lands (task 2) and after `collectTeamOsSemanticChecks` is wired in (task 6), rerun `node scripts/check-operating-docs.mjs` / `--index` and confirm every pre-existing check ID that passed before Stage 3 still passes, and the pass count grows by exactly the number of new semantic checks added.

## Exact verification commands

Unchanged from revision 1:

```
node scripts/check-operating-docs.semantic.test.mjs
node scripts/check-operating-docs.mjs
node scripts/check-operating-docs.mjs --index
git diff --cached --check
```

Then, after PR is opened, on the actual candidate branch head:

```
node scripts/check-operating-docs.mjs --tracked
```

All measured counts are actual, reported after running, never predicted.

## Explicit exclusions

Unchanged from revision 1 (D021/D022/C1–C11 semantics, authority documents, PR-A, PR #5, ACTUAL TEST, 50/150 cases, Codex/Claude/human obedience testing, Markdown-enforces-behavior claims, product family/field/threshold changes, dependency installs, destructive Git ops). No file changes beyond the 8-file set above while this plan is DRAFT.

## Risk / rollback / corrective strategy

Unchanged core risks from revision 1 (refactor regression, false-positive stale-scan, inventory/checker desync), plus:
- **Risk: `d021-contract`/`d022-*` checks become brittle to harmless D021/D022 rewording.** Mitigation: anchor on the four/three named semantic anchors per decision (see group G), not full-text equality — a copy-edit that preserves all anchors stays GREEN.
- **Risk: `status-pr-a-not-started` becomes stale once PR-A actually starts.** Expected and out of scope for Stage 3 to solve — noted here so the check's removal/update at that future gate isn't mistaken for a Stage 3 regression when it happens.
- **Corrective strategy for a genuinely unresolved material decision found mid-implementation:** unchanged — STOP, do not choose, D017 interview format, wait for Product's LOCKED decision.

## Integration method

Unchanged: `PR_MERGE`, branch `claude/team-os-stage3-checker-hardening` (already created from the exact verified base). No self-merge, no auto-merge, Product's explicit MERGE decision required.

## Completion artifacts

Unchanged from revision 1: PR-description Change-Report-shaped summary (`Integration method: PR_MERGE`); fresh eight-section `handoff/CODEX_TO_CHATGPT.md` with actual measured checker counts; no Test Evidence Report (no ACTUAL TEST/SELF-BENCHMARK evaluation of the DECODE product performed).

## Plan self-review

- No material decision was silently introduced this revision either — every new/strengthened check (D, G, H groups; the 3 new mutation scenarios; the 4 control cases) operationalizes something Product already specified as already-LOCKED or explicitly requested in this review round.
- One implementation-style fork is flagged transparently rather than silently resolved: whether `status-actual-test-not-yet-tested` duplicates the `docs/CURRENT_STATUS.md`-specific check inside the pure function (this plan's default) or the existing CLI-level `actual-unexecuted:docs/CURRENT_STATUS.md` check is moved bodily into the pure function instead. Both satisfy "the CLI and the mutation test must call the same underlying function" for this ID; the choice is C11, not D017, since it changes no external contract or check ID naming that Product would need to review — but it's called out per Product's request that exact names/exact mechanism be traceable.
- Every correction (1–7) maps to an explicit plan section above.
- No TBD/TODO/vague "add tests" placeholder.
- RED → GREEN cycle is explicit and now meaningful-RED-first per correction 6.
- Positive/control cases are explicit per correction 7.
- Complete 8-file PR scope is explicit per correction 5.
- Inventory v5/51 rationale is explicit.
- Final Product review/PR merge gate is explicit.
- **No materially unresolved Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost decision was found during this revision either.** No STOP-for-interview is triggered.

# Codex → ChatGPT

Report ID: DECODE-D023-EVIDENCE-CONTRACT-2026-09-07 | Scope: D023 evidence/provenance contract amendment
Owner: AI/Engineering Lead | Source revision: base `origin/main = 6ae646a2e961125d957768f7828e11f13b771a32`

Prior report: DECODE-TEAM-OS-STAGE3-AUDIT-FIX-2026-09-07, this file's immediately preceding content (superseded by this report). See Git history for the exact prior text.

## IMPLEMENTED

D023 (LOCKED EVIDENCE CONTRACT) recorded in `docs/DECISIONS.md`, authority `U-DECODE-EVIDENCE-CONTRACT-2026-09-07`, following Product's decision interview under D017 (user selected Option C). Amends PLAN 1A Canonical Foundation's Section 3 provenance contract (and its restatement in Section 12's acceptance invariants): removes `MODEL_BAKE_OFF` as a top-level Evaluation purpose/mode (retained only as optional `evaluation_subtype=MODEL_BAKE_OFF` metadata under SELF-BENCHMARK, never changing ACTUAL TEST eligibility); removes `MIXED` as a canonical Data origin (REAL and SIMULATED inputs now require separate evidence records, never a single MIXED record, and SIMULATED material is never folded into an ACTUAL TEST denominator/run/claim); removes the separate `ActualTestStatus` axis (ACTUAL TEST state = Evaluation purpose/mode=ACTUAL TEST plus canonical Execution status; `ACTUAL TEST = NOT YET TESTED` remains explanatory prose for that combination, not a separate enum value). Repo-wide search confirmed the conflicting contract (`MODEL_BAKE_OFF`, `MIXED`, `ActualTestStatus`, `EvaluationMode`, `DataOrigin`) existed only in PLAN 1A — no other active/current source needed reconciliation. `docs/CURRENT_STATUS.md` and `handoff/CHATGPT_TO_CODEX.md` reconciled to the post-D023 gate state (amendment complete, PR-A still NOT STARTED). Added 5 new semantic checks (`plan1a-mode-no-bakeoff`, `plan1a-origin-no-mixed`, `plan1a-no-actualteststatus-axis`, `plan1a-actual-requires-real`, `plan1a-separate-records-required`) to `collectTeamOsSemanticChecks`, with 5 new RED mutations and 2 new positive controls in the test suite. Preserves the TypeScript/Node runtime lock, ActorVerifier Port, Policy & Rights, durable job lifecycle, migration compatibility, Q1–Q56 ACTUAL TEST protocol, and product families/fields/threshold status unchanged, per D023's explicit scope limit.

## ACTUAL TEST

NOT YET TESTED — no consented real VOD or independent expert session was run. `ACTUAL TEST = NOT YET TESTED` for both the DECODE product and this amendment itself.

## SELF-BENCHMARK

- `node scripts/check-operating-docs.semantic.test.mjs`: **42/42 PASS, 0 failures** (8 baseline/positive-control + 34 RED mutation scenarios, 7 new this revision).
- `node scripts/check-operating-docs.mjs` (default): **749/749 PASS, 0 failures**.
- `node scripts/check-operating-docs.mjs --index` (staged tree): **801/801 PASS, 0 failures**.
- `git diff --cached --check`: exit 0, no whitespace errors.
- Meaningful-RED evidence for a new check: `plan1a-mode-no-bakeoff` was temporarily stubbed to always pass; the corresponding mutation test (`RED mutation: 30. ...`) then failed with `AssertionError: expected plan1a-mode-no-bakeoff to fail ... true !== false` — assertion-level, not import/module error. Stub reverted, confirmed byte-identical to pre-stub (modulo CRLF), suite reran fully GREEN.
- Authority document blob/hash re-verification: Integrated Spec `f7571338e93a408a8aeef93d63275d7076e76f80` and 10-Case ACTUAL TEST Protocol `4d7788bb39d68c5cd147408a85954cd5a0e7b8f0` unchanged. PLAN 1A's blob **changed as expected and required** by this locked amendment: `10aa423531f83a044ded273cde603a04e33c03d0` → `283307d15c7dcc2d75f55044d7d22648a866e94d`. The prior blob remains in Git history as historical provenance, not a regression.
- This is documentation/contract evidence only, not compile/typecheck/software/ACTUAL TEST evidence.

## SIMULATED

No synthetic decision fixtures or simulated stress run generated. The new mutation/control scenarios operate on in-memory string mutations of real repository text for test purposes only.

## FAILED

None outside the intentional, resolved meaningful-RED proof described in SELF-BENCHMARK. No other check failure occurred during this amendment. Google sync remains BLOCKED by missing bindings, as before.

## NOT TESTED

Application/runtime, model behavior, prompt obedience, accessibility/security conformance, expert measurements, Google writes, empirical token savings, and actual Codex/Claude Code/human obedience to any checked contract. PR-A Canonical Foundation implementation is NOT STARTED. No manifest scripts were executed.

## FILES CHANGED

`docs/DECISIONS.md`, `docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md`, `docs/CURRENT_STATUS.md`, `handoff/CHATGPT_TO_CODEX.md`, `handoff/CODEX_TO_CHATGPT.md`, `scripts/check-operating-docs.mjs`, `scripts/check-operating-docs.semantic.test.mjs`, `experiments/ai_execution_log.pending.csv`. Exactly 8 files, matching the request's minimum-modify list; repo-wide search found no other ACTIVE/current file containing the conflicting contract, so no additional file needed reconciliation. No `docs/PUBLICATION_FILES.json` change (inventory remains v5 / 51 — no new file). Integrated Spec and 10-Case ACTUAL TEST Protocol untouched; PLAN 1A's content intentionally changed as the locked amendment target. PR #5 untouched.

## RECOMMENDED NEXT DECISION

Merge this amendment PR (per Product's stated workflow: no pre-merge Product code review gate). After merge, fetch `origin/main`, verify the resulting HEAD, and rerun `node scripts/check-operating-docs.mjs --tracked` on merged main. Product then independently audits the merged amendment and, only if clean, approves that exact SHA as the PR-A base under D022. Do not start PR-A before that explicit approval. PR #5 remains OPEN / non-canonical candidate and must not be merged in its current form. No ACTUAL TEST or 50/150 expansion is authorized by this amendment.

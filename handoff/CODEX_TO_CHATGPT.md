# Codex → ChatGPT

Report ID: DECODE-D024-PREEXECUTION-RECORD-2026-09-07 | Scope: D024 ACTUAL TEST pre-execution record semantics amendment
Owner: AI/Engineering Lead | Source revision: base `origin/main = 5b4676af4859ab505d9a524100676f02647445df`

Prior report: DECODE-D023-EVIDENCE-CONTRACT-2026-09-07, this file's immediately preceding content (superseded by this report). See Git history for the exact prior text.

## IMPLEMENTED

D024 (LOCKED EVIDENCE CONTRACT) recorded in `docs/DECISIONS.md`, authority `U-DECODE-ACTUAL-PREEXECUTION-2026-09-07`, following Product's decision interview under D017 (user selected Option A — ALLOW). Reconciles PLAN 1A Canonical Foundation's Section 12 Provenance acceptance invariant #5, which conflicted with Section 3 by treating Execution status=NOT TESTED as meaning "no ACTUAL TEST record exists yet." Replaced with: a persisted ACTUAL TEST + Data origin=REAL + Execution status=NOT TESTED record is valid as a pre-execution/planned record, representing a planned/registered ACTUAL TEST evidence unit not yet executed — not that the test occurred, passed, or failed — and explicitly excluded from executed sample size, expert agreement, threshold calculations, and GO/REVISE/STOP evidence, never authorizing 50/150 expansion. Section 3 already had the correct semantics and remains authoritative and unchanged except for a clarifying cross-reference to D024. Repo-wide search for "no ACTUAL TEST record exists yet," "persisted ACTUAL TEST," "ExecutionStatus=NOT TESTED," "NOT YET TESTED," and "ACTUAL TEST record" confirmed the conflicting language existed only at PLAN 1A Section 12 item 5 — no other active/current source needed reconciliation. Added 3 new semantic checks (`plan1a-preexecution-record-allowed`, `plan1a-preexecution-requires-real`, `plan1a-preexecution-excluded-from-denominator`) to `collectTeamOsSemanticChecks`, with 3 new RED mutations and 3 new positive controls. `docs/CURRENT_STATUS.md` and `handoff/CHATGPT_TO_CODEX.md` reconciled to the post-D024 gate state.

## ACTUAL TEST

NOT YET TESTED — no consented real VOD or independent expert session was run. `ACTUAL TEST = NOT YET TESTED` for both the DECODE product and this amendment itself. This amendment defines the semantics of a pre-execution record; it does not create, run, or claim any such record for the DECODE product.

## SELF-BENCHMARK

- `node scripts/check-operating-docs.semantic.test.mjs`: **48/48 PASS, 0 failures** (11 baseline/positive-control + 37 RED mutation scenarios, 6 new this revision: 3 mutations + 3 controls).
- `node scripts/check-operating-docs.mjs` (default): **753/753 PASS, 0 failures**.
- `node scripts/check-operating-docs.mjs --index` (staged tree): **805/805 PASS, 0 failures**.
- `git diff --cached --check`: exit 0, no whitespace errors.
- Meaningful-RED evidence for a new check: `plan1a-preexecution-requires-real` was temporarily stubbed to always pass; the corresponding mutation test (`RED mutation: 37. ...`) then failed with `AssertionError: expected plan1a-preexecution-requires-real to fail ... true !== false` — assertion-level, not import/module error. Stub reverted, confirmed byte-identical to pre-stub (modulo CRLF), suite reran fully GREEN.
- D023 checks re-verified intact: all `plan1a-mode-no-bakeoff`, `plan1a-origin-no-mixed`, `plan1a-no-actualteststatus-axis`, `plan1a-actual-requires-real`, `plan1a-separate-records-required` still pass on the amended PLAN 1A.
- Authority document blob/hash re-verification: Integrated Spec `f7571338e93a408a8aeef93d63275d7076e76f80` and 10-Case ACTUAL TEST Protocol `4d7788bb39d68c5cd147408a85954cd5a0e7b8f0` unchanged. PLAN 1A's blob changes from `283307d15c7dcc2d75f55044d7d22648a866e94d` to `bfb5e35b921ccc320f3ffb2631b661368206fa6b` — expected and required by this locked amendment, prior blob preserved in Git history.
- This is documentation/contract evidence only, not compile/typecheck/software/ACTUAL TEST evidence.

## SIMULATED

No synthetic decision fixtures or simulated stress run generated. The new mutation/control scenarios operate on in-memory string mutations of real repository text for test purposes only.

## FAILED

None outside the intentional, resolved meaningful-RED proof described in SELF-BENCHMARK. No other check failure occurred during this amendment. Google sync remains BLOCKED by missing bindings, as before.

## NOT TESTED

Application/runtime, model behavior, prompt obedience, accessibility/security conformance, expert measurements, Google writes, empirical token savings, and actual Codex/Claude Code/human obedience to any checked contract. PR-A Canonical Foundation implementation is NOT STARTED. No manifest scripts were executed.

## FILES CHANGED

`docs/DECISIONS.md`, `docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md`, `docs/CURRENT_STATUS.md`, `handoff/CHATGPT_TO_CODEX.md`, `handoff/CODEX_TO_CHATGPT.md`, `scripts/check-operating-docs.mjs`, `scripts/check-operating-docs.semantic.test.mjs`, `experiments/ai_execution_log.pending.csv`. Exactly 8 files. No `docs/PUBLICATION_FILES.json` change (inventory remains v5 / 51 — no new file). Integrated Spec and 10-Case ACTUAL TEST Protocol untouched; PLAN 1A's content intentionally changed as the locked amendment target (Section 12 item 5 only; Section 3 unchanged except a clarifying cross-reference). PR #5 untouched.

## RECOMMENDED NEXT DECISION

Merge this amendment PR (per Product's stated workflow: no pre-merge Product code review gate). After merge, fetch `origin/main`, verify the resulting HEAD, and rerun `node scripts/check-operating-docs.mjs --tracked` on merged main. Product then independently audits the merged amendment and, only if clean, approves that exact SHA as the PR-A base under D022. Do not start PR-A before that explicit approval. PR #5 remains OPEN / non-canonical candidate and must not be merged in its current form. No ACTUAL TEST or 50/150 expansion is authorized by this amendment.

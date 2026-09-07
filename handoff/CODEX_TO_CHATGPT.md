# Codex → ChatGPT

Report ID: DECODE-PRE-PR-A-GATE-FIX-2026-09-07 | Scope: final pre-PR-A gate correction
Owner: AI/Engineering Lead | Source revision: base `origin/main = 4bd7149ed2a93ba31de9a17d83ae9844b0af7bc3`

Prior report: DECODE-D024-PREEXECUTION-RECORD-2026-09-07, this file's immediately preceding content (superseded by this report). See Git history for the exact prior text.

## IMPLEMENTED

Two mechanical defects found by independent Product audit of merged PR #13, fixed: (1) `handoff/CHATGPT_TO_CODEX.md` was stale and executable — it still requested D024 implementation from an old base though D024 was already merged via PR #13. Replaced with Handoff ID `DECODE-PR-A-BASE-GATE`, explicitly stating no engineering implementation is currently authorized, D023/D024 must not be rerun, and PR-A awaits Product's exact-SHA base approval under D022. (2) The `plan1a-preexecution-excluded-from-denominator` semantic check only required the "excluded from executed sample size" phrase; strengthened to require the complete D024 exclusion set (sample size, expert agreement, threshold calculations, GO/REVISE/STOP evidence, and the 50/150-expansion non-authorization), with isolated RED mutation coverage proving each element is independently enforced. Also added a new phase-guard check, `handoff-pr-a-base-gate`: while the current `docs/CURRENT_STATUS.md` region says PR-A is NOT STARTED and awaiting Product's exact-SHA base approval, the current `handoff/CHATGPT_TO_CODEX.md` must represent a gate state, not an executable implementation request — this directly prevents the same stale-handoff problem from recurring silently. `docs/CURRENT_STATUS.md` reconciled to record D023 (PR #12) and D024 (PR #13) as both merged and complete, with this revision as only the final pre-PR-A gate correction. No PLAN 1A text change (D024's wording was already correct) and no `docs/DECISIONS.md` change — no new material decision.

## ACTUAL TEST

NOT YET TESTED — no consented real VOD or independent expert session was run. `ACTUAL TEST = NOT YET TESTED` for both the DECODE product and this correction itself.

## SELF-BENCHMARK

- `node scripts/check-operating-docs.semantic.test.mjs`: **51/51 PASS, 0 failures** (14 baseline/positive-control + 37 RED mutation scenarios... plus 3 new this revision: 40 mutations total).
- `node scripts/check-operating-docs.mjs` (default): **755/755 PASS, 0 failures**.
- `node scripts/check-operating-docs.mjs --index` (staged tree): **807/807 PASS, 0 failures**.
- `git diff --cached --check`: exit 0, no whitespace errors.
- Meaningful-RED evidence for the new check: `handoff-pr-a-base-gate` was temporarily stubbed to always pass; the corresponding mutation test (`RED mutation: 40. ...`) then failed with `AssertionError: expected handoff-pr-a-base-gate to fail ... true !== false` — assertion-level, not import/module error. Stub reverted, confirmed byte-identical to pre-stub (modulo CRLF), suite reran fully GREEN.
- One design fix made mid-implementation: the phase-guard check was initially pushed conditionally (only when the pre-PR-A phase precondition held), which broke the "same check count before/after mutation" invariant when a mutation altered the precondition itself (scenarios #20/#23, which mutate `PR-A = NOT STARTED` text unrelated to this new check). Fixed by always pushing the check with a vacuously-true value when the precondition doesn't hold, so the check ID never disappears.
- D023 and D024 checks re-verified intact on the unchanged PLAN 1A content: `plan1a-mode-no-bakeoff`, `plan1a-origin-no-mixed`, `plan1a-no-actualteststatus-axis`, `plan1a-actual-requires-real`, `plan1a-separate-records-required`, `plan1a-preexecution-record-allowed`, `plan1a-preexecution-requires-real`, and the strengthened `plan1a-preexecution-excluded-from-denominator` all pass.
- Authority document blob/hash re-verification: Integrated Spec `f7571338e93a408a8aeef93d63275d7076e76f80` and 10-Case ACTUAL TEST Protocol `4d7788bb39d68c5cd147408a85954cd5a0e7b8f0` unchanged. Current PLAN 1A blob remains `bfb5e35b921ccc320f3ffb2631b661368206fa6b`, unchanged by this correction (no PLAN 1A file was touched).
- This is documentation/contract evidence only, not compile/typecheck/software/ACTUAL TEST evidence.

## SIMULATED

No synthetic decision fixtures or simulated stress run generated. The new mutation/control scenarios operate on in-memory string mutations of real repository text for test purposes only.

## FAILED

None outside the intentional, resolved meaningful-RED proof and the mid-implementation check-design fix described in SELF-BENCHMARK, both real evidence the test infrastructure is working correctly. No other check failure occurred. Google sync remains BLOCKED by missing bindings, as before.

## NOT TESTED

Application/runtime, model behavior, prompt obedience, accessibility/security conformance, expert measurements, Google writes, empirical token savings, and actual Codex/Claude Code/human obedience to any checked contract. PR-A Canonical Foundation implementation is NOT STARTED. No manifest scripts were executed.

## FILES CHANGED

`handoff/CHATGPT_TO_CODEX.md`, `docs/CURRENT_STATUS.md`, `scripts/check-operating-docs.mjs`, `scripts/check-operating-docs.semantic.test.mjs`, `handoff/CODEX_TO_CHATGPT.md`, `experiments/ai_execution_log.pending.csv`. Exactly 6 files, matching the request's expected scope exactly — no PLAN 1A change, no `docs/DECISIONS.md` change, no new file, no `docs/PUBLICATION_FILES.json` change (inventory remains v5 / 51). Integrated Spec, 10-Case ACTUAL TEST Protocol, PLAN 1A, and PR #5 untouched.

## RECOMMENDED NEXT DECISION

Merge this corrective PR (per Product's stated workflow: no pre-merge Product code review gate). After merge, fetch `origin/main`, verify the resulting HEAD, and rerun `node scripts/check-operating-docs.mjs --tracked` on merged main. Product then performs one final independent GitHub audit; if clean, that exact resulting main SHA is approved as the PR-A base under D022 and PR-A implementation may begin. PR #5 remains OPEN / non-canonical candidate and must not be merged in its current form. No ACTUAL TEST or 50/150 expansion is authorized by this correction.

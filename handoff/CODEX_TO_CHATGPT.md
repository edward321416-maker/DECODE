# Codex → ChatGPT

Report ID: DECODE-DRY-READINESS-SPEC-CORRECTIONS-2026-09-08 | Scope: PR #17 design-spec correction round (fresh Product review)
Owner: AI/Engineering Lead | Base: canonical `origin/main = d4bc7b8018398dc9644088cda64bc17f6eb63021`, unaffected by this work until PR #17 merges

Prior report: DECODE-PR-A-POST-MERGE-RECEIPT-2026-09-08, this file's immediately preceding content (superseded by this report). See Git history for the exact prior text.

## IMPLEMENTED

This is documentation/spec correction only. **No readiness code, no `readiness/` package, and no engineering implementation of any kind exists.**

**Round 2** (commit `6049f7c`): Product's fresh independent review of PR #17 head `966ad18893cb0a8450ad3f63ed8a04c08a52740e` returned `REVISE — MERGE NOT AUTHORIZED` with 10 findings against the design spec text and D037 (Dry Readiness execution-status mapping) as a new sequential decision. All 10 findings were corrected in the design spec text (`docs/superpowers/specs/2026-09-08-decode-dry-readiness-design.md`, Status remains **DRAFT — USER REVIEW REQUIRED BEFORE IMPLEMENTATION PLAN**): (1) the run-ID contract no longer implies `foundation/` gains a `readiness` namespace — `readiness/` owns its own contract; (2) the positive-quality composition condition is now correctly described as evaluated only after synthetic Gold rehearsal, never at pre-selection/freeze time; (3) the SIMULATED-only input boundary is now described as a structural allowlist, not heuristic content classification; (4) `docs/CURRENT_STATUS.md` now explicitly distinguishes canonical `main` (unaffected until merge) from PR #17 as a reviewed, not-yet-merged proposal, and records the REVISE verdict; (5) this reverse handoff was reconciled for the correction round; (6) internal section cross-references that incorrectly pointed at "Section 8" (or an unqualified "Section 4"/"Section 14/15") when they meant Section 13's gate list (or PLAN 1A's own sections) were fixed throughout; (7) dependency wording no longer calls `@decode/foundation` a "workspace dependency" while leaving the exact mechanism unresolved; (8) a new pending-log event was appended; (9) checker coverage was reviewed; (10) D025–D036 remained in force, D037 added as the next sequential decision.

**Round 3** (commit `118ca88`, follow-up polish): propagated D037 into `handoff/CHATGPT_TO_CODEX.md`'s authority list; removed the stale "package name TBD by implementer" framing from the spec's Section 11 Unresolved Decisions, since D028 already locks the `readiness/` package name (Section 11 now states this explicitly rather than listing it as unresolved). This round also edited the round-2 pending-log row's text in place to soften its "accurate timestamp" claim — corrected below.

**Round 4** (this revision, PR #17 correction round 2 per Product's fresh REVISE verdict on head `118ca8859a7c776df0b178e5a9ac3df76f93df46`): (1) `handoff/CHATGPT_TO_CODEX.md` now states D037's evidence-status-mapping semantics inline (`NOT_TESTED`/`RUNNING`/`PASSED`+`DRY_READY`/`FAILED`+`BLOCKED`/`BLOCKED`+`BLOCKED`, `EvaluationMode=SELF_BENCHMARK`, `DataOrigin=SIMULATED`, `DRY_READY != ACTUAL TEST READY != ACTUAL TEST GO`) rather than citing D037 by number alone; (2) round 3's in-place edit of the `2026-09-08T03:00:00+09:00` pending-log row is reverted — that row is restored to its original wording, preserved byte-for-byte as historical audit evidence, and a new clarification row is appended at `Timestamp=2026-09-08T23:31:28+09:00` (the actual Git commit date of `6049f7c8100a9e9a8ccffc2ccd94bc7f71ec98c1`, the correction-round commit that row describes), naming which prior timestamp claim was inaccurate and recording the real correction-completion time; this file's own finding-8 description and `docs/CURRENT_STATUS.md` are updated to match the append-not-edit approach; (3) `docs/CURRENT_STATUS.md` now states an explicit forward-looking post-merge-receipt requirement: a PR #17 merge does not itself authorize implementation, and an immediate post-merge receipt/reconciliation revision (matching the established PR-A → PR-15/PR-16 pattern) is required before any implementation plan or `readiness/` implementation is authorized. The three frozen authority documents (Integrated Spec, PLAN 1A, 10-Case ACTUAL TEST Protocol) remain unmodified throughout all four rounds. PR #5 remains untouched.

## ACTUAL TEST

NOT YET TESTED — no consented real VOD or independent expert session was run for PR-A, this design spec, this correction round, or DECODE generally. `ACTUAL TEST = NOT YET TESTED`.

## SELF-BENCHMARK

- Start-gate reconciliation for round 4 (this revision): fresh-fetched `origin/main` (`d4bc7b8018398dc9644088cda64bc17f6eb63021`, matched) and the PR #17 branch. The task directive's expected PR #17 head (`6049f7c8100a9e9a8ccffc2ccd94bc7f71ec98c1`) did not match the actual fetched branch head (`118ca8859a7c776df0b178e5a9ac3df76f93df46`, round 3's follow-up commit); this mismatch was reported via STOP_AND_REPORT and the user explicitly confirmed `118ca88...` as the legitimate current head before any edit proceeded.
- Authority blob re-verification, before and after round 4: PLAN 1A `bfb5e35b921ccc320f3ffb2631b661368206fa6b`, Integrated Spec `f7571338e93a408a8aeef93d63275d7076e76f80`, 10-Case ACTUAL TEST Protocol `4d7788bb39d68c5cd147408a85954cd5a0e7b8f0` — all three unchanged across rounds 2, 3, and 4; none of the three frozen documents were edited.
- Round 2's internal section-reference audit (unchanged, preserved from the prior report): grepped the design spec for every `Section N` occurrence and manually verified each; found and fixed 8 misreferences.
- `node scripts/check-operating-docs.mjs` (default, working tree, measured after round 4's edits): **916/916 PASS, 0 failures.**
- `node scripts/check-operating-docs.mjs --index` (staged tree, measured after round 4's edits): **988/988 PASS, 0 failures.**
- `node scripts/check-operating-docs.semantic.test.mjs`: unchanged suite (see checker-coverage note below for why no new mutation test was needed) — **53/53 PASS, 0 failures.**
- `git diff --cached --check`: exit 0, no whitespace errors.
- `node scripts/check-operating-docs.mjs --tracked` (post-commit, against the actual committed HEAD): reported in the return summary for this correction round.
- Checker-coverage review (round 2 finding 9, re-confirmed unaffected by round 4): the existing `status-pr-a-merged`, `status-no-next-scope-overclaim`, and `handoff-post-pr-a-gate` checks already mechanically enforce that `docs/CURRENT_STATUS.md`'s current region cannot silently claim PR-A is unmerged or that a next implementation task is authorized; those checks continue to pass against round 4's added post-merge-receipt-requirement prose. That prose, the inline D037 evidence-semantics restatement, and the timestamp-provenance append are new *narrative*/*audit-trail* content, not a new machine-checkable claim boundary comparable to "PR-A = MERGED" — no new semantic check was added; this conclusion is reported here rather than silently decided.
- This is documentation/contract evidence only, not compile/typecheck/software/ACTUAL TEST evidence — there is no `foundation/` or `readiness/` code in this diff to compile or typecheck.

## SIMULATED

None. This correction round edits only prose/decision-register text; no synthetic fixtures, no code, no readiness-domain data of any kind.

## FAILED

None. No check failed during this correction round; findings 1–10 were text-accuracy/reference defects in the prior draft, not test/build failures, and are corrected here.

## NOT TESTED

Readiness runtime/code (does not exist), any ACTUAL TEST evidence, PLAN 1B, expert usability, coaching effectiveness. This correction round adds no new semantic checker check (see the checker-coverage conclusion above) — the existing checker suite's applicability to this correction is fully covered by re-running it unchanged, which is reported in SELF-BENCHMARK.

## FILES CHANGED

Round 4 (this revision): `docs/CURRENT_STATUS.md`, `handoff/CHATGPT_TO_CODEX.md`, `handoff/CODEX_TO_CHATGPT.md`, `experiments/ai_execution_log.pending.csv`. No new file this round. No change to `docs/superpowers/specs/2026-09-08-decode-dry-readiness-design.md`, `docs/DECISIONS.md` (Finding 2's D028/Section 11 correction and D037's materialization were already complete as of round 3), `docs/PUBLICATION_FILES.json` (version remains 7, no file added/removed), `scripts/check-operating-docs.mjs`, `scripts/check-operating-docs.semantic.test.mjs` (see checker-coverage conclusion — none needed), the Integrated Spec, PLAN 1A, the 10-Case ACTUAL TEST Protocol, or `foundation/`. PR #5 untouched.

## RECOMMENDED NEXT DECISION

Product performs a fresh independent review of the corrected PR #17 head against round 2's 10 findings, round 3's follow-up polish, round 4's 5 findings (this revision), and D037. This PR must not be merged by Engineering. If Product finds the corrections acceptable, Product may grant merge approval; if not, Product returns further specific findings, or opens a D017 decision interview if a material gap is found. No implementation of `readiness/`, no PLAN 1B, no ACTUAL TEST, and no 50/150 expansion is authorized by this correction round.

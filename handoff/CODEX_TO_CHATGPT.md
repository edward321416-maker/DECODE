# Codex → ChatGPT

Report ID: DECODE-DRY-READINESS-SPEC-CORRECTIONS-2026-09-08 | Scope: PR #17 design-spec correction round (fresh Product review)
Owner: AI/Engineering Lead | Base: canonical `origin/main = d4bc7b8018398dc9644088cda64bc17f6eb63021`, unaffected by this work until PR #17 merges

Prior report: DECODE-PR-A-POST-MERGE-RECEIPT-2026-09-08, this file's immediately preceding content (superseded by this report). See Git history for the exact prior text.

## IMPLEMENTED

This is documentation/spec correction only. **No readiness code, no `readiness/` package, and no engineering implementation of any kind exists.** Product's fresh independent review of PR #17 head `966ad18893cb0a8450ad3f63ed8a04c08a52740e` returned `REVISE — MERGE NOT AUTHORIZED` with 10 findings against the design spec text and D037 (Dry Readiness execution-status mapping) as a new sequential decision. All 10 findings are corrected in the design spec text (`docs/superpowers/specs/2026-09-08-decode-dry-readiness-design.md`, Status remains **DRAFT — USER REVIEW REQUIRED BEFORE IMPLEMENTATION PLAN**): (1) the run-ID contract no longer implies `foundation/` gains a `readiness` namespace — `readiness/` owns its own contract; (2) the positive-quality composition condition is now correctly described as evaluated only after synthetic Gold rehearsal, never at pre-selection/freeze time; (3) the SIMULATED-only input boundary is now described as a structural allowlist, not heuristic content classification; (4) `docs/CURRENT_STATUS.md` now explicitly distinguishes canonical `main` (unaffected until merge) from PR #17 as a reviewed, not-yet-merged proposal, and records the REVISE verdict; (5) this reverse handoff is reconciled for the correction round; (6) internal section cross-references that incorrectly pointed at "Section 8" (or an unqualified "Section 4"/"Section 14/15") when they meant Section 13's gate list (or PLAN 1A's own sections) are fixed throughout; (7) dependency wording no longer calls `@decode/foundation` a "workspace dependency" while leaving the exact mechanism unresolved — it now consistently says "repository-local dependency; exact workspace/`file:` linking mechanism is a C11 implementation detail"; (8) a new pending-log event is appended for this correction round with a locally-assigned sequential-estimate timestamp (not a verified system-clock capture — no live clock is available to this process), corrected from the prior round's unqualified "accurate timestamp" claim; no historical (already-merged) row is rewritten; (9) checker coverage was reviewed (see SELF-BENCHMARK below for the conclusion); (10) D025–D036 remain in force, D037 added as the next sequential decision. The three frozen authority documents (Integrated Spec, PLAN 1A, 10-Case ACTUAL TEST Protocol) remain unmodified. PR #5 remains untouched.

## ACTUAL TEST

NOT YET TESTED — no consented real VOD or independent expert session was run for PR-A, this design spec, this correction round, or DECODE generally. `ACTUAL TEST = NOT YET TESTED`.

## SELF-BENCHMARK

- Start-gate reconciliation: fresh-fetched `origin/main` and the PR #17 branch; both matched the values Product's directive specified (`d4bc7b8018398dc9644088cda64bc17f6eb63021` and `966ad18893cb0a8450ad3f63ed8a04c08a52740e` respectively) before any edit.
- Authority blob re-verification, before and after this correction round: PLAN 1A `bfb5e35b921ccc320f3ffb2631b661368206fa6b`, Integrated Spec `f7571338e93a408a8aeef93d63275d7076e76f80`, 10-Case ACTUAL TEST Protocol `4d7788bb39d68c5cd147408a85954cd5a0e7b8f0` — all three unchanged; none of the three frozen documents were edited.
- Internal section-reference audit: grepped the design spec for every `Section N` occurrence and manually verified each against this document's own section numbering (0–16 plus appendices) and against Protocol/PLAN 1A cross-references; found and fixed 8 misreferences (6 instances of a stale "Section 8" that should read "Section 13," one unqualified "Section 4" that should read "Section 10," one unqualified "Section 14/15" that should read "PLAN 1A Section 14/15").
- `node scripts/check-operating-docs.mjs` (default, working tree): **914/914 PASS, 0 failures.**
- `node scripts/check-operating-docs.mjs --index` (staged tree): **986/986 PASS, 0 failures.**
- `node scripts/check-operating-docs.semantic.test.mjs`: unchanged suite (see checker-coverage note below for why no new mutation test was needed) — **53/53 PASS, 0 failures.**
- `git diff --cached --check`: exit 0, no whitespace errors.
- `node scripts/check-operating-docs.mjs --tracked` (post-commit, against the actual committed HEAD): reported in the STOP_AND_REPORT for this correction round.
- Checker-coverage review (finding 9): the existing `status-pr-a-merged`, `status-no-next-scope-overclaim`, and `handoff-post-pr-a-gate` checks already mechanically enforce that `docs/CURRENT_STATUS.md`'s current region cannot silently claim PR-A is unmerged or that a next implementation task is authorized; those checks are unaffected by and continue to pass against this correction's text. D037 and the unmerged-PR-provenance distinction are new *narrative* content (decision text, explanatory status prose) rather than a new *machine-checkable claim boundary* comparable to "PR-A = MERGED" or "no next implementation task is authorized" — there is no analogous single literal phrase whose presence/absence would meaningfully gate a real regression the way those two do. Adding a tautological text-presence check (e.g. "does `docs/DECISIONS.md` contain the string `D037`") would not catch any real error class this repository's semantic-checker discipline exists to catch, so no new semantic check was added; this conclusion itself is reported here rather than silently decided.
- This is documentation/contract evidence only, not compile/typecheck/software/ACTUAL TEST evidence — there is no `foundation/` or `readiness/` code in this diff to compile or typecheck.

## SIMULATED

None. This correction round edits only prose/decision-register text; no synthetic fixtures, no code, no readiness-domain data of any kind.

## FAILED

None. No check failed during this correction round; findings 1–10 were text-accuracy/reference defects in the prior draft, not test/build failures, and are corrected here.

## NOT TESTED

Readiness runtime/code (does not exist), any ACTUAL TEST evidence, PLAN 1B, expert usability, coaching effectiveness. This correction round adds no new semantic checker check (see the checker-coverage conclusion above) — the existing checker suite's applicability to this correction is fully covered by re-running it unchanged, which is reported in SELF-BENCHMARK.

## FILES CHANGED

`docs/superpowers/specs/2026-09-08-decode-dry-readiness-design.md`, `docs/DECISIONS.md`, `docs/CURRENT_STATUS.md`, `handoff/CODEX_TO_CHATGPT.md`, `experiments/ai_execution_log.pending.csv`. No new file. `handoff/CHATGPT_TO_CODEX.md` is unchanged this round — its prior SPEC REVIEW GATE content ("no engineering implementation is currently authorized") remains accurate. No change to `docs/PUBLICATION_FILES.json` (version remains 7, no file added/removed), `scripts/check-operating-docs.mjs`, `scripts/check-operating-docs.semantic.test.mjs` (see checker-coverage conclusion — none needed), the Integrated Spec, PLAN 1A, the 10-Case ACTUAL TEST Protocol, or `foundation/`. PR #5 untouched.

## RECOMMENDED NEXT DECISION

Product performs a fresh independent review of the corrected PR #17 head against these 10 findings and D037. This PR must not be merged by Engineering. If Product finds the corrections acceptable, Product may grant merge approval; if not, Product returns further specific findings, or opens a D017 decision interview if a material gap is found. No implementation of `readiness/`, no PLAN 1B, no ACTUAL TEST, and no 50/150 expansion is authorized by this correction round.

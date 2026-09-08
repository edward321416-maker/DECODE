# Codex → ChatGPT

Report ID: DECODE-PR-A-CANONICAL-FOUNDATION-CORRECTIONS-ROUND3-2026-09-07 | Scope: PR #15 Product-review round-3 (final-focused) corrections
Owner: AI/Engineering Lead | Base: `APPROVED_IMPLEMENTATION_BASE_SHA = 4e006c9512e7665cd9195c42c508435092cb672d`

Prior report: DECODE-PR-A-CANONICAL-FOUNDATION-CORRECTIONS-ROUND2-2026-09-07, this file's immediately preceding content (superseded by this report). See Git history for the exact prior text.

**Non-self-reference note:** this report's evidence was measured against commit `961408a2311e18620234c78723fb344f93ec8a25` (the "verified code snapshot" — the exact commit subjected to `npm ci`/typecheck/test/checker). This status/handoff-reconciliation commit necessarily moves branch HEAD forward again without changing `foundation/` source. Product must read the actual live PR #15 head from GitHub directly, not assume it equals the verified code snapshot SHA quoted here.

## IMPLEMENTED

PLAN 1A Canonical Foundation (prior reports) plus round-1's 10 corrections and round-2's 3 corrections (prior reports) plus 2 further narrowly scoped corrections against Product's final-focused review of PR #15 (audited head `9e32c6ec0daa9ff5ff10e0ba8f2ec223de36b5b6`, which accepted round-2 findings A–C as corrected). Neither of the 2 findings exposed a material Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost decision — both are implementation defects against already-LOCKED contracts, fixed on the existing branch/PR without touching the Integrated Spec, PLAN 1A, the 10-Case Protocol, `docs/DECISIONS.md`, or PR #5. By finding:

**1. Byte-ambiguous canonical fingerprint encoding.** The prior length-prefixed encoding computed its prefix from JavaScript string `.length` (a count of UTF-16 code units) but hashed the field via Node's default UTF-8 string-to-bytes conversion. UTF-8 conversion substitutes *any* lone (unpaired) surrogate with the same U+FFFD replacement byte sequence, so two canonical commands differing only by which lone surrogate one field contained (e.g. `aggregateKey="\uD800"` vs `aggregateKey="\uD801"`) could hash to identical bytes despite being genuinely different runtime strings. `encodeField()` in `foundation/src/storage/atomic-command-gate.ts` now emits a 4-byte big-endian **byte**-length prefix followed by the field's raw UTF-16LE byte representation (`Buffer.from(value, "utf16le")`), which preserves every UTF-16 code unit — including lone surrogates — byte-for-byte, so distinct runtime strings can never collapse before hashing.

**2. Non-failure-atomic DurableJob completion.** `succeed()`/`fail()` mutated `Attempt.state` and `Job.state` *before* `deepCloneEvidence()` (`structuredClone`) ran on the supplied evidence. Since `structuredClone` throws for non-cloneable values (e.g. an object containing a function), a throwing clone left the job stuck with its state already transitioned to `SUCCEEDED`/`FAILED` but no evidence actually stored. Both methods now compute the cloned evidence first and only mutate `Attempt`/`Job` state after the clone succeeds, so a throwing clone leaves the job untouched in `RUNNING` — including remaining usable for a subsequent, valid `succeed()`/`fail()` call.

## ACTUAL TEST

NOT YET TESTED — no consented real VOD or independent expert session was run, for this implementation, any correction round, or for DECODE generally. `ACTUAL TEST = NOT YET TESTED`.

## SELF-BENCHMARK

**Round-3 corrections (this report), measured against the verified code snapshot `961408a2311e18620234c78723fb344f93ec8a25`:**

- RED evidence: the new/changed tests for findings 1–2 were written and run against the round-2-fixed (not yet round-3-fixed) implementation. The suite ran **82 tests, 78 pass, 4 fail** — two real assertion failures for finding 1 (fingerprint distinctness; conflict-not-replay on key reuse) and two for finding 2 (`succeed()`/`fail()` atomicity) — all genuine behavioral failures against the then-current implementation, not import/syntax errors. Fixes were then implemented; the suite reran fully GREEN, all 78 prior tests preserved unweakened.
- `foundation/` fresh `npm ci` (Node v24.14.0): clean install, **0 vulnerabilities**.
- `npm run typecheck` (`tsc`, strict, `noUncheckedIndexedAccess`): **0 errors.**
- `npm test`: **82/82 PASS, 0 failures** (78 from round 2 + 4 new tests covering findings 1–2).
- `node scripts/check-operating-docs.mjs --tracked` at the verified code snapshot: **966/966 PASS, 0 failures** — unchanged from round 2 since round 3 touched only already-tracked `foundation/**` source/test files, not the publication inventory. This count reflects the snapshot only; Product must independently re-measure `--tracked` against the actual live PR head.
- `node scripts/check-operating-docs.semantic.test.mjs`: **51/51 PASS, 0 failures** (unchanged; round 3 made no Team OS/checker-contract change).
- `git diff 4e006c9512e7665cd9195c42c508435092cb672d..HEAD --check` at the verified code snapshot: exit 0, no whitespace errors. **Exactly 27 files changed** vs. the original approved base (verified via `git diff --name-only`) — identical file list to all three prior reports; round 3 only modified already-listed `foundation/**` files, adding none.
- Authority document blob/hash re-verification: Integrated Spec `f7571338e93a408a8aeef93d63275d7076e76f80` and 10-Case ACTUAL TEST Protocol `4d7788bb39d68c5cd147408a85954cd5a0e7b8f0` unchanged; PLAN 1A blob unchanged from branch creation (`bfb5e35b921ccc320f3ffb2631b661368206fa6b`); no PLAN 1A text touched.
- No secret/private-VOD/consent/access-bearing material added or changed: both corrections are in-memory reference-implementation logic and synthetic test fixtures (including deliberately malformed lone-surrogate strings and a deliberately non-cloneable test fixture, both synthetic and non-sensitive).
- PR #5 re-verified: OPEN, untouched.
- This is documentation/contract/software-engineering evidence only (SELF-BENCHMARK), not ACTUAL TEST evidence, and does not self-promote.

**Round-2 corrections (prior report, unchanged facts):** findings A–C fixed (same-idempotency-key/different-aggregate race; durable-history nested-evidence ingress+egress aliasing; incomplete runtime provenance validation); RED before fix: 78 tests, 69 pass, 9 fail. See Git history for the full prior text.

**Round-1 corrections (prior report, unchanged facts):** 10 findings fixed; RED before fix: 66 tests, 55 pass, 11 fail. See Git history for the full prior text.

**Original implementation round (prior report, unchanged facts):** genuine TDD from typed `not implemented` stubs captured real RED at 53 tests, 7 pass, 46 fail; `docs/PUBLICATION_FILES.json` → version 6 (18 tracked `foundation/` files). See Git history for the full prior text.

## SIMULATED

`foundation/test/**` uses deterministic in-memory fixtures and a `TestClock` for time control — synthetic test data only, not synthetic decision/VOD/expert records and not folded into any ACTUAL TEST claim.

## FAILED

The 4 intentional RED failures captured during round 3's pre-fix state (see SELF-BENCHMARK) are real evidence each fix addresses a genuine gap — both were resolved by the corresponding fix and the suite is fully GREEN. The 9 RED failures from round 2, the 11 from round 1, and the 46 from the original implementation (prior reports) remain valid historical evidence, also resolved. No other check, build, or test failure occurred. Google sync remains BLOCKED by missing bindings, as before.

## NOT TESTED

ACTUAL TEST (real VOD/expert session), expert usability, coaching effectiveness, application/runtime behavior beyond `foundation/`'s own automated suite, accessibility/security conformance, empirical token savings, and actual Codex/Claude Code/human obedience to any checked contract. No manifest scripts beyond `foundation/`'s own `npm ci`/`typecheck`/`test` were executed. Gate D (Model Evaluation) is N/A per PLAN 1A; Gate E (Actual Expert Test) is NOT YET TESTED; Gate F (Product Review) is PENDING (awaiting Product's final re-audit of the actual live PR head); Gate G (Deployment) is NOT AUTHORIZED.

## FILES CHANGED

Identical file set to all three prior reports — **27 files vs. the approved base**: `.gitignore`, `docs/CURRENT_STATUS.md`, `docs/PUBLICATION_FILES.json`, `experiments/ai_execution_log.pending.csv`, `handoff/CHATGPT_TO_CODEX.md`, `handoff/CODEX_TO_CHATGPT.md`, `scripts/check-operating-docs.mjs`, `scripts/check-operating-docs.semantic.test.mjs`, plus 18 files under `foundation/` (`package.json`, `package-lock.json`, `tsconfig.json`, `scripts/run-tests.mjs`, 8 `src/**` files, 6 `test/**` files). Round 3's own code-fix diff (`9e32c6e..961408a`) touches exactly 4 files, all already in the above list: `foundation/src/jobs/durable-job.ts`, `foundation/src/storage/atomic-command-gate.ts`, `foundation/test/atomic-command-gate.test.ts`, `foundation/test/durable-job.test.ts`. No new file, no change to `docs/DECISIONS.md`, the Integrated Spec, the 10-Case ACTUAL TEST Protocol, or PLAN 1A text; PR #5 untouched.

## RECOMMENDED NEXT DECISION

Product performs one final independent GitHub source audit of the actual live PR #15 head against findings 1–2 and PLAN 1A Section 12/13. This PR must not be merged by Engineering. If Product finds these blockers closed with no regression, Product may grant MERGE approval directly; if not, Product returns further specific findings, or opens a D017 decision interview if a material gap is found. No ACTUAL TEST or 50/150 expansion is authorized by this correction round.

# Codex → ChatGPT

Report ID: DECODE-PR-A-CANONICAL-FOUNDATION-CORRECTIONS-ROUND2-2026-09-07 | Scope: PR #15 Product-review round-2 corrections
Owner: AI/Engineering Lead | Base: `APPROVED_IMPLEMENTATION_BASE_SHA = 4e006c9512e7665cd9195c42c508435092cb672d`

Prior report: DECODE-PR-A-CANONICAL-FOUNDATION-CORRECTIONS-2026-09-07, this file's immediately preceding content (superseded by this report). See Git history for the exact prior text.

## IMPLEMENTED

PLAN 1A Canonical Foundation (prior reports) plus round-1's 10 corrections (prior report) plus 3 further corrections against Product's independent re-review of PR #15 (head `dbc2d75ba929327f1287a2c903a1222bb759e1e0`). None of the 3 findings exposed a material Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost decision — all are implementation defects against already-LOCKED contracts, fixed on the existing branch/PR without touching the Integrated Spec, PLAN 1A, the 10-Case Protocol, `docs/DECISIONS.md`, or PR #5. By finding:

**A. Same-idempotency-key race across different aggregates.** Round-1's fix serialized `AtomicCommandGate.execute()` only per `aggregateKey`, so two calls sharing the same `idempotencyKey` but targeting *different* aggregates could each independently observe "no receipt yet" and both execute their mutation callback. `execute()` now serializes per `idempotencyKey` FIRST (a `withLock(idempotencyLocks, idempotencyKey, ...)` wrapping the existing `withLock(aggregateLocks, aggregateKey, ...)`), so the losing command — the one whose canonical command differs because its `aggregateKey` differs — is rejected as `CommandConflictError` with its `mutate()` callback never invoked, while the winning command commits normally. Lock acquisition order is always `idempotencyLocks` → `aggregateLocks`, never reversed, so this cannot deadlock. Round-1's already-fixed behaviors (same key/same command replay; different keys racing the same aggregate → one commit, loser `StaleVersionError`) are preserved by the same composed mechanism.

**B. Durable history nested-object aliasing.** `DurableJob`'s clone-on-read was shallow: `resultEvidence`/`failureEvidence` were copied by reference, and `externalObservedAt` was stored directly from the caller's `Date` on ingress (`reconcile()`), meaning a caller mutating a nested object inside evidence they supplied — or inside a previously-returned view — could alter stored history. Added `deepCloneEvidence()` (a `structuredClone`-based helper) applied at **both** ingress (`succeed()`, `fail()`) and egress (`getAttempts()`, `getReconciliations()`); `externalObservedAt` is now cloned to a fresh `Date` on ingress in `reconcile()` too (egress cloning for it already existed from round 1). Neither the caller's original input object/Date nor a previously-returned view can now alias stored historical evidence or provenance.

**C. Incomplete runtime provenance validation.** `validateEvidenceRecord()` validated `DataOrigin` at the runtime boundary (round 1) but still trusted TypeScript for `EvaluationMode`, `ExecutionStatus`, and `evaluationSubtype`. Added `assertValidEvaluationMode`/`assertValidExecutionStatus`/`assertValidEvaluationSubtype`, all invoked from `validateEvidenceRecord()`, enforcing D023's complete locked value set — including rejecting `evaluationMode="MODEL_BAKE_OFF"` as a top-level mode (not only as the existing `evaluation_subtype=MODEL_BAKE_OFF` metadata path), an unknown `EvaluationMode`, an unknown/non-canonical `ExecutionStatus` (e.g. `"EXECUTED"`), and an unknown `evaluationSubtype`. All D023/D024 semantics and the `MODEL_BAKE_OFF` subtype path are unchanged.

## ACTUAL TEST

NOT YET TESTED — no consented real VOD or independent expert session was run, for this implementation, either correction round, or for DECODE generally. `ACTUAL TEST = NOT YET TESTED`.

## SELF-BENCHMARK

**Round-2 corrections (this report):**

- RED evidence: the new/changed tests for findings A–C were written and run against the round-1-fixed (not yet round-2-fixed) implementation. The suite ran **78 tests, 69 pass, 9 fail** — one real assertion failure for finding A, four for finding B (B.1–B.4; B.5 was already passing since round-1 already cloned `externalObservedAt` on egress), and four for finding C (C.1–C.4) — all genuine behavioral failures against the then-current implementation, not import/syntax errors. Fixes were then implemented; the suite reran fully GREEN.
- `foundation/` fresh `npm ci` (Node v24.14.0, committed HEAD `1d081607a7a71a6013b67c939a465f375ef27694`): clean install, **0 vulnerabilities**.
- `npm run typecheck` (`tsc`, strict, `noUncheckedIndexedAccess`): **0 errors.**
- `npm test`: **78/78 PASS, 0 failures** (66 from round 1 + 12 new tests covering findings A–C).
- `node scripts/check-operating-docs.mjs --tracked` (committed HEAD `1d081607a7a71a6013b67c939a465f375ef27694`): **965/965 PASS, 0 failures** — unchanged from the round-1 count since round 2 touched only already-tracked `foundation/**` source/test files, not the publication inventory.
- `node scripts/check-operating-docs.semantic.test.mjs`: **51/51 PASS, 0 failures** (unchanged; round 2 made no Team OS/checker-contract change).
- `git diff 4e006c9512e7665cd9195c42c508435092cb672d..HEAD --check`: exit 0, no whitespace errors. **Exactly 27 files changed** vs. the original approved base (verified via `git diff --name-only`) — identical file list to both prior reports; round 2 only modified already-listed `foundation/**` files, adding none.
- Authority document blob/hash re-verification: Integrated Spec `f7571338e93a408a8aeef93d63275d7076e76f80` and 10-Case ACTUAL TEST Protocol `4d7788bb39d68c5cd147408a85954cd5a0e7b8f0` unchanged; PLAN 1A blob unchanged from branch creation (`bfb5e35b921ccc320f3ffb2631b661368206fa6b`); no PLAN 1A text touched.
- No secret/private-VOD/consent/access-bearing material added or changed: all 3 corrections are in-memory reference-implementation logic and synthetic test fixtures.
- PR #5 re-verified: OPEN, untouched.
- This is documentation/contract/software-engineering evidence only (SELF-BENCHMARK), not ACTUAL TEST evidence, and does not self-promote.

**Round-1 corrections (prior report, unchanged facts):** 10 findings fixed (execution-time binding, permit tamper-resistance, policy content-drift detection, unambiguous fingerprint encoding, fail-closed Rights, same-aggregate concurrency serialization, Job/Permit namespace enforcement, DataOrigin runtime enforcement, durable-history clone-on-read, inclusive expiry boundary); RED before fix: 66 tests, 55 pass, 11 fail. See Git history for the full prior text.

**Original implementation round (prior report, unchanged facts):** genuine TDD from typed `not implemented` stubs captured real RED at 53 tests, 7 pass, 46 fail; `docs/PUBLICATION_FILES.json` → version 6 (18 tracked `foundation/` files); `tsx` bumped to `4.23.13` to clear a moderate dev-only `esbuild` advisory. See Git history for the full prior text.

## SIMULATED

`foundation/test/**` uses deterministic in-memory fixtures and a `TestClock` for time control — synthetic test data only, not synthetic decision/VOD/expert records and not folded into any ACTUAL TEST claim.

## FAILED

The 9 intentional RED failures captured during round 2's pre-fix state (see SELF-BENCHMARK) are real evidence each fix addresses a genuine gap — all were resolved by the corresponding fix and the suite is fully GREEN. The 11 RED failures from round 1 and the 46 from the original implementation (prior reports) remain valid historical evidence, also resolved. No other check, build, or test failure occurred. Google sync remains BLOCKED by missing bindings, as before.

## NOT TESTED

ACTUAL TEST (real VOD/expert session), expert usability, coaching effectiveness, application/runtime behavior beyond `foundation/`'s own automated suite, accessibility/security conformance, empirical token savings, and actual Codex/Claude Code/human obedience to any checked contract. No manifest scripts beyond `foundation/`'s own `npm ci`/`typecheck`/`test` were executed. Gate D (Model Evaluation) is N/A per PLAN 1A; Gate E (Actual Expert Test) is NOT YET TESTED; Gate F (Product Review) is PENDING (this round awaits Product's re-audit); Gate G (Deployment) is NOT AUTHORIZED.

## FILES CHANGED

Identical file set to both prior reports — **27 files vs. the approved base**: `.gitignore`, `docs/CURRENT_STATUS.md`, `docs/PUBLICATION_FILES.json`, `experiments/ai_execution_log.pending.csv`, `handoff/CHATGPT_TO_CODEX.md`, `handoff/CODEX_TO_CHATGPT.md`, `scripts/check-operating-docs.mjs`, `scripts/check-operating-docs.semantic.test.mjs`, plus 18 files under `foundation/` (`package.json`, `package-lock.json`, `tsconfig.json`, `scripts/run-tests.mjs`, 8 `src/**` files, 6 `test/**` files). Round 2's own diff (`dbc2d75..1d08160`) touches exactly 6 files, all already in the above list: `foundation/src/jobs/durable-job.ts`, `foundation/src/shared/provenance.ts`, `foundation/src/storage/atomic-command-gate.ts`, `foundation/test/atomic-command-gate.test.ts`, `foundation/test/durable-job.test.ts`, `foundation/test/provenance.test.ts`. No new file, no change to `docs/DECISIONS.md`, the Integrated Spec, the 10-Case ACTUAL TEST Protocol, or PLAN 1A text; PR #5 untouched.

## RECOMMENDED NEXT DECISION

Product re-audits the actual GitHub code for PR #15 at head `1d081607a7a71a6013b67c939a465f375ef27694` against findings A–C and PLAN 1A Section 12/13. This PR must not be merged by Engineering. If Product finds the corrections acceptable, Product merges directly; if not, Product returns further specific findings, or opens a D017 decision interview if a material gap is found. No ACTUAL TEST or 50/150 expansion is authorized by this correction round.

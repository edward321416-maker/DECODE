# Codex → ChatGPT

Report ID: DECODE-PR-A-CANONICAL-FOUNDATION-CORRECTIONS-2026-09-07 | Scope: PR #15 Product-review corrections
Owner: AI/Engineering Lead | Base: `APPROVED_IMPLEMENTATION_BASE_SHA = 4e006c9512e7665cd9195c42c508435092cb672d`

Prior report: DECODE-PR-A-CANONICAL-FOUNDATION-IMPLEMENTATION-2026-09-07, this file's immediately preceding content (superseded by this report). See Git history for the exact prior text.

## IMPLEMENTED

PLAN 1A Canonical Foundation, as reported in the prior handoff, plus 10 corrections against Product's independent review of PR #15 (head `23b02f26dbca349157c0d11e8ac513cec1a7c3a7`). None of the 10 findings exposed a material Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost decision — all are implementation defects against already-LOCKED contracts, fixed on the existing branch/PR without touching the Integrated Spec, PLAN 1A, the 10-Case Protocol, `docs/DECISIONS.md`, or PR #5. By finding:

1. **Execution-time binding enforcement** — `InMemoryPolicyRightsGate.revalidate(permitId, request)` now takes the execution request and checks it against the internally stored authoritative permit via `permitMatchesRequest` before any other check; a caller can no longer succeed by calling `revalidate(permitId)` alone.
2. **Tamper-resistant permit state** — `authorize()` stores a canonical permit object internally (never exposed) and returns a deep clone (fresh `sourceRefs` array, fresh `issuedAt`/`expiresAt` `Date` instances) on every call; `revalidate` always reads the internally stored object, so mutating the returned permit (including attempting to rewrite `expiresAt` far into the future) cannot affect stored state or bypass later checks.
3. **Policy content-drift detection (invariant 38)** — the gate now derives a `sha256` content hash over the canonicalized rule set (sorted purposes/data classes/destinations, sorted by action) independently of the caller-supplied `id`/`hash` labels, and rejects a permit at revalidation if that content hash has changed since issuance — catching drift even when `id` and the supplied `hash` are left unchanged. Policy snapshots are deep-cloned on ingestion (constructor and `setPolicySnapshot`) so a caller cannot mutate the gate's stored snapshot after the fact.
4. **Unambiguous fingerprint encoding** — `fingerprintCommand` now length-prefixes each field (`` `${value.length}:${value}` ``) before hashing instead of delimiter-joined concatenation, eliminating the field-boundary collision where e.g. `aggregateKey="a b", operation="c"` and `aggregateKey="a", operation="b c"` previously hashed identically.
5. **Fail-closed Rights** — `InMemoryRightsStore.get()` now returns `undefined` for a missing record instead of defaulting to `EXECUTABLE`; both `authorize` and `revalidate` explicitly deny when no rights record exists. No new `Eligibility` enum value was added, per the finding's own guidance.
6. **Same-aggregate concurrency race** — `AtomicCommandGate.execute()` now serializes all commands per `aggregateKey` (not only per `idempotencyKey`) via a per-aggregate promise-chain lock; two different idempotency keys racing on the same aggregate/expectedVersion now resolve to exactly one commit, with the loser rejected by `StaleVersionError` and its `mutate()` callback never invoked. The existing same-key concurrent-duplicate behavior (invariant 16) is preserved by the same mechanism.
7. **Job/Permit namespace enforcement** — `DurableJob`'s constructor now validates its id is in the `"job"` namespace via `isNamespacedId`, rejecting a Permit id or an unnamespaced string.
8. **Runtime provenance enforcement at the point of use** — `validateEvidenceRecord()` now calls `assertValidDataOrigin()` on itself as its first step, so a non-canonical runtime `DataOrigin` (e.g. `"MIXED"` arriving from outside the type system) is rejected without depending on a caller separately remembering to call `assertValidDataOrigin` first. D023/D024 semantics and `MODEL_BAKE_OFF` subtype behavior are unchanged.
9. **Durable history protected from external mutation** — `DurableJob.getAttempts()`/`getReconciliations()` now return deep clones (including fresh `Date` instances for `startedAt`/`recordedAt`/`externalObservedAt`) instead of the live internal arrays/objects; mutating the returned view cannot alter stored history, evidence, or timestamps.
10. **Inclusive expiry boundary** — permit expiry is now `now >= expiresAt` (was `>`); a permit is no longer executable at exactly its expiry instant, not only strictly after it.

## ACTUAL TEST

NOT YET TESTED — no consented real VOD or independent expert session was run, for this implementation, its corrections, or for DECODE generally. `ACTUAL TEST = NOT YET TESTED`.

## SELF-BENCHMARK

**Corrections round (this report):**

- RED evidence: with the test files carrying the 10 findings' new/changed assertions but the source reverted to the pre-correction implementation (`git stash` isolation, confirmed via `git status`/diff before and after), the suite ran **66 tests, 55 pass, 11 fail**. The 11 failures were real assertion/behavioral failures against the prior implementation — one per finding, with finding 4 (fingerprint collision) covered by two failing tests — not import or syntax errors; `tsc` additionally reported 13 real compile errors on the old `revalidate(permitId)` signature (finding 1), confirming the missing parameter at the type level too. Source fixes were then restored; the suite reran fully GREEN.
- `foundation/` fresh `npm ci` (Node v24.14.0, committed HEAD `6bca24c323cde783fda4478ad707675cc4cb48d8`): clean install, **0 vulnerabilities**.
- `npm run typecheck` (`tsc`, strict, `noUncheckedIndexedAccess`): **0 errors.**
- `npm test`: **66/66 PASS, 0 failures** (53 from the original implementation + 13 new tests covering the 10 findings, several findings covered by more than one test).
- `node scripts/check-operating-docs.mjs --tracked` (committed HEAD `6bca24c323cde783fda4478ad707675cc4cb48d8`): **964/964 PASS, 0 failures** — unchanged from the pre-correction count since this round touched only already-tracked `foundation/**` source/test files, not the publication inventory.
- `node scripts/check-operating-docs.semantic.test.mjs`: **51/51 PASS, 0 failures** (unchanged from the prior report; this round made no Team OS/checker-contract change).
- `git diff 4e006c9512e7665cd9195c42c508435092cb672d..HEAD --check`: exit 0, no whitespace errors. **Exactly 27 files changed** vs. the original approved base (verified via `git diff --name-status`) — identical file list to the prior report; this round only modified already-listed `foundation/**` files, adding none.
- Authority document blob/hash re-verification: Integrated Spec `f7571338e93a408a8aeef93d63275d7076e76f80` and 10-Case ACTUAL TEST Protocol `4d7788bb39d68c5cd147408a85954cd5a0e7b8f0` unchanged; PLAN 1A blob unchanged from branch creation (`bfb5e35b921ccc320f3ffb2631b661368206fa6b`); no PLAN 1A text touched by this correction round.
- No secret/private-VOD/consent/access-bearing material added or changed: all 10 corrections are in-memory reference-implementation logic and synthetic test fixtures.
- PR #5 re-verified: OPEN, `codex/annotation-infrastructure`, untouched.
- This is documentation/contract/software-engineering evidence only (SELF-BENCHMARK), not ACTUAL TEST evidence, and does not self-promote.

**Original implementation round (prior report, unchanged facts):** genuine TDD from typed `not implemented` stubs captured real RED at 53 tests, 7 pass, 46 fail; `docs/PUBLICATION_FILES.json` → version 6 (18 tracked `foundation/` files); `tsx` bumped to `4.23.13` to clear a moderate dev-only `esbuild` advisory. See Git history for the full prior text.

## SIMULATED

`foundation/test/**` uses deterministic in-memory fixtures and a `TestClock` for time control — synthetic test data only, not synthetic decision/VOD/expert records and not folded into any ACTUAL TEST claim. The `git stash`-isolated RED capture used the real repository source under test, not a synthetic fixture.

## FAILED

The 11 intentional RED failures captured during the corrections' pre-fix isolation (see SELF-BENCHMARK) are real evidence each fix addresses a genuine gap — all were resolved by the corresponding fix and the suite is fully GREEN. The 46 RED failures from the original implementation round (prior report) remain valid historical evidence, also resolved. No other check, build, or test failure occurred. Google sync remains BLOCKED by missing bindings, as before.

## NOT TESTED

ACTUAL TEST (real VOD/expert session), expert usability, coaching effectiveness, application/runtime behavior beyond `foundation/`'s own automated suite, accessibility/security conformance, empirical token savings, and actual Codex/Claude Code/human obedience to any checked contract. No manifest scripts beyond `foundation/`'s own `npm ci`/`typecheck`/`test` were executed. Gate D (Model Evaluation) is N/A per PLAN 1A; Gate E (Actual Expert Test) is NOT YET TESTED; Gate F (Product Review) is PENDING (this correction round awaits Product's re-audit); Gate G (Deployment) is NOT AUTHORIZED.

## FILES CHANGED

Identical file set to the original implementation report — **27 files vs. the approved base**: `.gitignore`, `docs/CURRENT_STATUS.md`, `docs/PUBLICATION_FILES.json`, `experiments/ai_execution_log.pending.csv`, `handoff/CHATGPT_TO_CODEX.md`, `handoff/CODEX_TO_CHATGPT.md`, `scripts/check-operating-docs.mjs`, `scripts/check-operating-docs.semantic.test.mjs`, plus 18 files under `foundation/` (`package.json`, `package-lock.json`, `tsconfig.json`, `scripts/run-tests.mjs`, 8 `src/**` files, 6 `test/**` files). This correction round's own diff (`23b02f2..HEAD`) touches exactly 8 files, all already in the above list: `foundation/src/jobs/durable-job.ts`, `foundation/src/policy/in-memory-policy-rights-gate.ts`, `foundation/src/shared/provenance.ts`, `foundation/src/storage/atomic-command-gate.ts`, `foundation/test/atomic-command-gate.test.ts`, `foundation/test/durable-job.test.ts`, `foundation/test/policy-rights-gate.test.ts`, `foundation/test/provenance.test.ts`. No new file, no change to `docs/DECISIONS.md`, the Integrated Spec, the 10-Case ACTUAL TEST Protocol, or PLAN 1A text; PR #5 untouched.

## RECOMMENDED NEXT DECISION

Product re-audits the actual GitHub code for PR #15 at head `6bca24c323cde783fda4478ad707675cc4cb48d8` against the 10 findings and PLAN 1A Section 12/13. This PR must not be merged by Engineering. If Product finds the corrections acceptable, Product merges directly; if not, Product returns further specific findings, or opens a D017 decision interview if a material gap is found. No ACTUAL TEST or 50/150 expansion is authorized by this correction round.

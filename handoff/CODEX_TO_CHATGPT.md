# Codex → ChatGPT

Report ID: DECODE-PR-A-CANONICAL-FOUNDATION-IMPLEMENTATION-2026-09-07 | Scope: PLAN 1A Canonical Foundation implementation
Owner: AI/Engineering Lead | Base: `APPROVED_IMPLEMENTATION_BASE_SHA = 4e006c9512e7665cd9195c42c508435092cb672d`

Prior report: DECODE-PRE-PR-A-GATE-FIX-2026-09-07, this file's immediately preceding content (superseded by this report). See Git history for the exact prior text.

## IMPLEMENTED

PLAN 1A Canonical Foundation implemented end-to-end under a new `foundation/` TypeScript/Node package (locked only for this package per PLAN 1A Section 2), on branch `claude/pr-a-canonical-foundation` created from the exact approved base. Start-gate verification confirmed branch base, `origin/main`, and the PLAN 1A blob all matched the approved values before any implementation began. By PLAN 1A area:

- **Provenance (Section 3, D023/D024-amended):** `foundation/src/shared/provenance.ts` — canonical `EvaluationMode`/`DataOrigin`/`ExecutionStatus` types (no `MIXED`, no `MODEL_BAKE_OFF` top-level mode, no separate `ActualTestStatus` axis); `validateEvidenceRecord` enforces ACTUAL TEST requires REAL and `evaluation_subtype=MODEL_BAKE_OFF` only under SELF-BENCHMARK; `isPreExecutionRecord`/`excludeFromExecutedDenominator` implement the D024 pre-execution-record semantics; `assertValidDataOrigin` rejects non-canonical runtime input (including `MIXED`); `selfPromoteToActualTest` is an explicit anti-promotion guard.
- **Canonical command identity (Section 4):** `foundation/src/storage/atomic-command-gate.ts` — `fingerprintCommand` derives a SHA-256 fingerprint over aggregateKey/operation/actorId/payloadHash/expectedVersion; `AtomicCommandGate.execute` replays on an identical canonical command, conflicts on any changed field reusing the same idempotency key, rejects stale versions before invoking `mutate()`, and serializes concurrent duplicate calls (via an in-flight promise map) so the reference adapter executes `mutate()` exactly once.
- **ActorVerifier Port + Policy & Rights (Sections 5–7):** `foundation/src/policy/contracts.ts` (port/type contracts) and `foundation/src/policy/in-memory-policy-rights-gate.ts` — `InMemoryPolicyRightsGate.authorize` runs the full order (ActorVerifier → Policy ALLOW → Rights EXECUTABLE → Permit), normalizes/dedupes/sorts source refs, requires a non-empty approved destination for `EXTERNAL_EGRESS`; `revalidate` re-checks expiry, actor verification, policy snapshot identity/hash, rule binding, and rights eligibility/revision at execution time; `permitMatchesRequest` detects any changed binding (actor/action/purpose/payload/data class/destination/source scope).
- **Durable Job (Section 8):** `foundation/src/jobs/durable-job.ts` — full state machine (`CREATED → RUNNING → SUCCEEDED|FAILED`, and the `UNKNOWN_RESULT → RECONCILIATION_REQUIRED → CONFIRMED_SUCCEEDED|CONFIRMED_FAILED|RETRY_ALLOWED` path); `UNKNOWN_RESULT` cannot retry without a recorded `RETRY_ALLOWED` reconciliation; reconciliation requires a non-empty ref/reason and stamps its timestamp from the Foundation `Clock`, keeping `externalObservedAt` separately attributable; reconciled outcomes do not increment the attempt count; `retry()` creates a fresh attempt, increments the count, and preserves prior attempts as history with no stale failure metadata copied forward. `CANCELLED` is excluded per PLAN 1A's explicit YAGNI note.
- **Migration contract (Section 9):** `foundation/src/migrations/manifest.ts` — strict `x.y.z` semver parsing/comparison, a rollback-safety guard, and a non-destructive guard; no migration engine is built, per PLAN 1A's explicit non-scope.
- **Publication integration (Section 10):** `docs/PUBLICATION_FILES.json` → version 6, adds the 18 tracked `foundation/` files (`foundation/node_modules` gitignored, never tracked); `scripts/check-operating-docs.mjs`'s `inventory-version` check updated to 6; the phase-scoped `status-pr-a-not-started`/`handoff-pr-a-base-gate` checks reconciled to the new phase (see SELF-BENCHMARK below) exactly as their own design comments anticipated.
- Identity provider, role taxonomy, OAuth/RSO/SSO, account database, academy tenancy, Evidence Snapshot/Seal, Gold/Assignment/Blind workflow, and every other PLAN 1A Section 14 non-scope item are **not** implemented, as required.

## ACTUAL TEST

NOT YET TESTED — no consented real VOD or independent expert session was run, for this implementation or for DECODE generally. `ACTUAL TEST = NOT YET TESTED`.

## SELF-BENCHMARK

- Genuine TDD: every behavioral `foundation/src/**` module was first written as a typed stub compiling cleanly but throwing `not implemented`. The full suite was run once against the stubs and produced **53 tests, 7 pass, 46 fail** — all 46 failures were `AssertionError`s against real expected behavior (e.g. `validateEvidenceRecord` rejecting/accepting the wrong records, `AtomicCommandGate.execute` not conflicting/replaying/serializing correctly), not import, syntax, or test-setup failures; the 7 passes were trivial pure functions (`fingerprintCommand`, `generateId`/`isNamespacedId`, `normalizeSourceRefs`, malformed-semver rejection, the anti-self-promotion guard, and one already-correct state-guard) with no meaningful RED to demonstrate. Real implementations were then written; the suite reran fully GREEN.
- `foundation/` (`npm ci`, Node v24.14.0): clean install, 0 vulnerabilities reported.
- `npm run typecheck` (`tsc`, strict, `noUncheckedIndexedAccess`): **0 errors.**
- `npm test` (`node --test` over `foundation/test/*.test.ts` via `tsx`, no external test-framework dependency): **53/53 PASS, 0 failures.** Each test is annotated with the PLAN 1A Section 12 acceptance-invariant number(s) it covers (invariants 2–59 that are in PR-A scope; invariants 1, 60–62 are runtime/repository-level facts verified separately below, not `foundation/` unit behavior).
- `node scripts/check-operating-docs.mjs` (default, working tree): **888/888 PASS, 0 failures.**
- `node scripts/check-operating-docs.semantic.test.mjs`: **51/51 PASS, 0 failures** (unchanged baseline/control coverage from the prior stage plus 3 mutations reconciled to the new PR-A-implemented phase: #20 and #23 now target the renamed `status-pr-a-not-overclaimed` check via its "unrecognized value" and "current-bullet overclaim" branches, and #40 is a new, independent mutation proving the check's forbidden-MERGED/DEPLOYED branch is enforced separately from its required-valid-phase branch. `handoff-pr-a-base-gate` is now vacuously true — its own design comment anticipated exactly this transition as expected, not a regression.).
- `node scripts/check-operating-docs.mjs --index` (staged tree): **963/963 PASS, 0 failures.**
- `git diff --cached --check`: exit 0, no whitespace errors.
- Authority document blob/hash verification on this branch: Integrated Spec `f7571338e93a408a8aeef93d63275d7076e76f80` and 10-Case ACTUAL TEST Protocol `4d7788bb39d68c5cd147408a85954cd5a0e7b8f0` unchanged; PLAN 1A blob at branch creation was `bfb5e35b921ccc320f3ffb2631b661368206fa6b`, matching the approved value; PLAN 1A's own text is unmodified by this implementation (no new decision amendment).
- No secret/private-VOD/consent/access-bearing material added: `foundation/src/**` and `foundation/test/**` contain only in-memory reference implementations and synthetic fixture strings (e.g. `"actor-1"`, `"hash-1"`); the publication checker's secret-pattern scan and `public-scope`/`public-content` checks pass on every newly tracked file.
- This is documentation/contract/software-engineering evidence only (SELF-BENCHMARK), not ACTUAL TEST evidence, and does not self-promote.

## SIMULATED

`foundation/test/**` uses deterministic in-memory fixtures and a `TestClock` for time control — synthetic test data only, not synthetic decision/VOD/expert records and not folded into any ACTUAL TEST claim.

## FAILED

The 46 intentional RED failures captured during the TDD stub phase (see SELF-BENCHMARK) are real evidence the test suite exercises genuine behavior, not a defect — all were resolved by the corresponding implementation and the suite is fully GREEN. No other check, build, or test failure occurred during this implementation. Google sync remains BLOCKED by missing bindings, as before.

## NOT TESTED

ACTUAL TEST (real VOD/expert session), expert usability, coaching effectiveness, application/runtime behavior beyond `foundation/`'s own automated suite, accessibility/security conformance, empirical token savings, and actual Codex/Claude Code/human obedience to any checked contract. No manifest scripts beyond `foundation/`'s own `npm ci`/`typecheck`/`test` were executed. Gate D (Model Evaluation) is N/A per PLAN 1A; Gate E (Actual Expert Test) is NOT YET TESTED; Gate F (Product Review) is PENDING; Gate G (Deployment) is NOT AUTHORIZED.

## FILES CHANGED

`.gitignore`, `docs/CURRENT_STATUS.md`, `docs/PUBLICATION_FILES.json`, `handoff/CHATGPT_TO_CODEX.md`, `handoff/CODEX_TO_CHATGPT.md`, `scripts/check-operating-docs.mjs`, `scripts/check-operating-docs.semantic.test.mjs`, plus 18 new files under `foundation/` (`package.json`, `package-lock.json`, `tsconfig.json`, `scripts/run-tests.mjs`, 8 `src/**` files, 6 `test/**` files). No change to `docs/DECISIONS.md` (no new material decision), no change to the Integrated Spec, 10-Case ACTUAL TEST Protocol, or PLAN 1A text, and PR #5 untouched.

## RECOMMENDED NEXT DECISION

Product reviews this PR against PLAN 1A Section 12's acceptance invariants and Section 13's gates (A–C applicable and passing per the SELF-BENCHMARK evidence above; D N/A; E/F/G pending/not authorized). This PR must not be merged by Engineering. If Product finds the implementation acceptable, Product merges it directly (no additional Engineering action required to merge); if not, Product returns specific findings for a follow-up correction, or opens a new D017 decision interview if a material gap is found. No ACTUAL TEST or 50/150 expansion is authorized by this implementation.

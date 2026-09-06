# DECODE PLAN 1A — Canonical Foundation Lock Candidate

**Goal:** DECODE PR-A Canonical Foundation implementation. Scope is provenance integrity, canonical idempotent command identity, enforceable Policy & Rights permits, durable external-job lifecycle/reconciliation, and migration compatibility.

**Runtime decision:** TypeScript/Node is LOCKED only for PR-A Canonical Foundation. AI/media/Python/future backend runtime is not locked.

**Implementation status:** NOT STARTED
**ACTUAL TEST:** NOT YET TESTED
**Automatic merge:** PROHIBITED

## 0. Mandatory Decision Interview Gate

If implementation/audit discovers a new material unresolved decision, do not implement it by default.

`MATERIAL UNRESOLVED DECISION → STOP AFFECTED DESIGN → INTERVIEW ONE DECISION → USER SELECTS → RECORD → LOCK → CONTINUE`

Material categories:

- Product / MVP scope
- Architecture / runtime / persistence
- Data semantics / Gold / schema
- AI / evaluation / thresholds
- Security / identity / authorization / privacy
- External egress
- Material cost / operations
- Destructive migration / irreversible behavior

Already locked:

`Actor Authorization Model = ActorVerifier Port`

Foundation does not lock the identity provider or role system.

## 1. M0 — Authority Materialization

Materialize:

- `docs/superpowers/specs/2026-09-06-decode-integrated-spec-v1.md`
- `docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md`
- `docs/superpowers/specs/2026-09-06-decode-10-case-actual-test-protocol-v1.md`

Reconcile:

- `docs/DECISIONS.md`
- `docs/CURRENT_STATUS.md`
- `docs/PUBLICATION_FILES.json`
- `scripts/check-operating-docs.mjs`
- `handoff/CHATGPT_TO_CODEX.md`

Decision register must record:

- Integrated Spec v1.0 = LOCKED
- PR-A runtime = TypeScript/Node only
- Actor Authorization = ActorVerifier Port
- identity provider / role system = NOT YET LOCKED
- 10-Case ACTUAL TEST Protocol v1.0 (Q1–Q56) = protocol design locked, ACTUAL TEST NOT YET TESTED
- PR-B Evidence + Blind Gold remains blocked until the applicable real-test/Product gate

Post-M0 receipt:

- SPEC_PATH / SPEC_COMMIT_SHA / SPEC_CONTENT_HASH
- PLAN_PATH / PLAN_COMMIT_SHA / PLAN_CONTENT_HASH
- ACTUAL_TEST_PROTOCOL_PATH / ACTUAL_TEST_PROTOCOL_COMMIT_SHA / ACTUAL_TEST_PROTOCOL_CONTENT_HASH
- APPROVED_IMPLEMENTATION_BASE_SHA
- TARGET_IMPLEMENTATION_BRANCH

Mismatch → `STOP_AND_REPORT`.

## 2. Foundation package

Planned paths:

- `foundation/package.json`
- `foundation/package-lock.json`
- `foundation/tsconfig.json`
- `foundation/scripts/run-tests.mjs`
- `foundation/src/shared/ids.ts`
- `foundation/src/shared/provenance.ts`
- `foundation/src/shared/clock.ts`
- `foundation/src/storage/atomic-command-gate.ts`
- `foundation/src/policy/contracts.ts`
- `foundation/src/policy/in-memory-policy-rights-gate.ts`
- `foundation/src/jobs/durable-job.ts`
- `foundation/src/migrations/manifest.ts`
- `foundation/test/*.test.ts`

Runtime/tooling candidate:

- Node >=24 <27
- TypeScript 5.9.3
- @types/node 24.5.2
- ES2022 / NodeNext / strict TypeScript

TDD remains mandatory.

## 3. Provenance contract

Canonical dimensions remain separate.

EvaluationMode:

- SELF-BENCHMARK
- MODEL_BAKE_OFF
- ACTUAL TEST

DataOrigin:

- SIMULATED
- REAL
- MIXED
- UNKNOWN

ActualTestStatus:

- NOT YET TESTED
- EXECUTED

ExecutionStatus:

- NOT TESTED
- RUNNING
- PASSED
- FAILED
- BLOCKED

Required invariants:

- SELF-BENCHMARK + SIMULATED is valid.
- ACTUAL TEST + SIMULATED is rejected.
- ACTUAL TEST requires REAL data.
- ACTUAL TEST requires actualTestStatus=EXECUTED.
- ACTUAL TEST cannot have executionStatus=NOT TESTED.
- actualTestStatus=EXECUTED outside ACTUAL TEST is rejected.

Engineering test results cannot promote themselves to ACTUAL TEST.

## 4. Canonical command identity

Caller supplies:

- operation
- actorId
- payloadHash

Foundation derives a SHA-256 fingerprint over:

- aggregateKey
- operation
- actorId
- payloadHash
- expectedVersion

Atomic behavior:

- same idempotency key + same canonical command → replay prior result;
- same key + changed aggregate/operation/actor/payload/expectedVersion → conflict;
- stale version → mutation callback must not execute;
- concurrent duplicate → reference implementation executes mutation once.

`mutate()` must not perform external/network side effects.

A future durable repository must atomically commit:

`aggregate state + version + idempotency receipt`

## 5. ActorVerifier Port — LOCKED

Foundation contract requires an ActorVerifier before protected actions.

At permit issuance and execution-time revalidation:

`actorId + action + purpose → ActorVerifier`

Denied/unverified actor → no valid protected action.

Foundation does not lock:

- OAuth/RSO/SSO;
- JWT shape;
- role taxonomy;
- account database;
- identity provider;
- academy tenancy.

## 6. Policy & Rights

Eligibility states:

- EXECUTABLE
- RESTRICTED
- WITHDRAWN
- POLICY_BLOCKED

Protected actions:

- EVIDENCE_INGESTION
- EXPERT_VOICE_STORAGE
- EXTERNAL_EGRESS
- EVALUATION_USE
- PLAYER_OUTPUT

Policy rules bind:

- action
- allowed purposes
- allowed data classes
- allowed destinations where applicable

Authorization request binds:

- actor
- action
- purpose
- source refs
- payload hash
- data class
- destination where applicable

Permit binds:

- actor/action/purpose
- canonical source refs
- payload hash
- data class
- destination
- rights snapshot/revisions
- policy snapshot id/hash
- issuedAt/expiresAt

Authorization order:

`request validation → ActorVerifier → Policy ALLOW → Rights EXECUTABLE → Permit`

Execution revalidation:

`expiry → actor still authorized → policy snapshot/current policy → exact binding → rights revisions/current eligibility → ALLOW`

Source refs are deduplicated and sorted.

External egress requires a non-empty approved destination.

Withdrawal invalidates old permits through rights revision/state changes.

## 7. ActorVerifier tests

Reference tests require:

- authorized actor can obtain a permit when all other gates allow;
- unauthorized actor cannot obtain a permit;
- actor revoked after permit issuance fails execution revalidation;
- changed actor/action/purpose/payload/data/destination/source scope fails;
- withdrawal fails;
- rights revision after re-enable invalidates old permit;
- policy snapshot change invalidates;
- same policy id with changed rules/hash invalidates;
- expiry invalidates.

A deterministic in-memory verifier is test infrastructure only and does not define the production identity model.

## 8. Durable Job

PR-A job states:

- CREATED
- RUNNING
- UNKNOWN_RESULT
- RECONCILIATION_REQUIRED
- RETRY_ALLOWED
- SUCCEEDED
- FAILED

`CANCELLED` is excluded from PR-A under YAGNI. If real product behavior later requires cancellation, evaluate it under the Decision Interview Gate.

Attempt states:

- RUNNING
- UNKNOWN_RESULT
- FAILED
- SUCCEEDED

Reconciliation decisions:

- CONFIRMED_SUCCEEDED
- CONFIRMED_FAILED
- RETRY_ALLOWED

Normal paths:

`CREATED → RUNNING → SUCCEEDED`

`CREATED → RUNNING → FAILED`

Unknown-result path:

`RUNNING → UNKNOWN_RESULT → RECONCILIATION_REQUIRED → CONFIRMED_SUCCEEDED | CONFIRMED_FAILED | RETRY_ALLOWED`

Forbidden:

`UNKNOWN_RESULT → RUNNING` without recorded reconciliation.

Normal success must preserve result evidence and not increment the attempt count.

Normal failure must preserve failure evidence and not increment the attempt count.

Reconciliation requires:

- non-empty reconciliationRef
- non-empty reason
- Foundation-recorded timestamp
- externalObservedAt only as separately attributable external provenance

Reconciled success does not create an extra attempt.

Actual retry creates a fresh RUNNING attempt, increments the attempt count, preserves historical attempts, and does not copy stale failure metadata into the new attempt.

## 9. Migration contract

Manifest fields include:

- migrationId
- fromVersion
- toVersion
- backwardReadCompatible
- forwardReadCompatible
- minimumCodeVersion
- rollbackCodeVersionMin
- destructive
- status

PR-A implements only:

- strict x.y.z parsing/comparison;
- rollback minimum compatibility guard;
- non-destructive guard.

No migration engine is built.

## 10. Publication integration

After M0, reconcile actual publication inventory state before changing the version. Do not assume PR #5 inventory semantics.

Preserve all existing public-main paths and safeguards.

After implementation evidence exists:

`stage → typecheck/test/checker → observe results → update CODEX_TO_CHATGPT → restage → rerun checker → inspect whole diff → commit`

Reverse handoff must preserve exactly these headings:

- IMPLEMENTED
- ACTUAL TEST
- SELF-BENCHMARK
- SIMULATED
- FAILED
- NOT TESTED
- FILES CHANGED
- RECOMMENDED NEXT DECISION

Truth boundaries:

- ACTUAL TEST = NOT YET TESTED
- MODEL_BAKE_OFF = NOT RUN
- Expert usability = NOT TESTED
- Coaching effectiveness = NOT TESTED

## 11. Whole-PR verification

Final implementation verification must use:

`APPROVED_IMPLEMENTATION_BASE_SHA..HEAD`

Required fresh evidence:

- npm ci
- npm run typecheck
- npm test
- publication checker --tracked
- git diff BASE..HEAD --check
- whole changed-file review
- whole diff review
- clean working tree

Unexpected file or authority mismatch → `STOP_AND_REPORT`.

## 12. Acceptance invariants

### Provenance

1. Supported runtime.
2. Permit and Job IDs use separate namespaces.
3. SELF-BENCHMARK + SIMULATED is valid.
4. ACTUAL TEST + SIMULATED rejected.
5. Unexecuted ACTUAL TEST rejected.
6. ACTUAL TEST with execution NOT TESTED rejected.
7. Executed actual-test status cannot attach to non-ACTUAL mode.

### Atomic Command

8. Fingerprint is generated by Foundation.
9. Same canonical command replays.
10. Changed aggregate conflicts.
11. Changed operation conflicts.
12. Changed actor conflicts.
13. Changed payload conflicts.
14. Changed expected version conflicts.
15. Stale version prevents mutation callback.
16. Concurrent duplicate executes once in the reference adapter.

### Actor / Policy / Rights

17. Authorized actor required.
18. Unauthorized actor cannot obtain Permit.
19. Actor revocation invalidates issued Permit at execution.
20. Policy must explicitly allow action.
21. Unapproved action denied.
22. Unapproved purpose denied.
23. Unapproved data class denied.
24. Unapproved egress destination denied.
25. Egress requires destination.
26. Permit binds actor.
27. Permit binds action.
28. Permit binds purpose.
29. Permit binds canonical source scope.
30. Equivalent reordered/duplicate source input normalizes.
31. Changed source scope rejected.
32. Permit binds payload.
33. Permit binds data class.
34. Permit binds destination.
35. Withdrawal invalidates Permit.
36. Rights revision invalidates old Permit after re-enable.
37. Policy snapshot change invalidates Permit.
38. Same policy ID with changed rule content invalidates Permit.
39. Expiry invalidates Permit.

### Durable Jobs

40. Normal RUNNING job succeeds.
41. Successful attempt preserves result evidence.
42. Normal RUNNING job definitively fails.
43. Failed attempt preserves failure evidence.
44. Normal completion from invalid state rejected.
45. UNKNOWN_RESULT cannot directly retry.
46. Reconciliation reference required.
47. Reconciliation reason required.
48. Canonical reconciliation timestamp comes from Foundation Clock.
49. External observed timestamp remains separately attributable.
50. Reconciled success does not increment attempt count.
51. Reconciled failure becomes terminal FAILED.
52. Retry requires recorded RETRY_ALLOWED reconciliation.
53. Actual retry increments attempt count.
54. Prior uncertain/failure attempt remains historical.
55. Fresh retry attempt has no stale failure metadata.

### Migration / Repository

56. Full semver comparison works.
57. Malformed semver rejected.
58. Unsafe rollback rejected.
59. Destructive migration rejected by non-destructive guard.
60. Exact publication inventory check passes.
61. Existing ACTUAL TEST anti-promotion checks remain intact.
62. No raw/private material is added.

Exact test counts are observed at execution time, never predeclared.

## 13. Acceptance gates

Gate A — Contract: all applicable invariants pass.

Gate B — Software: npm ci/typecheck/tests/diff/checker pass.

Gate C — Security/Rights: ActorVerifier, policy, rights, permit integrity, privacy/secret checks pass.

Gate D — Model Evaluation: N/A.

Gate E — Actual Expert Test: NOT YET TESTED.

Gate F — Product Review: PENDING.

Gate G — Deployment: NOT AUTHORIZED.

Maximum engineering claim before Product review:

`PR-A = IMPLEMENTATION READY FOR PRODUCT REVIEW`

## 14. Explicit non-scope

PR-A does not implement:

- identity provider;
- role taxonomy;
- OAuth/RSO/SSO;
- account database;
- academy tenancy;
- Evidence Snapshot/Seal;
- Gold/Assignment/Blind workflow;
- Transcript/Knowledge;
- AI/Retrieval/Evaluation;
- Live Observer;
- Coaching/Growth;
- Riot integration;
- Practice Coach.

## 15. PLAN 1B gate

Do not authorize final PLAN 1B implementation merely because PR-A completes.

The Evidence/Blind Gold track remains gated by the approved real-test protocol and Product evidence decision.

No 50/150 expansion is automatic.

## 16. Authority state

- PLAN 1A = CANONICAL FOUNDATION LOCK CANDIDATE
- STATIC PLAN AUDIT = requires fresh materialization audit
- ACTUAL COMPILE = NOT RUN
- ACTUAL TYPECHECK = NOT RUN
- ACTUAL TEST SUITE = NOT RUN
- IMPLEMENTATION = NOT STARTED
- MERGE = NOT AUTHORIZED

# DECODE Integrated Spec v1.0

**Status:** CHAT APPROVED / REPOSITORY MATERIALIZATION CANDIDATE
**Date:** 2026-09-06
**Owner:** Product/Business Lead
**ACTUAL TEST:** NOT YET TESTED
**Scope:** DECODE Coach Copilot MVP v0.1 and the architecture/evidence rules required to reach the first real 10-Case ACTUAL TEST without prematurely promoting untested candidates.

## 0. Authority and evidence boundary

This document materializes the approved DECODE product/architecture decisions. It does not claim that unexecuted business, expert, VOD, usability, coaching, model, or security hypotheses have been validated.

The exact prose of the earlier chat-approved Integrated Spec was not present in GitHub or the accessible file library at M0. This document is the consolidated materialization of those approved decisions and the subsequent approved interview decisions. Its committed content hash becomes repository authority only after the normal review/merge flow; this provenance limitation must not be hidden.

Evidence labels remain distinct:

- `ACTUAL TEST`
- `SELF-BENCHMARK`
- `SIMULATED`
- `NOT YET TESTED`

Execution status is separate from evidence category. Synthetic inputs and internal software checks never establish expert/VOD success. Unknown measurements remain UNKNOWN/null, never zero.

Repository authority after review follows:

`User-approved scope → this Integrated Spec → exact committed Spec hash → approved Plan hash → reviewed PR → main`

A mismatch between an approved authority hash and an implementation base is `STOP_AND_REPORT`.

## 1. Product definition — LOCKED

DECODE is:

> 프로의 판단 기준을 데이터화하여 플레이어의 반복 실수를 분석하고, 코치의 VOD 리뷰·성장관리 업무를 지원함으로써 더 많은 플레이어를 일관된 품질로 코칭할 수 있게 하는 e스포츠 Coaching Intelligence 플랫폼.

Founder asset:

- Founder/representative has VALORANT tier-1/first-team pro-player experience.
- Founder expertise is treated as a source for structured professional decision standards, not as branding proof of product effectiveness.

## 2. Customer and GTM direction — LOCKED

Primary B2B buyer:

- independent professional coach; or
- academy owner/head coach.

Operator:

- actual VALORANT coach.

Beneficiary:

- students/players.

Parallel B2C:

- adult competitive VALORANT player.

Initial B2B ICP:

- coaches and small/medium academies doing repeated VOD review.

Pain hypotheses:

- review workload;
- inconsistent feedback quality;
- difficulty demonstrating growth over time.

GTM sequence:

`B2C 10–30 → B2B 3–5 coaches → 1–3 academies`

These are business hypotheses until real buyer/pilot evidence is collected.

## 3. Coach Copilot MVP v0.1 — LOCKED

Primary workflow:

`PLAYER VOD → Semi-Automatic Candidate Moments → AI Decision Draft → Pro Knowledge Engine → Coach Review → Priority #1 → Shareable Coaching Report → Next VOD → IMPROVED / SAME / WORSE`

Coach review actions:

- `APPROVE`
- `EDIT`
- `REJECT`

Initial decision families:

1. Fight Selection
2. Post-contact Decision
3. Tradeability & Spacing

Initial product surfaces:

- Players
- Review Workspace
- Report Builder
- Follow-up

Deferred from MVP v0.1:

- player portal;
- automatic next-match ingestion;
- PIR;
- Player DNA;
- Team Intel;
- additional games;
- realtime ranked coaching;
- AI chat;
- native mobile;
- parent dashboard;
- full Riot API dependency.

Utility/objective macro categories remain outside the initial family set, but architecture may support future discovery and Founder-authorized promotion.

## 4. Decision Case model — LOCKED philosophy

One case represents one primary decision.

`EVIDENCE → CONTEXT → TRIGGER → OBSERVED DECISION → EXPERT VERDICT → PREFERRED DECISION → DECISION PRINCIPLE → EXPERT REASON → SEVERITY / CONFIDENCE → OUTCOME / CAUSALITY`

Rules:

- `1 Case = 1 Primary Decision`.
- Decision quality is separate from outcome.
- Coaching presentation is separate from the underlying decision layer.
- Counterfactuals are optional.
- Missing or unseen context is never silently invented.
- Multiple valid alternatives may be preserved.

Verdicts:

- OPTIMAL
- ACCEPTABLE
- SUBOPTIMAL
- ERROR
- UNCERTAIN
- INSUFFICIENT_CONTEXT

The eight expert fields, Core/Extended context contract, twelve seed principles, and detailed nullability remain `LOCK CANDIDATE` until real execution evidence supports promotion.

Candidate expert fields:

1. Trigger
2. Observed Decision
3. Verdict
4. Preferred Decision
5. Decision Principle
6. Expert Reason
7. Severity
8. Confidence

Research instrumentation such as timing, difficulty, missing-context feedback, and field-usefulness is not silently treated as an expert field.

## 5. Seed principles — LOCK CANDIDATE

Fight Selection:

- NUMBER_ADVANTAGE_PRESERVATION
- DUEL_QUALITY
- INFORMATION_ADVANTAGE
- TIME_PRESSURE_RISK

Post-contact Decision:

- POST_KILL_REPOSITION
- POST_CONTACT_RESET
- VALUE_THEN_DISENGAGE
- SPACE_CONVERSION

Tradeability & Spacing:

- TRADE_DISTANCE
- SUPPORT_LINE_OF_SIGHT
- SYNCHRONIZED_CONTACT
- ISOLATION_AVOIDANCE

Additional candidate markers:

- OTHER
- NEW_PRINCIPLE_NEEDED
- MULTIPLE_PRINCIPLES

`MULTIPLE_PRINCIPLES` is a storage/selection marker, not a thirteenth seed principle.

## 6. Expert Knowledge / Pro Standard model — LOCKED

Founder expertise is represented as Pro Decision Standards.

Knowledge structure:

`Principle → Situation Trigger → What Matters → Default Action → Why → Exceptions → Acceptable Alternatives → Common Misread → Evidence Cases`

Coaching presentation may compare:

`Your read ↔ Pro read`

Provenance classes:

- EXPERT_AUTHORED
- EXPERT_VERIFIED
- AI_DRAFT — NOT VERIFIED

Long-term moat hypothesis:

`Decision Cases → Pro Standards → exceptions/alternatives/corrections`

No claim is made that this moat has been commercially validated.

## 7. AI strategy — LOCKED architecture direction

DECODE does not train a foundation model from scratch for the MVP.

Initial AI direction:

- provider/model-agnostic gateway;
- local/open preprocessing where appropriate;
- RAG before fine-tuning;
- frontier/API models may be used behind an explicit gateway only when policy/rights/egress permit execution;
- fine-tuning requires later evidence and a separate decision;
- corrections are stored with immutable attempts and provenance.

No single production model/provider is locked by this Spec.

## 8. Canonical architecture — LOCKED

Core flow:

`Evidence → Expert Knowledge → Knowledge Core snapshots → Retriever → Reasoning Context → Model Gateway → Structured AI Attempt → Evaluation / Live Engine → Observer first → Coaching → Ledger → Correction`

Domain boundaries:

- Evidence
- Expert Knowledge
- Retrieval
- AI Execution
- Evaluation
- Coaching
- Growth

Cross-cutting boundaries:

- Identity
- Consent
- Provenance
- Versioning
- Retention
- Output Policy

Same-case layers remain separate:

- evidence;
- context;
- expert Gold;
- second-expert review;
- AI attempt;
- critique/preference;
- coaching output;
- provenance;
- rights/consent state.

Snapshots are immutable. Current execution eligibility is separate from historical immutable content.

## 9. Deployment boundary — LOCKED

Deployment model:

`MODULAR MONOLITH + ISOLATED MEDIA WORKER + DURABLE EXTERNAL-JOB EXECUTION`

External job states:

- CREATED
- RUNNING
- SUCCEEDED
- FAILED
- UNKNOWN_RESULT
- RECONCILIATION_REQUIRED
- RETRY_ALLOWED

Unknown external result cannot be blindly retried. Reconciliation evidence is required before a new retry is permitted.

## 10. Command consistency — LOCKED

State-changing domain commands require canonical idempotent identity.

Foundation derives the command fingerprint from:

- aggregate key;
- operation;
- actor;
- payload hash;
- expected version.

A production durable repository must atomically persist:

`aggregate state + version + idempotency receipt`

A mutation callback must not perform network/external side effects inside the atomic state transaction.

## 11. Identity and protected-action boundary — LOCKED

Actor authorization model:

`ActorVerifier Port`

Foundation owns the rule:

> No protected-action permit may be issued or executed for an unverified actor.

Foundation does not yet lock:

- Founder/Coach/System role taxonomy;
- OAuth/RSO/SSO;
- JWT format;
- identity provider;
- account database;
- academy tenant model.

Real identity systems remain adapter responsibilities.

## 12. Policy / Rights Gate — LOCKED

Execution eligibility:

- EXECUTABLE
- RESTRICTED
- WITHDRAWN
- POLICY_BLOCKED

Protected actions include:

- EVIDENCE_INGESTION
- EXPERT_VOICE_STORAGE
- EXTERNAL_EGRESS
- EVALUATION_USE
- PLAYER_OUTPUT

A permit binds at minimum:

- actor;
- action;
- purpose;
- canonical source refs;
- payload hash;
- data class;
- destination where applicable;
- rights snapshot/revisions;
- policy snapshot id/hash;
- issue/expiry time.

Policy and rights must both allow execution.

Before execute/retry:

- actor authorization is revalidated;
- policy is revalidated;
- rights are revalidated;
- expiry is checked;
- request/permit binding is checked.

Withdrawal invalidates related permits, pending jobs, and eligible caches/indexes.

External egress requires an approved destination and valid permit.

## 13. Experiment and Gold isolation — LOCKED

Evidence is sealed before expert/AI comparison.

Gold workflow preserves independent expert judgment and prevents AI leakage before the required blind lock.

AI outputs never become Gold merely because the expert later accepts them.

Evaluation ancestry must be traceable. An evaluation case cannot contain transitive evaluation ancestry that would contaminate the measurement. Exposure state is irreversible for that experiment.

Experiment freezes are explicit and versioned.

## 14. Pilot ladder — LOCKED

Pilot ladder:

A. 10-Case stress test
B. Gold-only Pro Tutor
C. AI-assisted Pro Tutor after infrastructure/bakeoff
D. Observer

The first real gate is the 10-Case ACTUAL TEST.

Alpha 50 / 150-case expansion is not authorized by this Spec and requires real evidence plus Product approval.

## 15. Riot / gameplay-policy boundary — LOCKED current safety direction

Practice/live behavior-changing assistance remains disabled until policy clearance.

Do not implement or rely on:

- client memory reading;
- client injection;
- Vanguard bypass;
- hidden-state extraction;
- opponent pre-match private scouting;
- private API use;
- ranked realtime instructions that alter live competitive behavior.

Observer-first is the current safe product direction.

## 16. Coaching freshness — LOCKED

Coaching output freshness states:

- CURRENT
- STALE
- REVIEW_REQUIRED
- NOT_APPLICABLE

A stale or invalidated underlying source cannot silently remain eligible for current coaching output.

## 17. Publication and source-of-truth — LOCKED

Repository:

`edward321416-maker/DECODE`

Canonical branch:

`main`

Main is the single Source of Truth only after reviewed materialization/merge.

Feature branches and chat artifacts are review candidates, not canonical authority.

PR #5 remains separate from the Canonical Foundation path and must not be silently overwritten or automatically merged.

Any inventory/checker version collision with PR #5 must be reconciled explicitly.

## 18. Mandatory Decision Interview Gate — LOCKED operating rule

For any new material unresolved decision:

`MATERIAL UNRESOLVED DECISION → INTERVIEW REQUIRED → USER DECISION → RECORD → LOCK → ONLY THEN IMPLEMENT`

Material categories include:

- Product / business;
- architecture/runtime/persistence;
- data schema/Gold/retention;
- AI/evaluation/model routing;
- privacy/security/rights/egress;
- material scope/cost/operations;
- destructive or irreversible migration.

Interview format should handle one important decision at a time, preferably with A/B/C options, recommendation, and trade-offs.

Lifecycle:

`UNRESOLVED → INTERVIEWED → USER SELECTED → RECORDED → LOCKED`

`RECOMMENDED ≠ APPROVED ≠ LOCKED`

Mechanical implementation details under an already locked contract do not require a new interview unless they materially change product, data, security, architecture, cost, evaluation, scope, or UX.

## 19. Gate-Based Parallel Execution Rule — LOCKED operating rule

Product/Research may work at most one verification gate ahead of Engineering.

If Engineering is at gate `N`, Product/Research may prepare `N` and `N+1`, but may not lock `N+2` implementation details before `N+1` evidence exists.

Current pairing:

- Engineering: M0 → PR-A Canonical Foundation
- Product/Research: 10-Case ACTUAL TEST preparation

Do not lock PLAN 1B final implementation, Live Observer implementation, Practice Coach, 50/150 expansion, or production model selection before the preceding evidence gate.

Engineering evidence that invalidates a planning assumption reopens only the affected scope.

## 20. Current gates

Current evidence state:

- Integrated Spec design: CHAT APPROVED.
- PLAN 1A: Canonical Foundation Lock Candidate; implementation not started.
- 10-Case ACTUAL TEST Protocol v1.0: Q1–Q56 design locked in chat; ACTUAL TEST NOT YET TESTED.
- PR #5 candidate annotation infrastructure: separate open candidate; not merged.
- 50/150 expansion: not authorized.

Foundation Track PR-A may begin after M0 authority materialization and the approved implementation plan receipt.

Evidence/Blind Gold implementation beyond the Foundation remains blocked until the required protocol/rights prerequisites are implemented and the 10-Case gate is authorized.

## 21. Non-scope / not yet locked

Not locked by this Spec:

- production identity provider;
- production role taxonomy;
- academy tenant model;
- production model/provider;
- fine-tuning;
- PLAN 1B final implementation;
- Live Observer implementation details;
- Practice Coach;
- 50/150 case expansion;
- coaching effectiveness claims;
- general population validity.

## 22. Required next authority receipts

After M0 materialization, record:

- SPEC_PATH
- SPEC_COMMIT_SHA
- SPEC_CONTENT_SHA256
- PLAN_PATH
- PLAN_COMMIT_SHA
- PLAN_CONTENT_SHA256
- ACTUAL_TEST_PROTOCOL_PATH
- ACTUAL_TEST_PROTOCOL_COMMIT_SHA
- ACTUAL_TEST_PROTOCOL_CONTENT_SHA256
- APPROVED_IMPLEMENTATION_BASE_SHA
- TARGET_IMPLEMENTATION_BRANCH

Any missing/mismatched authority receipt blocks implementation.

# ChatGPT → Codex

Handoff ID: DECODE-D024-PREEXECUTION-RECORD | Version: 1.0 | Owner: Product/Business Lead

## Current development request — D024 ACTUAL TEST pre-execution record semantics (narrowly authorized)

Product decision interview completed; user selected Option A (ALLOW). D024 (LOCKED EVIDENCE CONTRACT) is recorded in `docs/DECISIONS.md`. Implement, verify, and normally merge this amendment: reconcile PLAN 1A Canonical Foundation's Section 12 Provenance acceptance invariant #5, which conflicted with Section 3 by treating Execution status=NOT TESTED as meaning no ACTUAL TEST record exists. Per D024, an evidence record MAY exist with Evaluation purpose/mode=ACTUAL TEST, Data origin=REAL, Execution status=NOT TESTED, representing a planned/registered pre-execution unit — never counted toward executed sample size, expert agreement, threshold calculations, or GO/REVISE/STOP evidence, and never authorizing 50/150 expansion. `ActualTestStatus` is not reintroduced. D023 remains fully in force. Start only from exact base `origin/main = 5b4676af4859ab505d9a524100676f02647445df`.

**This request narrowly authorizes only the D024 reconciliation described above. It does not authorize PR-A.** After this amendment is merged, the gate returns to: D024 reconciliation complete; PR-A still NOT STARTED; await Product's exact-SHA PR-A base approval under D022, after Product independently audits the merged amendment.

Authority: D024 / U-DECODE-ACTUAL-PREEXECUTION-2026-09-07; D023 / U-DECODE-EVIDENCE-CONTRACT-2026-09-07, D021 / U-DECODE-TEAM-OS-2026-09-06, and D022 / U-DECODE-TEAM-OS-SEQUENCE-2026-09-06 remain unchanged.

## Explicit exclusions (HISTORICAL / DO NOT EXECUTE beyond this scope)

- PR-A Canonical Foundation implementation is NOT in scope. PR-A = NOT STARTED.
- PR #5 must not be modified, merged, or closed.
- Unrelated PLAN 1A contracts (TypeScript/Node runtime lock, ActorVerifier Port, Policy & Rights, durable job lifecycle, migration compatibility, Q1–Q56 ACTUAL TEST protocol, product families/fields/threshold status) are unchanged by D024 and out of scope for this handoff.
- ACTUAL TEST execution and 50/150 case generation are NOT in scope. A pre-execution ACTUAL TEST+REAL+NOT TESTED record is a documentation/contract concept only — this handoff does not authorize creating, running, or claiming any such record for the DECODE product.
- If reconciliation reveals another materially unresolved Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost decision, STOP and return exactly one decision question for Product interview rather than deciding it — routine wording/check/test organization inside D024's own semantics remains a C11 implementation choice.
- The earlier M0, 003-A-1, Team OS Stage 1/2/3 (+ audit correction), and D023 requests remain historical provenance only, per the prior handoff revisions preserved in Git history.

## Integration

Scoped branch, normal main-targeted PR, no auto-merge, per [Collaboration Rules](../docs/COLLABORATION_RULES.md) (no pre-merge Product code review gate for this task, per Product's current workflow).

`PR-A = NOT STARTED`. `ACTUAL TEST = NOT YET TESTED`.

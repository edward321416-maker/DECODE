# ChatGPT → Codex

Handoff ID: DECODE-D023-EVIDENCE-CONTRACT | Version: 1.0 | Owner: Product/Business Lead

## Current development request — D023 evidence/provenance contract amendment (narrowly authorized)

Product decision interview completed; user selected Option C. D023 (LOCKED EVIDENCE CONTRACT) is recorded in `docs/DECISIONS.md`. Implement, verify, and normally merge this amendment: reconcile PLAN 1A Canonical Foundation's Section 3 provenance contract (and its restatement in Section 12's acceptance invariants) to DECODE's canonical three-dimension evidence contract — Evaluation purpose/mode (ACTUAL TEST, SELF-BENCHMARK, N/A), Data origin (REAL, SIMULATED, UNKNOWN), Execution status (NOT TESTED, RUNNING, PASSED, FAILED, BLOCKED). Remove `MODEL_BAKE_OFF` as a top-level Evaluation purpose/mode (retain only as optional `evaluation_subtype` metadata under SELF-BENCHMARK); remove `MIXED` as a canonical Data origin (require separate evidence records for REAL and SIMULATED portions); remove the separate `ActualTestStatus` axis. Add deterministic semantic-checker enforcement and mutation/positive-control tests for each. Start only from exact base `origin/main = 6ae646a2e961125d957768f7828e11f13b771a32`.

**This request narrowly authorizes only the D023 reconciliation described above. It does not authorize PR-A.** After this amendment is merged, the gate returns to: D023 reconciliation complete; PR-A still NOT STARTED; await Product's exact-SHA PR-A base approval under D022.

Authority: D023 / U-DECODE-EVIDENCE-CONTRACT-2026-09-07; D021 / U-DECODE-TEAM-OS-2026-09-06 and D022 / U-DECODE-TEAM-OS-SEQUENCE-2026-09-06 remain unchanged.

## Explicit exclusions (HISTORICAL / DO NOT EXECUTE beyond this scope)

- PR-A Canonical Foundation implementation is NOT in scope. PR-A = NOT STARTED.
- PR #5 must not be modified, merged, or closed.
- The TypeScript/Node runtime lock, ActorVerifier Port, Policy & Rights, durable job lifecycle, migration compatibility, Q1–Q56 ACTUAL TEST protocol, and product families/fields/threshold status are unchanged by D023 and out of scope for this handoff.
- ACTUAL TEST execution and 50/150 case generation are NOT in scope.
- If reconciliation reveals another materially unresolved Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost decision, STOP and return exactly one decision question for Product interview rather than deciding it — routine enum naming, code/check organization, mutation design, and documentation mechanics inside D023's own semantics remain C11 implementation choices and do not require an interview.
- The earlier M0, 003-A-1, and Team OS Stage 1/2/3 (+ audit correction) requests remain historical provenance only, per the prior handoff revisions preserved in Git history.

## Integration

Scoped branch, normal main-targeted PR, no auto-merge, per [Collaboration Rules](../docs/COLLABORATION_RULES.md) (no pre-merge Product code review gate for this task, per Product's current workflow).

`PR-A = NOT STARTED`. `ACTUAL TEST = NOT YET TESTED`.

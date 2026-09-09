# ChatGPT → Codex

Handoff ID: DECODE-DRY-READINESS-SPEC-REVIEW-GATE | Version: 1.0 | Owner: Product/Business Lead

## Current gate — DRY Readiness design spec materialized; SPEC REVIEW GATE, NO IMPLEMENTATION AUTHORIZED

Product authorized design spec materialization only for A1 Dry Readiness (D025–D036), plus D037 (Dry Readiness execution-status mapping) as the next sequential decision from Product's fresh review of PR #17. The design spec at [2026-09-08-decode-dry-readiness-design.md](../docs/superpowers/specs/2026-09-08-decode-dry-readiness-design.md) is materialized, Status `DRAFT — USER REVIEW REQUIRED BEFORE IMPLEMENTATION PLAN`. **No engineering implementation is currently authorized.** This is a spec-review gate handoff, not an implementation request.

- **D037 evidence semantics (authoritative summary; see [Decisions](../docs/DECISIONS.md) D037 for the full locked text).** Before a dry run executes: `ExecutionStatus=NOT_TESTED`. While a valid dry run is executing: `ExecutionStatus=RUNNING`. Every mandatory dry gate completed and `PASS`: `ExecutionStatus=PASSED`, `readiness_verdict=DRY_READY`. A mandatory gate that actually executes and detects a real software/contract/invariant defect: `ExecutionStatus=FAILED`, `readiness_verdict=BLOCKED`. No defect demonstrated, but a mandatory prerequisite/gate cannot execute: `ExecutionStatus=BLOCKED`, `readiness_verdict=BLOCKED`. `readiness_verdict` and canonical `ExecutionStatus` are independent fields, never collapsed into one enum. Every dry-run evidence record carries `EvaluationMode=SELF_BENCHMARK`, `DataOrigin=SIMULATED`. `DRY_READY != ACTUAL TEST READY != ACTUAL TEST GO`.
- **This is a design spec only.** No readiness runtime/code, no `readiness/` package, no test suite for it, exists yet. Materializing the spec did not implement anything.
- **PR-A remains MERGED and is not reopened.** `foundation/` is unchanged by this gate.
- **Do not start PLAN 1B merely because PR-A merged.** Unrelated to and unaffected by this design spec.
- **Do not modify, merge, or close PR #5.** It remains OPEN / non-canonical / untouched.
- **Do not execute ACTUAL TEST.** `ACTUAL TEST = NOT YET TESTED` remains true; nothing in this design spec changes that.
- **Do not authorize the 50/150 expansion.** No such expansion is authorized by this spec.
- **Do not begin implementing the DRY Readiness harness from this handoff.** An implementation plan (per `docs/templates/IMPLEMENTATION_PLAN_TEMPLATE.md`) is a separate, later, separately-authorized request after Product/user reviews the design spec — this handoff does not itself authorize it.
- **await Product's next explicitly approved scope.** Engineering does not begin the implementation plan or any other next task unilaterally; Product reviews the design spec first.
- **New material decisions still return through D017.** Any materially unresolved Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost choice discovered during spec review goes through the one-decision-at-a-time interview before lock or implementation — it is not decided unilaterally by Engineering.

Authority: D021 / U-DECODE-TEAM-OS-2026-09-06, D022 / U-DECODE-TEAM-OS-SEQUENCE-2026-09-06, D023 / U-DECODE-EVIDENCE-CONTRACT-2026-09-07, D024 / U-DECODE-ACTUAL-PREEXECUTION-2026-09-07, D025–D036 / U-DECODE-DRY-READINESS-2026-09-08, D037 / U-DECODE-DRY-READINESS-CORRECTION-2026-09-08 (all settled, none reopened by this gate).

## Explicit exclusions (DO NOT EXECUTE beyond this scope)

- DRY Readiness harness implementation is NOT in scope of this gate — it requires a separate implementation-plan authorization after spec review.
- PLAN 1B implementation is NOT in scope and is not authorized by this design spec.
- Any change to the three frozen authority documents (Integrated Spec, PLAN 1A, 10-Case ACTUAL TEST Protocol) is NOT in scope; this design spec traces to them without amending them.
- Any modification, merge, rebase, cherry-pick, or closure of PR #5 is NOT in scope; PR #5 is read-only reference material only (D027).
- ACTUAL TEST execution or 50/150 case generation is NOT in scope.

## Integration

No engineering implementation task is currently open under this gate handoff. If/when Product reviews the design spec and approves an implementation plan, that will be a separate handoff revision naming its own integration method per [Collaboration Rules](../docs/COLLABORATION_RULES.md).

`PR-A = MERGED`. DRY Readiness design spec = DRAFT, awaiting user review. `ACTUAL TEST = NOT YET TESTED`.

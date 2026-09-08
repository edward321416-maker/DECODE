# ChatGPT → Codex

Handoff ID: DECODE-PR-A-CANONICAL-FOUNDATION-IMPLEMENTATION | Version: 1.0 | Owner: Product/Business Lead

## Current directive — PR-A Canonical Foundation implementation, GO

Product completed the final independent GitHub audit and explicitly approved the PR-A implementation base under D022: `APPROVED_IMPLEMENTATION_BASE_SHA = 4e006c9512e7665cd9195c42c508435092cb672d`. Engineering is authorized to implement PLAN 1A Canonical Foundation end-to-end, per the exact scope, gates, and boundaries of that plan and its D023/D024 amendments.

- **Authority:** [PLAN 1A Canonical Foundation](../docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md), amended by D023 (`U-DECODE-EVIDENCE-CONTRACT-2026-09-07`) and D024 (`U-DECODE-ACTUAL-PREEXECUTION-2026-09-07`) in [Decisions](../docs/DECISIONS.md). Integrated Spec and 10-Case ACTUAL TEST Protocol v1.0 remain unchanged authority documents. PR #5 remains OPEN / non-canonical and is not part of this scope.
- **Scope:** canonical/idempotent command identity; ActorVerifier Port; Policy & Rights permit issuance, binding, and invalidation; durable external-job lifecycle with UNKNOWN_RESULT reconciliation and retry semantics; migration/version compatibility with non-destructive guards; the Provenance contract and its D023/D024 acceptance invariants. TypeScript/Node is LOCKED only for this package.
- **Evidence boundary:** do not execute ACTUAL TEST; do not treat SIMULATED/SELF-BENCHMARK results as ACTUAL TEST evidence; do not authorize or generate the 50/150 expansion. `ACTUAL TEST = NOT YET TESTED` remains true for the DECODE product regardless of this implementation's own SELF-BENCHMARK verification (typecheck/tests/checker).
- **Decision gate:** any newly discovered material Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost decision returns through D017 as one decision at a time — Engineering does not choose unilaterally. Routine file layout, internal abstractions, naming, and test structure remain C11 Engineering choices.
- **Integration boundary:** Engineering may implement, test, commit, push, and open the complete main-targeted PR. Engineering **must not merge PR-A**. The maximum Engineering claim before Product review is `PR-A = IMPLEMENTATION READY FOR PRODUCT REVIEW`.

Authority: D021 / U-DECODE-TEAM-OS-2026-09-06, D022 / U-DECODE-TEAM-OS-SEQUENCE-2026-09-06, D023 / U-DECODE-EVIDENCE-CONTRACT-2026-09-07, D024 / U-DECODE-ACTUAL-PREEXECUTION-2026-09-07 (all settled, none reopened by this directive).

## Explicit exclusions

- Do not rerun or reopen D023 or D024 — both are locked and merged.
- Do not change the three authority documents (Integrated Spec, PLAN 1A, 10-Case ACTUAL TEST Protocol) beyond what PLAN 1A's own amendments already record.
- Do not execute ACTUAL TEST or generate/authorize the 50/150 case expansion.
- Do not modify, merge, or close PR #5.

## Integration

Engineering follows [Collaboration Rules](../docs/COLLABORATION_RULES.md) C1–C11: implement with genuine TDD (RED must demonstrate missing required behavior, not import/syntax/setup failure), verify the whole PR against `APPROVED_IMPLEMENTATION_BASE_SHA..HEAD` per PLAN 1A Section 11, and open — but do not merge — the resulting PR. The reverse handoff ([CODEX_TO_CHATGPT.md](CODEX_TO_CHATGPT.md)) reports measured results once implementation evidence exists.

`PR-A = IMPLEMENTATION READY FOR PRODUCT REVIEW` (once the PR is opened; see [Current Status](../docs/CURRENT_STATUS.md) for the exact current state). `ACTUAL TEST = NOT YET TESTED`.

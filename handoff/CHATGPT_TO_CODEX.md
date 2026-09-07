# ChatGPT → Codex

Handoff ID: DECODE-TEAM-OS-STAGE3 | Version: 1.1-DRAFT | Owner: Product/Business Lead

## Current development request — Team OS Stage 3 semantic checker hardening (PLAN under review, revision 2; implementation NOT YET AUTHORIZED)

Start only from exact base `origin/main = f22cceedf369d4b0b2419314f824e12f7563526c` (verified merge of Team OS Stage 2 / PR #9). Make `scripts/check-operating-docs.mjs` mechanically detect semantic drift in the ACTIVE Team OS contract — Project Operating Manual, Collaboration Rules C1–C11, router parity (`AGENTS.md`/`CLAUDE.md`), the 10 active templates, retired-protocol shape, D021/D022, and evidence/status boundaries (including `UNKNOWN/null ≠ zero` and the `PR-A NOT STARTED` gate) — while preserving every existing publication/security/evidence check unchanged. Full requirements, the revised check-ID groups, the 21 required RED mutation scenarios plus 4 positive/control cases, the exact ACTIVE-file stale-scan scope (which now includes this handoff file itself, as a currently-executable instruction source), the test-seam/RED→GREEN design, and the complete 8-file PR scope are recorded in [docs/superpowers/plans/2026-09-06-decode-team-os-stage3-semantic-checker-hardening.md](../docs/superpowers/plans/2026-09-06-decode-team-os-stage3-semantic-checker-hardening.md) — that plan, not this handoff, is the operative specification. This handoff request does not itself authorize implementation; it becomes active only once Product reviews and approves the linked plan.

Authority: D021 / U-DECODE-TEAM-OS-2026-09-06, D022 / U-DECODE-TEAM-OS-SEQUENCE-2026-09-06 (both unchanged by Stage 3 — Stage 3 verifies them, it does not amend them).

## Explicit exclusions (HISTORICAL / DO NOT EXECUTE beyond this scope)

- Stage 3 must not change D021/D022 semantics, C1–C11 semantics, or any of the three authority documents (Integrated Spec, PLAN 1A, 10-Case ACTUAL TEST Protocol).
- **PR-A** Canonical Foundation implementation is NOT in scope. PR-A = NOT STARTED.
- **PR #5** must not be modified, merged, or closed.
- **ACTUAL TEST** execution, 50/150 case generation, annotation schema/app implementation, testing actual Codex/Claude/human obedience, and any claim that Markdown technically enforces agent behavior are NOT in scope. Stage 3 validates repository text/contracts only.
- No new dependency install; no destructive Git operations.
- The earlier M0, 003-A-1, and Team OS Stage 1/Stage 2 requests remain historical provenance only, per the prior handoff revisions preserved in Git history.

## Integration

Task-specific integration method: `PR_MERGE` (overrides the Collaboration Rules PR-optional/direct-main default for this task specifically, so Product can independently review the final Team OS enforcement diff before Team OS completion). Scoped branch `claude/team-os-stage3-checker-hardening`, already created from the exact verified base. No self-merge; no auto-merge; Product's explicit MERGE decision is required after PR review.

If planning or implementation reveals a materially unresolved Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost choice, the D017 Decision Interview Gate applies — STOP_AND_REPORT the exact decision question with options/recommendation/tradeoffs/evidence/unknowns rather than choosing unilaterally.

`PR-A = NOT STARTED`. `ACTUAL TEST = NOT YET TESTED`.

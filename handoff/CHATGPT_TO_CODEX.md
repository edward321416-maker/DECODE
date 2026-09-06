# ChatGPT → Codex

Handoff ID: DECODE-TEAM-OS-STAGE2 | Version: 1.0 | Owner: Product/Business Lead

## Current development request — Team OS Stage 2 activation/reconciliation

Start only from exact base `origin/main = 5c09f6f7108c94fd840797b434f34286da30d8b6` (verified merge of Team OS Stage 1 / PR #8). Activate and reconcile Team OS: move `docs/PROJECT_OPERATING_MANUAL.md` and `docs/COLLABORATION_RULES.md` (C1–C11) to ACTIVE OPERATING POLICY; move `docs/templates/` to ACTIVE TEMPLATE; create `CLAUDE.md` and reconcile `AGENTS.md` as thin tool-specific routers into the manual; reconcile `docs/DEVELOPMENT_RULES.md`, `docs/DOCUMENTATION_RULES.md`, `docs/AI_OPERATING_POLICY.md`, `docs/PUBLICATION_POLICY.md`, `README.md`, `docs/PROJECT_BRIEF.md`, `docs/PRODUCT_SPEC.md`, `docs/DECISION_DATASET_SPEC.md`, `data/schemas/README.md`, and both `.github/system_prompts/*` files for tool-neutral Engineering and C1–C11-consistent integration method; retire `docs/EXPERIMENT_PROTOCOL.md` to a historical candidate summary superseded for execution under D018; record D021 (Team OS v1 collaboration/operating policy) and D022 (Team OS precedes PR-A) in `docs/DECISIONS.md`; reconcile `docs/CURRENT_STATUS.md`; bump `docs/PUBLICATION_FILES.json` to version 4 (adds `CLAUDE.md`, 49 files) with only the mechanical `scripts/check-operating-docs.mjs` inventory-version-gate change plus any assertion updates strictly required by the reconciled wording (report each exactly).

Authority: D021 / U-DECODE-TEAM-OS-2026-09-06, D022 / U-DECODE-TEAM-OS-SEQUENCE-2026-09-06.

## Explicit exclusions (HISTORICAL / DO NOT EXECUTE beyond this scope)

- **Stage 3** (full Team OS semantic checker hardening) is NOT in scope for this handoff.
- **PR-A** Canonical Foundation implementation is NOT in scope. PR-A = NOT STARTED.
- **PR #5** must not be modified, merged, or closed.
- **ACTUAL TEST** execution, 50/150 case generation, and any change to the three authority documents (Integrated Spec, PLAN 1A, 10-Case ACTUAL TEST Protocol) are NOT in scope.
- The earlier M0 and 003-A-1 requests remain historical provenance only, per the prior handoff revision preserved in Git history.

## Integration

This Stage 2 activation change itself uses a scoped branch (`claude/team-os-stage2-activation`) and a normal main-targeted PR — activation is not effective until that PR is reviewed and merged; no auto-merge. Only after merge does C1–C11 (including direct-main/self-merge defaults) become the active collaboration contract for subsequent work.

`PR-A = NOT STARTED`. `ACTUAL TEST = NOT YET TESTED`.

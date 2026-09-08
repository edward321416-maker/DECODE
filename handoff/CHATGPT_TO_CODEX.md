# ChatGPT → Codex

Handoff ID: DECODE-POST-PR-A-NEXT-SCOPE-GATE | Version: 1.0 | Owner: Product/Business Lead

## Current gate — PR-A merged and complete; no engineering implementation currently authorized

PR-A Canonical Foundation is merged and complete: PR #15 merged into main at `4c8dca77acbae11f435f0d90ee863353ebae8a91` (reviewed head `e20d7f3f21d93328f4fcfb381920353c429f7606`), following Product's `MERGE APPROVED` verdict and independent post-merge audit. No engineering implementation is currently authorized. This is a gate handoff, not an implementation request.

- **Do not rerun PR-A.** It is merged and complete; PLAN 1A Canonical Foundation's implementation scope (canonical/idempotent command identity, ActorVerifier Port, Policy & Rights, durable job lifecycle, migration guards, Provenance contract) is settled on main.
- **No engineering task is currently open.** This file does not name a current development request.
- **Do not start PLAN 1B merely because PR-A merged.** PR-A completing does not automatically authorize PLAN 1B or any other next implementation; per PLAN 1A Section 15, the Evidence/Blind Gold track remains gated by the approved real-test protocol and a separate Product evidence decision.
- **Do not modify, merge, or close PR #5.** It remains OPEN / non-canonical / untouched by Team OS or PR-A work.
- **Do not execute ACTUAL TEST.** `ACTUAL TEST = NOT YET TESTED` remains true; no consented real VOD or independent expert session has run for the DECODE product.
- **Do not authorize the 50/150 expansion.** No such expansion is authorized by PR-A's merge.
- **await Product's next explicitly approved scope.** Engineering does not select or begin the next product-development task unilaterally.
- **New material decisions still return through D017.** Any materially unresolved Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost choice, whether surfaced during a mechanical correction or during future planning, goes through the one-decision-at-a-time interview before lock or implementation — it is not decided unilaterally by Engineering.

Authority: D021 / U-DECODE-TEAM-OS-2026-09-06, D022 / U-DECODE-TEAM-OS-SEQUENCE-2026-09-06, D023 / U-DECODE-EVIDENCE-CONTRACT-2026-09-07, D024 / U-DECODE-ACTUAL-PREEXECUTION-2026-09-07 (all settled, none reopened by this gate). PLAN 1A Canonical Foundation implementation authority is exhausted by the completed, merged PR-A.

## Explicit exclusions (HISTORICAL / DO NOT EXECUTE beyond this scope)

- PR-A Canonical Foundation implementation is COMPLETE and NOT in scope of this gate — do not reopen it.
- PLAN 1B implementation is NOT in scope of this gate and is not authorized by PR-A's merge.
- Any change to the three authority documents (Integrated Spec, PLAN 1A, 10-Case ACTUAL TEST Protocol), ACTUAL TEST execution, or 50/150 case generation is NOT in scope.
- The earlier M0, Team OS Stage 1/2/3 (+ audit correction), D023, D024, and PR-A implementation/review-round requests remain historical provenance only, per the prior handoff revisions preserved in Git history.

## Integration

No engineering task is currently open under this gate handoff. If/when Product approves a specific next scope and issues a new request, that request will be a separate handoff revision naming its own integration method per [Collaboration Rules](../docs/COLLABORATION_RULES.md).

`PR-A = MERGED`. `ACTUAL TEST = NOT YET TESTED`.

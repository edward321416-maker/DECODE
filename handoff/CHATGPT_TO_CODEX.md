# ChatGPT → Codex

Handoff ID: DECODE-PR-A-BASE-GATE | Version: 1.0 | Owner: Product/Business Lead

## Current gate — D023 and D024 merged and complete; no engineering implementation currently authorized

D023 and D024 are merged and complete. No engineering implementation is currently authorized. PR-A remains NOT STARTED. Await Product's independent audit and explicit approval of the exact current `origin/main` SHA as the PR-A base under D022.

This is a gate handoff, not an implementation request. Explicitly:

- **Do not rerun D023.** It was locked and merged via PR #12; the evidence contract (three canonical dimensions; `MODEL_BAKE_OFF` only as SELF-BENCHMARK subtype metadata; no `DataOrigin=MIXED`; separate REAL/SIMULATED records) is settled.
- **Do not rerun D024.** It was locked and merged via PR #13; the ACTUAL TEST + REAL + NOT TESTED pre-execution record semantics are settled.
- **No engineering task is currently open.** This file does not name a current development request.
- **PR-A = NOT STARTED.** It begins only after Product externally fetches and independently audits the actual `origin/main` HEAD following final Team OS/gate completion, and explicitly approves that exact SHA as the PR-A base under D022. That approval has not yet happened.
- **PR #5 remains OPEN / non-canonical / untouched.** It must not be modified, merged, or closed by this or any Team OS gate.
- **ACTUAL TEST = NOT YET TESTED.** No consented real VOD or independent expert session has run for the DECODE product.
- **New material decisions still return through D017.** Any materially unresolved Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost choice, whether surfaced during a mechanical correction or during future PR-A planning, goes through the one-decision-at-a-time interview before lock or implementation — it is not decided unilaterally by Engineering.

Authority: D021 / U-DECODE-TEAM-OS-2026-09-06, D022 / U-DECODE-TEAM-OS-SEQUENCE-2026-09-06, D023 / U-DECODE-EVIDENCE-CONTRACT-2026-09-07, D024 / U-DECODE-ACTUAL-PREEXECUTION-2026-09-07 (all settled, none reopened by this gate).

## Explicit exclusions (HISTORICAL / DO NOT EXECUTE beyond this scope)

- PR-A Canonical Foundation implementation is NOT in scope of this gate.
- Any change to the three authority documents (Integrated Spec, PLAN 1A, 10-Case ACTUAL TEST Protocol), ACTUAL TEST execution, or 50/150 case generation is NOT in scope.
- The earlier M0, 003-A-1, Team OS Stage 1/2/3 (+ audit correction), D023, and D024 requests remain historical provenance only, per the prior handoff revisions preserved in Git history.

## Integration

No engineering task is currently open under this gate handoff. If/when Product approves the exact PR-A base SHA and issues a new request, that request will be a separate handoff revision naming its own integration method per [Collaboration Rules](../docs/COLLABORATION_RULES.md).

`PR-A = NOT STARTED`. `ACTUAL TEST = NOT YET TESTED`.

# Implementation Plan — [feature name]

Template Version: 1.0 | Updated: 2026-09-06 | Owner: AI/Engineering Lead
Status: ACTIVE TEMPLATE
Scope: skeleton for a step-by-step engineering plan for approved scope
Authority: D021 / U-DECODE-TEAM-OS-2026-09-06

Instance fields (fill in when using this template):

Owner: AI/Engineering Lead | Date: [ISO-8601] | Status: [DRAFT | APPROVED | IN PROGRESS | DONE]

## Exact approved base

[Exact commit SHA this plan branches from, or the exact main HEAD it will integrate against directly — verify with `git rev-parse` immediately before starting, not from memory]

## Spec reference

[The Design Spec / Planning Brief this implements — link or ID. A plan without an approved spec for non-trivial scope is itself a material gap; note it rather than improvising design mid-plan]

## Global constraints

[Runtime/stack constraints (e.g. TypeScript/Node only per D016), style rules, anything that bounds every step below]

## Exact files / symbols affected

[Concrete paths and, where known, function/class/module names — not "the relevant files"]

## Task-by-task implementation sequence

1. [Task — exact files touched, expected diff shape]
2. [Task]

## Interfaces consumed / produced

[Where this plan's steps cross a component boundary from the Design Spec: what interface is consumed at that step, what is produced for a later step]

## TDD / regression cycle

[For each task above that changes behavior: which test is written first, what it asserts, and which existing tests must still pass — name the actual test file(s), not "add appropriate tests"]

## Exact verification commands

[The literal command(s) run after each task and at the end — e.g. `node scripts/check-operating-docs.mjs --index`, the actual test runner invocation. Not "run tests."]

## Explicit exclusions

[What this plan does not do, even if adjacent — prevents scope creep mid-implementation]

## Risk / rollback / corrective strategy

[What could fail at each risky step, and the exact rollback (git revert target, feature flag, etc.) — not "handle errors appropriately"]

## Integration method

[Follows the active collaboration contract in effect for this task, plus any stricter task-specific Spec/Plan/Handoff that overrides it — e.g. PLAN 1A's Whole-PR verification contract. State which applies here: DIRECT_MAIN | BRANCH_ONLY | PR_MERGE | OTHER, and why. Do not assume a PR is required by default; require one only when the applicable contract for this task actually calls for one.]

## Completion artifacts

[What gets produced at the end, matching the integration method above: a Change Report is always appropriate; a PR URL/merge commit only when this task's integration method actually uses a PR; a Test Evidence Report when evaluation occurred. Name which templates from docs/templates/ apply.]

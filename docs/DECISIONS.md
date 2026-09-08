# DECODE Decision Register

Updated: 2026-09-06 | Owner: Product/Business Lead

LOCKED means product scope is approved, not scientifically validated. LOCK CANDIDATE means reversible and awaiting evidence/approval. Record amendments as new entries referencing the superseded decision; do not silently rewrite history.

| ID | Status | Decision | Source |
| --- | --- | --- | --- |
| D001 | LOCKED | ChatGPT Project=planning HQ; planning conversation=Product/Business Lead; Codex=AI/Engineering Lead; GitHub=intended shared source of truth | U-2026-09-02 |
| D002 | LOCKED | DECODE Coach Copilot MVP v0.1, human coach retains judgment | U-2026-09-02; P-MVP |
| D003 | LOCKED | Hierarchical Decision Case, one primary decision per case, evidence/context grounded; optional alternative; outcome is not correctness | U-2026-09-02; P-DATA |
| D004 | LOCKED | Fight Selection; Post-contact Decision; Tradeability & Spacing only | U-2026-09-02 |
| D005 | LOCKED | ③-A-1 design: clear 6 + ambiguous 4; primary family 4/3/3; blind expert-first labels and timing | P-STRESS; adopted for requested handoff |
| D006 | LOCK CANDIDATE | Eight expert fields, Core/Extended context, twelve seed principles | U-2026-09-02 |
| D007 | LOCK CANDIDATE | GO/STOP thresholds and measurement conventions | U-2026-09-02; P-STRESS |
| D008 | LOCKED | ③-A-1 ACTUAL TEST is NOT YET TESTED; simulations and internal checks cannot establish success | U-2026-09-02 |
| D009 | IMPLEMENTATION CHOICE | Reuse existing local DECODE repository; no new GitHub repository or unrelated repository reuse | Identity inspection; within U-2026-09-02 |
| D010 | PENDING USER DECISION | Existing remote URL or explicit new-repository approval; Google destinations and approved authentication | No bindings found |
| D011 | ADOPTED LOCAL POLICY | Version 0.1 development/documentation/graphics rules after scoped review; no candidate promotion, implementation start or external publication | U-RULES-2026-09-02; [Rules Review](RULES_REVIEW.md) |
| D012 | USER-AUTHORIZED SETUP | Create DECODE GitHub repository and connect the existing local checkout; private edward321416-maker/DECODE created, contents not published | U-REPO-2026-09-02; [Current Status](CURRENT_STATUS.md); supersedes only D009/D010's no-new-remote pending state |

U-RULES-2026-09-02: the user asked in the current Codex task to check the proposed rules and save them if suitable. This authority covers local policy review/correction/storage only. It does not supersede D006, D007, D008 or D010.

U-REPO-2026-09-02: the user explicitly requested repository creation. Private visibility was chosen as the conservative default under the authenticated personal account. No file upload, commit, PR, merge, collaborator grant, paid service or implementation expansion is included. Google configuration and product candidates remain pending; D009-D011 are retained as historical entries.

## Public-main amendment

| ID | Status | Decision | Source |
| --- | --- | --- | --- |
| D013 | USER-AUTHORIZED OPERATING POLICY | DECODE is public; main is the single Source of Truth. Verify conflicts and content, then merge the operating foundation; use scoped branches as needed and integrate validated current rules/results into main | U-PUBLIC-2026-09-02; [Publication Policy](PUBLICATION_POLICY.md); supersedes D012 private visibility and earlier local-only/publication-pending restrictions |

U-PUBLIC-2026-09-02: the user explicitly required a public repository and main integration after verification. This authorizes scoped operating-document publication, issue/branch/commit/PR/normal merge, not unrelated legacy app publication, raw/private data, candidate promotion, new account permissions, destructive actions or a claimed ACTUAL TEST. D009-D012 and prior setup reports are historical; their unfulfilled repository/publication gates are superseded. Google bindings remain unresolved.

## Infrastructure amendment preserved from open PR #5

| ID | Status | Decision | Source |
| --- | --- | --- | --- |
| D014 | USER-AUTHORIZED IMPLEMENTATION | Implement only 003-A-1 annotation infrastructure, ten SIMULATED fixtures and automated checks on a scoped branch from latest public main; open a main PR, DO NOT MERGE before Product review | U-INFRA-2026-09-02; open PR #5 / `codex/annotation-infrastructure` |

D014 is preserved here to prevent decision-ID collision with the still-open PR #5. Recording the decision on the M0 branch does not merge or approve PR #5.

## 2026-09-06 authority amendment

| ID | Status | Decision | Source |
| --- | --- | --- | --- |
| D015 | LOCKED | DECODE Integrated Spec v1.0 consolidates the user-approved Product/Architecture decisions. The exact earlier prose was unavailable in GitHub/Library; the reviewed committed M0 content hash becomes repository wording authority only after normal review/merge. | U-DECODE-INTEGRATED-2026-09-06 |
| D016 | LOCKED | PR-A Canonical Foundation runtime is TypeScript/Node only. Future AI/media/backend runtime remains provider/runtime neutral. Actor authorization uses an `ActorVerifier` port; production identity provider/role taxonomy remain NOT YET LOCKED. | U-DECODE-PLAN1A-2026-09-06 |
| D017 | LOCKED OPERATING RULE | Material unresolved Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost decisions require one-decision-at-a-time user interview before lock/implementation. Product/Research may work at most one verification gate ahead of Engineering. | U-DECODE-OPERATING-2026-09-06 |
| D018 | LOCKED PROTOCOL DESIGN | 10-Case ACTUAL TEST Protocol v1.0, decisions Q1-Q56, is design-locked for preparation only. ACTUAL TEST remains NOT YET TESTED; fields/context/principles and performance thresholds remain evidence candidates until real execution review. | U-DECODE-ACTUAL-PROTOCOL-2026-09-06 |
| D019 | LOCKED | ACTUAL TEST Product gate authority: Product/Business Lead synthesizes evidence and recommends GO/REVISE/STOP; the user is final approval authority. Thresholds never auto-authorize GO/STOP and no 50/150 expansion is automatic. | U-DECODE-ACTUAL-PROTOCOL-2026-09-06 |

U-DECODE-INTEGRATED-2026-09-06 / U-DECODE-PLAN1A-2026-09-06 / U-DECODE-ACTUAL-PROTOCOL-2026-09-06: decisions approved in the DECODE planning conversation and materialized through the M0 review flow. Publication does not establish empirical validity. ACTUAL TEST remains NOT YET TESTED.

## 2026-09-06 M0 post-merge receipt

| ID | Status | Decision | Source |
| --- | --- | --- | --- |
| D020 | LOCKED | M0 authority materialization is complete: PR #6 (`m0/authority-materialization-2026-09-06`) merged to main at `M0_AUTHORITY_MERGE_SHA = 94252efe862d01c6441d6b0ed10fde589870b562`; independently re-verified post-merge by exact Git blob ID and SHA-256 of Git object bytes for all three authority documents, matching Product-approved expected values exactly. `APPROVED_IMPLEMENTATION_BASE_SHA` = the actual `origin/main` HEAD produced by the reviewed merge of this receipt PR (PR #7), fetched, verified, and recorded in the merge receipt/report immediately after that merge, without a further repository-file commit that would move main HEAD again; PR-A remains NOT STARTED and must branch from that exact verified HEAD, re-checked against the approved receipt SHA immediately before PR-A starts (mismatch = STOP_AND_REPORT). | U-DECODE-M0-RECEIPT-2026-09-06 |

U-DECODE-M0-RECEIPT-2026-09-06: continuation of the same M0 authority materialization authority (U-DECODE-INTEGRATED-2026-09-06 / U-DECODE-PLAN1A-2026-09-06 / U-DECODE-ACTUAL-PROTOCOL-2026-09-06), confirming the reviewed merge and recording an independent post-merge hash receipt. Does not authorize PR-A start, PR #5 merge, or any ACTUAL TEST execution.

## 2026-09-06 Team OS activation

| ID | Status | Decision | Source |
| --- | --- | --- | --- |
| D021 | LOCKED OPERATING POLICY | Team OS v1 collaboration/operating policy adopted: [Project Operating Manual](PROJECT_OPERATING_MANUAL.md) is the shared canonical task router; [Collaboration Rules](COLLABORATION_RULES.md) C1–C11 govern integration (peer approval/review/PR/branch optional; self-merge and direct-main allowed where host/task permits; free parallel/same-file work; no ownership requirement; work-sized PRs; C6 minimum/full verification; available developer/AI may repair main; brief coordination notice only before large work; free commit style; routine implementation choices belong to the implementer; no force-push/destructive reset); `docs/templates/` are the standard document structures; human developers and approved AI development tools (including Codex and Claude Code, either able to fill the AI/Engineering role) operate under the same collaboration contract within actual host permissions; `AGENTS.md` and `CLAUDE.md` are thin tool-specific routers into the same manual, not separate policy copies. Material Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost decisions remain under D017; an approved task-specific Spec/Plan/Handoff may impose stricter requirements and wins over the collaboration defaults (PLAN 1A's Whole-PR verification contract is the standing example). D021 supersedes D001 only insofar as D001 could be read as making Codex the exclusive Engineering tool/provider; D001 remains historical provenance for the original role/document assignment otherwise. | U-DECODE-TEAM-OS-2026-09-06 |
| D022 | LOCKED EXECUTION SEQUENCE | Team OS Stage 1 → Stage 2 → Stage 3 must complete before PR-A begins. D020's `M0_AUTHORITY_MERGE_SHA`-derived receipt main SHA `44fc42861e6b73d848f2f50b1d8f19991d1d5a12` remains valid historical M0 receipt evidence; it is superseded only as the eventual PR-A start base. The replacement PR-A base is the exact actual `origin/main` HEAD immediately after final Team OS completion, externally verified and explicitly Product-approved before PR-A branch creation. That future SHA is not written into main in advance, and no commit is created merely to record it. | U-DECODE-TEAM-OS-SEQUENCE-2026-09-06 |

U-DECODE-TEAM-OS-2026-09-06 / U-DECODE-TEAM-OS-SEQUENCE-2026-09-06: Product-approved Team OS activation and sequencing, recorded during Stage 2 reconciliation. Neither authorizes PR-A start, PR #5 merge/modification/closure, ACTUAL TEST execution, or any change to the three authority documents. ACTUAL TEST remains NOT YET TESTED.

## 2026-09-07 Evidence / provenance contract amendment

| ID | Status | Decision | Source |
| --- | --- | --- | --- |
| D023 | LOCKED EVIDENCE CONTRACT | DECODE retains exactly three canonical evidence dimensions — Evaluation purpose/mode (ACTUAL TEST, SELF-BENCHMARK, N/A), Data origin (REAL, SIMULATED, UNKNOWN), Execution status (NOT TESTED, RUNNING, PASSED, FAILED, BLOCKED). `MODEL_BAKE_OFF` is not a fourth Evaluation purpose/mode; an internal model comparison uses Evaluation purpose/mode=SELF-BENCHMARK with optional orthogonal metadata `evaluation_subtype=MODEL_BAKE_OFF`, which never changes ACTUAL TEST eligibility; no other subtype value is defined by this decision. `MIXED` is not a canonical Data origin; a workflow using both REAL and SIMULATED inputs records separate evidence records for each, never a single record with Data origin=MIXED, and SIMULATED material is never folded into an ACTUAL TEST denominator/run/claim. The separate `ActualTestStatus` axis is removed: ACTUAL TEST state is Evaluation purpose/mode=ACTUAL TEST plus the canonical Execution status; `ACTUAL TEST = NOT YET TESTED` remains explanatory prose for mode=ACTUAL TEST, execution status=NOT TESTED, not a separate enum value. This amends only the provenance-contract section (Section 3, plus its restatement in Section 12's acceptance invariants) of PLAN 1A Canonical Foundation; the TypeScript/Node runtime lock, ActorVerifier Port, Policy & Rights, durable job lifecycle, migration compatibility, Q1–Q56 ACTUAL TEST protocol, and product families/fields/threshold status are unchanged. | U-DECODE-EVIDENCE-CONTRACT-2026-09-07 |

U-DECODE-EVIDENCE-CONTRACT-2026-09-07: user-selected Option C following a Product decision interview under D017. Locks the evidence/provenance contract amendment above; does not authorize PR-A start, PR #5 merge/modification/closure, or ACTUAL TEST execution. The pre-amendment PLAN 1A Section 3 text and its prior content hash remain in Git history as historical provenance, not current canonical wording.

## 2026-09-07 ACTUAL TEST pre-execution record semantics

| ID | Status | Decision | Source |
| --- | --- | --- | --- |
| D024 | LOCKED EVIDENCE CONTRACT | An evidence record may exist with Evaluation purpose/mode=ACTUAL TEST, Data origin=REAL, Execution status=NOT TESTED, representing a planned/registered ACTUAL TEST evidence unit that has not yet been executed. It does not mean the ACTUAL TEST occurred, real evidence was observed, an expert completed review, or the test passed or failed; the record becomes an executed ACTUAL TEST record only when Execution status transitions according to actual execution evidence. `ACTUAL TEST = NOT YET TESTED` is explanatory prose for this pre-execution state, whether or not such a record is persisted. Canonical Execution statuses remain exactly NOT TESTED/RUNNING/PASSED/FAILED/BLOCKED; `ActualTestStatus` is not reintroduced. Such a pre-execution record must never count toward executed sample size, expert agreement, threshold calculations, or GO/REVISE/STOP evidence, and never authorizes 50/150 expansion or is represented as PASSED/FAILED. D023 remains fully in force (three canonical dimensions; MODEL_BAKE_OFF only as SELF-BENCHMARK subtype metadata; no Data origin=MIXED; separate REAL/SIMULATED records). This amends only PLAN 1A Section 12's Provenance acceptance invariant #5, which previously conflicted with Section 3 by treating ExecutionStatus=NOT TESTED as meaning no ACTUAL TEST record exists; Section 3 already had the correct semantics and remains authoritative, unchanged except for a clarifying cross-reference to this decision. | U-DECODE-ACTUAL-PREEXECUTION-2026-09-07 |

U-DECODE-ACTUAL-PREEXECUTION-2026-09-07: user-selected Option A (ALLOW) following a Product decision interview under D017. Locks the pre-execution record semantics above; does not authorize PR-A start, PR #5 merge/modification/closure, or ACTUAL TEST execution. Unknown measured fields remain UNKNOWN/null, never zero.

## 2026-09-08 DRY Readiness design (A1 scope)

| ID | Status | Decision | Source |
| --- | --- | --- | --- |
| D025 | LOCKED SCOPE | A1 Dry Readiness only: no real VOD, participant PII, actual consent collection, Founder Gold, actual Second Expert session, or other REAL execution. ACTUAL TEST remains NOT YET TESTED. | U-DECODE-DRY-READINESS-2026-09-08 |
| D026 | LOCKED SCOPE | B1 Synthetic-only readiness harness: dry rehearsal only; no REAL-data entry point. | U-DECODE-DRY-READINESS-2026-09-08 |
| D027 | LOCKED SCOPE | C1 PR #5 read-only reference: audit lessons/patterns only. No merge/rebase/cherry-pick/modification/closure. Any useful behavior is independently reimplemented from canonical main. | U-DECODE-DRY-READINESS-2026-09-08 |
| D028 | LOCKED ARCHITECTURE | D1 Separate `readiness/` package. It sits above `@decode/foundation`; no protocol-specific behavior is added to `foundation/`. | U-DECODE-DRY-READINESS-2026-09-08 |
| D029 | LOCKED CONTRACT | E1 All-or-blocked readiness verdict. Every mandatory dry gate must PASS for `readiness_verdict=DRY_READY`. Any missing/failing/unknown/unexecuted mandatory dry gate => `readiness_verdict=BLOCKED`. `DRY_READY != ACTUAL TEST READY != ACTUAL TEST GO`. | U-DECODE-DRY-READINESS-2026-09-08 |
| D030 | LOCKED CONTRACT | F1 Hybrid evidence gate. Deterministic properties => automated tests. Operational flows => synthetic scenario rehearsal + checklist. Real human/rights facts remain NOT TESTED; synthetic rehearsal must never represent actual consent, source rights, or expert qualification as passed. | U-DECODE-DRY-READINESS-2026-09-08 |
| D031 | LOCKED INTERFACE | G1 CLI + machine-readable JSON. No UI. Versioned SIMULATED fixtures only. Unique `run_id`. Gate result/reason codes and overall readiness verdict. | U-DECODE-DRY-READINESS-2026-09-08 |
| D032 | LOCKED POLICY | H1 Sanitized Git evidence only. Commit sanitized SELF-BENCHMARK result artifacts. Raw stdout/stderr, temporary workspaces, traces, access-bearing or private evidence remain local/private. | U-DECODE-DRY-READINESS-2026-09-08 |
| D033 | LOCKED POLICY | I1 Retain every valid completed dry run. Both DRY_READY and BLOCKED valid runs are immutable history. Do not overwrite/delete failed historical evidence to improve appearance. A crash that cannot produce a trustworthy artifact is not represented as a valid DRY_READY/BLOCKED run. | U-DECODE-DRY-READINESS-2026-09-08 |
| D034 | LOCKED CONTRACT | J1 Latest valid canonical run determines current readiness. Its frozen code/protocol/schema/fixture/gate hashes must still match current canonical state. Any relevant change before a fresh run => current readiness BLOCKED with `STALE_RUN`. | U-DECODE-DRY-READINESS-2026-09-08 |
| D035 | LOCKED CONTRACT | K1 Synthetic metric values are non-evidentiary. Gate only correctness of preregistered computation: median, nearest-rank P90, timing exclusion, context-insufficiency numerator/denominator, taxonomy escape, directional-agreement eligibility/coverage, field usefulness, raw denominator preservation, UNKNOWN/null handling. Synthetic values do NOT need to satisfy candidate thresholds and never become Product-quality evidence. | U-DECODE-DRY-READINESS-2026-09-08 |
| D036 | LOCKED ARCHITECTURE | L1 Readiness core TypeScript/Node + provider-neutral `LocalTranscriptionPort`. TypeScript/Node is locked only for the readiness core. No concrete STT engine/provider/model is locked by this decision. Protocol pre-execution step 13 is rehearsed through `LocalTranscriptionPort` using non-personal SIMULATED audio; if no qualifying local adapter exists at execution time, the mandatory dry gate => `BLOCKED / LOCAL_TRANSCRIPTION_UNAVAILABLE`. External STT is never an automatic fallback; external egress remains BLOCKED unless a future separately authorized scope satisfies the Protocol. | U-DECODE-DRY-READINESS-2026-09-08 |

U-DECODE-DRY-READINESS-2026-09-08: Product-approved DRY Readiness design-spec-materialization directive. Materializes decisions D025–D036 as design-level scope/architecture/contract locks for the design spec at [2026-09-08-decode-dry-readiness-design.md](superpowers/specs/2026-09-08-decode-dry-readiness-design.md), Status DRAFT — USER REVIEW REQUIRED BEFORE IMPLEMENTATION PLAN. Does not authorize implementation of the readiness runtime/code, PLAN 1B, ACTUAL TEST execution, or 50/150 expansion; does not modify, merge, rebase, cherry-pick, or close PR #5; does not amend the Integrated Spec, PLAN 1A, or the 10-Case ACTUAL TEST Protocol, all three of which remain frozen authority artifacts. `ACTUAL TEST = NOT YET TESTED`.

## 2026-09-08 Dry Readiness execution-status mapping

| ID | Status | Decision | Source |
| --- | --- | --- | --- |
| D037 | LOCKED EVIDENCE CONTRACT | Dry Readiness execution-status mapping. Before a dry run executes: `ExecutionStatus=NOT_TESTED`. While a valid dry run is executing: `ExecutionStatus=RUNNING`. Every mandatory dry gate completed and PASS: `ExecutionStatus=PASSED`, `readiness_verdict=DRY_READY`. At least one mandatory gate actually executes and detects a software/contract/invariant defect: `ExecutionStatus=FAILED`, `readiness_verdict=BLOCKED`. No actual defect was demonstrated, but the valid run cannot satisfy a mandatory prerequisite or a mandatory gate remains unavailable/not executable: `ExecutionStatus=BLOCKED`, `readiness_verdict=BLOCKED`. `readiness_verdict` and canonical `ExecutionStatus` remain independent fields and MUST NOT be collapsed into one enum. Every dry-run evidence record remains `EvaluationMode=SELF_BENCHMARK`, `DataOrigin=SIMULATED`. No dry result may self-promote to ACTUAL TEST. `DRY_READY != ACTUAL TEST READY != ACTUAL TEST GO`. If implementation later encounters a case that cannot deterministically map under this decision, it stops under D017 rather than inventing another status. | U-DECODE-DRY-READINESS-CORRECTION-2026-09-08 |

U-DECODE-DRY-READINESS-CORRECTION-2026-09-08: Product's fresh independent review of PR #17 head `966ad18893cb0a8450ad3f63ed8a04c08a52740e` returned REVISE — MERGE NOT AUTHORIZED, materializing D037 as the next sequential decision and directing 10 mechanical corrections to the design spec text (run-ID contract, positive-quality composition timing, structural SIMULATED-only input boundary, unmerged-PR-provenance distinction in `docs/CURRENT_STATUS.md`, reverse handoff, internal section-reference fixes, dependency wording, pending-log timestamp, checker coverage review). D025–D036 remain in force, unamended except where this correction's own wording clarifications apply. Does not authorize implementation of the readiness runtime/code, PLAN 1B, ACTUAL TEST execution, or 50/150 expansion; does not modify, merge, rebase, cherry-pick, or close PR #5; does not amend the Integrated Spec, PLAN 1A, or the 10-Case ACTUAL TEST Protocol. `ACTUAL TEST = NOT YET TESTED`.

## Decision promotion

Engineering may recommend GO/REVISE/STOP, but cannot promote candidates, invent thresholds, declare actual-test success from fixtures, or authorize Alpha 50/150 itself. Product records approver, date, evidence/run IDs, exact rule/version, and approved scope. If evidence is absent, the decision remains pending.

## Future entry template

- ID / date / author / approving user:
- Status and superseded ID:
- Decision and alternatives:
- Evidence category, run ID, source commit/PR, sample size:
- Known limitations / rollback or revision condition:
- Next authorized engineering request:

Source IDs resolve through [PROJECT_BRIEF](PROJECT_BRIEF.md). The earlier B2C demo and five-category/six-screen proposal are not the current Coach Copilot scope.

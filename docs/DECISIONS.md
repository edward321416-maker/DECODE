# DECODE Decision Register

Updated: 2026-09-02 | Owner: Product/Business Lead

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

# DECODE Collaboration Rules — Human Developers and Approved AI Tools

Version: 1.0 | Updated: 2026-09-06 | Owner: AI/Engineering Lead
Status: ACTIVE OPERATING POLICY | Scope: multi-tool AI/Engineering and human developer collaboration on this repository
Authority: D021 / U-DECODE-TEAM-OS-2026-09-06 in [Decisions](DECISIONS.md)

These rules govern DECODE collaboration effective this revision. Human developers and approved AI development tools (Codex, Claude Code, and any future approved tool) follow the same rules within actual host permissions. An approved task-specific Spec/Plan/Handoff may impose a stricter workflow and overrides these defaults for that task (see Precedence, below).

## C1 — Main integration authority

- Peer approval is not required.
- Review is optional.
- A PR author may merge their own PR where the applicable task/host permits.
- Existing stricter task-specific contracts override this default.

## C2 — Free parallel development

- Free parallel development is allowed.
- Same feature/file may be worked on concurrently.
- No task/feature ownership requirement.

## C3 — PR size

- PRs may contain the amount of work completed.
- No fixed small-PR size rule.
- Unrelated work/material decisions must still not be hidden inside a PR.

## C4 — Self-merge

- Self-merge is allowed where the applicable task/host permits.
- Peer approval is not a prerequisite.

## C5 — Direct main development

- Branch is optional.
- PR is optional.
- Direct-main workflow is allowed under this collaboration contract when host permissions and the applicable task-specific contract allow it.
- Force push and destructive reset remain prohibited.

## C6 — Minimum verification

For ordinary changes:

- reconcile/check latest main;
- run affected tests;
- inspect the actual diff;
- check for secrets/private VOD/consent/access-bearing data.

Elevate to full verification for:

- shared contract/schema;
- dependency;
- build/config;
- auth/security/rights;
- migration;
- cross-system changes;
- significant conflict resolution.

## C7 — Main recovery

- A main regression/problem may be corrected by whichever developer/approved AI is available.
- Original authorship does not create exclusive repair ownership.
- Destructive recovery remains prohibited.

## C8 — Work visibility

- No notification is required for every task.
- Before significant/large work, send only a short coordination notice.
- The notice is not an approval request and does not create ownership.

## C9 — AI development authority

- Approved AI development tools and human developers follow the same collaboration rules within actual host permissions.
- This includes edit/test/commit/branch/PR/self-merge/direct-main capabilities when the applicable host/task permits.
- This does not grant unavailable OAuth/IAM/elevated/destructive capabilities.
- Material decisions still remain under D017.

## C10 — Commit style

- Commit count/style is free.
- Conventional Commits are not mandatory.
- Squash is not mandatory.
- Commit messages only need to remain understandable.
- Force-push history rewriting remains prohibited.

## C11 — Engineering implementation choice

- Routine implementation details are chosen by the implementer within LOCKED contracts.
- Function/file organization, naming, internal abstractions and test structure do not require a new Product decision.
- Material Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost changes return through D017.

## Precedence (cross-cutting, not a numbered rule)

Approved task-specific Spec / Plan / Handoff may impose stricter workflow or verification requirements and overrides the collaboration defaults for that task. Example: PLAN 1A retains its Whole-PR verification contract, which takes priority over C1/C5's PR-optional/direct-main defaults for PR-A Canonical Foundation work.

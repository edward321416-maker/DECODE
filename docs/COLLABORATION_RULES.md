# DECODE Collaboration Rules — Codex and Claude Code

Version: 0.1 | Updated: 2026-09-06 | Owner: AI/Engineering Lead
Status: ACTIVE OPERATING POLICY | Scope: multi-tool AI/Engineering work on this repository
Authority: reconciles existing role/authority decisions (D001, D017) in [Decisions](DECISIONS.md); introduces no new product/architecture decision.

DECODE's AI/Engineering Lead role has been filled at different times by Codex (via `AGENTS.md`) and Claude Code (via `CLAUDE.md`). Both route to [Project Operating Manual](PROJECT_OPERATING_MANUAL.md) and share the same repository state — `docs/`, `handoff/`, git history. "Codex" and "ChatGPT" in existing handoff documents are role names describing a function (Product/Business Lead, AI/Engineering Lead), not a commitment to a specific vendor tool; either tool may fill either AI role for a given task, subject to the constraints below.

## COL-01 — One writer per branch at a time

Only one AI tool/session writes to a given branch or worktree at a time. Before starting work, check `git status`, `git worktree list`, and recent commits/PRs for in-progress work by another session. If found, do not rebase, force-push, or overwrite it; branch from the same base under a distinct name or continue in the existing branch/worktree only if the prior session's work is understood and preserved.

## COL-02 — Single handoff record, tool-agnostic

`handoff/CODEX_TO_CHATGPT.md` and `handoff/CHATGPT_TO_CODEX.md` are the shared report/request record regardless of which tool produced them. A report written by Claude Code uses the same eight required headings and evidence discipline as one written by Codex; it is not a second, competing report. Preserve the prior report's content in Git history rather than silently discarding it.

## COL-03 — Decisions and status are singular

`docs/DECISIONS.md` and `docs/CURRENT_STATUS.md` have exactly one current state each, edited by whichever tool is doing the reconciling work in a given task, never forked per tool. A decision ID (`D0NN`) is issued once; if two sessions might both need a new ID, the later session checks the current file state immediately before editing to avoid a collision, and amends with a new ID rather than overwriting.

## COL-04 — Router files stay thin

`AGENTS.md` and `CLAUDE.md` each hold only: a read-order pointer into `docs/PROJECT_OPERATING_MANUAL.md`, and tool-specific mechanics that genuinely differ (e.g. a harness's own file-editing conventions). Policy content that applies to both tools belongs in the manual or the document it points to, not duplicated or forked across the two router files. A change to shared policy is one edit to the manual, not a parallel edit to both routers.

## COL-05 — Verification is tool-neutral

A publication check, hash verification, or test result is valid regardless of which tool ran it, provided the method is recorded (exact command, source revision, evidence label). Do not re-claim a check as unverified merely because a different tool re-runs it; do re-run it when the underlying files changed since the last run.

## COL-06 — Escalation on conflict

If Codex-authored and Claude-Code-authored guidance for the same task genuinely conflict (not just different phrasing), that is a material Product/Architecture question under D017 and goes through the one-decision-at-a-time interview gate — neither tool unilaterally decides which guidance wins.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## DECODE operating policy

Before substantive DECODE work, read `docs/PROJECT_OPERATING_MANUAL.md` — the canonical repository task router for every role and tool. It routes to `docs/CURRENT_STATUS.md`, `docs/DECISIONS.md`, the applicable handoff, and the applicable domain policies (`docs/DEVELOPMENT_RULES.md`, `docs/DOCUMENTATION_RULES.md`, `docs/GRAPHICS_RULES.md`, `docs/AI_OPERATING_POLICY.md`, `docs/PUBLICATION_POLICY.md`) in the order and precedence it specifies. These project policies remain subordinate to host/system/developer safety and permissions.

`docs/COLLABORATION_RULES.md` (C1–C11) governs collaboration between Codex, Claude Code (`CLAUDE.md`), and human developers on this repository — read it there rather than duplicated here. `.github/system_prompts/codex_system_prompt.md` is Codex-specific supplemental policy layered on top of the shared Team OS, not a replacement for it; it does not hard-code a current engineering task — the applicable handoff and `docs/CURRENT_STATUS.md` name the actual current request.

Preserve existing untracked app code and unrelated work. Environment sensing parses manifests only; never executes their scripts. Do not create a repository without explicit user approval. Force-push, destructive reset, and other history-rewriting operations remain prohibited regardless of what Collaboration Rules permits elsewhere. Report file changes only as unified diffs or exact SEARCH/REPLACE blocks unless a tool already produced the change for direct review. Never turn SIMULATED or SELF-BENCHMARK results into ACTUAL TEST success.

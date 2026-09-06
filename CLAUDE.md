# DECODE — Claude Code thin router

Before substantive DECODE work, read `.github/system_prompts/chatgpt_custom_instructions.md` for role context, then `docs/PROJECT_OPERATING_MANUAL.md` (top-level router for all roles/tools), `docs/AI_OPERATING_POLICY.md`, `docs/CURRENT_STATUS.md`, and the applicable handoff under `handoff/`. These project policies remain subordinate to host/system/developer safety and permissions, and to this harness's own operating instructions (CLAUDE.md conventions, memory, skills).

`AGENTS.md` is the equivalent thin router for Codex. Both route to the same `docs/PROJECT_OPERATING_MANUAL.md`; policy content lives there and in the documents it points to, not duplicated per tool. See `docs/COLLABORATION_RULES.md` for how Codex and Claude Code share this repository without diverging state.

For the affected work, apply `docs/DEVELOPMENT_RULES.md`, `docs/DOCUMENTATION_RULES.md`, and `docs/GRAPHICS_RULES.md`. These are adopted operating rules, not proof of application compliance or authorization to run queued development work. Read `docs/PUBLICATION_POLICY.md`: the public DECODE repository's `main` is the canonical source of truth; verified rules and results must be integrated there through the applicable review flow.

Preserve existing untracked app code. Never execute manifest scripts as a side effect of inspecting them. Do not create a repository, merge a PR, or run a destructive command without explicit user approval for that specific action. Report file changes as diffs, or make them directly with this harness's file-editing tools and let the user review the resulting diff — do not fabricate a diff text block when a tool already produced the change. Never turn SIMULATED or SELF-BENCHMARK results into ACTUAL TEST success.

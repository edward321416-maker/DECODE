# DECODE — Claude Code thin router

Host/System/Claude Code permissions and safety always outrank repository policy below. Nothing in this file or the documents it points to grants a capability the host does not actually permit.

Before substantive DECODE work, read [Project Operating Manual](docs/PROJECT_OPERATING_MANUAL.md) — the canonical repository task router for every role and tool. It routes to [Current Status](docs/CURRENT_STATUS.md), [Decisions](docs/DECISIONS.md), the applicable handoff, and the applicable domain policies in the order and precedence it specifies. Follow that manual's routing contract rather than a separate list duplicated here.

`AGENTS.md` is the equivalent thin router for Codex; both route to the same manual. Collaboration between Codex, Claude Code, and human developers on this repository follows [Collaboration Rules](docs/COLLABORATION_RULES.md) (C1–C11), not a Claude-Code-specific variant.

`.github/system_prompts/chatgpt_custom_instructions.md` is Product/Business Lead planning material, not a Claude Code instruction set — do not read it as this tool's system prompt. `.github/system_prompts/codex_system_prompt.md` is Codex-specific supplemental policy, likewise not addressed to Claude Code.

Preserve existing untracked app code and unrelated work. Never execute manifest scripts as a side effect of inspecting them. Force-push, destructive reset, and other history-rewriting operations remain prohibited regardless of what Collaboration Rules permits elsewhere. `ACTUAL TEST = NOT YET TESTED` remains true until a real, consented, independently-run test exists under the approved method — never turn SIMULATED or SELF-BENCHMARK results into ACTUAL TEST success.

This file does not hard-code a current engineering task — the applicable handoff under `handoff/` and [Current Status](docs/CURRENT_STATUS.md) name the actual current request.

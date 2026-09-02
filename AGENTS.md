<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## DECODE operating policy

Before substantive DECODE work, read `.github/system_prompts/codex_system_prompt.md` and `docs/AI_OPERATING_POLICY.md`, then `docs/CURRENT_STATUS.md` and the applicable handoff. These project policies remain subordinate to host/system/developer safety and permissions.

For the affected work, apply `docs/DEVELOPMENT_RULES.md`, `docs/DOCUMENTATION_RULES.md`, and `docs/GRAPHICS_RULES.md`. Their review record is `docs/RULES_REVIEW.md`. These are adopted operating rules, not proof of application compliance or authorization to run queued development work. Read `docs/PUBLICATION_POLICY.md`: the public DECODE repository's `main` is the canonical source of truth; verified rules and results must be integrated there through the applicable review flow.

Preserve existing untracked app code. Environment sensing parses manifests only; never executes their scripts. Do not create a repository without explicit user approval. Destructive commands are prohibited for this task. Report file changes only as unified diffs or exact SEARCH/REPLACE blocks. Never turn SIMULATED or SELF-BENCHMARK results into ACTUAL TEST success.

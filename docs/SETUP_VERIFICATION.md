# Operating Setup Verification

HISTORICAL SNAPSHOT — records the earlier task only. Current authority and repository state are in [Current Status](CURRENT_STATUS.md) and [Publication Policy](PUBLICATION_POLICY.md). Later publication supersedes old local-only/private/pending statements; earlier check counts are not a fresh audit.

Scope: documentation and policy integrity only | Evidence: SELF-BENCHMARK

Verified: 2026-09-02T02:50:09.183Z | Result: 174/174 checks PASS, 0 failures.

## What was actually checked

- All 22 scoped files exist: 20 additions and two edits (README.md, AGENTS.md).
- All 17 other baseline files retain their original SHA-256 values, including app code, package.json, package-lock.json, TypeScript configuration and .gitignore. Every original line of the two edited documents remains in order.
- Forty relative Markdown links resolve. Scoped Markdown has final newlines and no trailing whitespace.
- Reverse handoff has the exact eight required sections; .gemini_sync.md has exactly the four required English report sections.
- experiment_log.csv is header-only with 14 columns; the separate pending Google log uses the requested four columns and an explicit UNKNOWN token value.
- Sampling slots are ten unique IDs with clear/ambiguous=6/4 and primary-family=4/3/3. All twelve candidate principle identifiers are present. This verifies document structure, not real scene selection.
- Each prompt has the required safety/context/acquisition/logging rules (28 static presence checks in total). This is NOT model compliance, prompt-injection robustness, or measured token reduction.
- The unified diff passes `git apply --check --whitespace=error-all` against the captured pre-edit baseline. Applying it in an isolated scratch directory reproduces all 22 scoped files byte-for-byte. The real repository was not reset or patched by this check.
- Git still has no remote, commit or staged file. No original untracked application file was staged or committed.

## Corrected check

The first audit found that CHATGPT_TO_CODEX.md lacked an explicit SELF-BENCHMARK statement (173/174 passed). That missing evidence distinction was added and the full audit passed. No test failure was concealed or relabeled as a real stress-test result.

## Live setup observations, separate from automated checks

The DECODE ChatGPT project was created. Its 7,927-character Product/Business Lead policy was saved, reopened and compared exactly. The existing planning conversation's move did not persist through repeated UI attempts, including a semantic menu selection; the project still listed no chats and app metadata showed projectId=null. The cause is not established. Current Codex task title reflects AI/Engineering Lead, while its recorded working directory remains projectless.

GitHub discovery used the authenticated CLI account's repository list and connected repository searches for DECODE/valorant. No matching remote was found in that bounded search. No Google spreadsheet/folder binding was found; Google write tests were not attempted.

## Recheck boundary

These checks use a dependency-free local audit and Git's patch checker, not package.json scripts. The delivered diff's application can be rechecked against the same pre-edit README/AGENTS baseline in a separate scratch directory. Do not apply it again over already-created setup files or claim Git HEAD represents that baseline: the repository has no commits. Later substantive edits require a fresh audit. The exported verification record contains the delivered patch hash; this report intentionally avoids a self-referential patch hash.

Application Runtime, manifest scripts, model behavior and ③-A-1 ACTUAL TEST were NOT TESTED. No measurement in this report may be used as expert agreement, annotation speed, principle coverage or coaching success.

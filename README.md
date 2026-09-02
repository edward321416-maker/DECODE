# DECODE Coach Copilot

Public operating foundation for **DECODE Coach Copilot MVP v0.1**. The canonical source of truth is [`main`](https://github.com/edward321416-maker/DECODE/tree/main), not a private chat or an unmerged branch.

**③-A-1 ACTUAL TEST: NOT YET TESTED.** This repository publishes operating rules, candidate specifications and handoffs. It does not yet contain an implemented annotation application, validated coaching model, real VOD, or expert results. The pre-existing local deterministic demo is excluded from this publication and is not a validated Coach Copilot.

## Start here

1. Read [Project Brief](docs/PROJECT_BRIEF.md), [Current Status](docs/CURRENT_STATUS.md) and [Decisions](docs/DECISIONS.md).
2. Use [Product Spec](docs/PRODUCT_SPEC.md), [Dataset Spec](docs/DECISION_DATASET_SPEC.md) and [Experiment Protocol](docs/EXPERIMENT_PROTOCOL.md). Eight expert fields, Core/Extended context, twelve principles and GO/STOP thresholds remain LOCK CANDIDATE.
3. Apply [Development Rules](docs/DEVELOPMENT_RULES.md), [Documentation Rules](docs/DOCUMENTATION_RULES.md), [Graphics Rules](docs/GRAPHICS_RULES.md), [AI operations](docs/AI_OPERATING_POLICY.md) and [Publication Policy](docs/PUBLICATION_POLICY.md).
4. Product writes [ChatGPT → Codex](handoff/CHATGPT_TO_CODEX.md); Engineering returns [Codex → ChatGPT](handoff/CODEX_TO_CHATGPT.md) against the same revision.

ChatGPT Project is the planning headquarters; the planning conversation is Product/Business Lead; Codex is AI/Engineering Lead. Role assignment does not synchronize chat histories. Private conversation bindings stay outside this public repository.

## Validate the operating documents

Prerequisites: Node.js and Git. No package installation, application build, manifest script, Google connection or model API is needed. From this repository root:

```sh
node scripts/check-operating-docs.mjs
node scripts/check-operating-docs.mjs --tracked
```

The first command checks the allowlisted working files; the second additionally compares the committed HEAD file list to the publication inventory. Before a publication commit, use `--index` instead of `--tracked` to verify the proposed staged tree. Exit 0 means these static publication checks passed; exit 1 lists failed checks to resolve. These commands do not run ③-A-1, certify security, or validate model behavior.

See [publication evidence](docs/MAIN_PUBLICATION.md), [historical Rules Review](docs/RULES_REVIEW.md) and [Risks](docs/RISKS.md) for limits. The [experiment log](experiments/experiment_log.csv) has no executed runs; the separate [pending operations log](experiments/ai_execution_log.pending.csv) is not a Google sync receipt.

## Contribution boundary

Use a scoped branch when needed, check changes and conflicts, and merge validated policies/results to `main` through a normal PR. Never bypass branch protections or publish secrets, private media, identities, consent records, private chat URLs, local-only audit files or unrelated app code. Public visibility does not approve a license or third-party content reuse; no license was added by this task.

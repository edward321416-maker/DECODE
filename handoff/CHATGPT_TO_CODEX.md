# ChatGPT → Codex

Handoff ID: DECODE-M0-PR-A | Version: 1.0 | Owner: Product/Business Lead

## Current development request — M0 authority materialization → PR-A

Start only from verified public main `e8e835718a9f95f02ce81682da2092db81249816`. First materialize the approved authority set exactly:

- `docs/superpowers/specs/2026-09-06-decode-integrated-spec-v1.md` — expected SHA-256 `bfad20123a4f4263d111fc50924a04e15d8e76fdccccb666f159eea0978009ae`
- `docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md` — expected SHA-256 `ff9b083a355d9228dcb37e4514c493e36d6090a20d2dcb1c96fc8eb83f8a6af7`
- `docs/superpowers/specs/2026-09-06-decode-10-case-actual-test-protocol-v1.md` — expected SHA-256 `134ac472f28c3a8f400fc16a501013c70614c2870e4b0ef82e7abbbbab0a2484`

Reconcile `DECISIONS`, `CURRENT_STATUS`, publication inventory/checker and this handoff. Preserve D014 from open PR #5 and use D015+ for the 2026-09-06 authority decisions. Do not overwrite, merge, or re-purpose PR #5. Its latest externally verified state remains OPEN / NOT MERGED at head `e3d37e42c129498ddbdf7810ce6dfecf61d9e8f5`.

Run the repository publication checks and inspect the whole M0 diff. Record exact commit SHA and content hashes. Mismatch => `STOP_AND_REPORT`. After reviewed M0 merge, the new main becomes `APPROVED_IMPLEMENTATION_BASE_SHA` for PR-A.

Only after the M0 receipt is exact may Engineering start PLAN 1A PR-A Canonical Foundation using TDD. Material unresolved decisions must return through the Mandatory Decision Interview Gate. No automatic merge. ACTUAL TEST remains NOT YET TESTED.

## Historical 003-A-1 development request

Implement the annotation schema, tools, and test infrastructure required to execute **③-A-1 10-Case Schema Stress Test**. If actual consented VOD or independent expert data is unavailable, label all synthetic/mock-input testing **SIMULATED** and retain **ACTUAL TEST: NOT YET TESTED**. Never report simulated schema-test success as actual stress-test success.

This file is the development queue, not an implementation-complete claim. U-PUBLIC-2026-09-02 authorizes publishing the operating foundation and merging it into public main, not running the queued experiment or building the annotation app. Before implementation, review the versioned design and unresolved candidate choices. Apply [Development Rules](../docs/DEVELOPMENT_RULES.md), [Documentation Rules](../docs/DOCUMENTATION_RULES.md), [Graphics Rules](../docs/GRAPHICS_RULES.md) and [Publication Policy](../docs/PUBLICATION_POLICY.md). [Rules Review](../docs/RULES_REVIEW.md) is historical policy-text evidence, not product validation.

Internal developer/model evaluation must be labeled SELF-BENCHMARK with data origin disclosed separately. Synthetic inputs remain SIMULATED even within a SELF-BENCHMARK; neither category establishes ACTUAL TEST success. Unexecuted checks remain NOT YET TESTED.

## LOCKED

- DECODE Coach Copilot MVP v0.1; Decision Case Dataset philosophy; `1 Case = 1 Primary Decision`.
- Fight Selection; Post-contact Decision; Tradeability & Spacing.
- Clear 6 + ambiguous 4, primary-family distribution 4/3/3, including good decisions.
- Independent expert-first labels before AI comparison; preserve uncertainty, alternatives, provenance and timing.
- ③-A-1 ACTUAL TEST is NOT YET TESTED.

## LOCK CANDIDATE

Eight expert fields; Core/Extended context; twelve seed principles; GO/STOP thresholds. Use versioned candidate schemas, surface unresolved choices, and request Product approval before promoting them. See [dataset contract](../docs/DECISION_DATASET_SPEC.md) and [protocol](../docs/EXPERIMENT_PROTOCOL.md).

## Acceptance criteria for the future implementation

1. Versioned machine-readable annotation schema with validation and explicit source type, consent, unknowns, alternatives and separate evidence mode/execution status.
2. Minimal operator/expert tool: eight candidate expert fields, conditional context/uncertainty, blind label capture, auto timing, save/resume, import/export and preserved independent reviews. Do not create a full coaching product in this step.
3. Ten clearly marked synthetic fixtures matching the six/four selection design for software testing only; fixtures must have no fake VOD links, consent, expert identities or measured timings presented as real.
4. Automated valid/invalid/missing-context/multiple-valid tests, enum/version checks, invalid timing/source/consent checks, and rejection of synthetic-origin ACTUAL TEST claims. Test blindness and export provenance.
5. Reproducible test commands, raw failure evidence kept outside conversational context, concise results, and no silent zeros for missing metrics. Run scripts only under the authority of the implementation request, never as part of environment sensing.
6. Update the reverse handoff, current status and experiment log with accurate labels, commands, limits, and a unified diff or precise SEARCH/REPLACE output.

## Constraints and blockers

Use existing stack/policies; parse package.json/requirements.txt/docker-compose.yml as data only during initialization. No destructive commands, additional repository without explicit approval, OAuth connection, paid service, broad permission, raw VOD publication, or 50/150-case expansion. Preserve existing untracked code. Public [DECODE main](https://github.com/edward321416-maker/DECODE/tree/main) is the canonical policy source; use the merged revision recorded in [publication evidence](../docs/MAIN_PUBLICATION.md). Consented data, experts and Google bindings remain unresolved; do not invent them. Report blocked external work separately from locally completed work.

Return under every heading in [CODEX_TO_CHATGPT](CODEX_TO_CHATGPT.md). Product makes the next GO/REVISE/STOP decision from evidence, not the number of files created.

# DECODE Current Status

Snapshot: 2026-09-07 | Phase: Team OS Stage 1/2/3 + post-merge audit correction, D023, and D024 all merged and complete; this revision is the final pre-PR-A gate correction; PR-A implementation NOT STARTED; PR #5 remains OPEN / NOT MERGED

## Current Team OS status (2026-09-07, final pre-PR-A gate correction)

- Team OS Stage 1/2/3 implementation and the Stage 3 post-merge audit correction = DONE, merged via PR #8, PR #9, PR #10, and PR #11 respectively.
- D023 (LOCKED EVIDENCE CONTRACT) = LOCKED, merged via PR #12: DECODE's canonical three-dimension evidence contract (Evaluation purpose/mode, Data origin, Execution status); `MODEL_BAKE_OFF` only as SELF-BENCHMARK subtype metadata; no `MIXED` Data origin; the separate `ActualTestStatus` axis removed.
- D024 (LOCKED EVIDENCE CONTRACT) = LOCKED, merged via PR #13 at `4bd7149ed2a93ba31de9a17d83ae9844b0af7bc3`: an evidence record may exist with Evaluation purpose/mode=ACTUAL TEST, Data origin=REAL, Execution status=NOT TESTED, representing a planned/registered pre-execution unit — not that the test occurred, passed, or failed — excluded from executed sample size, expert agreement, threshold calculations, and GO/REVISE/STOP evidence, and never authorizing 50/150 expansion. `ActualTestStatus` is not reintroduced. D023 remains fully in force.
- This revision is only the final pre-PR-A gate correction: closes a stale executable handoff (`handoff/CHATGPT_TO_CODEX.md` reconciled to a gate/no-open-engineering-task state), strengthens the D024 exclusion-set semantic check, and adds a deterministic guard preventing the current handoff from silently drifting back to a completed-task-shaped executable request while PR-A remains ungated. It does not reopen D023, D024, or any prior Team OS stage.
- `docs/PUBLICATION_FILES.json` remains version 5 / 51 files; no new file is added by this correction.
- `docs/EXPERIMENT_PROTOCOL.md` remains a concise historical shim, non-executable, pointing to the Q1–Q56 10-Case ACTUAL TEST Protocol v1.0 as sole current execution/design authority (unaffected by D023/D024).
- PR #5 remains OPEN / NOT MERGED / non-canonical candidate, untouched by Team OS work.
- `ACTUAL TEST = NOT YET TESTED` (current state).
- `PR-A = NOT STARTED` (current state). Next action after this correction revision is merged: Product externally verifies the actual new `origin/main` and, if clean, explicitly approves that exact SHA as the PR-A base under D022. No such future SHA is written into this commit in advance.

## 2026-09-07 D024 ACTUAL TEST pre-execution record reconciliation (historical, prior to final gate correction)

- Team OS Stage 1/2/3 implementation and the Stage 3 post-merge audit correction = DONE, merged via PR #8, PR #9, PR #10, and PR #11 respectively.
- D023 (LOCKED EVIDENCE CONTRACT) = LOCKED, reconciled and merged via PR #12.
- D024 (LOCKED EVIDENCE CONTRACT) was selected by Product via a decision interview under D017 (Option A — ALLOW) and this section described its reconciliation. This section is HISTORICAL; see the current section above, which now also reflects the final pre-PR-A gate correction. Merged via PR #13 at `4bd7149ed2a93ba31de9a17d83ae9844b0af7bc3`.
- PR #5 remains OPEN / NOT MERGED / non-canonical candidate, untouched by Team OS work.
- `ACTUAL TEST = NOT YET TESTED`. `PR-A = NOT STARTED`.

## 2026-09-07 D023 evidence-contract reconciliation (historical, prior to D024)

- Team OS Stage 1/2/3 implementation and the Stage 3 post-merge audit correction = DONE, merged via PR #8, PR #9, PR #10, and PR #11 respectively.
- D023 (LOCKED EVIDENCE CONTRACT) was selected by Product via a decision interview under D017 (Option C) and amended PLAN 1A Canonical Foundation's Section 3 provenance contract: `MODEL_BAKE_OFF` no longer a top-level Evaluation purpose/mode; `MIXED` no longer a canonical Data origin; the separate `ActualTestStatus` axis removed. This section is HISTORICAL; see the current section above, which now also reflects D024. Merged via PR #12 at `5b4676af4859ab505d9a524100676f02647445df`.
- PR #5 remains OPEN / NOT MERGED / non-canonical candidate, untouched by Team OS work.
- `ACTUAL TEST = NOT YET TESTED`. `PR-A = NOT STARTED`.

## 2026-09-07 Team OS Stage 3 post-merge audit correction (historical, prior to D023)

- Team OS Stage 1 (inert scaffold) = DONE, merged via PR #8 at `5c09f6f7108c94fd840797b434f34286da30d8b6`.
- Team OS Stage 2 (policy/router activation) = DONE, merged via PR #9 at `f22cceedf369d4b0b2419314f824e12f7563526c`.
- Team OS Stage 3 (semantic checker hardening) implementation = DONE, merged via PR #10 at `0c30bdb3763d493befe778558b267cd672761792`.
- This section described a post-merge audit correction of Stage 3's mechanical enforcement (phase-anchored current-state checks, destructive-reset/force-push separation, read-flow completeness, router-copy detection, broader stale-PR-wording detection, scoped D022 future-base protection, strengthened protocol-authority check), merged via PR #11 at `6ae646a2e961125d957768f7828e11f13b771a32`. This section is HISTORICAL; see the current section above for the present state, which now also reflects D023.
- PR #5 remains OPEN / NOT MERGED / non-canonical candidate, untouched by Team OS work.
- `ACTUAL TEST = NOT YET TESTED`. `PR-A = NOT STARTED`.

## 2026-09-07 Team OS Stage 3 — semantic checker hardening (historical, prior to post-merge audit correction)

- Team OS Stage 2 (policy/router activation) merged via PR #9 at `f22cceedf369d4b0b2419314f824e12f7563526c`.
- This revision (Stage 3) makes `scripts/check-operating-docs.mjs` mechanically detect semantic drift in the ACTIVE Team OS contract: Project Operating Manual status/authority/precedence/evidence-model; Collaboration Rules C1–C11 presence/order and key clauses; `AGENTS.md`/`CLAUDE.md` router parity and ChatGPT-prompt separation; all 10 active templates' status and required field sets; a scoped stale-executable-instruction scan across currently-read instruction sources (including `handoff/CHATGPT_TO_CODEX.md` itself); the retired `docs/EXPERIMENT_PROTOCOL.md`'s concise historical shape; D021/D022 anchored semantic checks; and evidence/status boundaries (`UNKNOWN/null ≠ zero`, `ACTUAL TEST = NOT YET TESTED`, `PR-A = NOT STARTED`).
- Implemented as a pure, exported `collectTeamOsSemanticChecks(texts)` function (`loadCanonicalTexts` is the deterministic, shared file-loader it consumes — that loader itself performs filesystem I/O and is not pure) shared by the CLI and by `scripts/check-operating-docs.semantic.test.mjs` (21 RED mutation scenarios + 4 positive/control cases, all passing at merge). Stage 3 validates repository text/contracts only — it does not prove Codex/Claude Code/human obedience, runtime/application/model behavior, or ACTUAL TEST success.
- This section is HISTORICAL: it described the not-yet-merged state at authoring time. Team OS Stage 3 has since merged via PR #10; see the current section above for the present state. Historical `ACTUAL TEST: NOT YET TESTED` and `PR-A: NOT STARTED` occurrences below and elsewhere in this document describe that point in time, not necessarily the current snapshot.
- `docs/PUBLICATION_FILES.json` → version 5 (adds the Stage 3 plan and the semantic test script; 51 files).
- PR #5 remains OPEN / NOT MERGED / non-canonical candidate, untouched by Team OS work.
- D022's PR-A base gate is unchanged by Stage 3: the replacement PR-A base is the exact actual `origin/main` HEAD after this Stage 3 revision merges, externally verified and explicitly Product-approved before PR-A branch creation. No such SHA is written into repository content in advance.

## 2026-09-06 Team OS Stage 1 + Stage 2 (historical, prior to Stage 3)

- Team OS Stage 1 (inert DRAFT scaffold: `docs/PROJECT_OPERATING_MANUAL.md`, `docs/COLLABORATION_RULES.md`, `docs/templates/`) merged via PR #8 at `5c09f6f7108c94fd840797b434f34286da30d8b6`.
- Stage 2 (this revision) activates Team OS: `docs/PROJECT_OPERATING_MANUAL.md` and `docs/COLLABORATION_RULES.md` (C1–C11) move to ACTIVE OPERATING POLICY under D021; `docs/templates/` move to ACTIVE TEMPLATE; `CLAUDE.md` is created and `AGENTS.md` reconciled as thin tool-specific routers into the manual; `docs/DEVELOPMENT_RULES.md`, `docs/DOCUMENTATION_RULES.md`, `docs/AI_OPERATING_POLICY.md`, `docs/PUBLICATION_POLICY.md`, `README.md`, `docs/PROJECT_BRIEF.md`, `docs/PRODUCT_SPEC.md`, `docs/DECISION_DATASET_SPEC.md`, `data/schemas/README.md`, and both `.github/system_prompts/*` files are reconciled for tool-neutral Engineering and C1–C11-consistent integration method; `docs/EXPERIMENT_PROTOCOL.md` is retired to a historical candidate summary superseded for execution under D018, with the Q1–Q56 10-Case ACTUAL TEST Protocol v1.0 as sole current execution authority.
- If this revision is being read from merged canonical main, Stage 2 is complete and Stage 3 (semantic checker hardening) is next. This revision itself, while in review, is Stage 2 not-yet-merged.
- This Stage 2 revision carries `docs/PUBLICATION_FILES.json` version 4 (adds `CLAUDE.md`; 49 files). Once this revision is reviewed and merged, version 4 becomes the canonical inventory on main, superseding the version-2-canonical wording below (kept as historical, prior to Team OS).
- PR #5 remains OPEN / NOT MERGED / non-canonical candidate, untouched by Team OS work.
- D020's `M0_AUTHORITY_MERGE_SHA`-derived receipt main SHA `44fc42861e6b73d848f2f50b1d8f19991d1d5a12` remains valid historical M0 receipt evidence; D022 supersedes it only as the eventual PR-A start base. No replacement PR-A SHA exists yet — the final PR-A base is selected only after Stage 3 completes, externally verified and explicitly Product-approved before PR-A branch creation.
- `ACTUAL TEST = NOT YET TESTED`. `PR-A = NOT STARTED`.

## 2026-09-06 M0 authority merge + post-merge receipt (historical, prior to Team OS)

- `M0_AUTHORITY_MERGE_SHA = 94252efe862d01c6441d6b0ed10fde589870b562` (merge of PR #6, `m0/authority-materialization-2026-09-06` into main). This supersedes the earlier `e8e835718a9f95f02ce81682da2092db81249816` preparation-source entry.
- Integrated Spec v1.0, PLAN 1A Canonical Foundation, and 10-Case ACTUAL TEST Protocol v1.0 (Q1-Q56) are merged to main at `M0_AUTHORITY_MERGE_SHA` and independently re-verified post-merge by exact Git blob ID and SHA-256 of Git object bytes (not working-tree bytes):
  - Integrated Spec — blob `f7571338e93a408a8aeef93d63275d7076e76f80`, SHA-256 `bfad20123a4f4263d111fc50924a04e15d8e76fdccccb666f159eea0978009ae`
  - PLAN 1A Canonical Foundation — blob `10aa423531f83a044ded273cde603a04e33c03d0`, SHA-256 `ff9b083a355d9228dcb37e4514c493e36d6090a20d2dcb1c96fc8eb83f8a6af7`
  - 10-Case ACTUAL TEST Protocol v1.0 — blob `4d7788bb39d68c5cd147408a85954cd5a0e7b8f0`, SHA-256 `11b42a0be56cc761a55929d642c9a5ad1d65d5a0f21d46fdf158f46b23dc2ef0`
  - All three match the Product-approved expected values exactly; M0 authority materialization is complete.
- Publication checker re-run against merged main (`node scripts/check-operating-docs.mjs --tracked`): PASS, 0 failures. This is documentation/contract evidence only, not compile/typecheck/software/ACTUAL TEST evidence.
- GitHub PR #5 remains a separate, non-canonical candidate branch, currently OPEN / NOT MERGED, and must not be modified, merged, or closed by M0/PR-A work.
- M0 publication inventory version 2 is canonical on main. PR #5's branch-local version 2 remains a non-canonical candidate and must not be merged in its current form. Any future reuse requires rebase onto post-M0 main, review of inventory/checker semantics, and adjustment to the next appropriate inventory version. This is not PR #5 merge authorization.
- ACTUAL TEST: NOT YET TESTED. No 50/150 expansion is authorized.
- `APPROVED_IMPLEMENTATION_BASE_SHA` = the actual `origin/main` HEAD produced by the reviewed merge of this receipt PR (PR #7). Immediately after that merge, `origin/main` is fetched and the resulting HEAD SHA is verified and recorded in the merge receipt/report as the exact value — no further repository-file commit writes that literal SHA, since a follow-up commit would move main HEAD again and create an infinite receipt loop. PR-A remains NOT STARTED and must branch from that exact verified HEAD; immediately before PR-A starts, `git rev-parse origin/main` is re-checked against the approved receipt SHA, and any mismatch is STOP_AND_REPORT.
- Google `AI_Execution_Log` binding remains NOT CONFIGURED; this M0 post-merge receipt event is recorded only in the local pending log (deduplicated by `event_id`), not written to Google.

## LOCKED

- DECODE Coach Copilot MVP v0.1.
- Decision Case Dataset philosophy: evidence and context before judgment; `1 Case = 1 Primary Decision`; decision quality is separate from outcome/causality.
- Exactly three initial decision families: Fight Selection; Post-contact Decision; Tradeability & Spacing.
- ③-A-1 selection design: six clear and four deliberately ambiguous moments, with 4/3/3 primary-family allocation. Include positive judgments. Expert-first blind labels; do not expose AI suggestions before independent labels are locked.

## LOCK CANDIDATE

- Eight expert fields and their enum/conditional-field design.
- Core/Extended context split.
- Twelve seed principles and their definitions.
- GO/STOP thresholds, metric aggregation rules, and escalation rubric.

These are testable proposals, not approved performance claims. Definitions are in [DECISION_DATASET_SPEC](DECISION_DATASET_SPEC.md); GO/STOP threshold and execution authority is the current [10-Case ACTUAL TEST Protocol v1.0](superpowers/specs/2026-09-06-decode-10-case-actual-test-protocol-v1.md) (Q1–Q56) — [EXPERIMENT_PROTOCOL](EXPERIMENT_PROTOCOL.md) is a historical candidate summary, superseded for execution.

## Evidence status

| Category | Current state | Limit |
| --- | --- | --- |
| IMPLEMENTED | Public repository and 33-file operating foundation merged through PR #2 | Verified merge receipt and check scope: [Publication evidence](MAIN_PUBLICATION.md); no annotation application |
| ACTUAL TEST | NOT YET TESTED | No consented VOD/expert session was supplied or run for ③-A-1 |
| SELF-BENCHMARK | Policy-text review and publication integrity checks only | [Current publication checks](MAIN_PUBLICATION.md); earlier [Rules Review](RULES_REVIEW.md) is historical; not model or coach evaluation |
| SIMULATED | Document-only checker fixtures executed; decision-data run NOT TESTED | Generated mutations tested the publication checker only; no synthetic decision records, VOD or expert results |
| FAILED | No claim of a failed stress test | Missing prerequisites are blockers, not test outcomes |
| NOT TESTED | Annotation infrastructure, expert timing/agreement, context sufficiency, principle coverage, coaching benefit, rule obedience and runtime/accessibility compliance | No new measured values available |

## Adopted operating rules

[Project Operating Manual](PROJECT_OPERATING_MANUAL.md) (v1.0, ACTIVE) is the canonical task router. [Collaboration Rules](COLLABORATION_RULES.md) (C1–C11, v1.0, ACTIVE) governs integration method. [Development Rules](DEVELOPMENT_RULES.md) (v0.3), [Documentation Rules](DOCUMENTATION_RULES.md) (v0.3) and [Graphics Rules](GRAPHICS_RULES.md) (v0.2) apply to approved work, reconciled for Team OS under D021. U-PUBLIC-2026-09-02 authorizes this operating foundation's publication and integration to main under [Publication Policy](PUBLICATION_POLICY.md) (v1.1). Earlier rules/setup checks remain historical, not fresh certification. No annotation implementation, graphic production, manifest script or package installation is included.

## Operational bindings

- ChatGPT Project: DECODE planning headquarters. Earlier setup verified project creation and then-current policy persistence; planning-chat membership remains unresolved and was not rechecked during publication. Public prompt-file updates do not update saved project instructions. No transcript/policy synchronization is claimed.
- Engineering: AI/Engineering Lead role, fillable by Codex, Claude Code, or a human developer under [Collaboration Rules](COLLABORATION_RULES.md), in the verified existing local DECODE checkout. Private task/project/chat bindings and local paths are excluded from the public repository.
- GitHub: [public edward321416-maker/DECODE](https://github.com/edward321416-maker/DECODE), repository ID 1354606878, with main as default and canonical branch. Foundation PR #2 merged at 2026-09-02T10:44:59Z; see [Publication evidence](MAIN_PUBLICATION.md) for exact commits and check receipts. Other branch proposals are not canonical until merged.
- Google `AI_Execution_Log` spreadsheet ID, range binding, and schema-cache Drive folder ID: NOT CONFIGURED. No repository policy or designated execution log was found before setup. No matching credential/binding environment variable names were present in the current process; credential stores were not searched.
- Prompt files are project policies, not modifications to a provider's system layer or global account settings. Google integration is a written protocol, not a deployed logger.

## Stack metadata — parsed, never executed

Source: root `package.json`, parsed during repository setup and rechecked for publication; unchanged SHA-256 `8BC48D8C7161F8D90BB9D23067DF6CE2A1D5AD2D1B859618D7CE4B2C38B00764`.

| Manifest field | Declared value |
| --- | --- |
| Package | `decode-beta-mvp` 0.1.0; npm private=true (package publishing flag, not GitHub visibility) |
| Next.js | `^16.3.2` |
| React / React DOM | `^19.2.4` / `^19.2.4` |
| TypeScript | `^5.9.3` |
| Tailwind / PostCSS plugin | `^4.1.18` / `^4.1.18` |
| Framer Motion / Lucide | `^13.1.1` / `^0.577.0` |
| Type declarations | Node `^24.5.2`, React `^19.2.10`, React DOM `^19.2.3` |
| Script names only | `dev`, `build`, `start`, `typecheck` — NOT EXECUTED |
| engines / packageManager | Not declared |
| package-lock.json | Present; not altered |
| requirements.txt / docker-compose.yml | Not found in inspected project files |

This is metadata for the excluded local legacy demo, not a runnable stack included in the public foundation. Versions are declared ranges, not installed-version or compatibility verification. No package installation, manifest script, Docker service, application build, or Runtime was started. FastAPI/PostgreSQL/FFmpeg discussed in planning are not installed-stack findings.

## Next gate

1. M0 authority materialization and post-merge receipt. — DONE (PR #6, PR #7; see historical section above).
2. Team OS Stage 1 (inert scaffold). — DONE, merged via PR #8 at `5c09f6f7108c94fd840797b434f34286da30d8b6`.
3. Team OS Stage 2 (policy/router activation and reconciliation). — DONE, merged via PR #9 at `f22cceedf369d4b0b2419314f824e12f7563526c`.
4. Team OS Stage 3 (semantic checker hardening). — This revision; not yet merged. Product independently audits the merged code/contracts after merge.
5. Only after Stage 1/2/3 all complete does PR-A Canonical Foundation TDD begin, from the exact actual `origin/main` HEAD at that time, externally verified and explicitly Product-approved before PR-A branch creation (D022). PR-A = NOT STARTED.
6. Product/Research may prepare the 10-Case ACTUAL TEST one gate ahead, but actual-mode execution remains blocked until the protocol/rights/software prerequisites are implemented and verified.

Google bindings remain unresolved. No ACTUAL TEST or 50/150 expansion is authorized by Team OS activation.

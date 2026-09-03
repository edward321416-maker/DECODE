# DECODE Current Status

Snapshot: 2026-09-03 | Owner: AI/Engineering Lead
Phase: 003-A-1 infrastructure implemented on codex/annotation-infrastructure; Product review required, NOT MERGED.
Canonical baseline: public main e8e835718a9f95f02ce81682da2092db81249816. Issue: [#4](https://github.com/edward321416-maker/DECODE/issues/4). Review: [PR #5](https://github.com/edward321416-maker/DECODE/pull/5), OPEN against main, NOT MERGED.

## LOCKED

- DECODE Coach Copilot MVP v0.1.
- Decision Case Dataset philosophy; 1 Case = 1 Primary Decision; quality is distinct from outcome/causality.
- Fight Selection, Post-contact Decision, Tradeability & Spacing.
- Clear 6 + ambiguous 4 and primary-family 4/3/3, including positive judgment.
- Expert blind labels before AI proposals; uncertainty is a normal label.

## LOCK CANDIDATE

Eight expert fields, Core/Extended context, twelve seed principles and GO/REVISE/STOP thresholds remain candidates. [Dataset](DECISION_DATASET_SPEC.md), [protocol](EXPERIMENT_PROTOCOL.md) and [implementation choices](ANNOTATION_IMPLEMENTATION.md). No Product lock/promotion is inferred from code or software checks.

## Evidence status

| Category | Current state | Limit |
| --- | --- | --- |
| IMPLEMENTED | Versioned schema, local operator/reviewer tool, independent review gate, timing, durable save/resume, imports/exports and provenance | Scoped candidate infrastructure, not full Coach Copilot; not yet merged |
| ACTUAL TEST | NOT YET TESTED | No real consented VALORANT VOD or independent expert session |
| SELF-BENCHMARK | Executed internal schema/workspace/HTTP/browser validation | Commands and exact counts/hashes in [result log](../experiments/experiment_log.csv); not human annotation measurements |
| SIMULATED | Ten fixtures, clear 6 / ambiguous 4, family 4 / 3 / 3; separate invented label examples | Not expert ground truth or an actual stress-test run |
| FAILED | Expected test-first failures and discovered implementation defects were corrected and rerun | See [review](ANNOTATION_IMPLEMENTATION.md); no failed real stress test is claimed |
| NOT TESTED | Actual annotation time, expert agreement, context sufficiency, principle coverage, coaching effectiveness | Also full security/accessibility conformance, other platforms and Google sync |

## Authority and operational bindings

D014 / U-INFRA-2026-09-02 approves this implementation and main-targeted PR, not merge. Product/Business Lead must review before merge. D013 keeps public main canonical; branch work is not canonical until merged. Earlier foundation evidence is retained in [MAIN_PUBLICATION](MAIN_PUBLICATION.md).

ChatGPT Project remains planning HQ, planning chat Product/Business Lead and Codex AI/Engineering Lead. Earlier planning-chat membership and saved instruction refresh remain unresolved and were not reverified here; no live transcript synchronization is claimed. Private app/task/source bindings remain outside public Git.

Public repository [edward321416-maker/DECODE](https://github.com/edward321416-maker/DECODE) and default main were reverified. Legacy untracked app files are excluded and preserved. Google AI_Execution_Log / Drive bindings and approved authentication are still NOT CONFIGURED / NOT VERIFIED. Sanitized pending rows are SYNC BLOCKED, not Google receipts.

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

This is metadata for the excluded local legacy demo, not a runnable stack included in the public foundation. Versions are declared ranges, not installed-version or compatibility verification. During initial sensing, no package installation, manifest script, Docker service, application build or Runtime was started. Later approved infrastructure execution is documented separately below. FastAPI/PostgreSQL/FFmpeg discussed in planning are not installed-stack findings.



## Approved infrastructure stack and actual execution

Separate annotation package: Node.js 24.14.0, Ajv 8.20.0, Playwright Test 1.62.1 and installed Chrome 152.0.7977.75 on Windows. Dependency acquisition was confined to annotation with lifecycle scripts disabled, after sensing and under implementation approval. No new account, OAuth, paid service, permissions or external media integration. Loopback server/browser tests were actually run; root legacy scripts remain NOT EXECUTED.

[Operator guide](../annotation/README.md) provides exact install/start/test commands and recovery limits. [Experiment log](../experiments/experiment_log.csv) links the executed sanitized SELF-BENCHMARK artifact. Real metrics remain null.

## Next decision

Review the scoped PR, provisional schema/nullability/timing/limits and representative native form. Approve merge only after Product review. Before actual data ingestion, approve consent/use, storage/access/retention/withdrawal, independent expert arrangement and the measurement/adjudication protocol. Actual execution mode is deliberately not enabled in this candidate. No 50/150 expansion, aggregate success gate or full Coach Copilot is authorized.

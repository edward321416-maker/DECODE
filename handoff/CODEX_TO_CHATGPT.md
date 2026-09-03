# Codex → ChatGPT

Report ID: DECODE-INFRA-2026-09-03 | Owner: AI/Engineering Lead
Scope: candidate 003-A-1 infrastructure | Branch: codex/annotation-infrastructure
Baseline: public main e8e835718a9f95f02ce81682da2092db81249816
Prior report: [publication snapshot](DECODE-PUBLICATION-2026-09-02.md).

## IMPLEMENTED

Versioned 0.1.0-candidate JSON Schema and semantic validation; minimal local operator/reviewer tool with eight fields, Core/Extended context, uncertainty/alternatives, fixed independent-review gate, monotonic timing, save/resume, immutable submissions, import/export and preserved provenance. [Guide](../annotation/README.md), [design/review](../docs/ANNOTATION_IMPLEMENTATION.md). D014 approves implementation and PR only. Product review is required before merge; no candidate promotion.

## ACTUAL TEST

NOT YET TESTED. No real consented VALORANT VOD or independent expert session was supplied or run. Current execution/export mode rejects ACTUAL TEST, including synthetic-origin promotion. No stress-test success is claimed.

## SELF-BENCHMARK

Executed run [annotation-self-2026-09-03t01-57-43-899z](../experiments/results/SELF_BENCHMARK/annotation-self-2026-09-03t01-57-43-899z.json): 36/36 Node tests, 8/8 actual browser tests (desktop 1280×900 and narrow 320×740), and 14/14 module syntax checks passed with zero final failures/skips/flaky results. Node 24.14.0, Chrome 152.0.7977.75; Ajv 8.20.0, Playwright Test 1.62.1. Commands, source/test/input/output hashes and null actual measurements are in that artifact. Reproduce with `node annotation/scripts/verify.mjs`. The CLI entrypoint was also started and its local route/banner verified, then stopped.

Controlled clocks verify pause/interruption semantics; these are not expert annotation durations. Browser execution confirms UI behavior, not expert usability, human independence or full accessibility/security conformance. Publication checks are separate operational validation, not extra experiment cases.

## SIMULATED

Exactly ten invented fixtures: clear 6 / ambiguous 4; Fight Selection 4 / Post-contact Decision 3 / Tradeability & Spacing 3. Separate illustrative labels include positive and uncertain judgments. Every source is SIMULATED; no real VOD/consent/player/expert/timing provenance was invented. Fixtures are software inputs, never gold training/evaluation labels.

## FAILED

Initial test-first stubs failed as expected. Real-clock timestamp mismatch, select labeling, narrow 200% heading overflow, missing alternative constraints, transferable-state quota and overlapping timers were found and fixed, then rerun. No required final software test remains failing. No failed ACTUAL TEST is implied. Google logging is SYNC BLOCKED by missing bindings/authentication; no cloud write is claimed.

## NOT TESTED

Real annotation time, expert agreement, context sufficiency, principle coverage, coaching effectiveness; real-mode session/adjudication/aggregate reporting; Linux/macOS or other browser engines; hosted deployment, encryption, disk-failure recovery, penetration testing, full WCAG/screen-reader compliance; model/prompt behavior, token savings, Google sync and planning-chat membership refresh. No root legacy scripts were executed.

## FILES CHANGED

The scoped main-targeted PR unified diff is the change report; PR creation is pending at this checkpoint. [PUBLICATION_FILES.json](../docs/PUBLICATION_FILES.json) defines the public tree. No raw trace/store/access code/export, legacy app or root package is included. Historical reverse handoff is retained. All subsequent change reports remain unified diffs.

## RECOMMENDED NEXT DECISION

Product/Business Lead reviews the PR, candidate schema/timing/nullability/limits and one native-form desktop/narrow treatment before deciding merge or revise. DO NOT MERGE automatically. Before actual ingestion/session, approve consent/use, restricted storage/access/retention/withdrawal, independent experts and measurement/adjudication protocol. Current mode remains internal-only; actual-mode enablement requires a separately reviewed change. Do not expand to 50/150 or implement full Coach Copilot.

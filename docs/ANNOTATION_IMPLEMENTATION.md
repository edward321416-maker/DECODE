# 003-A-1 Candidate Infrastructure Design

Version: 0.1.0-candidate | Owner: AI/Engineering Lead | Status: IMPLEMENTED CANDIDATE, PRODUCT REVIEW REQUIRED, NOT MERGED
Authority: U-INFRA-2026-09-02, explicit Product/Business Lead implementation approval
Baseline: public main e8e835718a9f95f02ce81682da2092db81249816 | Tracking: [Issue #4](https://github.com/edward321416-maker/DECODE/issues/4)

## Delivery gate

Implement on codex/annotation-infrastructure and open a main-targeted PR. DO NOT MERGE automatically. Product review is required even if every check passes. This task-specific decision supersedes the earlier publication merge permission; main remains canonical until review/merge. No candidate is promoted.

## Minimal architecture

An isolated annotation/ Node.js package, JSON Schema 2020-12 validated by pinned Ajv, a loopback-only HTTP server and a single native-HTML form. No legacy Next.js app edits, AI suggestions, remote services, media upload, new visual identity or hosted deployment. Browser checks use pinned Playwright with a locally installed browser. Initial sensing parsed the excluded root manifest only; installation, if needed, is confined to this approved new package with lifecycle scripts disabled.

The operator imports a ten-case bundle and chooses two distinct pseudonymous reviewer identifiers plus four second-review cases (two clear/two ambiguous). Both reviewer plans are fixed before labeling. The second reviewer cannot open cases until all ten primary labels are locked. The server returns only the requesting reviewer's case, draft, timing and status; selection metadata and sample labels are never served to experts. This is application isolation, not proof of human independence or protection from a malicious operator/OS administrator.

## Candidate implementation choices, not Product locks

- All six Core keys exist, with explicit value/provenance/note objects; unknown values are null with UNKNOWN provenance. Extended values are optional but retain the same provenance contract. Missing context is valid, not silently filled.
- The eight expert fields keep existing names/enums. Preferred decision and severity may be null for uncertainty; negative verdicts require severity; a non-uncertain judgment requires a preferred decision. Uncertainty needs a reason; INSUFFICIENT_CONTEXT also needs a missing-context note.
- Multiple-valid alternatives are action/reason pairs; MULTIPLE_VALID_OPTIONS requires at least two distinct actions. MULTIPLE_PRINCIPLES uses a marker plus at least two distinct related seed/OTHER identifiers. This storage convention is provisional.
- Drafts may be incomplete; submitted labels undergo strict validation and become immutable. Case source/context cannot be replaced after import. Optimistic revisions prevent stale overwrites; request IDs prevent duplicate actions.
- Timing uses server monotonic active segments with UTC wall timestamps. Explicit pause excludes gaps; save checkpoints elapsed segments; only one active case per reviewer is allowed. Restarted active segments become INCOMPLETE with null total rather than fabricated elapsed time. Continue/lock may preserve incomplete timing but such records are ineligible for timing analysis. No median, P90, agreement, coverage or GO/STOP result is computed.
- Durable state uses append-only, checksum-protected snapshots. Import validates first, applies atomically and never overwrites existing case/review history. Transfer imports require an empty workspace, retain original provenance and issue fresh reviewer access codes.
- Exports contain independent histories, schema/software provenance, snapshot integrity and import lineage; no passwords/access codes. Unkeyed hashes detect accidental corruption, not malicious fabrication.
- Current execution purpose is SELF-BENCHMARK only. Synthetic data remains SIMULATED in cases/exports. ACTUAL TEST is rejected by the current execution/export contract and its project status remains NOT YET TESTED.
- REAL case provenance requires ANNOTATION_RESEARCH use scope, consent and restricted pseudonymous references, but machine validity does not verify consent. Before real ingestion, the operator must approve storage/access/retention/withdrawal arrangements and the candidate protocol. VOD viewing stays in the approved external viewer; the tool does not fetch media or signed URLs.

## Work sequence and checks

1. Write failing schema/fixture tests; implement the candidate schema, semantic checks and ten SIMULATED cases with separate synthetic label examples.
2. Write failing service/HTTP tests; implement fixed review plans, isolation, timing, save/resume, durable history and transfer validation.
3. Write failing browser flows; implement one functional form with empty/error/pause/locked states, keyboard labels and small-screen treatment. Present the representative screen for Product review before visual expansion.
4. Execute schema/service/API/browser and publication checks; record failures and reruns. Update handoff/status and only executed internal experiment records; keep external data/private audit files excluded.
5. Open the PR without merging.

## Documentation sources

Checked 2026-09-02: [Ajv schema versions](https://ajv.js.org/json-schema.html) for the 2020-12-specific validator; [Node test runner](https://nodejs.org/docs/latest-v24.x/api/test.html) for dependency-light unit/integration tests; [Playwright configuration](https://playwright.dev/docs/test-configuration) for isolated browser checks. These references inform implementation, not product validation.

## Evidence boundary

ACTUAL TEST: NOT YET TESTED. Real annotation time, expert agreement, context sufficiency, principle coverage and coaching effectiveness remain NOT YET TESTED. Fixture examples are invented software inputs, not expert labels. Local operation is not approved internet deployment, full security/WCAG certification or actual stress-test success.

## Implementation review and observed failures

[Operator/API guide](../annotation/README.md) covers all exported entrypoints, setup, limits and recovery. The public results are linked from [experiment_log.csv](../experiments/experiment_log.csv); raw traces/stores stay private. Schema/workspace/HTTP tests and real browser tests were executed, not inferred from source.

Test-first checks initially failed against stubs. Subsequent checks exposed and corrected real-clock submission/checkpoint timestamp disagreement, missing explicit select-label association, 200% narrow-screen heading overflow, multiple-valid alternatives without two actions, unbounded transferable-state growth and overlapping reviewer timers. Wrong-Host testing was corrected to use a real HTTP socket because native fetch rewrites that header. These are internal development failures, not failed actual stress tests.

| Rule / concern | Verification or explicit boundary |
| --- | --- |
| DEV-01/02/03; DOC-01/04 | Latest public main baseline, scoped branch, preserved legacy files, read policies in requested order, parse-only sensing; explicit isolated dependency install |
| DEV-04/07/08; DOC-03/05 | Candidate schema/semantic tests; null unknowns, 8 fields, 12 seeds, multiple valid choices, origin/consent/clip timing, 10+4 independent assignments |
| DEV-05/06/09/10 | Loopback/Host/Origin/JSON-size/session tests, role isolation, code rotation, no source/label path serving, inert text, conflict/idempotency, interruption/corruption/quota tests, export/re-import |
| GFX-02/05/06/08/12; DEV-11 | One native-form implementation, real desktop/320px browser checks, Korean text and 200% reflow; screenshots for Product review, no visual identity approval implied |
| GFX-07 | Keyboard start and visible focus, semantic labels/status and reflow checked. No full WCAG, screen-reader, contrast-compliance or all-keyboard-path certification |
| GFX-03/04/09/10/11 | No assets, charts, generated gameplay, remote media, motion or audio introduced; media-specific checks not applicable to this form |
| DEV-12; DOC-06/07/08/09/10 | Scoped diff, linked status/handoff, sanitized result/log contracts and pending Google events. No automated merge, model/token benchmark or cloud-sync claim |

Known limits: no hosted deployment, encryption, malicious-local-admin protection, verified human identity/independence, real VOD player, adjudication editor, difficulty form or aggregate metrics. JSON source editing is intentionally minimal. Snapshot/request/history caps, OS-sleep timing caveats and recovery steps require Product/operator review before a real session. A passed internal suite means candidate infrastructure behavior was exercised; it is not approval for an ACTUAL TEST.

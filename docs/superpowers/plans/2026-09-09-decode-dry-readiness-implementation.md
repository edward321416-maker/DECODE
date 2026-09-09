# DECODE DRY Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the D025–D037 synthetic-only DRY Readiness harness as a separate TypeScript/Node `readiness/` package that rehearses the locked 10-Case ACTUAL TEST Protocol mechanics without any REAL data or ACTUAL TEST execution.

**Architecture:** `readiness/` is a new package above, and dependent on, the existing Foundation source through one readiness-local ESM bridge that re-exports `../../foundation/src/index.js`; `foundation/` is not modified. The package separates fixture admission, frozen protocol mechanics, operational rehearsals, foundation integration, gate execution, run aggregation/staleness, CLI serialization, and retained sanitized SELF-BENCHMARK artifacts. Every mandatory gate is independently testable; the runner aggregates all gate results and maps them to the canonical D037 `ExecutionStatus` separately from `readiness_verdict`.

**Tech Stack:** Node.js `>=24 <27`, TypeScript `5.9.3`, ESM/`NodeNext`, `tsx 4.23.13`, `@types/node 24.5.2`, built-in `node:test` + `node:assert/strict`, built-in `node:crypto`; no new production dependency and no network-facing runtime.

**Spec:** `docs/superpowers/specs/2026-09-08-decode-dry-readiness-design.md` (D025–D037, canonical via PR #17/#18 receipt).

**Plan status:** DRAFT — USER REVIEW REQUIRED BEFORE IMPLEMENTATION. User authorization on 2026-09-09 covers creation/review of this Implementation Plan only; it does **not** authorize implementation.

## Global Constraints

- Planning baseline: canonical `main` = `07d5789750d206613c0dec058f392be65cb690ab` (PR #18 merge). Verify `origin/main` immediately before implementation. If it differs, STOP_AND_REPORT and reconcile the implementation base before writing code.
- D025: no real VOD, participant PII, actual consent collection, Founder Gold, actual Second Expert session, or any other REAL execution.
- D026: structurally synthetic-only harness; there is no REAL-data entry point.
- D027: PR #5 is read-only reference only. No merge, rebase, cherry-pick, modification, closure, import, or copied code.
- D028: implementation lives in a separate `readiness/` package; no protocol-specific behavior or new exports are added to `foundation/`.
- D029: every mandatory gate must be PASS for `readiness_verdict=DRY_READY`; any mandatory FAIL/UNKNOWN/NOT_EXECUTED means `readiness_verdict=BLOCKED`.
- D030: deterministic properties use automated tests; operational flows use synthetic scenario rehearsal plus checklist assertions.
- D031: CLI + machine-readable JSON only. No UI.
- D032: only sanitized SELF-BENCHMARK artifacts are Git-committable; raw stdout/stderr, traces, temporary workspaces, access-bearing/private evidence remain local.
- D033: every valid completed dry run is immutable history. Never overwrite/delete a valid BLOCKED run to improve appearance. Crashed/truncated output is not a valid run artifact.
- D034: current readiness comes from the latest valid canonical run whose frozen hashes still match; stale => current readiness `BLOCKED / STALE_RUN` without mutating historical verdicts.
- D035: synthetic metric values are non-evidentiary; gate only computation correctness and denominator/null semantics.
- D036: TypeScript/Node readiness core + provider-neutral `LocalTranscriptionPort`; no STT engine/provider/model is locked. External STT is never automatic fallback.
- D037: canonical evidence record remains `EvaluationMode=SELF_BENCHMARK`, `DataOrigin=SIMULATED`; map run state to `ExecutionStatus` exactly: NOT_TESTED before, RUNNING while valid run executes, PASSED + DRY_READY only when all mandatory gates PASS, FAILED + BLOCKED when an executed mandatory gate demonstrates a defect, BLOCKED + BLOCKED when prerequisites/gates are unavailable without demonstrated defect.
- `readiness_verdict` and canonical `ExecutionStatus` are independent fields and must never be collapsed.
- `DRY_READY != ACTUAL TEST READY != ACTUAL TEST GO`; `ACTUAL TEST = NOT YET TESTED` remains true regardless of dry-run result.
- Unknown measured fields remain `null`/UNKNOWN; never coerce unknown to zero.
- Reuse the existing zero-external-test-framework convention from `foundation/`.
- No destructive Git operations, force push, or direct-main implementation. Implementation integration for this plan is `PR_MERGE` with whole-PR review; no merge until explicit user/Product approval.

---

## File Structure Locked by This Plan (C11 implementation choices, not new Product locks)

The following are routine implementation choices within D025–D037. They are reviewable/reversible and do not amend the locked design.

```text
readiness/
  package.json
  package-lock.json
  tsconfig.json
  scripts/run-tests.mjs
  src/
    index.ts
    cli.ts
    domain/contracts.ts
    domain/run-id.ts
    domain/frozen-hashes.ts
    foundation-api.ts
    fixtures/contracts.ts
    fixtures/registry.ts
    protocol/freeze.ts
    protocol/composition.ts
    protocol/reserve.ts
    protocol/second-expert.ts
    protocol/measurement.ts
    protocol/timing.ts
    rehearsal/consent.ts
    rehearsal/source-rights.ts
    rehearsal/second-expert-qualification.ts
    rehearsal/retention.ts
    rehearsal/withdrawal.ts
    ports/local-transcription-port.ts
    gates/gate-catalog.ts
    gates/input-gates.ts
    gates/protocol-gates.ts
    gates/operational-gates.ts
    gates/integration-gates.ts
    gates/metric-gates.ts
    runner/readiness-runner.ts
    runner/current-readiness.ts
    persistence/run-artifact.ts
  fixtures/
    v1/full-ready.json
    v1/no-local-transcription.json
    v1/replacement-unavailable.json
  test/
    package-contract.test.ts
    simulated-input.test.ts
    protocol-selection.test.ts
    measurement-timing.test.ts
    operational-rehearsal.test.ts
    integration-gates.test.ts
    runner-verdict.test.ts
    cli-artifact.test.ts
    end-to-end.test.ts
  results/README.md
```

Additional repository files modified only during the implementation PR:

```text
docs/PUBLICATION_FILES.json
scripts/check-operating-docs.mjs
scripts/check-operating-docs.semantic.test.mjs
handoff/CHATGPT_TO_CODEX.md
handoff/CODEX_TO_CHATGPT.md
experiments/ai_execution_log.pending.csv
```

**C11 linking choice:** do not introduce a root npm workspace, do not use a TypeScript `paths` alias to simulate a sibling package, and do not modify `foundation/package.json`. `readiness/src/foundation-api.ts` is the single coupling point and re-exports the existing Foundation public barrel with `export * from "../../foundation/src/index.js";`. All readiness modules import Foundation contracts through this local bridge. This keeps Node/tsx runtime resolution ordinary and keeps Foundation byte-unchanged.

**C11 LocalTranscription choice:** production/default CLI wiring uses no qualifying local adapter and therefore returns `LOCAL_TRANSCRIPTION_UNAVAILABLE`; port-contract unit tests may inject a test-only synthetic adapter, but that stub is never accepted as satisfying the mandatory `local-transcription-port` readiness gate. No concrete STT provider/model is added anywhere.

---

### Task 1: Package Scaffold and Canonical Readiness Contracts

**Files:**
- Create: `readiness/package.json`
- Create: `readiness/package-lock.json`
- Create: `readiness/tsconfig.json`
- Create: `readiness/scripts/run-tests.mjs`
- Create: `readiness/src/index.ts`
- Create: `readiness/src/domain/contracts.ts`
- Create: `readiness/src/domain/run-id.ts`
- Create: `readiness/src/foundation-api.ts`
- Test: `readiness/test/package-contract.test.ts`

**Interfaces:**
- Consumes: `EvidenceRecord`, `ExecutionStatus`, `validateEvidenceRecord` from the existing Foundation public barrel through `readiness/src/foundation-api.ts`.
- Produces: `GateStatus`, `GateResult`, `ReadinessVerdict`, `ReadinessRun`, `ReadinessRunState`, `generateReadinessRunId()`.

- [ ] **Step 1: Create package metadata and test runner contract**

`readiness/package.json` must be:

```json
{
  "name": "@decode/readiness",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=24 <27" },
  "scripts": {
    "typecheck": "tsc",
    "test": "node scripts/run-tests.mjs",
    "readiness": "tsx src/cli.ts"
  },
  "devDependencies": {
    "@types/node": "24.5.2",
    "tsx": "4.23.13",
    "typescript": "5.9.3"
  }
}
```

`readiness/tsconfig.json` must preserve the Foundation compiler strictness and add only the path alias:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true
  },
  "include": ["src", "test"]
}
```

`readiness/scripts/run-tests.mjs` copies the already-reviewed Foundation test-discovery pattern, changing only `testDir` to the readiness package's own `test/` directory. `readiness/src/foundation-api.ts` contains exactly:

```ts
export * from "../../foundation/src/index.js";
```

No other readiness file imports Foundation by a filesystem-relative path; the bridge is the single dependency seam.

- [ ] **Step 2: Write RED contract tests before domain implementation**

In `readiness/test/package-contract.test.ts`, assert:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  createInitialReadinessRun,
  generateReadinessRunId,
} from "../src/index.js";

 test("run ids are readiness-prefixed and distinct from foundation namespaces", () => {
  const id = generateReadinessRunId();
  assert.match(id, /^readiness_[0-9a-f-]{36}$/);
  assert.equal(id.startsWith("permit_"), false);
  assert.equal(id.startsWith("job_"), false);
  assert.equal(id.startsWith("command_"), false);
});

 test("initial run evidence is SELF_BENCHMARK + SIMULATED + NOT_TESTED", () => {
  const run = createInitialReadinessRun("readiness_00000000-0000-4000-8000-000000000001");
  assert.deepEqual(run.evidence, {
    evaluationMode: "SELF_BENCHMARK",
    dataOrigin: "SIMULATED",
    executionStatus: "NOT_TESTED",
  });
});
```

- [ ] **Step 3: Run RED**

Run:

```bash
cd readiness
npm install --package-lock-only
npm test
```

Expected: test load/compile fails because `src/index.ts` and the exported contract functions do not yet exist. Failure must be from missing implementation, not malformed test syntax.

- [ ] **Step 4: Implement minimal canonical types and run-id generation**

`readiness/src/domain/contracts.ts` starts with:

```ts
import type { EvidenceRecord } from "../foundation-api.js";

export type GateStatus = "PASS" | "FAIL" | "UNKNOWN" | "NOT_EXECUTED";
export type ReadinessVerdict = "DRY_READY" | "BLOCKED";
export type ReadinessRunState = "NOT_STARTED" | "RUNNING" | "COMPLETED";

export interface GateResult {
  gateId: string;
  mandatory: boolean;
  status: GateStatus;
  reasonCodes: string[];
  detail?: string;
}

export interface FrozenHashSet {
  readinessSource: string;
  foundationSource: string;
  protocol: string;
  schema: string;
  fixtureSet: string;
  gateDefinition: string;
}

export interface ReadinessRun {
  runId: string;
  startedAt: string | null;
  completedAt: string | null;
  state: ReadinessRunState;
  gates: GateResult[];
  readinessVerdict: ReadinessVerdict | null;
  evidence: EvidenceRecord;
  frozenHashes: FrozenHashSet | null;
  staleness: { stale: boolean; reasonCodes: string[] };
}
```

`readiness/src/domain/run-id.ts`:

```ts
import { randomUUID } from "node:crypto";
export function generateReadinessRunId(): string {
  return `readiness_${randomUUID()}`;
}
```

`createInitialReadinessRun()` hard-codes only canonical dry evidence: SELF_BENCHMARK/SIMULATED/NOT_TESTED, validates it through `validateEvidenceRecord()`, and exposes no input parameter that could select ACTUAL_TEST or REAL.

- [ ] **Step 5: GREEN + typecheck**

Run:

```bash
cd readiness
npm run typecheck
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add readiness/package.json readiness/package-lock.json readiness/tsconfig.json readiness/scripts/run-tests.mjs readiness/src readiness/test/package-contract.test.ts
git commit -m "feat(readiness): add dry-run package contracts"
```

---

### Task 2: Synthetic Fixture Admission and Frozen Hashes

**Files:**
- Create: `readiness/src/fixtures/contracts.ts`
- Create: `readiness/src/fixtures/registry.ts`
- Create: `readiness/src/domain/frozen-hashes.ts`
- Create: `readiness/fixtures/v1/full-ready.json`
- Create: `readiness/fixtures/v1/no-local-transcription.json`
- Create: `readiness/fixtures/v1/replacement-unavailable.json`
- Test: `readiness/test/simulated-input.test.ts`

**Interfaces:**
- Consumes: canonical `DataOrigin` through Foundation validation only; arbitrary media/filesystem/URL inputs are never accepted.
- Produces: `SyntheticFixtureSet`, `FixtureRegistry`, `loadFixtureSet(fixtureId)`, `computeFrozenHashes(input)`.

- [ ] **Step 1: Write RED structural-boundary tests**

Assert that only exact registry IDs can load, and that a fixture record carrying `dataOrigin: "REAL"` is rejected before any gate runs:

```ts
test("unknown fixture id is rejected instead of inspected heuristically", () => {
  assert.throws(() => loadFixtureSet("/tmp/player.vod"), /UNREGISTERED_FIXTURE/);
  assert.throws(() => loadFixtureSet("https://example.com/vod"), /UNREGISTERED_FIXTURE/);
});

test("REAL origin cannot enter the readiness fixture schema", () => {
  const unsafe = { ...validFixtureRecord(), dataOrigin: "REAL" };
  assert.throws(() => validateSyntheticFixtureRecord(unsafe), /SIMULATED_ONLY/);
});
```

- [ ] **Step 2: Run RED**

```bash
cd readiness
npm test
```

Expected: missing fixture implementation failures.

- [ ] **Step 3: Implement a closed fixture registry**

Registry shape:

```ts
const FIXTURE_REGISTRY = {
  "full-ready-v1": new URL("../../fixtures/v1/full-ready.json", import.meta.url),
  "no-local-transcription-v1": new URL("../../fixtures/v1/no-local-transcription.json", import.meta.url),
  "replacement-unavailable-v1": new URL("../../fixtures/v1/replacement-unavailable.json", import.meta.url),
} as const;

export type FixtureId = keyof typeof FIXTURE_REGISTRY;
```

`loadFixtureSet(input: string)` first checks `input in FIXTURE_REGISTRY`; it never interprets an arbitrary path or URL.

Every fixture root includes:

```json
{
  "fixtureVersion": "1.0.0",
  "evaluationMode": "SELF_BENCHMARK",
  "dataOrigin": "SIMULATED",
  "rehearsal": true
}
```

- [ ] **Step 4: Implement deterministic frozen hashes**

`computeFrozenHashes()` uses SHA-256 over canonical UTF-8 bytes for six named inputs: readiness source manifest, foundation source manifest, protocol document, readiness schema version, fixture-set serialized bytes, and gate catalog serialized bytes. Sort path lists lexicographically before hashing; do not hash filesystem traversal order.

Core helper:

```ts
import { createHash } from "node:crypto";
export function sha256Utf8(value: string): string {
  return createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");
}
```

- [ ] **Step 5: GREEN**

```bash
cd readiness
npm run typecheck
npm test
```

Expected: all package + fixture/hash tests PASS.

- [ ] **Step 6: Commit**

```bash
git add readiness/src/fixtures readiness/src/domain/frozen-hashes.ts readiness/fixtures readiness/test/simulated-input.test.ts
git commit -m "feat(readiness): enforce synthetic fixture boundary"
```

---

### Task 3: Freeze Primitive, Main-10 Composition, Reserve-3, and Second-Expert Subset

**Files:**
- Create: `readiness/src/protocol/freeze.ts`
- Create: `readiness/src/protocol/composition.ts`
- Create: `readiness/src/protocol/reserve.ts`
- Create: `readiness/src/protocol/second-expert.ts`
- Test: `readiness/test/protocol-selection.test.ts`

**Interfaces:**
- Produces: `Freezable<T>`, `validateMain10Composition()`, `allocateReserveStrata()`, `replaceBeforeMeasurementFreeze()`, `selectSecondExpertSubset()`.

- [ ] **Step 1: Write RED tests for all locked selection invariants**

Tests must cover:

```ts
assert.deepEqual(countClarity(main10), { CLEAR: 6, AMBIGUOUS: 4 });
assert.deepEqual(countFamilies(main10), {
  FIGHT_SELECTION: 4,
  POST_CONTACT_DECISION: 3,
  TRADEABILITY_SPACING: 3,
});
```

and:

- clarity cannot change after freeze;
- positive-quality condition is evaluated only after synthetic Gold verdicts exist;
- fewer than two OPTIMAL/ACCEPTABLE returns reason `COMPOSITION_CONDITION_FAILED` without swapping cases;
- reserve allocation = CLEAR top two strata + AMBIGUOUS top one, sorting `main_count DESC`, then canonical `stratum_id ASC`;
- replacement only before measurement freeze and only same clarity + primary family;
- missing same-stratum reserve returns `REPLACEMENT_UNAVAILABLE`;
- no result-driven redraw after measurement freeze;
- Second Expert subset is exactly CLEAR 2 + AMBIGUOUS 2 and same seed + case IDs => identical selection;
- redraw after Gold/AI output/availability/disagreement is rejected.

- [ ] **Step 2: RED**

```bash
cd readiness
npm test
```

Expected: protocol-selection tests fail from missing functions.

- [ ] **Step 3: Implement generic freeze-once primitive**

```ts
export class FrozenValue<T> {
  #value: T;
  #frozen = false;
  constructor(value: T) { this.#value = structuredClone(value); }
  freeze(): void { this.#frozen = true; }
  replace(next: T): void {
    if (this.#frozen) throw new Error("FROZEN_MUTATION");
    this.#value = structuredClone(next);
  }
  read(): T { return structuredClone(this.#value); }
  isFrozen(): boolean { return this.#frozen; }
}
```

Use this primitive for composition, subset, and measurement-contract immutability; do not create three subtly different freeze implementations.

- [ ] **Step 4: Implement exact reserve and subset algorithms**

Second Expert digest input is byte-unambiguous UTF-8 concatenation with a delimiter that cannot occur in the fixed seed encoding:

```ts
const digest = createHash("sha256")
  .update(Buffer.from(`${selectionSeedHex}:${caseId}`, "utf8"))
  .digest("hex");
```

The Protocol text says `SHA-256(selection_seed || case_id)`. To preserve that semantics exactly, the implementation stores `selectionSeedHex` as fixed-length 64 hex chars and case IDs as UTF-8, then hashes `Buffer.concat([Buffer.from(selectionSeedHex, "hex"), Buffer.from(caseId, "utf8")])`; the colon form above may be used only in test diagnostics, not the selection implementation.

- [ ] **Step 5: GREEN**

```bash
cd readiness
npm run typecheck
npm test
```

Expected: exact composition/reserve/subset/freeze tests PASS.

- [ ] **Step 6: Commit**

```bash
git add readiness/src/protocol readiness/test/protocol-selection.test.ts
git commit -m "feat(readiness): add frozen case selection mechanics"
```

---

### Task 4: Measurement Preregistration, Metric Computation, and Timing Contract

**Files:**
- Create: `readiness/src/protocol/measurement.ts`
- Create: `readiness/src/protocol/timing.ts`
- Test: `readiness/test/measurement-timing.test.ts`

**Interfaces:**
- Produces: `MeasurementContract`, `computeMedian()`, `computeNearestRankP90()`, `computeContextInsufficiency()`, `computeTaxonomyEscape()`, `computeDirectionalAgreement()`, `countUnnecessaryFields()`, `ActiveTimer`.

- [ ] **Step 1: RED metric tests with known-correct fixtures**

Use fixed durations `[60, 120, 180, 240, 300, 360, 420, 480, 540, 600]` seconds.

Expected:

```ts
assert.equal(computeMedian(durations), 330);
assert.equal(computeNearestRankP90(durations), 540);
```

Also assert:

- P90 rank = `ceil(0.9*n)` using nearest-rank, not interpolation;
- invalid/incomplete timing is excluded and exclusion reason remains in report;
- context insufficiency numerator = unique completed Founder cases with `INSUFFICIENT_CONTEXT`, denominator = completed valid Founder cases;
- taxonomy escape counts `OTHER` or `NEW_PRINCIPLE_NEEDED` over completed Founder cases;
- directional agreement excludes UNCERTAIN and INSUFFICIENT_CONTEXT and reports planned-pair coverage separately;
- UNKNOWN/null input remains null and is never treated as zero;
- field usefulness counts UNNECESSARY only.

- [ ] **Step 2: RED timing tests**

Drive a deterministic injected clock. Assert manual pause/resume controls active time, while focus/inactivity events increment flags only and never rewrite elapsed active duration.

- [ ] **Step 3: Implement immutable measurement contract**

The locked candidate thresholds are represented as data but never used as automatic GO/STOP logic:

```ts
export const MEASUREMENT_CONTRACT_V1 = Object.freeze({
  medianActiveSecondsCandidateMax: 300,
  p90ActiveSecondsCandidateMax: 480,
  insufficientContextCandidateMaxRatio: 0.20,
  taxonomyEscapeCandidateMaxRatio: 0.20,
  unnecessaryCoreFieldsCandidateMax: 1,
  directionalAgreementCandidateMinRatio: 0.75,
});
```

No function named `shouldGo()` or `shouldStop()` is introduced.

- [ ] **Step 4: Implement timing accumulator with injected clock**

The timer records `manualPauseCount`, `manualPauseDuration`, `interruptionCandidateCount`, `confirmedInterruptionCount`, `confirmedInterruptionDuration`, and reason categories. It rejects negative intervals and overlapping pause transitions.

- [ ] **Step 5: GREEN**

```bash
cd readiness
npm run typecheck
npm test
```

- [ ] **Step 6: Commit**

```bash
git add readiness/src/protocol/measurement.ts readiness/src/protocol/timing.ts readiness/test/measurement-timing.test.ts
git commit -m "feat(readiness): add metric and timing contracts"
```

---

### Task 5: Synthetic Consent, Source-Rights, and Second-Expert Qualification Rehearsals

**Files:**
- Create: `readiness/src/rehearsal/consent.ts`
- Create: `readiness/src/rehearsal/source-rights.ts`
- Create: `readiness/src/rehearsal/second-expert-qualification.ts`
- Test: `readiness/test/operational-rehearsal.test.ts`

**Interfaces:**
- Produces synthetic-only state-machine results with `rehearsal: true`, canonical SELF_BENCHMARK/SIMULATED evidence, and explicit reason codes.

- [ ] **Step 1: RED consent/guardian/assent cases**

Cover:

- adult PARTICIPATE accepted when synthetic checklist passes;
- participant DO_NOT_PARTICIPATE always rejects, even if guardian says consent;
- minor requires participant assent + guardian consent + guardian verification;
- ambiguous expression transitions to PAUSED and cannot process affected next step until explicit CONTINUE/WITHDRAW;
- WITHDRAW always stops future affected processing.

- [ ] **Step 2: RED source-rights cases**

Accepted synthetic source categories only:

```ts
type SyntheticSourceKind = "FOUNDER_OWNED" | "FOUNDER_AUTHORIZED" | "CONSENTED_PILOT";
```

Reject simulated arbitrary public scraping, unconsented Pilot, and any rule that forces a Founder/Pilot ratio.

- [ ] **Step 3: RED qualification cases**

Return exactly `ELIGIBLE | NOT_ELIGIBLE | INSUFFICIENT_EVIDENCE`; Founder recommendation is recorded as input provenance but cannot itself produce ELIGIBLE. Relationship provenance enum is limited to the Protocol's six values.

- [ ] **Step 4: Implement state machines with no REAL actor fields**

No name, email, handle, phone, DOB, address, raw voice, VOD path, or URL field exists in these interfaces. Synthetic actor IDs use fixture-local IDs only.

- [ ] **Step 5: GREEN**

```bash
cd readiness
npm run typecheck
npm test
```

- [ ] **Step 6: Commit**

```bash
git add readiness/src/rehearsal readiness/test/operational-rehearsal.test.ts
git commit -m "feat(readiness): add synthetic operational rehearsals"
```

---

### Task 6: Foundation Policy/Rights Integration, Withdrawal Invalidation, Retention Receipts, and Local Transcription Port

**Files:**
- Create: `readiness/src/rehearsal/withdrawal.ts`
- Create: `readiness/src/rehearsal/retention.ts`
- Create: `readiness/src/ports/local-transcription-port.ts`
- Create: `readiness/src/gates/integration-gates.ts`
- Test: `readiness/test/integration-gates.test.ts`

**Interfaces:**
- Consumes Foundation `ActorVerifier`, `AuthorizationRequest`, `InMemoryPolicyRightsGate`, `InMemoryRightsStore`, `DurableJob`, `AuthorizationDeniedError` and canonical Provenance functions through `readiness/src/foundation-api.ts`, which re-exports the existing Foundation public barrel only.
- Produces protected-action rehearsal results, deletion receipts, withdrawal invalidation result, `LocalTranscriptionPort`.

- [ ] **Step 1: RED Policy/Rights tests**

For each locked `ProtectedAction`:

```ts
[
  "EVIDENCE_INGESTION",
  "EXPERT_VOICE_STORAGE",
  "EXTERNAL_EGRESS",
  "EVALUATION_USE",
  "PLAYER_OUTPUT",
]
```

assert the rehearsal calls `authorize(request)` and then `revalidate(permit.permitId, request)` immediately before the simulated action. Also assert unauthorized actor, changed execution binding, withdrawn rights, expired/revoked permit, and unsatisfied external destination are denied.

- [ ] **Step 2: RED withdrawal + retention tests**

Withdrawal must:

- mark synthetic source WITHDRAWN;
- invalidate future-use eligibility;
- cause revalidation of prior permit to fail;
- invalidate pending synthetic job/cache references;
- preserve only a tombstone `{ referenceId, state, withdrawalAt, deletionCompletedAt, receiptId }`;
- after measurement freeze, adjust/report denominator and limitation without selecting replacement based on observed results.

Retention tests cover raw-founder-audio synthetic 72-hour grace, unused-reserve deletion when replacement window closes, and full-VOD deletion-after-required-reviews as **rehearsal receipts only**.

- [ ] **Step 3: Define provider-neutral local transcription port**

```ts
export interface SyntheticAudioFixture {
  fixtureId: string;
  pcm16le: Uint8Array;
  sampleRateHz: 16000;
}

export interface TranscriptionResult {
  text: string;
  confidence?: number;
}

export interface LocalTranscriptionPort {
  isAvailable(): Promise<boolean>;
  transcribe(input: SyntheticAudioFixture): Promise<TranscriptionResult>;
}
```

No concrete production adapter is created. Tests inject a local test double with deterministic in-memory synthetic PCM; CLI default receives `undefined`/Unavailable and therefore cannot claim the qualifying adapter exists.

- [ ] **Step 4: Implement external-egress default block**

There is no network client. The positive path only rehearses Foundation policy evaluation against a fully synthetically satisfied `EXTERNAL_EGRESS` request; it never sends bytes anywhere. The negative/default path returns gate reason `EXTERNAL_EGRESS_BLOCKED`.

- [ ] **Step 5: GREEN + Foundation regression**

```bash
cd readiness && npm run typecheck && npm test
cd ../foundation && npm run typecheck && npm test
```

Foundation expected baseline at planning time: 82/82 tests PASS. If baseline has legitimately advanced before implementation, compare against the then-current approved baseline; any regression is STOP_AND_REPORT.

- [ ] **Step 6: Commit**

```bash
git add readiness/src/rehearsal/withdrawal.ts readiness/src/rehearsal/retention.ts readiness/src/ports readiness/src/gates/integration-gates.ts readiness/test/integration-gates.test.ts
git commit -m "feat(readiness): integrate policy rights and retention rehearsals"
```

---

### Task 7: Gate Catalog and Independent Gate Implementations

**Files:**
- Create: `readiness/src/gates/gate-catalog.ts`
- Create: `readiness/src/gates/input-gates.ts`
- Create: `readiness/src/gates/protocol-gates.ts`
- Create: `readiness/src/gates/operational-gates.ts`
- Create: `readiness/src/gates/metric-gates.ts`
- Modify: `readiness/src/gates/integration-gates.ts`
- Test: existing task-specific tests plus `readiness/test/runner-verdict.test.ts`

**Interfaces:**
- Produces one `GateDefinition` per Section 13 mandatory gate; later runner consumes only this catalog.

- [ ] **Step 1: RED catalog completeness test**

Define the exact mandatory IDs as code data and test exact equality, not containment:

```ts
export const MANDATORY_GATE_IDS = [
  "simulated-only-input",
  "evidence-anti-promotion",
  "consent-guardian-assent-rehearsal",
  "source-rights-rehearsal",
  "second-expert-qualification-rehearsal",
  "main10-composition-freeze",
  "reserve3-allocation-freeze",
  "reserve-replacement",
  "second-expert-planned-subset",
  "freeze-immutability",
  "measurement-preregistration-freeze",
  "software-schema-protocol-fixture-gate-hashing",
  "timing-pause-interruption-contract",
  "withdrawal-future-use-invalidation",
  "retention-deletion-receipts",
  "foundation-policy-rights-integration",
  "local-transcription-port",
  "external-egress-default-block",
  "canonical-provenance-anti-promotion",
  "metric-computation-contract",
  "stale-run-detection",
  "end-to-end-synthetic-rehearsal"
] as const;
```

Assert catalog IDs are sorted/unique and exactly this set.

- [ ] **Step 2: RED per-gate reason-code tests**

Every gate must produce at least one negative-path reason code specified by the Design Spec; examples include `UNREGISTERED_FIXTURE`, `SIMULATED_ONLY`, `COMPOSITION_CONDITION_FAILED`, `REPLACEMENT_UNAVAILABLE`, `FROZEN_MUTATION`, `LOCAL_TRANSCRIPTION_UNAVAILABLE`, `EXTERNAL_EGRESS_BLOCKED`, `STALE_RUN`.

- [ ] **Step 3: Implement gate adapter layer**

```ts
export interface GateContext {
  fixture: SyntheticFixtureSet;
  frozenHashes: FrozenHashSet;
  localTranscription?: LocalTranscriptionPort;
}

export interface GateDefinition {
  id: MandatoryGateId;
  mandatory: true;
  execute(context: GateContext, priorResults: readonly GateResult[]): Promise<GateResult>;
}
```

Gate files adapt previously tested pure/rehearsal functions; they do not duplicate business logic. `end-to-end-synthetic-rehearsal` is a meta-gate over the accumulated prior gate records for the complete scenario; it **must not call `runReadiness()` recursively**. It passes only when orchestration produced a terminal result record for every preceding mandatory gate in catalog order, and it preserves those gates' PASS/FAIL/UNKNOWN/NOT_EXECUTED states rather than converting them to PASS.

- [ ] **Step 4: Enforce canonical anti-promotion structurally**

`canonical-provenance-anti-promotion` builds only `{evaluationMode:"SELF_BENCHMARK", dataOrigin:"SIMULATED", executionStatus:<run status>}` and passes it to Foundation `validateEvidenceRecord()`. The package contains no string literal assignment that creates `evaluationMode: "ACTUAL_TEST"` or `dataOrigin: "REAL"`; repository checker hardening in Task 11 guards this mechanically.

- [ ] **Step 5: GREEN**

```bash
cd readiness
npm run typecheck
npm test
```

- [ ] **Step 6: Commit**

```bash
git add readiness/src/gates readiness/test/runner-verdict.test.ts
git commit -m "feat(readiness): add mandatory dry gate catalog"
```

---

### Task 8: Readiness Runner, D037 Status Mapping, and Staleness

**Files:**
- Create: `readiness/src/runner/readiness-runner.ts`
- Create: `readiness/src/runner/current-readiness.ts`
- Modify: `readiness/src/domain/contracts.ts`
- Test: `readiness/test/runner-verdict.test.ts`

**Interfaces:**
- Consumes: `GateDefinition[]`, `GateContext`, `FrozenHashSet`.
- Produces: `runReadiness()`, `classifyExecutionStatus()`, `evaluateCurrentReadiness()`.

- [ ] **Step 1: RED all-or-blocked mutation test**

Create 22 PASS gate stubs and assert DRY_READY/PASSED. Then mutate each mandatory gate one at a time to FAIL, UNKNOWN, and NOT_EXECUTED; every mutation must flip verdict to BLOCKED.

- [ ] **Step 2: RED D037 mapping tests**

Exact mapping:

```text
all mandatory PASS -> PASSED + DRY_READY
>=1 actual executed defect FAIL -> FAILED + BLOCKED
no FAIL, but >=1 mandatory UNKNOWN/NOT_EXECUTED prerequisite unavailable -> BLOCKED + BLOCKED
before run -> NOT_TESTED + null verdict
while run executes -> RUNNING + null verdict
```

If both FAIL and NOT_EXECUTED occur, FAILED wins because an actual defect was demonstrated; record all gate results, never hide unavailable gates.

- [ ] **Step 3: Implement non-short-circuit runner**

Runner attempts all gates in catalog order. A gate may return NOT_EXECUTED when its own prerequisite state is unavailable, but earlier FAIL never globally aborts the run. A thrown exception means the process did not produce a trustworthy valid completed run; propagate it and do not serialize a completed artifact.

- [ ] **Step 4: Implement staleness without historical mutation**

```ts
export function evaluateCurrentReadiness(
  latest: ReadinessRun,
  currentHashes: FrozenHashSet,
): { readinessVerdict: ReadinessVerdict; executionStatus: ExecutionStatus; reasonCodes: string[] };
```

Hash mismatch returns BLOCKED/BLOCKED with `STALE_RUN`; `latest.readinessVerdict` and `latest.evidence.executionStatus` remain unchanged in memory and serialized history.

- [ ] **Step 5: GREEN**

```bash
cd readiness
npm run typecheck
npm test
```

- [ ] **Step 6: Commit**

```bash
git add readiness/src/runner readiness/src/domain/contracts.ts readiness/test/runner-verdict.test.ts
git commit -m "feat(readiness): aggregate dry readiness status"
```

---

### Task 9: CLI, Stable JSON, and Immutable Run Artifact Writer

**Files:**
- Create: `readiness/src/persistence/run-artifact.ts`
- Create: `readiness/src/cli.ts`
- Create: `readiness/results/README.md`
- Modify: `readiness/src/index.ts`
- Test: `readiness/test/cli-artifact.test.ts`

**Interfaces:**
- CLI: `npm run readiness -- run --scenario <registered-fixture-id> [--output-dir <dir>]`.
- Produces stdout JSON and one new file named `readiness_<uuid>.json` in the output directory for a valid completed run.

- [ ] **Step 1: RED CLI parsing tests**

Assert:

- only command `run` exists;
- `--scenario` is required and must resolve through registry;
- no `--vod`, `--url`, `--input-file`, or arbitrary media argument exists;
- unknown arguments exit non-zero without creating an artifact.

- [ ] **Step 2: RED artifact immutability tests**

Writer contract:

```ts
writeRunArtifact(run, outputDir): Promise<string>
```

must use exclusive create (`flag: "wx"`). If the same path already exists, throw `RUN_ARTIFACT_EXISTS`; never overwrite.

- [ ] **Step 3: Implement stable JSON envelope**

Serialized output includes exactly:

```ts
{
  schemaVersion: "1.0.0",
  runId,
  startedAt,
  completedAt,
  gates,
  readinessVerdict,
  evidence,
  frozenHashes,
  staleness
}
```

Sort object construction deterministically and emit trailing newline. No raw stdout/stderr capture, stack trace, temporary path, environment variables, credentials, or access-bearing URL is embedded.

- [ ] **Step 4: CLI default local-transcription behavior**

The normal CLI wires no qualifying `LocalTranscriptionPort`; therefore a valid default dry run is expected to complete as BLOCKED with gate `local-transcription-port = NOT_EXECUTED / LOCAL_TRANSCRIPTION_UNAVAILABLE`. This is an expected readiness result, not an implementation failure.

- [ ] **Step 5: GREEN**

```bash
cd readiness
npm run typecheck
npm test
```

- [ ] **Step 6: Commit**

```bash
git add readiness/src/persistence readiness/src/cli.ts readiness/src/index.ts readiness/results/README.md readiness/test/cli-artifact.test.ts
git commit -m "feat(readiness): add CLI and immutable artifacts"
```

---

### Task 10: Full End-to-End Synthetic Rehearsal and Negative-Path Coverage

**Files:**
- Test: `readiness/test/end-to-end.test.ts`
- Modify fixtures only if a test exposes a fixture defect, never to make an implementation defect disappear.

**Interfaces:**
- Consumes the public `runReadiness()`/CLI path only; no test reaches into private gate internals for end-to-end assertions.

- [ ] **Step 1: RED complete default end-to-end path**

Use `full-ready-v1` with the implementation's normal wiring (no qualifying local adapter). Assert every mandatory gate produces a terminal result record, all mechanically satisfiable gates PASS, `local-transcription-port` is NOT_EXECUTED with `LOCAL_TRANSCRIPTION_UNAVAILABLE`, evidence remains SELF_BENCHMARK/SIMULATED, and the valid completed run is `ExecutionStatus=BLOCKED` + `readinessVerdict=BLOCKED`. The test-only `LocalTranscriptionPort` stub is used only in a separate port-contract unit test and **must not** make this gate or run DRY_READY.

- [ ] **Step 2: RED aggregation-only DRY_READY possibility**

Use pure `GateDefinition` stubs (not the LocalTranscription test adapter and not a claimed deployment configuration) to feed 22 PASS results into `classifyExecutionStatus()`/the runner aggregation boundary. Assert the all-PASS algebra maps to PASSED + DRY_READY. This proves D029/D037 aggregation without falsely claiming that this implementation has a qualifying local STT adapter.

- [ ] **Step 3: RED replacement-unavailable scenario**

Use `replacement-unavailable-v1`; assert the reserve gate records `REPLACEMENT_UNAVAILABLE`, no redraw occurs, affected planned/completed coverage remains explicit, and the overall result is BLOCKED unless the fixture is specifically modeling an expected accepted limitation path defined by gate semantics. The gate tests, not presentation needs, determine PASS/FAIL.

- [ ] **Step 4: RED anti-optimization regressions**

Explicitly attempt:

- post-Gold clarity reclassification;
- post-freeze Second Expert redraw;
- replacing disagreement/difficult case;
- swapping cases to repair positive-quality count;
- treating unknown metric as zero;
- overwriting an old BLOCKED run artifact;
- treating stale historical DRY_READY as current.

Each attempt must fail with the expected reason and leave original state unchanged.

- [ ] **Step 5: GREEN whole readiness suite**

```bash
cd readiness
npm run typecheck
npm test
```

- [ ] **Step 6: Commit**

```bash
git add readiness/test/end-to-end.test.ts readiness/fixtures
git commit -m "test(readiness): cover end-to-end dry rehearsal"
```

---

### Task 11: Publication Inventory and Semantic Anti-Drift Guards

**Files:**
- Modify: `docs/PUBLICATION_FILES.json`
- Modify: `scripts/check-operating-docs.mjs`
- Modify: `scripts/check-operating-docs.semantic.test.mjs`
- Test: existing semantic mutation suite.

**Interfaces:**
- Publication checker must account for every new tracked `readiness/` source/test/fixture/README file and, when a final valid run artifact is committed, that exact artifact path.

- [ ] **Step 1: Write RED semantic mutations before checker implementation**

Add mutations proving the checker rejects:

1. inventory omits a tracked `readiness/` file;
2. `readiness/` source introduces `DataOrigin=REAL` as an assignable runtime value;
3. `readiness/` source introduces `EvaluationMode=ACTUAL_TEST` as an assignable runtime value;
4. `foundation/src/index.ts` or `foundation/package.json` changes as part of readiness implementation;
5. gate catalog drops or duplicates any mandatory Section 13 gate ID;
6. CLI adds an arbitrary media/path/URL entry point;
7. run artifact schema collapses `readinessVerdict` into `executionStatus` or omits canonical evidence dimensions.

- [ ] **Step 2: Establish meaningful RED**

Run semantic suite after adding mutations but before checker hardening:

```bash
node scripts/check-operating-docs.semantic.test.mjs
```

Expected: the newly added mutation cases fail for missing detection; existing positive controls remain PASS.

- [ ] **Step 3: Update publication inventory**

Bump inventory version from 7 to 8. Update scope prose to say Version 8 adds the separately authorized DRY Readiness implementation package and tests under `readiness/`, while ACTUAL TEST remains NOT YET TESTED. Add exact tracked paths sorted/unique. Do not add `node_modules`, raw stdout/stderr, temp workspaces, or local traces.

- [ ] **Step 4: Implement checker guards**

Keep checks structural and narrowly scoped. Do not ban documentation sentences that legitimately mention `REAL`/`ACTUAL_TEST`; inspect executable readiness source contexts and exact gate catalog/CLI contracts instead.

- [ ] **Step 5: GREEN checker suites**

```bash
node scripts/check-operating-docs.semantic.test.mjs
node scripts/check-operating-docs.mjs
```

On the implementation branch after staging:

```bash
node scripts/check-operating-docs.mjs --index
git diff --cached --check
```

Expected: all PASS / exit 0.

- [ ] **Step 6: Commit**

```bash
git add docs/PUBLICATION_FILES.json scripts/check-operating-docs.mjs scripts/check-operating-docs.semantic.test.mjs
git commit -m "test(readiness): harden publication contracts"
```

---

### Task 12: Fresh Dry Run Evidence, Handoffs, Execution Log, and Whole-PR Verification

**Files:**
- Create at execution time: `readiness/results/<generated-readiness-run-id>.json`
- Modify: `docs/PUBLICATION_FILES.json` to add that exact generated artifact path
- Modify: `handoff/CHATGPT_TO_CODEX.md`
- Modify: `handoff/CODEX_TO_CHATGPT.md`
- Modify: `experiments/ai_execution_log.pending.csv`
- Produce from templates: Change Report and Test Evidence Report if the active repository policy requires their tracked instances; otherwise include equivalent evidence in PR body without inventing new tracked files.

**Interfaces:**
- Completion artifact is SELF_BENCHMARK/SIMULATED only.
- No GO/REVISE/STOP Product decision is generated by the harness itself.

- [ ] **Step 1: Run clean-install verification in `readiness/` and `foundation/`**

From a clean worktree of the implementation branch:

```bash
cd readiness
npm ci
npm run typecheck
npm test

cd ../foundation
npm ci
npm run typecheck
npm test
```

Expected: 0 npm vulnerabilities in both clean installs; 0 TypeScript errors; all tests PASS. Record exact counts, never reuse planning-time counts as if they were fresh execution evidence.

- [ ] **Step 2: Run one real DRY harness execution with the normal CLI wiring**

```bash
cd readiness
npm run readiness -- run --scenario full-ready-v1 --output-dir results
```

Expected for this implementation scope: **valid completed SELF-BENCHMARK/SIMULATED run with `readiness_verdict=BLOCKED`, `ExecutionStatus=BLOCKED`, reason including `LOCAL_TRANSCRIPTION_UNAVAILABLE`**, because this plan deliberately does not add a qualifying local STT adapter. A future separately authorized adapter scope may change that later; this implementation must not fake availability to obtain DRY_READY.

This run is a DRY Readiness SELF-BENCHMARK, not ACTUAL TEST evidence. Its actual verdict is evidence and must not be edited.

- [ ] **Step 3: Add the exact valid run artifact to Git immutably**

Add the generated `readiness/results/readiness_<uuid>.json` path to `docs/PUBLICATION_FILES.json` in the same commit. If the run crashes or fails to produce a trustworthy complete artifact, do not commit a partial result; fix the implementation defect, rerun from a clean state, and preserve any already-valid prior completed runs.

- [ ] **Step 4: Reconcile handoffs without authorizing the next gate**

Forward and reverse handoffs must state:

```text
DRY Readiness implementation = IMPLEMENTED / AWAITING PRODUCT REVIEW
ACTUAL TEST = NOT YET TESTED
50/150 expansion = NOT AUTHORIZED
PLAN 1B = NOT AUTHORIZED
PR #5 = OPEN / UNTOUCHED
No next implementation task is authorized by implementation completion alone.
```

If the actual implementation verdict is BLOCKED because no local adapter exists, state that explicitly rather than calling the harness DRY_READY.

- [ ] **Step 5: Append execution-log row; never rewrite historical rows**

Append one row with actual timestamp and an `event_id` unique to the implementation run, exact branch/base/commit/run ID/test counts/verdict, `Acquired Skill` used, token estimate UNKNOWN unless telemetry exists, Google transport status, and `ACTUAL TEST NOT YET TESTED`.

- [ ] **Step 6: Whole-PR verification**

Run:

```bash
cd readiness && npm ci && npm run typecheck && npm test
cd ../foundation && npm ci && npm run typecheck && npm test
cd ..
node scripts/check-operating-docs.semantic.test.mjs
node scripts/check-operating-docs.mjs --tracked
git diff <approved-implementation-base>..HEAD --check
```

Also verify mechanically:

```bash
git diff --name-only <approved-implementation-base>..HEAD -- foundation/
git diff --name-only <approved-implementation-base>..HEAD -- docs/superpowers/specs/2026-09-08-decode-dry-readiness-design.md
git diff --name-only <approved-implementation-base>..HEAD -- docs/superpowers/specs/2026-09-06-decode-10-case-actual-test-protocol-v1.md
git diff --name-only <approved-implementation-base>..HEAD -- docs/superpowers/specs/2026-09-06-decode-integrated-spec-v1.md
git diff --name-only <approved-implementation-base>..HEAD -- docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md
```

Expected: no Foundation or frozen-authority-document changes. If any appear, STOP_AND_REPORT.

- [ ] **Step 7: Open implementation PR, do not merge**

PR body must include exact approved base SHA, final head SHA, changed files, exact fresh commands/counts, dry run ID + verdict + reason codes, frozen hashes, explicit evidence labels SELF_BENCHMARK/SIMULATED, PR #5 untouched evidence, and explicit exclusions. User/Product reviews the actual PR head before merge. Implementation completion does not authorize merge or ACTUAL TEST.

---

## Interfaces Consumed / Produced

### Foundation interfaces consumed unchanged

```ts
import {
  InMemoryPolicyRightsGate,
  InMemoryRightsStore,
  type ActorVerifier,
  type AuthorizationRequest,
  type ProtectedAction,
  DurableJob,
  validateEvidenceRecord,
  selfPromoteToActualTest,
  type EvidenceRecord,
  type ExecutionStatus,
} from "./foundation-api.js";
```

`readiness/src/foundation-api.ts` is the only relative Foundation seam:

```ts
export * from "../../foundation/src/index.js";
```

Known public contracts verified at planning baseline:

```ts
interface ActorVerifier {
  verify(input: { actorId: string; action: ProtectedAction; purpose: string }): Promise<boolean> | boolean;
}

class InMemoryPolicyRightsGate {
  authorize(request: AuthorizationRequest): Promise<Permit>;
  revalidate(permitId: string, request: AuthorizationRequest): Promise<void>;
}
```

No new Foundation export is introduced.

### Readiness interfaces produced

```ts
type GateStatus = "PASS" | "FAIL" | "UNKNOWN" | "NOT_EXECUTED";
type ReadinessVerdict = "DRY_READY" | "BLOCKED";

interface GateDefinition {
  id: MandatoryGateId;
  mandatory: true;
  execute(context: GateContext, priorResults: readonly GateResult[]): Promise<GateResult>;
}

interface LocalTranscriptionPort {
  isAvailable(): Promise<boolean>;
  transcribe(input: SyntheticAudioFixture): Promise<TranscriptionResult>;
}

function runReadiness(input: RunReadinessInput): Promise<ReadinessRun>;
function evaluateCurrentReadiness(latest: ReadinessRun, currentHashes: FrozenHashSet): CurrentReadiness;
```

---

## TDD / Regression Cycle

For every behavior-changing task:

1. Add the exact failing test first.
2. Run the narrow/full readiness suite and capture a genuine assertion/contract RED attributable to the missing behavior.
3. Add the minimum implementation needed for GREEN.
4. Run readiness typecheck + all readiness tests.
5. Run Foundation regression whenever the task consumes Foundation behavior.
6. Commit the self-contained task.

Never weaken, delete, skip, or rewrite a failing test merely to obtain GREEN. A test change that corrects an invalid test assumption must be documented in the commit/PR evidence with the before/after reason.

---

## Exact Verification Commands

Planning-time stack metadata was read without execution. Implementation-time commands are:

```bash
# Readiness package
cd readiness
npm ci
npm run typecheck
npm test
npm run readiness -- run --scenario full-ready-v1 --output-dir results

# Foundation regression
cd ../foundation
npm ci
npm run typecheck
npm test

# Repository operating-document gates
cd ..
node scripts/check-operating-docs.semantic.test.mjs
node scripts/check-operating-docs.mjs --tracked
git diff <approved-implementation-base>..HEAD --check
```

Before implementation begins:

```bash
git fetch origin
git rev-parse origin/main
```

The returned SHA must equal the separately approved implementation base for this plan; otherwise STOP_AND_REPORT before code changes.

---

## Explicit Exclusions

- No REAL VOD, real player, PII, real consent, guardian identity, real Founder Gold, real Second Expert session, or actual Pilot.
- No ACTUAL TEST execution and no claim that dry results are ACTUAL TEST evidence.
- No PLAN 1B, Evidence Snapshot/Seal, production Gold/Assignment/Blind workflow, production identity provider, role taxonomy, UI, deployment, or 50/150 expansion.
- No concrete STT provider/model/engine selection or network egress.
- No change to the three frozen authority documents or PLAN 1A.
- No change to `foundation/` source/public API/package metadata.
- No merge/rebase/cherry-pick/modification/closure of PR #5 and no copied PR #5 implementation.
- No automatic Product GO/REVISE/STOP based on synthetic thresholds.
- No direct-main implementation and no automatic merge of the implementation PR.

---

## Risk / Rollback / Corrective Strategy

1. **Synthetic boundary accidentally accepts arbitrary input.** STOP; keep branch unmerged; revert the task commit that introduced the input path and restore closed registry tests before continuing.
2. **Readiness code requires a Foundation change.** STOP under D017. Do not modify Foundation as a workaround. Surface the exact missing primitive as a new material Architecture decision.
3. **D037 status cannot deterministically classify a run.** STOP under D017; do not add a new ExecutionStatus or merge readiness verdict/status enums.
4. **Default environment has no local STT adapter.** Expected readiness outcome is BLOCKED/LOCAL_TRANSCRIPTION_UNAVAILABLE, not rollback and not external fallback.
5. **Checker detects a frozen authority or Foundation diff.** STOP_AND_REPORT; restore those files byte-for-byte from approved base before any review.
6. **A valid BLOCKED dry-run artifact exists.** Preserve it immutably. Never delete or overwrite it to make a later result look cleaner.
7. **Crash/truncated run artifact.** Do not commit it as valid evidence. Correct software, rerun, and separately retain any already-valid prior completed run.
8. **Implementation base drifts before start or review.** Stop, fetch current main, reconcile changed canonical decisions/docs, and obtain explicit approval of the new implementation base before proceeding.

Rollback uses ordinary `git revert <task-commit>` on the scoped implementation branch after review of the exact target; no force push, destructive reset, or history rewrite.

---

## Integration Method

`PR_MERGE`.

When implementation is separately approved, create a scoped implementation branch from the exact approved `origin/main` SHA. Use task-sized commits from the sequence above, open one implementation PR, run the full Whole-PR verification, and obtain user/Product review of the exact final PR head. No merge is authorized merely by this plan or by passing tests.

The implementation PR must remain separate from PR #5. PR #5 stays read-only/open/untouched.

---

## Completion Artifacts

A completed implementation PR must contain or link:

- exact implementation base SHA and final PR head SHA;
- exact changed-file inventory;
- fresh readiness clean-install/typecheck/test counts;
- fresh Foundation clean-install/typecheck/test counts;
- fresh operating checker and semantic mutation counts;
- one valid dry-run `run_id`, exact `readiness_verdict`, canonical `ExecutionStatus`, gate results/reason codes, and frozen hashes;
- sanitized immutable run artifact committed and inventoried;
- Change Report using `docs/templates/CHANGE_REPORT_TEMPLATE.md` semantics;
- Test Evidence Report using `docs/templates/TEST_EVIDENCE_TEMPLATE.md` semantics when evaluation evidence is reported;
- reconciled forward/reverse handoffs;
- appended execution-log receipt;
- explicit statement: `ACTUAL TEST = NOT YET TESTED`, `50/150 = NOT AUTHORIZED`, `PLAN 1B = NOT AUTHORIZED`, `PR #5 = OPEN / UNTOUCHED`;
- user/Product review verdict for the exact final implementation head before merge.

---

## Plan Self-Review

### Spec coverage

- D025/D026 synthetic-only + structural no-REAL boundary: Tasks 1–2, 7, 11.
- D027 PR #5 read-only: Global Constraints, Task 12 verification, Explicit Exclusions.
- D028 separate package/no Foundation changes: Task 1, Task 12 verification.
- D029 all-or-blocked: Tasks 7–8.
- D030 deterministic vs operational evidence: Tasks 3–7.
- D031 CLI + JSON/no UI: Task 9.
- D032 sanitized Git evidence: Tasks 9, 12.
- D033 immutable valid run history: Tasks 9, 12.
- D034 stale current readiness: Tasks 2, 8.
- D035 metric computation only: Task 4 and metric gate in Task 7.
- D036 provider-neutral local transcription/no automatic external fallback: Task 6 and Task 12 expected default BLOCKED behavior.
- D037 canonical status mapping: Task 8.
- Protocol Section 29 steps 1–14: Tasks 2–7.
- Structural mechanics steps 15–20: Tasks 3–6.
- All 22 minimum mandatory gates: exact catalog in Task 7.
- Acceptance criteria 1–8: Tasks 7–12.

### Placeholder scan

No placeholder markers or unspecified test/error-handling steps are permitted in execution. Dynamic values such as generated run IDs and the future separately approved implementation base are runtime/authorization values, not missing design decisions.

### Type consistency

`GateStatus`, `ReadinessVerdict`, `GateResult`, `FrozenHashSet`, `LocalTranscriptionPort`, `GateDefinition`, `ReadinessRun`, and the D037 mapping are defined once and consumed consistently by later tasks. Foundation canonical evidence types are imported through the single readiness-local bridge, never duplicated.

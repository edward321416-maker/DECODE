# Design Spec — DECODE DRY Readiness (A1 scope)

Template Version: 1.0 | Updated: 2026-09-08 | Owner: AI/Engineering Lead
Status: **DRAFT — USER REVIEW REQUIRED BEFORE IMPLEMENTATION PLAN**
Scope: architecture/interface design for a synthetic-only "dry rehearsal" readiness harness that exercises the 10-Case ACTUAL TEST Protocol v1.0's pre-execution and structural steps end-to-end with SIMULATED data, before any real Pilot/Founder/Second Expert execution
Authority: D025–D037 (this document; see [Decisions](../../DECISIONS.md)), amending/extending nothing in the frozen [Integrated Spec](2026-09-06-decode-integrated-spec-v1.md), [PLAN 1A Canonical Foundation](../plans/2026-09-06-decode-plan-1a-canonical-foundation.md), or the [10-Case ACTUAL TEST Protocol v1.0](2026-09-06-decode-10-case-actual-test-protocol-v1.md). Those three documents remain frozen authority artifacts; this spec traces to them, it does not amend them.

Owner: AI/Engineering Lead | Date: 2026-09-08 | Status: DRAFT

**Implementation status: NOT STARTED. This document is a design spec only — no readiness runtime/code is implemented by materializing it.**

---

## 0. Why this scope exists

PR-A Canonical Foundation is merged (`@decode/foundation`: canonical command identity, ActorVerifier Port, Policy & Rights, durable job lifecycle, migration guards, Provenance contract). The 10-Case ACTUAL TEST Protocol v1.0 (Q1–Q56) is design-locked but its pre-execution and structural steps (Section 29, steps 1–14) have never been exercised even synthetically — every readiness claim so far is aspirational, not demonstrated. Before any real Pilot/Founder/Second Expert session is attempted, Product needs evidence that the *procedural machinery* the Protocol describes — case composition/freeze, reserve allocation/replacement, Second Expert subset selection, measurement preregistration, hashing, timing, retention/deletion, rights/permit integration, local transcription — can actually run correctly end-to-end, using synthetic data that never touches a real person, real VOD, or real consent.

That is the entire and only purpose of this scope: a **dry rehearsal readiness harness**. It answers "does the machinery work," never "is DECODE ready for real people." The latter question remains gated by ACTUAL TEST, which stays NOT YET TESTED regardless of any result this harness produces.

## 1. Scope

- A synthetic-only readiness harness, package name `readiness/` (D028), that rehearses Protocol Section 29 pre-execution steps 1–14 and the structural mechanics of steps 15–20 (composition, freeze, reserve, Second Expert subset, timing contract, retention/deletion receipts) using exclusively SIMULATED fixtures.
- A CLI entry point producing machine-readable JSON output: a `readiness_verdict` (`DRY_READY` or `BLOCKED`), a `run_id`, per-gate results with reason codes, and the frozen hashes that make the run reproducible/comparable.
- Deterministic properties (hashing, semver-style compatibility rules already in `@decode/foundation`, metric computation formulas, freeze/immutability enforcement) verified by automated unit/integration tests.
- Operational flows (consent/guardian/assent, source-rights, Second Expert qualification, Pilot Operator checklist) verified by synthetic scenario rehearsal plus a checklist artifact — never by claiming a real legal/ethical determination occurred.
- Integration with the already-merged `@decode/foundation` Policy & Rights gate and ActorVerifier Port for every protected action the Protocol's Section 28 requires revalidation before.
- Local-only transcription dry verification through a provider-neutral port, using non-personal synthetic audio, with a defined BLOCKED behavior when no qualifying local adapter exists.

## 2. Non-goals

- **No implementation in this PR.** This document is a design spec; an implementation plan (per `docs/templates/IMPLEMENTATION_PLAN_TEMPLATE.md`) and TDD execution are separate, later, separately-authorized work.
- **No real VOD, participant PII, actual consent collection, Founder Gold, actual Second Expert session, or any other REAL execution** (D025). This is not a Pilot run, not a soft-launch, not a partial ACTUAL TEST.
- **No PLAN 1B.** This scope does not implement Evidence Snapshot/Seal, the production Gold/Assignment/Blind workflow, or any of PLAN 1A Section 14's explicit non-scope items. Gold/Blind/Second-Expert behavior here is synthetic scenario/state-machine rehearsal only (Correction 2, below) — production versions of those workflows remain gated by PLAN 1A Section 15's PLAN 1B gate and a separate Product evidence decision.
- **No UI.** CLI + JSON only (D031).
- **No concrete STT engine/provider/model lock.** `LocalTranscriptionPort` is an interface; which local adapter (if any) satisfies it is an implementation-time/deployment-time concern, not locked by this spec (D036).
- **No 50/150 expansion, no ACTUAL TEST execution, no deployment.** Unaffected by anything in this scope.
- **No PR #5 interaction.** PR #5 (`codex/annotation-infrastructure`) is referenced read-only for lessons/patterns (D027); nothing from it is merged, rebased, cherry-picked, or otherwise pulled in verbatim.

## 3. Interfaces / contracts

All types below are proposed shapes for the later implementation plan to refine (C11 — routine implementation detail); they exist here to make the design's boundaries concrete enough to review, not to lock exact field names.

### 3.1 Readiness domain types (readiness/ package — see Section 10, "Alternatives considered," for why this is a separate package from `foundation/`)

```ts
// readiness/src/domain/verdict.ts
type ReadinessVerdict = "DRY_READY" | "BLOCKED";

interface GateResult {
  gateId: string;                 // stable identifier, see Section 13 gate list
  mandatory: boolean;
  status: "PASS" | "FAIL" | "UNKNOWN" | "NOT_EXECUTED";
  reasonCodes: string[];          // machine-readable, e.g. "REPLACEMENT_UNAVAILABLE"
  detail?: string;
}

interface ReadinessRun {
  runId: string;                  // unique per run, see Section 3.4
  startedAt: string;              // ISO-8601
  completedAt: string;
  gates: GateResult[];
  verdict: ReadinessVerdict;      // DRY_READY iff every mandatory gate is PASS
  frozenHashes: FrozenHashSet;    // Section 13's "software/schema/protocol/fixture/gate hashing" gate
  staleness: { stale: boolean; reasonCodes: string[] };
}
```

**Correction 1 (Product pre-spec audit):** `readiness_verdict` is a readiness-domain field. It is never written into, and never replaces or overloads, the canonical three-dimension evidence contract from PLAN 1A Section 3 / D023 / D024. Every evidence record this harness produces states, separately and always:

```
EvaluationMode = SELF_BENCHMARK
DataOrigin     = SIMULATED
ExecutionStatus = <whatever the run actually did: NOT_TESTED | RUNNING | PASSED | FAILED | BLOCKED>
```

`readiness_verdict` and `ExecutionStatus` are never the same field, never derived from each other by string equality, and a `DRY_READY` verdict never implies `ExecutionStatus=PASSED` for anything outside this harness's own gates. `DRY_READY != ACTUAL TEST READY != ACTUAL TEST GO` (D029) is enforced structurally: nothing in the `ReadinessRun` type or its JSON serialization contains an `EvaluationMode=ACTUAL_TEST` value anywhere, ever — a static/lint-level invariant, not just documentation.

**D037 (Dry Readiness execution-status mapping)** formalizes the exact `ExecutionStatus`/`readiness_verdict` correspondence: before a run executes, `ExecutionStatus=NOT_TESTED`; while a valid run executes, `ExecutionStatus=RUNNING`; every mandatory gate completed and `PASS` ⇒ `ExecutionStatus=PASSED` and `readiness_verdict=DRY_READY`; a mandatory gate that actually executes and detects a real software/contract/invariant defect ⇒ `ExecutionStatus=FAILED` and `readiness_verdict=BLOCKED`; a valid run that cannot satisfy a mandatory prerequisite or reach a mandatory gate (no defect demonstrated) ⇒ `ExecutionStatus=BLOCKED` and `readiness_verdict=BLOCKED`. This mapping is deterministic; a case implementation cannot map under it stops under D017 rather than inventing a new status.

### 3.2 Foundation integration (no new protocol behavior added to `foundation/`)

`readiness/` depends on `@decode/foundation` as a repository-local dependency; the exact workspace/`file:` linking mechanism is a C11 implementation detail (Section 11) and is not decided by this spec. `readiness/` consumes `foundation/`'s existing exports without modification:

```ts
import {
  InMemoryPolicyRightsGate, InMemoryRightsStore, type ActorVerifier,
  DurableJob, AtomicCommandGate, validateEvidenceRecord,
  type EvidenceRecord,
} from "@decode/foundation";
```

Canonical `foundation/` only defines the `"permit" | "job" | "command"` ID namespaces (`generateId()`); this spec does **not** add a `"readiness"` namespace to `foundation/`. `readiness/` owns its own run-ID generation contract entirely within the `readiness/` package (Section 3.4) — it does not call or extend `foundation/`'s `generateId()`.

Every protected action the Protocol's Section 28 lists (evidence ingestion, expert-voice storage, external transcription egress, evaluation use, player output) is rehearsed by requesting a Permit through `InMemoryPolicyRightsGate.authorize()` and revalidating through `.revalidate(permitId, request)` immediately before the simulated action, exactly as `foundation/`'s existing contract requires. `readiness/` does **not** add a `readiness`-specific action type, a new Eligibility state, or a new protected-action enum value to `foundation/` — it uses the existing `ProtectedAction` union and existing `Eligibility` states, because the Protocol's rights model is already fully expressed by what PR-A implemented. If a later reviewer of this spec identifies a genuine gap where the Protocol needs a rights primitive `foundation/` does not have, that is a material Architecture decision and goes through D017 — it is explicitly out of scope for this document to invent one.

### 3.3 LocalTranscriptionPort (provider-neutral)

```ts
// readiness/src/ports/local-transcription-port.ts
interface LocalTranscriptionPort {
  isAvailable(): Promise<boolean>;
  transcribe(input: SyntheticAudioFixture): Promise<TranscriptionResult>;
}

interface SyntheticAudioFixture {
  fixtureId: string;
  // non-personal synthetic audio only — see Section 6 Persistence / Section 7 Security
}

interface TranscriptionResult {
  text: string;
  confidence?: number;
}
```

No concrete adapter (whisper.cpp, a specific local model, etc.) is named or locked by this spec — that is deliberately deferred (D036). The readiness harness's *own* test double/reference adapter (used to prove the port contract itself works) is not a "qualifying local adapter" for the purposes of the `local-transcription-port` gate; that gate asks whether a real deployment has a real local adapter configured. Per D036/D037's layering (Section 3.1), when no qualifying local adapter is present — expected and correct in the dry harness's own CI/dev environment — `GateResult.status=NOT_EXECUTED` with `reasonCodes` including `LOCAL_TRANSCRIPTION_UNAVAILABLE`; no software/contract defect is thereby demonstrated, so the run's `ExecutionStatus=BLOCKED` and `readiness_verdict=BLOCKED` (D037), not `FAIL`. `BLOCKED` is never a `GateResult.status` value (Section 5.2) — it is the run-level `ExecutionStatus`/`readiness_verdict` outcome that this gate's `NOT_EXECUTED` result produces (Section 13).

### 3.4 Run identity

`readiness/` owns its own run-ID generation contract, independent of `foundation/`'s `generateId()` (which only defines the `"permit" | "job" | "command"` namespaces and is not extended by this spec — Correction 1). A proposed local implementation: `` `readiness_${crypto.randomUUID()}` `` using Node's built-in `node:crypto.randomUUID()`, or an equivalent C11-level local implementation the implementer chooses. Whichever mechanism is used, a `readiness_`-prefixed run id must remain structurally distinguishable from and never collide with a `permit_`/`job_`/`command_` id minted by `foundation/`.

## 4. Data flow

```
CLI invocation (readiness run --scenario <fixture-set>)
  -> load versioned SIMULATED fixture set (Section 6)
  -> compute frozenHashes over: readiness/ source version, foundation/ dependency version,
     Protocol version/hash, schema version, fixture-set version, gate-definition version
  -> for each mandatory + optional gate (Section 13), in dependency order:
       -> execute gate logic against fixtures (pure where possible; foundation/ calls where
          rights/permit/job/provenance behavior is exercised)
       -> record GateResult{status, reasonCodes}
  -> aggregate: verdict = DRY_READY iff every mandatory gate status == PASS, else BLOCKED
  -> emit ReadinessRun as JSON to stdout and as a sanitized Git-committable artifact (Section 6)
```

Every gate is independent and order is fixed by dependency (e.g. "main10 composition/freeze" must run before "reserve replacement" can be meaningfully exercised), but a failing gate does not abort the run — the harness always attempts every gate and reports `NOT_EXECUTED` only for gates whose preconditions were never reached (Section 5), so a single run always shows the complete picture, not just the first failure.

## 5. State / error states

### 5.1 `ReadinessVerdict`

- `DRY_READY` — every mandatory gate (Section 13) reports `PASS` for this run.
- `BLOCKED` — at least one mandatory gate reports `FAIL`, `UNKNOWN`, or `NOT_EXECUTED` (D029: missing/failing/unknown/unexecuted mandatory gate all collapse to BLOCKED — there is no partial-credit verdict).

### 5.2 `GateResult.status`

- `PASS` — the gate's rehearsal completed and its assertions held.
- `FAIL` — the gate ran and a real defect/violation was observed (e.g. a redraw attempt after freeze was not rejected).
- `UNKNOWN` — the gate could not determine a result (e.g. a dependency gate it needs is itself `NOT_EXECUTED`).
- `NOT_EXECUTED` — the gate's preconditions were never reached this run (e.g. reserve-replacement gate when the composition gate that must precede it failed hard enough to prevent any frozen state to replace within).

### 5.3 Staleness (D034)

A run is only trustworthy if its `frozenHashes` still match current canonical state. `staleness.stale = true` when any of: `readiness/` source hash, `foundation/` dependency hash, Protocol document hash, schema version, fixture-set version, or gate-definition hash has changed since the run. A stale run's *recorded* verdict is preserved as historical evidence (D033), but *current* readiness is separately computed as `BLOCKED / STALE_RUN` until a fresh run exists (Section 13, "stale-run detection" gate) — staleness is a property of "is this run still the answer for right now," not a mutation of the historical record.

### 5.4 Run validity (D033)

A run is either a **valid completed run** (every gate reached at least `NOT_EXECUTED` with a recorded reason, and the run's own integrity — hashes, run_id uniqueness, timestamps — is intact) or **not a valid run at all** (a crash, a truncated artifact, a process that never produced a trustworthy `ReadinessRun` object). Only valid completed runs — `DRY_READY` or `BLOCKED` — are retained as immutable history (Section 6). A crash is not represented as either a valid `DRY_READY` or a valid `BLOCKED` run; it produces no committed artifact at all, and if partial output exists locally it is explicitly excluded from the Git-committed evidence.

## 6. Persistence

**What is committed to Git (sanitized SELF-BENCHMARK result artifacts, D032):**

- Every valid completed `ReadinessRun` JSON artifact (both `DRY_READY` and `BLOCKED` runs), immutable once committed (D033) — never overwritten or deleted to improve appearance.
- The versioned SIMULATED fixture sets themselves (they are synthetic by construction, never personal data).
- The frozen gate/schema/protocol-hash definitions used to compute `frozenHashes`.

**What stays local/private, never committed (D032):**

- Raw stdout/stderr from any run.
- Temporary workspaces, scratch fixtures generated mid-run, execution traces.
- Any access-bearing or private evidence (there should be none in a synthetic-only harness by construction, but the retention rule is explicit as a defense-in-depth backstop, matching Publication Policy's existing exclusion scan).

**Fixture versioning:** every fixture set carries an explicit version identifier; `frozenHashes` includes it, so a fixture-set change is always visible as a staleness trigger for prior runs, never a silent drift.

**Retention/deletion receipt rehearsal:** the harness includes a synthetic "unused reserve deletion at replacement-window close" gate (Protocol Section 5) that produces a synthetic deletion-receipt artifact — itself sanitized, itself SIMULATED, never representing an actual deletion of actual data, since no actual data exists in this harness.

## 7. Security / rights / privacy / egress

- **No real personal data or VOD may be accepted anywhere in the dry harness** (Correction 7). The harness fails closed **structurally**, not heuristically: fixture input is restricted to explicitly versioned, repository-bundled/allowlisted synthetic fixture identifiers and their validated records — never an arbitrary filesystem VOD/media path, a URL, user-uploaded media, a free-form real-source reference, or a `DataOrigin=REAL` value. An unknown/unregistered fixture identifier is rejected outright (Section 13, `simulated-only-input` gate). This is a structural allowlist boundary — the harness never attempts to classify whether arbitrary input "looks real" — and, like every gate in this spec, it is a design contract only; it is not implemented in this PR.
- **Consent/assent/guardian/source-rights/Second-Expert-qualification artifacts produced by this harness are templates/rehearsals only** (Correction 6): they exercise the *shape and workflow* of the Protocol's consent (Protocol §17, §24–26), source-rights (Protocol §3–4), and Second Expert qualification (Protocol §8) processes with synthetic actors and synthetic decisions. None of them constitutes legal certification, and none is evidence that any actual eligibility determination occurred. Every such artifact is labeled, in its own JSON, as `rehearsal: true` and carries `EvaluationMode=SELF_BENCHMARK, DataOrigin=SIMULATED`.
- **External egress defaults BLOCKED** (matching Protocol Section 12's `LOCAL-FIRST` default and PLAN 1A's Policy & Rights `EXTERNAL_EGRESS` action): the dry harness never attempts a real external STT call. If `LocalTranscriptionPort.isAvailable()` returns false, `GateResult.status=NOT_EXECUTED` with `reasonCodes` including `LOCAL_TRANSCRIPTION_UNAVAILABLE` (Section 3.1, Section 5.2), and the run's `ExecutionStatus=BLOCKED`/`readiness_verdict=BLOCKED` (D037) — external STT is never an automatic fallback (D036), and a future scope that wants to exercise external egress must separately satisfy the full Protocol Section 12 permit chain (explicit approval, revalidated permit, provider review) under its own authorized scope, not this one.
- **Foundation Policy/Rights integration is exercised, not reinvented** (Section 3.2): every protected-action rehearsal goes through `authorize()`/`revalidate()` exactly as `foundation/` requires, including execution-time revalidation immediately before the simulated protected action, matching Protocol Section 28's "revalidate immediately before" requirement.
- **Auth boundary:** the readiness CLI runs locally, as a developer/CI tool; it has no network-facing surface of its own. `ActorVerifier` in this harness is `foundation/`'s existing deterministic in-memory test-infrastructure verifier (per PLAN 1A Section 7) — the dry harness does not implement or lock a production identity provider, matching PLAN 1A's own boundary.

## 8. External dependencies

- `@decode/foundation` (repository-local dependency; exact workspace/`file:` linking mechanism is a C11 implementation detail, Section 11 — no version drift is possible either way, since both live in the same repository and the same commit).
- Node.js test runner (`node:test`) and `node:assert/strict`, matching `foundation/`'s existing zero-external-test-framework convention (C11 — implementer may choose otherwise if a genuine need arises, but no new dependency is anticipated by this spec).
- `node:crypto` for hashing (`frozenHashes`), matching `foundation/`'s existing `createHash("sha256")` usage.
- No new production dependency is anticipated for the readiness domain logic itself. A concrete `LocalTranscriptionPort` adapter, if one is wired up in a later implementation phase, will bring its own dependency — deliberately not decided here (D036).

## 9. Migration / compatibility

Greenfield — `readiness/` is a new package with no prior stored format to migrate. `frozenHashes` and staleness detection (Section 5.3) are this design's own forward-compatibility mechanism: any future change to `foundation/`, the Protocol, the schema, fixtures, or gate definitions is required to show up as `STALE_RUN` for prior runs rather than silently invalidating them without a visible signal.

## 10. Alternatives considered

- **Folding readiness logic into `foundation/` directly** — rejected (D028): `foundation/` is PLAN 1A's Canonical Foundation, already reviewed and merged against a specific locked contract; adding protocol-specific (Q1–Q56) behavior to it would blur that boundary and re-open a merged, reviewed package for unrelated scope. A separate `readiness/` package that *depends on* `foundation/` keeps the boundary clean and matches PLAN 1A Section 14/15's non-scope discipline.
- **Reusing PR #5's annotation-infrastructure code directly (merge/rebase/cherry-pick)** — rejected (D027): PR #5 predates D023/D024's evidence-contract amendments and PR-A's now-merged Foundation contracts, and reuse-by-merge would risk pulling in an evidence model that predates the canonical one. Any genuinely useful pattern from PR #5 is independently reimplemented from canonical `main`, read-only reference, PR #5 itself stays untouched.
- **A UI-based readiness dashboard instead of CLI+JSON** — rejected (D031): premature; a CLI with machine-readable JSON is sufficient to prove the machinery works and is far cheaper to build and review than a UI, which can be added later against a stable JSON contract if ever needed.
- **Locking a concrete STT provider now** — rejected (D036): no concrete choice has been evaluated for cost/quality/licensing, and locking one prematurely would create exactly the kind of unreviewed dependency commitment this repository's Decision Interview Gate (D017) exists to prevent.
- **A single flat pass/fail boolean instead of per-gate results with reason codes** — rejected: Product explicitly asked for "Gate result/reason codes and overall readiness verdict" (D031); per-gate detail is required for the traceability matrix (Section 12) to be meaningful, and for a `BLOCKED` run to be actionable rather than opaque.

## 11. Unresolved decisions

The `readiness/` package/directory name is locked by D028's own wording ("Separate `readiness/` package") — it is not listed as unresolved below.

- [ ] Exact concrete `LocalTranscriptionPort` reference/test adapter used only to prove the port contract in unit tests (not a production STT choice) — C11, implementer's call, must not be confused with or presented as satisfying the "qualifying local adapter" condition for the `LOCAL_TRANSCRIPTION_UNAVAILABLE` gate in a real deployment context.
- [ ] Whether `readiness/` uses npm workspaces or a simple relative `file:` dependency on `foundation/` — C11, implementer's call, does not change any locked contract.

None of the above rises to a material Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost decision; all are routine implementation choices under C11. If implementation reveals one that does, it stops and returns through D017 rather than being decided here.

## 12. Protocol Section 29 pre-execution traceability matrix (steps 1–14)

Every row maps a Protocol pre-execution step to the dry-harness gate(s) that rehearse it. "Rehearsed" means: the harness exercises the step's *mechanics* with synthetic data and checks the mechanics behave correctly per the Protocol's rules — it never claims the step's real-world precondition (e.g. actual consent) is satisfied.

| # | Protocol pre-execution step | Dry-harness gate(s) | What is rehearsed | What remains NOT TESTED |
| --- | --- | --- | --- | --- |
| 1 | Materialize and hash approved Protocol version | software/schema/protocol/fixture/gate hashing | Protocol document hash computed and frozen into `frozenHashes` | Whether the *content* of a future Protocol revision is itself correct (that's a Product/Documentation concern, not this harness's) |
| 2 | Verify Pilot Operator readiness | consent/guardian/assent workflow rehearsal (readiness sub-check) | A synthetic "Pilot Operator checklist" artifact is completed against the Protocol Section 23 required-category list | Whether a real Pilot Operator exists, is trained, or is actually ready |
| 3 | Verify consent/guardian/assent flow | consent/guardian/assent workflow rehearsal | The state machine `PARTICIPATE / DO NOT PARTICIPATE`, guardian-consent + assent + verification → eligibility, and the `PAUSE → explain → CONTINUE/WITHDRAW` ambiguous-withdrawal path (Protocol §17, §24–26) are exercised with synthetic participants | Real consent, real guardian identity, real minor-status determination |
| 4 | Verify Founder source rights | source-rights workflow rehearsal | Synthetic source-provenance records are validated against the Protocol §3 allowed-pool rules (Founder-owned/authorized, explicitly consented Pilot) and rejected when they simulate a forbidden source | Real ownership/rights verification of any actual VOD |
| 5 | Qualify Second Expert | Second Expert qualification workflow rehearsal | The `ELIGIBLE / NOT ELIGIBLE / INSUFFICIENT EVIDENCE` decision path and the minimal relationship-provenance enum (Protocol §8) are exercised against synthetic candidate profiles | Real qualification of any actual person |
| 6 | Identify allowed source pool | source-rights workflow rehearsal | Synthetic pool enumeration against the allowed/forbidden source rules | Real pool identification |
| 7 | Select/freeze main 10 | main10 composition/freeze | Synthetic case set is composed to CLEAR 6 / AMBIGUOUS 4, families 4/3/3 (Protocol §2) and frozen **before** any synthetic Gold rehearsal begins (post-freeze reclassification attempts are rejected). The ≥2 OPTIMAL/ACCEPTABLE positive-quality condition is evaluated **only after** synthetic Gold rehearsal produces verdicts — it is a post-Gold structural check, never a pre-selection eligibility gate — and a shortfall records `COMPOSITION_CONDITION_FAILED` without swapping/reselecting cases to repair the count | Real case content/quality |
| 8 | Allocate/select/freeze reserve 3 | reserve3 allocation/freeze | Synthetic reserve allocation reproduces Protocol §5's exact stratum-sorting algorithm (CLEAR 2 by `main_count` desc/`stratum_id` asc top-2; AMBIGUOUS 1 by the same rule top-1) and freezes the result | Real reserve case content |
| 9 | Generate/freeze Second Expert 4-case subset | deterministic Second Expert planned subset (CLEAR 2 + AMBIGUOUS 2) | Synthetic run of Protocol §6's exact algorithm: 256-bit seed, `SHA-256(seed \|\| case_id)`, ascending sort per stratum, first-2-per-stratum selection, frozen before Gold; a re-run with the same seed/fixtures must reproduce the identical selection (determinism check) | Real Second Expert availability/participation |
| 10 | Freeze measurement contract | measurement preregistration/freeze | The full Protocol §16 metric contract (median/P90 timing, context-insufficiency, taxonomy escape, directional agreement, core-field usefulness, candidate thresholds) is loaded and frozen before any synthetic "Gold" is rehearsed; a post-freeze mutation attempt is rejected | Whether the preregistered thresholds are the *right* thresholds — that remains a Product hypothesis (Protocol §16: "thresholds are hypotheses, not automatic decision rules") |
| 11 | Freeze software/schema/protocol revision | software/schema/protocol/fixture/gate hashing | Same hashing gate as step 1, extended to also cover schema and gate-definition versions | N/A |
| 12 | Verify access/retention/deletion paths | retention/deletion receipts including unused reserve | Synthetic retention windows and deletion receipts (raw-audio 72h grace period per Protocol §11, unused-reserve deletion at replacement-window close per Protocol §5) are exercised and receipts are produced | Real storage/deletion infrastructure behavior |
| 13 | Verify local transcription | local transcription via LocalTranscriptionPort | `LocalTranscriptionPort.isAvailable()` and `.transcribe()` are exercised against non-personal synthetic audio (D036) | Real transcription quality/accuracy on real speech |
| 14 | Verify external STT fallback remains blocked unless all permit conditions are satisfied | external egress default BLOCK | A synthetic external-egress request without a satisfied permit chain is rejected `BLOCKED`; a synthetic request WITH every Protocol §12 condition satisfied (as a positive-path rehearsal) is checked against the `EXTERNAL_EGRESS` Policy & Rights action | Whether any real external provider/destination is actually approved — none is approved by this scope |

Steps 15–20 (execution) are not "pre-execution" but their **structural mechanics** are rehearsed by additional gates listed in Section 13 below (freeze immutability, timing/pause/interruption contract, withdrawal/future-use invalidation) using the same synthetic-only discipline — this spec explicitly extends coverage there because a readiness harness that only rehearses steps 1–14 and ignores the freeze-immutability and withdrawal mechanics of steps 15–20 would miss exactly the failure modes (silent redraw, silent threshold repair) the Protocol spends the most words guarding against.

## 13. Minimum mandatory dry gates

Every gate below is **mandatory** for `readiness_verdict=DRY_READY` (D029) unless explicitly marked optional. Gate IDs are illustrative; exact naming is C11.

| Gate ID (illustrative) | Rehearses | Negative paths explicitly covered |
| --- | --- | --- |
| `simulated-only-input` | Correction 7 / D025 | Structural allowlist: rejects any fixture reference that is not an explicitly versioned, repository-bundled/allowlisted synthetic fixture identifier; refuses arbitrary filesystem/VOD/media paths, URL input, user-uploaded media, free-form real-source references, and any `DataOrigin=REAL` value; an unknown/unregistered fixture identifier is rejected, fail-closed |
| `evidence-anti-promotion` | PLAN 1A §3/§12 invariant 7, D023 | No SELF-BENCHMARK/synthetic result can self-promote to `EvaluationMode=ACTUAL_TEST`; reuses `foundation/`'s existing `selfPromoteToActualTest()`/`validateEvidenceRecord()` |
| `consent-guardian-assent-rehearsal` | Protocol §17, §22–26 | Ambiguous-expression pause/reconfirm path; guardian refusal overrides nothing; a clear participant refusal is not overridden by guardian consent |
| `source-rights-rehearsal` | Protocol §3–4 | Forbidden-source rejection (arbitrary scraping, unconsented Pilot VOD, forced source ratios) |
| `second-expert-qualification-rehearsal` | Protocol §8 | `INSUFFICIENT EVIDENCE` and `NOT ELIGIBLE` paths; Founder cannot unilaterally approve |
| `main10-composition-freeze` | Protocol §2 | Post-freeze reclassification attempt rejected during selection/freeze (pre-Gold); separately, after synthetic Gold rehearsal, the ≥2 OPTIMAL/ACCEPTABLE positive-quality condition is checked post hoc (never as a pre-selection eligibility gate) and a shortfall records `COMPOSITION_CONDITION_FAILED` without case-swap/reselection |
| `reserve3-allocation-freeze` | Protocol §5 | Correct stratum-sort tie-breaking; freeze-before-Gold enforcement |
| `reserve-replacement` | Protocol §5, §21 | **Same-stratum reserve replacement before measurement freeze** (accepted path); **`REPLACEMENT_UNAVAILABLE`** when no same-stratum reserve exists; **no result-driven redraw/reselection after measurement freeze** (rejected path); **unused-reserve deletion receipt at replacement-window close** |
| `second-expert-planned-subset` | Protocol §6 | Deterministic reproducibility (same seed ⇒ same selection); no redraw after Founder Gold/AI output/availability/expected disagreement |
| `freeze-immutability` | Protocol §2, §6, §16 | Any post-freeze mutation attempt (composition, subset, measurement contract) is rejected, not silently allowed |
| `measurement-preregistration-freeze` | Protocol §16 | Full metric contract frozen before Gold; post-freeze mutation rejected |
| `software-schema-protocol-fixture-gate-hashing` | Protocol §29 step 1/11, D034 | All required hashes computed, frozen, and included in `frozenHashes` |
| `timing-pause-interruption-contract` | Protocol §15 | Manual pause/resume controls active time; automatic focus/inactivity signals are flags only, never silent timer rewrites; incomplete/invalid timing excluded from aggregation and disclosed |
| `withdrawal-future-use-invalidation` | Protocol §20–21, §28 | Withdrawal invalidates eligibility, permits, pending jobs/caches; **post-freeze withdrawal denominator/limitation handling** (adjusted/reported, not silently dropped) |
| `retention-deletion-receipts` | Protocol §11, §18, §19, §24 | Raw-audio 72h grace + deletion receipt; unused-reserve deletion receipt; full-VOD deletion-after-Gold receipt (rehearsed) |
| `foundation-policy-rights-integration` | PLAN 1A §5–7, Protocol §28 | Permit issuance + execution-time revalidation for every protected action; unauthorized/revoked actor denied; withdrawn permit denied |
| `local-transcription-port` | Protocol §12, D036 | `LOCAL_TRANSCRIPTION_UNAVAILABLE` when no qualifying adapter; successful synthetic transcription when one is present |
| `external-egress-default-block` | Protocol §12, D036 | External STT never an automatic fallback; blocked unless every permit condition is synthetically satisfied |
| `canonical-provenance-anti-promotion` | D023, D024, Correction 1 | Every artifact carries `EvaluationMode=SELF_BENCHMARK, DataOrigin=SIMULATED`; `readiness_verdict` never substitutes for `ExecutionStatus` |
| `metric-computation-contract` | Protocol §16 | Median/nearest-rank P90, context-insufficiency numerator/denominator, taxonomy escape, directional-agreement eligibility/coverage, field-usefulness counting, raw denominator preservation, UNKNOWN/null never treated as zero — all checked against preregistered fixtures with known-correct expected outputs (D035: synthetic *values* are non-evidentiary, but the *computation* is gated for correctness) |
| `stale-run-detection` | D034 | A run whose frozen hashes no longer match current canonical state reports current readiness as `BLOCKED / STALE_RUN` |
| `end-to-end-synthetic-rehearsal` | All of the above | A single full run exercising every gate above in dependency order against one complete synthetic scenario, producing one `ReadinessRun` artifact |

## 14. Acceptance criteria

This design is correctly implemented (in a later, separately authorized implementation) when:

1. Every gate in Section 13 exists, is independently testable, and its negative paths (explicitly listed) are covered by genuine TDD RED-before-GREEN tests.
2. A `DRY_READY` verdict is achievable only when every mandatory gate is `PASS`; flipping any single mandatory gate to `FAIL`/`UNKNOWN`/`NOT_EXECUTED` flips the verdict to `BLOCKED` (a mutation-style test proves this, matching this repository's established `collectTeamOsSemanticChecks`-style "exactly one thing flips" discipline).
3. No code path anywhere in `readiness/` can produce or accept `DataOrigin=REAL` or `EvaluationMode=ACTUAL_TEST`.
4. `readiness/` never imports from or duplicates PR #5's code; any behavioral similarity is independently reimplemented and reviewable as such.
5. `readiness/` adds zero new exported symbols to `foundation/`'s public API surface.
6. The CLI's JSON output is stable/versioned enough that Section 13's gate IDs and reason codes are machine-parseable across runs.
7. A stale run is detected and reported as `BLOCKED / STALE_RUN`, not silently treated as still current.
8. Every retained run artifact (both `DRY_READY` and `BLOCKED`) is git-committed, immutable, and never overwritten to improve appearance.

## 15. Test strategy

- **Deterministic properties → automated tests** (D030): hashing, freeze/immutability enforcement, reserve-allocation stratum sorting, Second Expert seeded-selection reproducibility, metric-computation formulas — all pure or near-pure logic, tested with `node:test` against fixtures with known-correct expected outputs, following this repository's established genuine-RED-before-GREEN TDD discipline (see `foundation/`'s own test suite for the established pattern).
- **Operational flows → synthetic scenario rehearsal + checklist** (D030): consent/guardian/assent, source-rights, Second Expert qualification — tested as state-machine scenarios with synthetic actors, asserting the *workflow* transitions correctly (including every explicitly listed negative path), never asserting anything about real eligibility.
- **Integration surface**: `foundation/`'s `InMemoryPolicyRightsGate`/`DurableJob`/`AtomicCommandGate` are exercised through their existing public contract only — no `foundation/` internals are reached into or duplicated.
- Exact commands (proposed, to be confirmed by the implementation plan): `npm ci`, `npm run typecheck`, `npm test` inside `readiness/`, plus a `readiness run --scenario <fixture-set>` smoke invocation whose JSON output is itself asserted against in a test.
- No test in this suite may claim `EvaluationMode=ACTUAL_TEST` for anything; a checker-style guard (analogous to `scripts/check-operating-docs.mjs`'s existing anti-promotion checks) is anticipated as part of the later implementation, not this design document.

## 16. Evidence boundaries

- **SELF-BENCHMARK / static (`DataOrigin=SIMULATED`), verifiable now by a later implementation without any ACTUAL TEST:** every gate in Section 13, every row of the Section 12 traceability matrix, all deterministic-property tests, all operational-flow scenario rehearsals.
- **Requires ACTUAL TEST (`DataOrigin=REAL`, approved consented/independent-expert method) before any reliance, and is explicitly NOT produced by this harness under any circumstance:** actual consent validity, actual guardian verification, actual Second Expert qualification of a real person, actual source rights to real VOD, actual transcription accuracy on real speech, actual timing/agreement/context-sufficiency values as Product-quality evidence (D035 — synthetic metric *values* never satisfy candidate thresholds and never become Product-quality evidence, even when the *computation* that produced them is gated for correctness).
- `ACTUAL TEST = NOT YET TESTED` remains true regardless of any `DRY_READY` verdict this harness ever produces. Expert usability and coaching effectiveness remain NOT TESTED, unaffected by this scope entirely.

---

## Appendix A — Decision index (D025–D037)

See [Decisions](../../DECISIONS.md) for the authoritative locked text. Summary for navigation only:

| ID | One-line summary |
| --- | --- |
| D025 | A1 Dry Readiness only — no REAL execution of any kind |
| D026 | B1 Synthetic-only readiness harness — no REAL-data entry point |
| D027 | C1 PR #5 read-only reference — no merge/rebase/cherry-pick/modification/closure |
| D028 | D1 Separate `readiness/` package above `@decode/foundation` |
| D029 | E1 All-or-blocked readiness verdict |
| D030 | F1 Hybrid evidence gate: deterministic → automated tests; operational → rehearsal + checklist |
| D031 | G1 CLI + machine-readable JSON, no UI |
| D032 | H1 Sanitized Git evidence only |
| D033 | I1 Retain every valid completed dry run, immutable history |
| D034 | J1 Latest valid canonical run determines current readiness; stale ⇒ BLOCKED |
| D035 | K1 Synthetic metric values are non-evidentiary; only computation correctness is gated |
| D036 | L1 Readiness core TypeScript/Node + provider-neutral `LocalTranscriptionPort`; no STT engine locked |
| D037 | Dry Readiness execution-status mapping — canonical `ExecutionStatus`/`readiness_verdict` correspondence, never collapsed into one enum |

## Appendix B — Corrections addressed (Product pre-spec audit)

1. `readiness_verdict` vs. canonical `ExecutionStatus` — Section 3.1.
2. Gold/Blind/Second-Expert = synthetic rehearsal only, not production workflow — Section 2 (Non-goals).
3. Negative paths (reserve replacement, `REPLACEMENT_UNAVAILABLE`, no redraw, unused-reserve deletion, post-freeze withdrawal handling) — Section 13, `reserve-replacement` and `withdrawal-future-use-invalidation` gates.
4. Protocol pre-execution steps 1–14 traceability matrix — Section 12.
5. Local transcription dry verification — Section 12 step 13, Section 13 `local-transcription-port` gate.
6. Consent/rights/qualification artifacts are templates/rehearsals only — Section 7.
7. No real personal data or VOD anywhere in the dry harness — Section 7, Section 13 `simulated-only-input` gate.

## Appendix C — Round-2 corrections addressed (Product's fresh review of PR #17 head `966ad18893cb0a8450ad3f63ed8a04c08a52740e`)

1. Invalid run-ID contract (spec previously implied `foundation/` gains a `"readiness"` ID namespace) — corrected in Section 3.2/3.4: `readiness/` owns its own run-ID contract; `generateId` removed from the illustrative `foundation/` imports.
2. Positive-quality composition timing (spec previously implied the ≥2 OPTIMAL/ACCEPTABLE condition is checked at selection/freeze time) — corrected in Section 12 row 7 and the Section 13 `main10-composition-freeze` gate: the condition is evaluated only after synthetic Gold rehearsal, never as a pre-selection eligibility gate.
3. Structural SIMULATED-only input boundary (spec previously used heuristic "looks like it could be real" language) — corrected in Section 7 and the Section 13 `simulated-only-input` gate: a structural allowlist of versioned, repository-bundled fixture identifiers, fail-closed on any unregistered identifier.
4. Unmerged-PR provenance — corrected in `docs/CURRENT_STATUS.md`: distinguishes canonical `main` (unaffected until PR #17 merges) from PR #17 as a reviewed proposal/spec-review branch, records the REVISE verdict on the prior head, and states the corrected head awaits fresh Product review.
5. Reverse handoff — `handoff/CODEX_TO_CHATGPT.md` updated for this correction round with the required eight headings, precise about documentation-only scope and no fabricated implementation evidence.
6. Internal section references — audited and fixed throughout (several places incorrectly said "Section 8" for what is actually Section 13's gate list, or an unqualified "Section 4"/"Section 14/15" that actually meant a different section of this document or of PLAN 1A).
7. Dependency wording — Section 3.2 and Section 8 (External dependencies) reworded to "repository-local dependency; exact workspace/`file:` linking mechanism is a C11 implementation detail," matching Section 11's already-unresolved status instead of contradicting it.
8. Pending execution-log timestamp — final structure (reconciled across this correction round and a subsequent audit-trail correction): the historical `2026-09-08T03:00:00+09:00` row is preserved unchanged in `experiments/ai_execution_log.pending.csv`, exactly as originally written, including its own now-superseded "accurate timestamp" self-description. A separate clarification event is appended at `2026-09-08T23:31:28+09:00` — the independently Git-verified commit timestamp of the correction round `2026-09-08T03:00:00+09:00` describes — explaining that the earlier row's timestamp self-description was itself a locally-assigned estimate, not a verified system-clock capture, and recording the real correction-completion time. No historical row is ever rewritten in place; corrections are always appended as new, separately timestamped events.
9. Checker coverage — see `scripts/check-operating-docs.mjs` / `scripts/check-operating-docs.semantic.test.mjs` change notes in this commit for whether a new semantic check was warranted.
10. D025–D036 preserved in force; D037 added as the next sequential decision (Section 3.1, Appendix A).

# DECODE Project Operating Manual (Stage 1 DRAFT)

Version: 0.2-DRAFT | Updated: 2026-09-06 | Owner: Product/Business Lead and AI/Engineering Lead
Status: DRAFT SCAFFOLD / NOT ACTIVE — this document does not route or govern any task in Stage 1
Scope: proposed single top-level router for all roles and tools working in this repository, if activated in a later stage
Authority: NONE. This is a Team OS Stage 1 proposal; it does not reconcile, supersede, or create an operating requirement. If activated, activation would require a Stage 2 decision record in [Decisions](DECISIONS.md) and, for any root-level tool router (e.g. a possible future `CLAUDE.md`), confirmation that existing policies have been reconciled first. No existing router currently points here.

This document describes a proposed shape for a future single entry point, so it can be reviewed before any activation decision. Until activated, existing active policies continue to govern: `AGENTS.md`, `docs/AI_OPERATING_POLICY.md`, `docs/DEVELOPMENT_RULES.md`, `docs/DOCUMENTATION_RULES.md`, `docs/GRAPHICS_RULES.md`, `docs/PUBLICATION_POLICY.md`, `docs/CURRENT_STATUS.md`, `docs/DECISIONS.md`, and the applicable `handoff/` documents remain the operative sources, unchanged by this proposal.

## If activated: intended read order for any task

1. This manual.
2. `docs/AI_OPERATING_POLICY.md` — activation/authority, Google bindings, logging contract.
3. `docs/CURRENT_STATUS.md` — current phase, evidence status, next gate.
4. `docs/DECISIONS.md` — the decision register; check for a LOCKED/LOCK CANDIDATE entry before assuming scope.
5. The applicable handoff under `handoff/` for the specific task in flight.
6. `docs/COLLABORATION_RULES.md` (also DRAFT SCAFFOLD / NOT ACTIVE — see that file) if more than one AI role/tool touches the same task or branch.
7. `docs/DEVELOPMENT_RULES.md`, `docs/DOCUMENTATION_RULES.md`, `docs/GRAPHICS_RULES.md` for the affected work type.
8. `docs/templates/README.md` when producing a new brief, plan, spec, decision record, test-evidence report, change report, or handoff — after activation, these would become the preferred starting structure rather than an inert reference.

## If activated: intended roles

- **Product/Business Lead** — owns `docs/DECISIONS.md`, `docs/PROJECT_BRIEF.md`, `docs/PRODUCT_SPEC.md`; approves LOCKED status; final ACTUAL TEST approval authority under D019.
- **AI/Engineering Lead** — implements within LOCKED scope; may be filled by more than one AI tool depending on the task, per whatever collaboration contract a later stage locks in `docs/COLLABORATION_RULES.md`.
- **Product/Research (one gate ahead)** — under D017, may prepare the next verification gate at most one gate ahead of Engineering; may not promote candidates or authorize execution.

## Evidence model this manual would require once active

This repository's evidence discipline keeps three independent dimensions separate. They must never be collapsed into one combined enum such as "ACTUAL TEST / SELF-BENCHMARK / SIMULATED / NOT TESTED / FAILED" — that conflates evaluation mode, data origin, and execution status.

| Dimension | Values |
| --- | --- |
| Evaluation purpose/mode | ACTUAL TEST · SELF-BENCHMARK · N/A (the artifact is not an evaluation) |
| Data origin | REAL · SIMULATED · UNKNOWN |
| Execution status | NOT TESTED · RUNNING · PASSED · FAILED · BLOCKED |

ACTUAL TEST evidence requires the approved real/consented VOD plus independent-expert method; its data origin is REAL. Synthetic, mock, or reconstructed material is SIMULATED, and SIMULATED material is never folded into an ACTUAL TEST run, denominator, or claim — it does not belong inside the same ACTUAL TEST run as a "control condition." If a synthetic or control fixture is evaluated, it is recorded separately as its own row: Evaluation purpose/mode = SELF-BENCHMARK, Data origin = SIMULATED, Execution status = whatever actually occurred. A future design that mixes real and synthetic material inside one ACTUAL TEST is not currently approved and would require its own Product decision/protocol amendment before use.

"NOT YET TESTED" is explanatory prose for the specific combination Evaluation purpose/mode = ACTUAL TEST and Execution status = NOT TESTED — it is not a sixth execution-status value. A passed software/static check (Execution status = PASSED, Evaluation purpose/mode = SELF-BENCHMARK or N/A) never becomes ACTUAL TEST evidence by being labeled PASSED.

`ACTUAL TEST = NOT YET TESTED` remains true for the DECODE product until a real, consented, independently-run test exists under the approved method; no document in this repository may claim otherwise.

## Publication and branch discipline (existing, already active — unaffected by this proposal's draft status)

`main` is the single source of truth ([Publication Policy](PUBLICATION_POLICY.md)). `docs/PUBLICATION_FILES.json` is the exact inventory of files in scope for the public operating foundation; `scripts/check-operating-docs.mjs` enforces it. This proposal's own files are registered in that inventory as inert additions (Stage 1); the checker does not assert any structure on them beyond the generic checks every inventoried file receives. Asserting structure on these files, and wiring any router to point at them, would be later-stage work, not part of this proposal.

## Decision gate (existing, already active)

Material unresolved Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost decisions go through the one-decision-at-a-time interview in D017 before lock or implementation. This proposal, in its current DRAFT SCAFFOLD state, does not itself lock any such decision and does not change who decides what.

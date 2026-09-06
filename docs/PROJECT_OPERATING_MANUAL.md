# DECODE Project Operating Manual

Version: 1.0 | Updated: 2026-09-06 | Owner: Product/Business Lead and AI/Engineering Lead
Status: ACTIVE OPERATING POLICY | Scope: single top-level router for all roles and tools working in this repository
Authority: D021 / U-DECODE-TEAM-OS-2026-09-06 in [Decisions](DECISIONS.md)

This manual is the canonical repository task router. `AGENTS.md` (Codex) and `CLAUDE.md` (Claude Code) are thin tool-specific routers that point here; policy content lives in this manual and the documents it routes to, not duplicated per tool.

## Required read flow

1. This manual.
2. [Current Status](CURRENT_STATUS.md).
3. [Decisions](DECISIONS.md).
4. The current applicable handoff under `handoff/`.
5. The applicable approved task-specific Spec / Plan, if one exists for the work at hand (e.g. PLAN 1A Canonical Foundation).
6. [Collaboration Rules](COLLABORATION_RULES.md).
7. [AI Operating Policy](AI_OPERATING_POLICY.md), [Development Rules](DEVELOPMENT_RULES.md), [Documentation Rules](DOCUMENTATION_RULES.md), [Graphics Rules](GRAPHICS_RULES.md), [Publication Policy](PUBLICATION_POLICY.md) as relevant to the affected work.
8. The matching template in [docs/templates/](templates/README.md) when creating a maintained artifact.

## Precedence

From highest to lowest:

1. Host/System/Developer safety and actual permissions.
2. Direct current user/Product approval.
3. LOCKED decisions in [Decisions](DECISIONS.md).
4. An approved task-specific Spec / Plan / Handoff.
5. This Project Operating Manual.
6. [Collaboration Rules](COLLABORATION_RULES.md).
7. Domain operating policies (Development/Documentation/Graphics/AI Operating/Publication Policy).
8. Tool/router defaults (`AGENTS.md`, `CLAUDE.md`).

A stricter approved task contract always wins over a more permissive default below it. PLAN 1A is the standing example: its Whole-PR verification contract overrides the ordinary Team OS PR-optional defaults in Collaboration Rules for that work.

## Roles

- **Product/Business Lead** — owns [Decisions](DECISIONS.md), [Project Brief](PROJECT_BRIEF.md), [Product Spec](PRODUCT_SPEC.md); approves LOCKED status; final ACTUAL TEST approval authority under D019.
- **AI/Engineering Lead** — implements within LOCKED scope; may be filled by a human developer, Codex, Claude Code, or another approved AI development tool for a given task, per [Collaboration Rules](COLLABORATION_RULES.md). Codex and Claude Code do not create competing project state — both read and write the same `docs/`, `handoff/`, and Git history.
- **Product/Research (one gate ahead)** — under D017, may prepare the next verification gate at most one gate ahead of Engineering; may not promote candidates or authorize execution.

## Evidence model

This repository's evidence discipline keeps three independent dimensions separate. They must never be collapsed into one combined enum such as "ACTUAL TEST / SELF-BENCHMARK / SIMULATED / NOT TESTED / FAILED."

| Dimension | Values |
| --- | --- |
| Evaluation purpose/mode | ACTUAL TEST · SELF-BENCHMARK · N/A (the artifact is not an evaluation) |
| Data origin | REAL · SIMULATED · UNKNOWN |
| Execution status | NOT TESTED · RUNNING · PASSED · FAILED · BLOCKED |

ACTUAL TEST requires the approved real/consented VOD plus independent-expert method; its data origin is REAL. Synthetic, mock, or reconstructed material is SIMULATED, and SIMULATED material is never folded into an ACTUAL TEST run, denominator, or claim as a "control condition." A synthetic or control fixture evaluated alongside real material is recorded separately: Evaluation purpose/mode = SELF-BENCHMARK, Data origin = SIMULATED, Execution status = whatever actually occurred. A design that mixes real and synthetic material inside one ACTUAL TEST is not currently approved and would require its own Product decision/protocol amendment before use.

"NOT YET TESTED" is explanatory prose for the specific combination Evaluation purpose/mode = ACTUAL TEST and Execution status = NOT TESTED — it is not a sixth execution-status value. A passed software/static check (Execution status = PASSED, Evaluation purpose/mode = SELF-BENCHMARK or N/A) never becomes ACTUAL TEST evidence by being labeled PASSED.

`ACTUAL TEST = NOT YET TESTED` remains true for the DECODE product until a real, consented, independently-run test exists under the approved method; no document in this repository may claim otherwise.

## Publication and integration discipline

`main` is the single source of truth ([Publication Policy](PUBLICATION_POLICY.md)). `docs/PUBLICATION_FILES.json` is the exact inventory of files in scope for the public operating foundation; `scripts/check-operating-docs.mjs` enforces it. Integration method (direct-main, branch-only, or PR) follows [Collaboration Rules](COLLABORATION_RULES.md) C1–C5 and C6's minimum/full verification split, subject to any stricter task-specific contract.

## Decision gate

Material unresolved Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost decisions go through the one-decision-at-a-time interview in D017 before lock or implementation. This manual does not itself lock any such decision.

# DECODE Project Operating Manual

Version: 0.1 | Updated: 2026-09-06 | Owner: Product/Business Lead and AI/Engineering Lead
Status: ACTIVE OPERATING POLICY | Scope: single top-level router for all roles and tools working in this repository
Authority: reconciles existing rule documents under U-PUBLIC-2026-09-02 and U-DECODE-OPERATING-2026-09-06 in [Decisions](DECISIONS.md); introduces no new product/architecture decision.

This manual is the one place to start. Tool-specific routers (`AGENTS.md` for Codex, `CLAUDE.md` for Claude Code) point here instead of duplicating policy. If a tool-specific router and this manual conflict, this manual wins; fix the router.

## Read order for any task

1. This manual.
2. `docs/AI_OPERATING_POLICY.md` — activation/authority, Google bindings, logging contract.
3. `docs/CURRENT_STATUS.md` — current phase, evidence status, next gate.
4. `docs/DECISIONS.md` — the decision register; check for a LOCKED/LOCK CANDIDATE entry before assuming scope.
5. The applicable handoff under `handoff/` for the specific task in flight.
6. `docs/COLLABORATION_RULES.md` if more than one AI role/tool touches the same task or branch.
7. `docs/DEVELOPMENT_RULES.md`, `docs/DOCUMENTATION_RULES.md`, `docs/GRAPHICS_RULES.md` for the affected work type.
8. `docs/templates/README.md` when producing a new brief, plan, spec, decision record, test-evidence report, change report, or handoff — use the matching template instead of inventing structure.

## Roles

- **Product/Business Lead** — owns `docs/DECISIONS.md`, `docs/PROJECT_BRIEF.md`, `docs/PRODUCT_SPEC.md`; approves LOCKED status; final ACTUAL TEST approval authority under D019.
- **AI/Engineering Lead** — implements within LOCKED scope; may be filled by either Codex or Claude Code in a given task, never both unsupervised on the same branch at once (see [Collaboration Rules](COLLABORATION_RULES.md)); reports through `handoff/CODEX_TO_CHATGPT.md` regardless of which tool authored the report.
- **Product/Research (one gate ahead)** — under D017, may prepare the next verification gate (e.g. the ACTUAL TEST protocol) at most one gate ahead of Engineering; may not promote candidates or authorize execution.

## Evidence discipline (applies everywhere)

Every status claim in this repository — code, docs, reports — uses the evidence contract in [Documentation Rules](DOCUMENTATION_RULES.md) DOC-03: ACTUAL TEST / SELF-BENCHMARK / SIMULATED / NOT TESTED / FAILED, never collapsed into a generic PASS. `ACTUAL TEST = NOT YET TESTED` until a real, consented, independently-run test exists; no document in this repository may claim otherwise.

## Publication and branch discipline

`main` is the single source of truth ([Publication Policy](PUBLICATION_POLICY.md)). Work happens on scoped branches named for their purpose, opens a PR against `main`, and is never auto-merged. `docs/PUBLICATION_FILES.json` is the exact inventory of files in scope for the public operating foundation; `scripts/check-operating-docs.mjs` enforces it. Adding, removing, or restructuring a routed document requires updating both the inventory and, if the checker asserts structure on that file (required headings, rule-ID counts, evidence-label presence), the checker itself, in the same reviewed change — an inventory or structural change without the matching checker/contract update is incomplete.

## Decision gate

Material unresolved Product/Architecture/Data/AI-Eval/Security-Rights/Scope-Cost decisions go through the one-decision-at-a-time interview in D017 before lock or implementation — this applies equally whether the requesting or implementing side is Codex, Claude Code, or the user working directly. This manual and its reconciled documents do not themselves lock any such decision; they route to where locked decisions already live.

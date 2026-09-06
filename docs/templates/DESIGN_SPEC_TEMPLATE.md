# Design Spec — [component / interface name]

Template Version: 1.0 | Updated: 2026-09-06 | Owner: AI/Engineering Lead
Status: ACTIVE TEMPLATE
Scope: skeleton for architecture/interface design of a component before it is implemented
Authority: D021 / U-DECODE-TEAM-OS-2026-09-06

Instance fields (fill in when using this template):

Owner: AI/Engineering Lead | Date: [ISO-8601] | Status: [DRAFT | REVIEWED | LOCKED]
Authority: [decision ID(s) this design implements — STOP and route through D017 if a material design choice depends on an unresolved one]

## Scope

[What this component/interface is responsible for]

## Non-goals

[What this explicitly does not do, even if adjacent]

## Interfaces / contracts

[Public contract: types, ports, function signatures, API shape — enough for an implementer to start without re-deciding design]

## Data flow

[How data moves through this component: inputs, transformations, outputs — a diagram description is fine if no diagram tool is available]

## State / error states

[What states this component can be in, and every error/failure state it must handle explicitly — not "appropriate error handling," the actual states]

## Persistence

[What is stored, where, retention policy, and what is explicitly NOT persisted — or N/A with reason]

## Security / rights / privacy / egress

[Auth boundary, what data may leave the system and to where, consent/rights basis for any personal or third-party data touched — or N/A with reason if this component touches none of these]

## External dependencies

[Libraries, services, APIs this relies on, and their version/stability constraints]

## Migration / compatibility

[What existing data/behavior this must remain compatible with, and the migration path if it changes a stored format — or N/A with reason if this is greenfield]

## Alternatives considered

[Briefly, what else was considered and why this was chosen — not exhaustive, just enough to avoid relitigating]

## Unresolved decisions

- [ ] [Anything not yet LOCKED that this spec depends on — route material ones through D017]

## Acceptance criteria

[Specific, checkable conditions that mean this design is correctly implemented]

## Test strategy

[How this will be verified: unit/integration boundaries, exact commands where known]

## Evidence boundaries

[Which parts of verifying this design can be SELF-BENCHMARK/static (Data origin may be SIMULATED), and which parts require an ACTUAL TEST (Data origin = REAL, approved consented/independent-expert method) before reliance. Keep Evaluation purpose/mode, Data origin, and Execution status separate; never mix SIMULATED material into an ACTUAL TEST run.]

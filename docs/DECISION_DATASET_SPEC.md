# Decision Case Dataset Specification

Version: 0.1 candidate contract | ACTUAL TEST: NOT YET TESTED

## LOCKED philosophy

One case represents one primary decision, not a whole round or a bag of errors. Preserve evidence → context → trigger → observed decision → expert verdict → preferred decision → principle → expert reason → severity/confidence → outcome/causality. A kill or win does not prove decision quality. Unknown information remains unknown; do not infer unseen comms, intent, enemy positions, or counterfactual outcomes.

Initial families: Fight Selection; Post-contact Decision; Tradeability & Spacing. Optional acceptable alternatives preserve multiple reasonable choices. Rank affects coaching presentation, not the truth of an observed event. Preserve provenance, consent scope, patch and schema version. Do not use synthetic cases as expert-labeled training/evaluation data.

## System/operator metadata — candidate implementation requirements

Case ID; source VOD ID; anonymous player ID; clip start/end and decision timestamp; map/agent/rank bucket/patch; schema version; source type; consent status and restricted consent reference. Record actual/ synthetic origin separately from evaluation mode and execution status. Missing values need explicit null/unknown semantics, not invented defaults.

Timestamps must specify units/time base; clip start < decision timestamp < clip end is a candidate validation rule with boundary handling to approve. Personal identifiers and access-bearing URLs must not appear in public fixtures/logs.

## LOCK CANDIDATE — eight expert fields

| # | Field | Candidate contract |
| --- | --- | --- |
| 1 | Trigger | Core event prompting the decision |
| 2 | Observed Decision | What the player actually chose |
| 3 | Verdict | OPTIMAL / ACCEPTABLE / SUBOPTIMAL / ERROR / UNCERTAIN / INSUFFICIENT_CONTEXT |
| 4 | Preferred Decision | Better/acceptable choice; same as observed may be valid for OPTIMAL |
| 5 | Decision Principle | Seed principle or OTHER / NEW_PRINCIPLE_NEEDED / MULTIPLE_PRINCIPLES |
| 6 | Expert Reason | Evidence-grounded explanation, normally 1–3 sentences |
| 7 | Severity | LOW / MEDIUM / HIGH / CRITICAL; applicability for non-error/unknown verdicts is unresolved |
| 8 | Confidence | LOW / MEDIUM / HIGH / VERY_HIGH; no calibrated numeric conversion claimed |

UNCERTAIN means judgment remains ambiguous despite available evidence; INSUFFICIENT_CONTEXT identifies missing evidence needed to judge. Neither is automatically an error or a failed case. Exact operational boundaries require expert validation.

Conditional candidates: uncertainty reason (missing enemy/team information, missing comms, multiple valid options, video quality, other); missing-context note; acceptable alternative action and reason. Preferred decision and severity must not force invented judgments when evidence is insufficient. The final nullability/enum rules remain unapproved.

Timing, difficulty (1–5), and missing-field feedback are separate research instrumentation, not silently counted as part of the eight expert fields. Measure their added burden. Trigger vs. operator `trigger_event` duplication is a known question for the stress test.

## LOCK CANDIDATE — context

- Core: `side`, `alive_state`, `round_phase`, `spike_state`, `location`, `trigger_event`.
- Extended, only when relevant: `time_remaining`, `economy_state`, `known_enemy_info`, `teammate_support`, `utility_state`.
- Record provenance/unknowns for operator-prefilled values. Distance alone cannot establish tradeability; line of sight, obstacles, timing and support matter. A time-critical case may require an Extended field even though it is not universally mandatory.

## LOCK CANDIDATE — twelve seed principles

| Family | Candidate identifiers copied from P-ALPHA |
| --- | --- |
| Fight Selection | NUMBER_ADVANTAGE_PRESERVATION; DUEL_QUALITY; INFORMATION_ADVANTAGE; TIME_PRESSURE_RISK |
| Post-contact Decision | POST_KILL_REPOSITION; POST_CONTACT_RESET; VALUE_THEN_DISENGAGE; SPACE_CONVERSION |
| Tradeability & Spacing | TRADE_DISTANCE; SUPPORT_LINE_OF_SIGHT; SYNCHRONIZED_CONTACT; ISOLATION_AVOIDANCE |

OTHER and NEW_PRINCIPLE_NEEDED must remain available. MULTIPLE_PRINCIPLES needs an explicit storage rule; it is not a thirteenth seed. The stress-slot shorthand TRADEABILITY is a family concept, not an approved extra principle. Formal definitions and overlap arbitration are still required.

## Provenance and quality

Separate immediate outcome, round outcome, decision quality and causal attribution. Retain both experts' independent labels and adjudication history; do not average categorical disagreements. Multiple-valid decisions may be legitimate. GOLD/SILVER/DISPUTED/EXCLUDED quality tiers from planning are candidate rules only; no current record is GOLD.

## Implementation boundary

[data/schemas](../data/schemas/README.md) is reserved for versioned machine-readable schemas. [data/samples](../data/samples/README.md) is reserved for conspicuously SIMULATED fixtures. No JSON schema or records are created by this documentation setup; implement and test them through the first handoff. See [EXPERIMENT_PROTOCOL](EXPERIMENT_PROTOCOL.md) for evidence labels and execution gates.

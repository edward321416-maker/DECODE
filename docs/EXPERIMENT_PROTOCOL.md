# ③-A-1 — 10-Case Schema Stress Test

Protocol: 0.1 candidate | ACTUAL TEST: NOT YET TESTED | Owner: Product/Business Lead
Status: **HISTORICAL CANDIDATE SUMMARY / SUPERSEDED FOR EXECUTION** — reconciled under D018 during Team OS Stage 2.

**This document is not an executable protocol.** The sole current 10-Case execution/design authority is [10-Case ACTUAL TEST Protocol v1.0](superpowers/specs/2026-09-06-decode-10-case-actual-test-protocol-v1.md) (Q1–Q56). Where anything below — completion assumptions, measurement rules, reserve/replacement behavior, evidence scope, or the expert execution steps — differs from Q1–Q56, the version here MUST NOT be executed. Git history preserves this document's original 2026-09-02 candidate text unmodified at earlier commits; the tables below are retained only as historical context for the evidence-label vocabulary, sampling-slot design, and GO/STOP hypothesis framing that Q1–Q56 builds on. This is mechanical reconciliation of a superseded document, not a new protocol decision.

## Evidence labels — mandatory and separate from pass/fail

| Label | Meaning | Permitted claim |
| --- | --- | --- |
| ACTUAL TEST | Consented real VOD plus actual independent expert participation, provenance and measured execution evidence | Only the measurements actually collected; never automatically SUCCESS |
| SELF-BENCHMARK | Internal developer/model evaluation with a disclosed evaluator, method and inputs | Internal result only; not independent expert agreement |
| SIMULATED | Synthetic, mocked, reconstructed or illustrative inputs | Schema/tool behavior only; never real coaching validation |
| NOT YET TESTED | Required evaluation has not run | No metric or success claim |

Execution status is a separate field: NOT TESTED, RUNNING, PASSED, FAILED, or BLOCKED. The handoff heading NOT TESTED uses NOT YET TESTED as the explanatory state. If an internal benchmark uses synthetic data, record SELF-BENCHMARK as evaluation mode and SIMULATED as data origin. ACTUAL TEST is forbidden for that run. Missing measurements are null/unavailable, never zero. A documentation check belongs to operating setup, not ③-A-1 results.

## Entry requirements

Before ACTUAL TEST, obtain consented VOD references with permitted use, patch/source metadata, ten traceable clips, a primary expert, a second independent expert for four cases, a versioned runnable schema/tool, and an approved measurement protocol. Keep raw VOD, comms, identities, and consent evidence outside Git in restricted storage. No such run has been performed here.

Pre-register timing/pause rules, missing-data handling, P90 algorithm, agreement denominators and thresholds. Proposed conventions below are LOCK CANDIDATE; unresolved choices must not be silently converted into code defaults or success criteria.

## Sampling slots, not labeled examples

Six clear + four ambiguous; Fight Selection 4, Post-contact Decision 3, Tradeability & Spacing 3. S10 uses Tradeability as primary and may have a Post-contact secondary tag. Slots describe failure modes to seek, not predetermined verdicts. Hide slot expectations and AI suggestions from experts.

| Slot | Kind | Primary family | Selection target / question |
| --- | --- | --- | --- |
| S01 | Clear | Fight Selection | Same-angle re-engagement after number advantage; preserve advantage? |
| S02 | Clear | Fight Selection | Risky engagement under time pressure; is risk necessary? |
| S03 | Clear | Fight Selection | Wide swing with poor information; information vs duel quality? |
| S04 | Clear | Post-contact Decision | Reposition after first kill; can good decisions be expressed? |
| S05 | Clear | Post-contact Decision | Pursuit after value already gained; disengagement tradeoff? |
| S06 | Clear | Tradeability & Spacing | Genuinely tradeable synchronized contact; positive example? |
| S07 | Ambiguous | Fight Selection | Re-engage and disengage both reasonable; multiple-valid handling |
| S08 | Ambiguous | Post-contact Decision | POV omits enemy information; uncertainty vs missing context |
| S09 | Ambiguous | Tradeability & Spacing | Teammate close but wall/angle obstructs LOS; tradeability ambiguity |
| S10 | Ambiguous | Tradeability & Spacing | Missing teammate intent/comms; video-only limits |

## Execution — HISTORICAL, DO NOT EXECUTE (superseded by Q1–Q56)

The five steps below are the original 2026-09-02 candidate execution sequence, preserved for provenance only. Q1–Q56's rights-loss and planned-vs-completed semantics supersede this sequence, including its "second expert labels two clear and two ambiguous" reserve/replacement assumption and its implicit completion criteria. Do not execute these steps as written; use the current 10-Case ACTUAL TEST Protocol v1.0 instead.

1. ~~Select moments by observable situation, assign neutral candidate IDs, and record operator-prefilled context with unknowns. Do not force footage into a principle.~~
2. ~~Primary expert labels all ten independently without AI output. Automatically record annotation_started_at, annotation_submitted_at and annotation_duration_sec. Capture difficulty and missing-context feedback separately from core expert fields.~~
3. ~~Lock the primary labels. Second expert labels two clear and two ambiguous clips without seeing the primary labels or AI output. Preserve both sets and adjudication separately.~~
4. ~~Compute metrics only from recorded evidence. Report completion counts, invalid/missing durations, raw denominators, schema version and evaluator roles. Optionally compare AI output only after expert labels are locked; label that comparison SELF-BENCHMARK and disclose real/synthetic origin.~~
5. ~~Product reviews the six outputs below and records GO / REVISE / STOP. No automatic expansion to 50/150 cases.~~

## Measurement specification — LOCK CANDIDATE

- Median and P90 annotation duration: use valid primary-expert durations only; disclose exclusions. Candidate P90=nearest-rank sorted value at ceil(0.9*n), so 9th value when n=10. Record wall time and pauses separately; final pause policy requires approval.
- Context insufficiency, uncertainty, OTHER/NEW_PRINCIPLE, multiple-valid and requested-field rates: unique primary cases in numerator; disclose denominator and incomplete cases. Do not count two labels on one case twice.
- Exact verdict agreement: matching verdicts / completed independent pairs; report all categories.
- Directional agreement: positive={OPTIMAL, ACCEPTABLE}; negative={SUBOPTIMAL, ERROR}. UNCERTAIN/INSUFFICIENT_CONTEXT remain separate. Candidate denominator includes only pairs with positive/negative decisions; also report eligible-pair count / four planned pairs. Do not apply a 75% GO heuristic if coverage is incomplete.
- Report principle and preferred-action disagreements separately; no automatic semantic equivalence or averaged categorical label.

## GO / STOP hypotheses — NOT validated thresholds

P-STRESS GO candidates: median ≤5 min; P90 ≤8 min; insufficient context ≤20%; OTHER/NEW_PRINCIPLE ≤20%; at most one core field judged unnecessary; requested context converges to one or two fields; directional agreement ≥75% across the four fully assessable blind-review pairs. Four pairs provide warning signals, not statistical validation. "Most criteria" is not an executable gate: Product must approve the combination rule before a pass decision.

STOP/REDESIGN candidates: median >8 min; at least 4/10 cases lack context; pervasive expert disagreement; principles mostly OTHER; repeated failure to isolate one primary decision. Qualitative terms need an explicit review rubric. S07–S10 revealing legitimate uncertainty is informative, not intrinsically failure. Earlier Alpha-50 thresholds are not substituted for these ten-case criteria.

## Required real-run outputs

Ten traceable cases; timing report; schema failure log; taxonomy coverage report; blind expert disagreement report; Product GO/REVISE/STOP record. Every artifact must show evidence label, input provenance, run ID, protocol/schema version, date, evaluator, code commit or exact uncommitted snapshot hash, and limitations.

Log each run in [experiment_log.csv](../experiments/experiment_log.csv). That file is header-only at setup, deliberately containing no invented run. Store sanitized artifacts under [results](../experiments/results/README.md); keep ACTUAL TEST, SELF-BENCHMARK and SIMULATED paths distinct.

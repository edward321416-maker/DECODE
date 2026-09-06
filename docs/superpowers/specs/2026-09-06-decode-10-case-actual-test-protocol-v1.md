# DECODE — 10-Case ACTUAL TEST Protocol v1.0

**Status:** CHAT LOCKED / REPOSITORY MATERIALIZATION CANDIDATE
**Date:** 2026-09-06
**Owner:** Product/Business Lead
**Decision coverage:** Q1–Q56
**ACTUAL TEST:** NOT YET TESTED
**50/150 expansion:** NOT AUTHORIZED

## 0. Purpose and evidence boundary

The first 10-Case ACTUAL TEST asks:

> Can DECODE turn consented real VALORANT VOD into structured expert Decision Cases without losing expert intent, while keeping annotation effort, rights, provenance, disagreement, retention, and execution auditable?

This test does not establish:

- population representativeness;
- prevalence estimates;
- coaching effectiveness;
- model superiority;
- production readiness;
- 50/150-case scalability.

The selected sample is Founder-curated and therefore selection-biased by design.

Evidence labels remain separate:

- ACTUAL TEST
- SELF-BENCHMARK
- SIMULATED
- NOT YET TESTED

No real execution claim is permitted until consented real VOD plus actual expert execution has occurred.

## 1. Experimental unit

`1 Case = 1 Primary Decision`

Decision quality is separate from outcome.

The first test is intentionally outcome-aware expert VOD review, not an outcome-blind benchmark.

## 2. Main 10-case composition

Total main cases:

`10`

Clarity:

- CLEAR = 6
- AMBIGUOUS = 4

Primary family:

- Fight Selection = 4
- Post-contact Decision = 3
- Tradeability & Spacing = 3

Positive-quality condition:

- at least 2 Founder Gold verdicts must be OPTIMAL or ACCEPTABLE.

Positive outcome does not count as positive decision quality.

Founder assigns CLEAR/AMBIGUOUS at case-selection time and freezes it before Gold.

Do not reclassify clarity after seeing:

- Founder Gold;
- AI output;
- Second Expert disagreement;
- outcome interpretation.

If the frozen 10 cases produce fewer than 2 positive-quality cases, record `COMPOSITION_CONDITION_FAILED`. Do not swap cases after Gold to repair the count.

## 3. Source pool

Allowed source pool:

- Founder-owned / Founder-authorized VOD;
- explicitly consented Pilot-player VOD.

No Founder/Pilot source quota is imposed.

Forbidden:

- arbitrary public VOD scraping;
- Pilot VOD without the required rights/consent;
- forcing source ratios for presentation.

All source provenance is recorded.

## 4. Main-case selection

Founder directly and freely selects the 10 cases subject to the frozen composition constraints.

No selection rubric is required.

Interpretation limit:

`Founder-curated expert sample ≠ representative sample`

Do not use the 10-case set to estimate how frequently the identified behaviors occur in the broader player population.

## 5. Reserve pool

Before Gold begins, create a frozen reserve pool of 3 cases:

- CLEAR reserve = 2
- AMBIGUOUS reserve = 1

After the main 10 cases are frozen, allocate reserve coverage within each clarity group.

CLEAR allocation:

1. Count the 6 CLEAR main cases across Fight Selection, Post-contact Decision, and Tradeability & Spacing.
2. Sort the three CLEAR strata by `main_count` descending, then canonical `stratum_id` ascending.
3. Allocate one reserve to each of the top 2 CLEAR strata.

AMBIGUOUS allocation:

1. Count the 4 AMBIGUOUS main cases across Fight Selection, Post-contact Decision, and Tradeability & Spacing.
2. Sort the three AMBIGUOUS strata by `main_count` descending, then canonical `stratum_id` ascending.
3. Allocate one reserve to the top 1 AMBIGUOUS stratum.

This preserves the locked reserve composition `CLEAR 2 + AMBIGUOUS 1` while prioritizing the most-used family strata within each clarity group.

Founder selects a reserve case matching each allocated stratum. All reserve cases are frozen before Gold.

Reserve is used only when a main case becomes ineligible because of a rights/withdrawal/eligibility event before measurement freeze.

Replacement must match:

- same clarity;
- same primary family.

Do not use reserve cases to:

- repair positive-case count;
- improve thresholds;
- replace disagreement;
- replace difficult cases;
- improve AI results.

If no same-stratum reserve exists, record `REPLACEMENT_UNAVAILABLE`.

A replacement inherits the removed slot's experimental role. If the removed slot was assigned to Second Expert, the replacement becomes the assigned case for that slot.

After measurement freeze, do not introduce a new replacement based on already observed results. Apply withdrawal/deletion rules, report the denominator change/limitation, and do not retroactively optimize the sample.

Unused reserve cases are not promoted into Decision Dataset evidence. When the replacement window closes at measurement freeze, delete any unused reserve case evidence that is no longer required for another active source-review obligation and record the deletion receipt.

## 6. Second Expert subset

Second Expert reviews exactly 4 main slots:

- 2 CLEAR
- 2 AMBIGUOUS

Selection occurs after main-case clarity freeze and before Founder Gold.

Use stratified deterministic random selection:

1. Generate and record a 256-bit selection seed from an OS cryptographic random source.
2. For each eligible case, compute `SHA-256(selection_seed || case_id)`.
3. Sort ascending by the digest within each clarity stratum.
4. Select the first 2 CLEAR and first 2 AMBIGUOUS case IDs.
5. Freeze selected IDs before Gold.

Record:

- selection_algorithm_version;
- selection_seed;
- eligible CLEAR IDs;
- eligible AMBIGUOUS IDs;
- selected case IDs;
- selected_at.

Do not redraw after Founder Gold, AI output, Second Expert availability, or expected disagreement.

## 7. Reviewer structure

### Founder

Founder responsibilities:

- select main 10 cases;
- select required reserve cases;
- assign CLEAR/AMBIGUOUS;
- write Gold for all active main cases.

Founder evidence scope:

- sanitized full allowed source VOD/context;
- final outcome.

Founder Gold is outcome-aware.

### Second Expert

Second Expert responsibilities:

- independently review the assigned 4 slots.

Second Expert evidence scope:

- assigned case only;
- sufficient bounded before/after context;
- final outcome;
- no full source VOD access.

Second Expert must not see:

- Founder Gold;
- AI Draft;
- other reviewer judgment;
- unassigned test cases.

Because evidence scope is comparable but not identical, report the four-case result as:

`blind diagnostic agreement under comparable but not identical evidence scope`

Do not claim population validation or fully symmetric inter-rater conditions.

### Pilot Operator

Pilot Operator responsibilities:

- consent;
- assent;
- guardian flow;
- rights eligibility;
- retention/deletion metadata;
- checklist approval.

Pilot Operator does not inspect gameplay clip content merely for operational convenience.

## 8. Second Expert qualification and independence

Required qualification:

- upper-level competitive VALORANT experience;
- actual VOD-review/coaching ability;
- ability to explain reasoning and alternatives.

Founder may recommend candidates.

Product/Business Lead reviews qualification evidence and returns:

- ELIGIBLE
- NOT ELIGIBLE
- INSUFFICIENT EVIDENCE

Material ambiguity is escalated to the user.

Founder does not unilaterally approve the Second Expert.

Relationship to Founder may exist. Required case-level blindness remains mandatory.

Record only minimal relationship provenance:

- NONE
- FORMER_TEAMMATE
- CURRENT_TEAMMATE
- FORMER_COACHING_RELATION
- CURRENT_COACHING_RELATION
- OTHER

Do not collect unnecessary private relationship detail.

## 9. Founder Gold creation

Founder:

1. reviews sanitized full-context evidence;
2. speaks freely;
3. receives AI-assisted transcription only;
4. corrects/confirms transcript;
5. completes/confirms structured expert fields;
6. passes required field/schema validation;
7. gives final confirmation;
8. reaches `GOLD VERIFIED`.

AI may perform:

- speech-to-text;
- punctuation;
- speaker segmentation if needed.

AI must not:

- recommend verdict;
- generate preferred decision;
- recommend principle;
- rewrite expert reason;
- infer missing field values;
- "professionalize" the Gold.

Transcript assistance never makes an AI-authored judgment Gold.

## 10. Expert fields under test

The eight candidate expert fields are:

1. Trigger
2. Observed Decision
3. Verdict
4. Preferred Decision
5. Decision Principle
6. Expert Reason
7. Severity
8. Confidence

Validator may enforce:

- required fields;
- enum membership;
- conditional requirements;
- nullability;
- type/format validity.

Validator may not judge expert correctness.

The field contract remains a testable candidate until the ACTUAL TEST evidence is reviewed.

## 11. Gold verification and raw Founder audio

`GOLD VERIFIED` requires:

- Founder transcript verification;
- structured field confirmation;
- schema/required-field validation;
- Founder final confirmation.

Raw Founder audio is retained only for transcription verification.

After `GOLD VERIFIED`:

- raw audio becomes `DELETION_ELIGIBLE`;
- 72-hour grace period begins;
- raw audio is automatically deleted after 72 hours;
- deletion receipt is recorded.

Do not retain raw Founder audio for long-term model training or unrelated analysis under this protocol.

## 12. Founder transcription egress

Default:

`LOCAL-FIRST`

Use local transcription first.

External STT fallback is not automatic.

External STT is allowed only when all are true:

- local transcription quality is insufficient;
- purpose is explicitly permitted;
- applicable consent/rights scope permits the processing;
- provider/destination is explicitly approved;
- provider retention/data-use behavior has been reviewed;
- a valid EXTERNAL_EGRESS permit exists;
- permit is revalidated immediately before execution.

Any missing condition:

`EXTERNAL_TRANSCRIPTION = BLOCKED`

External transcript still requires Founder correction/confirmation before Gold.

Third-party raw voice must not be included in Founder STT payload.

## 13. Third-party data minimization

Before any expert review, sanitize source evidence to minimize third-party personal information.

Where unnecessary:

- redact/mask nicknames;
- redact unnecessary chat;
- remove/mute third-party raw voice;
- remove other unnecessary identifiers.

If team communication content is necessary for the decision:

- retain only the minimum necessary content;
- convert it to a minimal transcript/structured context where feasible;
- pseudonymize the speaker;
- discard unrelated speech;
- do not retain raw third-party voice in expert evidence.

Identity is not treated as necessary merely because context is necessary.

## 14. Second Expert disagreement

Preserve independent layers.

Do not:

- average;
- majority vote;
- force consensus;
- overwrite Founder Gold;
- invoke automatic third-expert adjudication.

Disagreement is diagnostic evidence.

## 15. Timing

Primary timing metric:

`Founder ACTIVE ANNOTATION TIME`

Timing authority:

- manual Pause/Resume controls active time;
- automatic focus/inactivity signals are evidence flags only.

System may flag:

- browser focus loss;
- visibility loss;
- prolonged inactivity;
- other obvious interruption candidate.

System does not silently rewrite the primary timer.

Record:

- active_duration;
- manual_pause_count;
- manual_pause_duration;
- interruption_candidate_count;
- confirmed_interruption_count;
- confirmed_interruption_duration;
- interruption_reason_category.

Incomplete/invalid timing remains ineligible for timing aggregation and must be disclosed.

## 16. Measurement preregistration

Freeze the full measurement contract before Founder Gold begins.

### Timing

Use valid Founder active annotation durations only.

Median:

- standard median.

P90:

- nearest-rank;
- rank = `ceil(0.9 × n)` on sorted valid durations.

Report invalid/excluded counts and reasons.

### Context insufficiency

Numerator:

- unique completed Founder cases with verdict `INSUFFICIENT_CONTEXT`.

Denominator:

- completed valid Founder cases.

Report raw numerator and denominator.

### Taxonomy escape

Numerator:

- unique completed Founder cases using `OTHER` or `NEW_PRINCIPLE_NEEDED`.

Denominator:

- completed Founder cases.

### Directional agreement

Positive:

- OPTIMAL
- ACCEPTABLE

Negative:

- SUBOPTIMAL
- ERROR

Exclude from directional denominator:

- UNCERTAIN
- INSUFFICIENT_CONTEXT

Report:

- eligible directional pairs;
- exact verdict matches;
- exact verdict disagreements;
- four planned-pair coverage.

Do not apply the 75% candidate heuristic when eligible-pair coverage is incomplete without explicitly reporting the limitation.

### Core-field usefulness

After the 10-case Founder session, Founder rates each of the eight candidate expert fields:

- REQUIRED
- USEFUL
- UNNECESSARY

Report the count of fields rated UNNECESSARY.

This is research instrumentation, not a ninth expert field.

### Candidate thresholds

Preregister these candidates before Gold:

- median active time ≤ 5 min
- P90 active time ≤ 8 min
- INSUFFICIENT_CONTEXT ≤ 20%
- OTHER / NEW_PRINCIPLE_NEEDED ≤ 20%
- UNNECESSARY core fields ≤ 1
- directional agreement ≥ 75%

Candidate STOP/REDESIGN signals include:

- median active time > 8 min;
- at least 4/10 cases INSUFFICIENT_CONTEXT;
- taxonomy predominantly escapes to OTHER/new principle;
- repeated inability to isolate one primary decision;
- severe/pervasive expert divergence.

Thresholds are hypotheses, not automatic decision rules.

`threshold satisfied ≠ automatic GO`

`threshold missed ≠ automatic STOP`

## 17. Pilot consent model

Use purpose-separated consent.

Required:

- ACTUAL TEST participation/use.

Separate optional choices:

- long-term Decision Dataset evidence retention;
- future evaluation reuse;
- model-training use.

Therefore:

`ACTUAL TEST consent ≠ dataset retention ≠ evaluation reuse ≠ model training`

Do not infer optional permissions from required participation consent.

## 18. Pilot full VOD lifecycle

For Pilot-supplied VOD:

1. verify permitted source/use;
2. identify main/reserve case evidence;
3. extract case/bounded context;
4. sanitize third-party information;
5. verify clip/context integrity;
6. keep raw/full source in restricted storage only while required expert review obligations remain;
7. Founder completes all Gold from that source;
8. any Second Expert assignment from that source completes the required bounded-context review;
9. delete original full VOD;
10. record deletion receipt.

Full VOD is not retained for speculative future use, future training, or future case mining.

## 19. Pilot case-clip retention

Active case clip/evidence may remain until:

- ACTUAL TEST is complete; and
- Product GO/REVISE/STOP decision is complete.

After that:

- if original consent explicitly permits long-term Decision Dataset evidence retention, the eligible evidence may remain;
- otherwise delete it and record a deletion receipt.

Dataset retention permission does not imply model-training permission.

## 20. Withdrawal

Participant may withdraw at any time.

On withdrawal:

- source eligibility → WITHDRAWN;
- future use stops;
- related permits invalidate;
- pending jobs/eligible caches invalidate;
- identifiable raw/clip/transcript is deleted;
- structured case content is deleted;
- minimum tombstone/audit receipt remains.

Allowed tombstone fields are limited to operational proof such as:

- internal case/reference ID;
- WITHDRAWN state;
- withdrawal timestamp;
- deletion completion timestamp;
- deletion/audit receipt ID.

Do not retain deleted expert judgment content merely under a different label.

Already irreversibly aggregated, non-reidentifiable results may remain.

## 21. Withdrawal replacement

Before measurement freeze:

- if an active main case becomes ineligible from withdrawal/rights invalidation, use only the same-stratum frozen reserve;
- record removed case, reason, replacement, stratum, reserve version, timestamp;
- if the removed slot is a Second Expert slot, replacement inherits that assignment.

After measurement freeze:

- do not select a replacement using observed results;
- apply deletion/withdrawal;
- adjust/report denominator and limitation;
- preserve only permitted irreversibly aggregated results.

## 22. Age and minor participation policy

Recruitment has no age restriction.

DECODE product policy for any minor participant in this first Pilot is stricter than the minimum legal baseline:

- guardian consent required;
- participant assent required;
- Pilot Operator checklist approval required.

For children under 14, current Korean Personal Information Protection Act requirements independently require legal-representative consent and verification when processing depends on consent, and child-facing notices must use easy-to-understand form/language.

This protocol does not claim comprehensive legal certification of the Pilot. Applicable requirements must be rechecked before execution.

Official legal references recorded at materialization time:

- Personal Information Protection Act, Article 22-2 (child personal information protection)
- Enforcement Decree, Article 17 and Article 17-2 (consent and verification methods)

## 23. Minor handling checklist

Pilot Operator uses a checklist.

Required categories include:

- age/status;
- VOD source/right;
- ACTUAL TEST purpose;
- retention scope;
- Dataset retention choice;
- evaluation reuse choice;
- model-training choice;
- withdrawal notice;
- guardian consent;
- participant assent;
- guardian verification;
- unresolved legal/privacy blocker.

Required item missing:

`BLOCKED`

Pilot Operator may not override a required checklist item.

A material exception requires the Decision Interview Gate and explicit approval before proceeding.

## 24. Guardian consent

First Pilot uses signed-document guardian verification as the default operational method.

Digital verification is a future adapter, not a first-Pilot requirement.

For a minor participant:

`participant assent + guardian consent + guardian verification → eligibility`

Either missing:

`NOT ELIGIBLE`

Guardian consent document is stored in restricted storage during the Participant Pilot and Product decision period.

After:

- participant Pilot completion; and
- Product GO/REVISE/STOP decision completion;

delete the original signed document, record a deletion receipt, and retain only the minimum consent receipt/hash metadata necessary for audit.

Do not unnecessarily retain:

- original signature image;
- ID-card copy;
- unnecessary address/contact data;
- unnecessary family information.

## 25. Participant assent

Use a separate participant-facing artifact in simple language.

Explain at minimum:

- why VOD is used;
- what is stored;
- who can access it;
- when source/clip data is deleted;
- optional future uses;
- right not to participate;
- right to withdraw.

Require an explicit choice:

- PARTICIPATE
- DO NOT PARTICIPATE

Guardian consent does not override a clear participant refusal.

## 26. Ambiguous withdrawal / hesitation

If the participant expression is ambiguous:

`PAUSE → explain simply → explicit CONTINUE / WITHDRAW`

Do not proceed with new affected processing before explicit reconfirmation.

A clear withdrawal cannot be overridden by the Operator.

Guardian withdrawal also stops the applicable processing.

## 27. Access control

Founder:

- access to all 10 active test cases;
- sanitized full source context required for Gold.

Second Expert:

- assigned 4 slots only;
- sufficient bounded context + final outcome;
- no full source VOD;
- no unassigned test cases.

Pilot Operator:

- consent/rights/retention metadata only;
- no gameplay-content access merely for convenience.

Apply least privilege.

## 28. Rights and permit execution

No protected action occurs without valid current eligibility and a valid permit where the architecture requires one.

At minimum, revalidate immediately before:

- evidence ingestion/use;
- expert-voice storage;
- external transcription egress;
- evaluation use;
- player output.

Withdrawal invalidates subsequent eligibility.

## 29. Execution order

Pre-execution:

1. materialize and hash approved Protocol version;
2. verify Pilot Operator readiness;
3. verify consent/guardian/assent flow;
4. verify Founder source rights;
5. qualify Second Expert;
6. identify allowed source pool;
7. select/freeze main 10;
8. allocate/select/freeze reserve 3;
9. generate/freeze Second Expert 4-case subset;
10. freeze measurement contract;
11. freeze software/schema/protocol revision;
12. verify access/retention/deletion paths;
13. verify local transcription;
14. verify external STT fallback remains blocked unless all permit conditions are satisfied.

Execution:

15. Founder Gold 10 active slots;
16. validate/verify each Gold;
17. Second Expert blind review of assigned 4;
18. record timing, interruptions, disagreement;
19. execute required deletion/retention transitions;
20. freeze measurements.

Review:

21. compute preregistered metrics only;
22. report raw denominators and limitations;
23. Product/Business Lead recommends GO / REVISE / STOP;
24. User gives final approval;
25. record decision and next authorized scope.

## 30. Product decision authority

Product/Business Lead:

- aggregates evidence;
- states limitations;
- recommends GO / REVISE / STOP.

User:

- final approval authority.

Founder, Codex, or metric thresholds cannot independently authorize the next Product gate.

## 31. GO / REVISE / STOP semantics

GO:

- permits the next approved planning step only;
- does not automatically authorize 50/150 expansion.

REVISE:

- reopen only affected assumptions such as schema/context/timing/taxonomy/workflow/rights.

STOP:

- redesign before continuation.

## 32. Required outputs

A real run must produce at least:

- 10 frozen main slots with final slot status, including any permitted replacement/withdrawal outcome;
- reserve/replacement ledger;
- consent/rights eligibility ledger;
- Founder Gold records;
- Second Expert 4-case records;
- timing report;
- schema/validation failure log;
- taxonomy coverage report;
- blind disagreement report;
- third-party sanitization provenance;
- retention/deletion receipts;
- measurement report;
- Product GO/REVISE/STOP recommendation;
- User final decision record.

Each sanitized public artifact must include or reference:

- evidence category;
- run ID;
- protocol version/hash;
- schema/software version/hash;
- input provenance;
- evaluator role;
- sample/denominator;
- limitations.

Raw VOD, raw comms, identities, signed consent documents, access-bearing URLs, and raw private audit material stay outside the public repository.

## 33. Current state

- Q1–Q56 = CHAT LOCKED
- Protocol design = STATIC MATERIAL BLOCKERS 0 in chat audit
- Repository materialization = PENDING
- Actual-mode implementation = NOT STARTED
- ACTUAL TEST = NOT YET TESTED
- 50/150 expansion = NOT AUTHORIZED

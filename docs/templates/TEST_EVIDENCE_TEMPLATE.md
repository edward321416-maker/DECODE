# Test Evidence Report — [what was tested]

Template Version: 0.2-DRAFT | Updated: 2026-09-06 | Owner: AI/Engineering Lead
Status: DRAFT SCAFFOLD / NOT ACTIVE — Team OS Stage 1 proposal
Scope: skeleton for any evaluation result report
Authority: NONE — Stage 1 proposal; does not create an operating requirement

Instance fields (fill in when using this template, after activation):

Author: [role] | Date: [ISO-8601] | Run ID: [stable event/run identifier]

## Evaluation purpose/mode

[ACTUAL TEST | SELF-BENCHMARK | N/A — pick exactly one. Do not combine with data origin or execution status into a single value.]

## Data origin

[REAL | SIMULATED | UNKNOWN — independent of evaluation purpose/mode. If Evaluation purpose/mode = ACTUAL TEST, Data origin must be REAL under the approved consented-VOD/independent-expert method: DECODE does not approve mixing SIMULATED fixtures or control conditions into an ACTUAL TEST run, denominator, or claim. Any synthetic/control material evaluated alongside it is recorded as its own separate row: Evaluation purpose/mode = SELF-BENCHMARK, Data origin = SIMULATED, Execution status = whatever actually occurred. A mixed real+synthetic experimental design is not currently approved and would require its own Product decision/protocol amendment before use.]

## Execution status

[NOT TESTED | RUNNING | PASSED | FAILED | BLOCKED. If Evaluation purpose/mode = ACTUAL TEST and Execution status = NOT TESTED, the plain-language summary is "ACTUAL TEST: NOT YET TESTED" — this is explanatory prose for that specific combination, not a sixth status value.]

## Method

[Exact command(s) run, source revision/commit, tool/model version if applicable, protocol version referenced]

## Sample / scope

[Denominator, exclusions, sample size, time unit, evaluator independence — never let a null result read as zero]

## Result

[Numbers or qualitative outcome, matching the execution status above — no generic PASS badge without the underlying breakdown]

## Limitations

[What this evidence does NOT establish — no accuracy/causal/business-success extrapolation beyond what was actually measured]

## Claim boundary check

- [ ] Does not present SIMULATED-origin data as REAL.
- [ ] No SIMULATED fixture/control condition is folded into this report's ACTUAL TEST run, denominator, or claim, if this report contains an ACTUAL TEST.
- [ ] A PASSED execution status under SELF-BENCHMARK or N/A evaluation purpose is not described as ACTUAL TEST evidence anywhere in this report.
- [ ] A completed REAL/ACTUAL TEST run is reported as PASSED or FAILED on its actual merits, not assumed successful because it ran.

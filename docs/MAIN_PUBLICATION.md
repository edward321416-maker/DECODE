# Public Main Publication Evidence

Record: PUBLICATION-2026-09-02-01 | Owner: AI/Engineering Lead | Updated: 2026-09-02
Evidence: operational SELF-BENCHMARK and observed GitHub receipts, not a model or VOD test

## Observed repository actions

- Public visibility and default branch main were read back from GitHub for repository ID 1354606878.
- Empty bootstrap commit `cd3f428` established main; it contains no files.
- [Issue #1](https://github.com/edward321416-maker/DECODE/issues/1) records the approved foundation scope.
- Foundation merge receipt: PENDING. This pre-merge report does not claim the PR has merged. The receipt will be updated after observing GitHub's merged state.

## Content review

| Area | Resolution / limit |
| --- | --- |
| Authority conflicts | D013 supersedes private visibility and local-only publication gates; earlier decisions/reports retained as historical |
| Public scope | Explicit inventory; excluded legacy app, environment files, private media and local audit originals |
| Privacy | Private chat/task/project IDs and absolute local paths removed from public docs; original bindings retained privately |
| Rules | Development/documentation/graphics v0.2 now reference public main without promoting product candidates |
| Dataset/protocol | Eight expert fields, context split, twelve principles and thresholds remain LOCK CANDIDATE; planned slots are not actual cases |
| Documentation | Relative links target published files; archived reports are labeled historical; latest handoff keeps all eight sections |
| Verification | Working-file preflight passed 464/464 checks at 2026-09-02T10:41:31Z; historical 174/201 counts are not reused |
| Enforcement | No rulesets were returned in the inspected repository; no protection/CI setup or independent approval is claimed |

## Executed checker self-tests

At 2026-09-02T10:42:46Z, an isolated generated-document fixture audit passed 13/13 scenarios: two clean working/staged positives and eleven rejection cases (unpublished link, false actual-test status, private chat URL, duplicate slot, candidate promotion, missing handoff section, invented experiment row, duplicate pending event, invalid option, staged blob drift and extra staged file). The clean staged fixture passed 498/498 checks. These generated document fixtures are SIMULATED inputs to an internal checker SELF-BENCHMARK, not simulated decision cases or VOD evidence. The local audit harness/baseline remain private; the public checker commands below reproduce the positive integrity checks.

Seventeen non-publication baseline files retained identical SHA-256 values, including the existing app, package/lock/config files and private handoff. No preservation claim is made for files absent from that captured baseline. The original README was retained in excluded local audit material before its scoped public replacement.

## Reproduction and limitations

Run the commands in [Publication Policy](PUBLICATION_POLICY.md). The published checker is for the operating-foundation boundary, not an annotation validator. Source originals and pre-edit hashes are retained in a private local baseline; preservation checks can compare that baseline but are not independently reproducible from public Git alone.

No manifest scripts, application build/runtime, model API, expert session, VOD annotation, Google write or new graphics were executed. ACTUAL TEST: NOT YET TESTED. SIMULATED decision-data run: NOT TESTED. No experiment rows were added. Google operational logging remains local/pending with UNKNOWN task tokens.

# [Role A] → [Role B]

Report ID: [DECODE-[NAME]-[ISO-8601 date]] | Scope: [what this handoff covers]
Owner: [role] | Source revision: [exact commit SHA / merge this reports on]

Prior report: [prior report ID / reference, or NONE]. Preserve these eight sections in every future report — do not drop or rename them.

## IMPLEMENTED

[What was actually built/merged, with the verified commit/PR reference. No annotation/model/feature implied beyond what is stated.]

## ACTUAL TEST

[NOT YET TESTED, or the exact consented/independent test that was run, with method and result]

## SELF-BENCHMARK

[Internal checks only: what ran, exact command, pass/fail counts. Not independent validation.]

## SIMULATED

[Any synthetic/mock data used, and explicitly that it does not represent real cases]

## FAILED

[Any check/merge/test failure, or explicitly "none remaining." Expected rejections in an audit are not failed stress tests.]

## NOT TESTED

[What remains unverified — application/runtime behavior, model behavior, accessibility/security conformance, etc.]

## FILES CHANGED

[Exact file list or diff reference — link the PR diff rather than restating a large diff]

## RECOMMENDED NEXT DECISION

[What Product/Business Lead should decide next. Name it without silently authorizing it. No automatic merge/promotion implied.]

---

For the reverse direction (Product/Business Lead → AI/Engineering Lead, a development request rather than a report), the structure is a request statement with: exact starting revision, exact deliverable, explicit exclusions (HISTORICAL / DO NOT EXECUTE section for anything retained only as provenance), and the decision-gate check from [Task Brief](TASK_BRIEF_TEMPLATE.md). See `handoff/CHATGPT_TO_CODEX.md` for a worked example.

# DECODE Documentation Rules

Version: 0.2 | Updated: 2026-09-02 | Owner: Product/Business Lead and AI/Engineering Lead
Status: ACTIVE OPERATING POLICY | Scope: DECODE specifications, decisions, reports and handoffs
Authority: user-approved rules plus U-PUBLIC-2026-09-02 in [Decisions](DECISIONS.md). Publication is authorized for the operating foundation; product-candidate promotion, annotation implementation and new visual production are not implied.

## Source and ownership

- DOC-01 — The public repository's main is the single source of truth under [Publication Policy](PUBLICATION_POLICY.md). Identify the exact main revision/PR; label unmerged proposals as proposals, not current canonical policy. Integrate validated current rules and results into main. A chat message is an input, not automatic modification of canonical files. ChatGPT cannot be assumed to see local files; provide the specific approved revision/patch when tools are unavailable.
- DOC-02 — Each maintained policy/specification states title, owner, version or dated revision, status, scope and source/authority. Results also identify run/check ID, source revision or snapshot hash, method, input origin and limitations. Use ISO-8601 timestamps with timezone for events. Keep operational prompts in clear English; user-facing explanations may be Korean. Preserve exact schema identifiers across translations.
- DOC-03 — Keep evidence purpose, data origin and execution outcome separate using the contract below. Never replace provenance with a generic PASS badge or infer real-world success from a generated file.

| Dimension | Required distinction |
| --- | --- |
| Evaluation purpose | ACTUAL TEST requires consented real VOD, independent experts and the approved recorded method; SELF-BENCHMARK is internal evaluation, not independent validation |
| Data origin | Real, SIMULATED, or UNKNOWN; synthetic/mock/reconstructed inputs remain SIMULATED even inside a SELF-BENCHMARK |
| Execution | NOT TESTED, RUNNING, PASSED, FAILED, or BLOCKED; explanatory unexecuted state is NOT YET TESTED |
| Claim boundary | ACTUAL TEST cannot contain synthetic-origin evidence presented as real; a completed real run still need not have succeeded |

The [Experiment Protocol](EXPERIMENT_PROTOCOL.md) owns the domain definitions. This table explains them; it does not create or lock new machine-schema enums.

## Accuracy and history

- DOC-04 — Amend decisions with a new ID, approver, date, evidence and superseded reference. LOCKED is an approved scope decision, not proof of scientific validity. LOCK CANDIDATE remains a hypothesis. Preserve earlier handoff/run artifacts before replacing the current report; preserve independent labels and adjudication separately.
- DOC-05 — Report denominators, exclusions, sample sizes, time units, evaluator independence and metric formula/version. UNKNOWN/null means missing, never zero. Do not fabricate VOD links, consent, experts, durations, screenshots or metrics. Separate outcome from decision quality; no accuracy, causal benefit or business-success extrapolation from this ten-case exploratory design.
- DOC-06 — Source external factual/technical claims to current primary references, with a checked date and relevant section. Distinguish observation, inference and proposed policy. A selected accessibility checklist is not full conformance; static prompt inspection is not model-behavior validation. Do not promise universal token savings, context deletion, live synchronization or enforcement from Markdown.
- DOC-07 — Read required policy/skill files completely. Inspect source symbols and bounded relevant excerpts before bodies; load full bodies only for direct modification targets. Report file changes only as unified diffs or exact SEARCH/REPLACE blocks, including additions from /dev/null. Non-change status may use concise prose. Validate relative links, headings, tables, encoding and examples; executable examples need actual scoped checks or an explicit NOT YET TESTED label.

## Working records

- DOC-08 — Keep a compact checkpoint: status, artifact, evidence category, token basis and next action. Use measured task telemetry, explicitly scoped estimates, or UNKNOWN; never derive task tokens from account percentages. Retrieve only relevant documents/tool schemas and retain stable source/version/hash references. Do not claim already-sent context was erased.
- DOC-09 — Follow the [AI operations](AI_OPERATING_POLICY.md) logging contract. For major completion/acquisition, append Timestamp, Acquired Skill, Estimated Tokens Used, Task Summary to the designated AI_Execution_Log only with verified bindings and authority. Use NONE for no acquisition and a stable event ID. Missing Google configuration means SYNC BLOCKED plus a sanitized local pending row, not a fabricated cloud write. Documentation checks do not create experiment rows.
- DOC-10 — Before delivery, update [Current Status](CURRENT_STATUS.md) and the [reverse handoff](../handoff/CODEX_TO_CHATGPT.md), retain the eight required headings, and name the next decision without silently authorizing it. Preserve the approved first request in [ChatGPT to Codex](../handoff/CHATGPT_TO_CODEX.md). The .gemini_sync.md report stays English with exactly Executed Actions, GSTACK & Skill Usage, PR Status, and Unresolved Issues / Next Steps sections. Source originals remain unchanged except for scoped, reviewed edits.

## Definition of done for documentation

The reviewer maps each applicable requirement to a rule ID, checks contradictions against canonical policy, validates links and change boundaries, and records unresolved issues. Failures are fixed and checked again; not-run checks are not passed. Use [Rules Review](RULES_REVIEW.md) for this revision's self-review scope and limits. Another AI role or a checklist is not an independent human/expert review.

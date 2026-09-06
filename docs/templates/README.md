# DECODE Document Templates

Version: 0.1 | Updated: 2026-09-06 | Owner: AI/Engineering Lead
Scope: skeleton templates for the document types [Documentation Rules](../DOCUMENTATION_RULES.md) and [Project Operating Manual](../PROJECT_OPERATING_MANUAL.md) require.

Use these as starting structure, not as content to leave unfilled. Every field in brackets must be replaced or explicitly marked UNKNOWN/NOT APPLICABLE — never deleted silently. Do not invent a new top-level document structure when one of these fits; propose a template change instead of a one-off format.

| Template | Use for |
| --- | --- |
| [TASK_BRIEF_TEMPLATE](TASK_BRIEF_TEMPLATE.md) | A single bounded unit of work handed to an AI/Engineering session |
| [PLANNING_BRIEF_TEMPLATE](PLANNING_BRIEF_TEMPLATE.md) | Product/Business Lead scoping a feature or milestone before implementation |
| [RESEARCH_NOTE_TEMPLATE](RESEARCH_NOTE_TEMPLATE.md) | Investigation findings that inform a decision but are not the decision itself |
| [DESIGN_SPEC_TEMPLATE](DESIGN_SPEC_TEMPLATE.md) | Architecture/interface design for a component before it is implemented |
| [IMPLEMENTATION_PLAN_TEMPLATE](IMPLEMENTATION_PLAN_TEMPLATE.md) | Step-by-step engineering plan for approved scope |
| [DECISION_RECORD_TEMPLATE](DECISION_RECORD_TEMPLATE.md) | A new or amended entry for [Decisions](../DECISIONS.md) |
| [TEST_EVIDENCE_TEMPLATE](TEST_EVIDENCE_TEMPLATE.md) | Any ACTUAL TEST / SELF-BENCHMARK / SIMULATED result report |
| [CHANGE_REPORT_TEMPLATE](CHANGE_REPORT_TEMPLATE.md) | Summary of a merged change for [Current Status](../CURRENT_STATUS.md) or a release note |
| [HANDOFF_TEMPLATE](HANDOFF_TEMPLATE.md) | A request or report between Product/Business Lead and AI/Engineering Lead, matching the eight required `CODEX_TO_CHATGPT.md` headings or the request structure of `CHATGPT_TO_CODEX.md` |

All templates inherit the evidence-label contract (DOC-03) and the header contract (DOC-02: title, owner, version/date, status, scope, source/authority) from [Documentation Rules](../DOCUMENTATION_RULES.md); do not restate those rules inside each template, reference them.

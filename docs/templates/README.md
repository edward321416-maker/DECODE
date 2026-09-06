# DECODE Document Templates

Template Version: 1.0 | Updated: 2026-09-06 | Owner: AI/Engineering Lead
Status: ACTIVE TEMPLATE SET
Scope: skeleton templates for document types named in [Documentation Rules](../DOCUMENTATION_RULES.md)
Authority: D021 / U-DECODE-TEAM-OS-2026-09-06. [Project Operating Manual](../PROJECT_OPERATING_MANUAL.md) is ACTIVE OPERATING POLICY and is referenced here for its evidence-model description.

These are the preferred starting structure for their document type. Every bracketed field must be replaced or explicitly marked UNKNOWN/NOT APPLICABLE rather than deleted silently.

| Template | Use for |
| --- | --- |
| [TASK_BRIEF_TEMPLATE](TASK_BRIEF_TEMPLATE.md) | A single bounded unit of work handed to an AI/Engineering session |
| [PLANNING_BRIEF_TEMPLATE](PLANNING_BRIEF_TEMPLATE.md) | Product/Business Lead scoping a feature or milestone before implementation |
| [RESEARCH_NOTE_TEMPLATE](RESEARCH_NOTE_TEMPLATE.md) | Investigation findings that inform a decision but are not the decision itself |
| [DESIGN_SPEC_TEMPLATE](DESIGN_SPEC_TEMPLATE.md) | Architecture/interface design for a component before it is implemented |
| [IMPLEMENTATION_PLAN_TEMPLATE](IMPLEMENTATION_PLAN_TEMPLATE.md) | Step-by-step engineering plan for approved scope |
| [DECISION_RECORD_TEMPLATE](DECISION_RECORD_TEMPLATE.md) | A new or amended entry for [Decisions](../DECISIONS.md) |
| [TEST_EVIDENCE_TEMPLATE](TEST_EVIDENCE_TEMPLATE.md) | Any evaluation result report — records evaluation purpose/mode, data origin, and execution status as separate dimensions |
| [CHANGE_REPORT_TEMPLATE](CHANGE_REPORT_TEMPLATE.md) | Summary of an integrated change for [Current Status](../CURRENT_STATUS.md) or a release note, regardless of integration method |
| [HANDOFF_TEMPLATE](HANDOFF_TEMPLATE.md) | A request or report between Product/Business Lead and AI/Engineering Lead, matching the eight required `CODEX_TO_CHATGPT.md` headings or the request structure of `CHATGPT_TO_CODEX.md` |

Each template file carries its own Template Version/Updated/Owner/Status/Scope/Authority header per [Documentation Rules](../DOCUMENTATION_RULES.md) DOC-02; this README does not substitute for that per-file header. All templates that involve an evaluation use the three-dimension evidence model (Evaluation purpose/mode, Data origin, Execution status), never a single collapsed label, per [Documentation Rules](../DOCUMENTATION_RULES.md) DOC-03.

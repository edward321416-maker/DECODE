# DECODE Rules Review

HISTORICAL SNAPSHOT — records the earlier task only. Current authority and repository state are in [Current Status](CURRENT_STATUS.md) and [Publication Policy](PUBLICATION_POLICY.md). Later publication supersedes old local-only/private/pending statements; earlier check counts are not a fresh audit.

Review ID: RULES-2026-09-02-01 | Version: 0.1 | Updated: 2026-09-02
Reviewer: AI/Engineering Lead, self-review | Authority: user requested checks and saving if suitable
Verdict: SUITABLE FOR LOCAL POLICY STORAGE after the revisions below
Evidence: SELF-BENCHMARK of policy text/static integrity; no independent reviewer, model evaluation or ACTUAL TEST

## Scope and method

This is a finite, task-specific review of all 40 criteria in the matrix, not proof that every possible risk was examined. Reviewed [Development Rules](DEVELOPMENT_RULES.md), [Documentation Rules](DOCUMENTATION_RULES.md), [Graphics Rules](GRAPHICS_RULES.md), AGENTS.md, both project prompts, AI operations, status/decisions, product/dataset/protocol/risk documents and both handoffs. Checked the repository state, parsed the package manifest without executing it, and inspected CSS/font/component symbols without editing the app.

The user authorized review, correction and local storage. This does not authorize annotation implementation, new visual production, product-candidate promotion, publication or account changes. Code-documenter guided linked, task-oriented rules; verification-before-completion requires fresh storage evidence. No capability was installed.

## Issues resolved before storage

1. Vague “test before delivery” became risk-based checks with explicit failure, missing-evidence and N/A handling.
2. Evidence category, synthetic origin and execution status were separated; no new machine-schema enums were locked.
3. Initial rules lacked import safety, data-loss recovery and blind-label leakage checks; these now include failure cases and accessible-text leakage.
4. “Readable/mobile” became measurable acceptance checks with documented exceptions and a warning that selected checks are not full conformance.
5. Existing visuals, visual approval and runtime evidence were separated; source/consent/rights metadata and original preservation were added.
6. Blanket approval gates were narrowed: routine safe steps stay autonomous inside approved scope; material external/brand/product changes still need approval.
7. The old “projectless working directory” statement was stale. Current execution context is the selected repository. Other remote/project-membership claims remain historical or unresolved, not reverified by this review.
8. Previous handoff history is retained in [the setup report](../handoff/DECODE-SETUP-2026-09-02.md); original app/manifest files remain outside the change scope.

## Coverage matrix

COVERED means a concrete rule or existing governing policy addresses the criterion after human-readable self-review. It is not a claim that the application implements or passes that control.

| ID | Review criterion | Rule/evidence location | Policy result |
| --- | --- | --- | --- |
| GOV-01 | Instruction priority and enforcement limits | AI operations; Development Rules introduction | COVERED |
| GOV-02 | Authorization restricted to review and local save | Each rule header; current handoff | COVERED |
| GOV-03 | Role ownership and LOCAL ONLY source of truth | DOC-01; DOC-02 | COVERED |
| GOV-04 | Repository/manifest/working-directory evidence | DEV-01; DEV-02; Current Status | COVERED |
| GOV-05 | No candidate promotion or product expansion | DEV-04; DOC-04; Decisions D006-D008 | COVERED |
| GOV-06 | Policy coverage is not behavioral certification | All three closing/verification sections | COVERED |
| DEV-01 | Dirty/untracked baseline and scoped changes | Development Rules | COVERED |
| DEV-02 | Manifest-only sensing and version-aware inspection | Development Rules | COVERED |
| DEV-03 | Skill trust, installation and external permissions | Development Rules | COVERED |
| DEV-04 | Maintainability and candidate interface boundaries | Development Rules | COVERED |
| DEV-05 | Secrets, media consent, retention and access | Development Rules | COVERED |
| DEV-06 | Hostile imports/uploads/paths/URLs | Development Rules | COVERED |
| DEV-07 | Blind expert flow, history and timing choices | Development Rules | COVERED |
| DEV-08 | Regression, negative and boundary test requirements | Development Rules | COVERED |
| DEV-09 | Errors, persistence and data-loss prevention | Development Rules | COVERED |
| DEV-10 | Mock/live separation and external failure handling | Development Rules | COVERED |
| DEV-11 | Scoped verification and measured performance | Development Rules | COVERED |
| DEV-12 | Non-destructive delivery, review and publication gates | Development Rules | COVERED |
| DOC-01 | Canonical revision and no implied chat sync | Documentation Rules | COVERED |
| DOC-02 | Owner, version, authority and timestamps | Documentation Rules | COVERED |
| DOC-03 | Evidence purpose, input origin and outcome separated | Documentation Rules | COVERED |
| DOC-04 | Append-only decisions and prior report preservation | Documentation Rules | COVERED |
| DOC-05 | Unknowns, denominators and no invented evidence | Documentation Rules | COVERED |
| DOC-06 | Primary references and bounded factual claims | Documentation Rules | COVERED |
| DOC-07 | Required full policy reads, diff format and links | Documentation Rules | COVERED |
| DOC-08 | Context checkpoints and honest token accounting | Documentation Rules | COVERED |
| DOC-09 | Four-column log, deduplication and missing Google | Documentation Rules; AI operations | COVERED |
| DOC-10 | Two-way handoffs and exact sync-report headings | Documentation Rules | COVERED |
| GFX-01 | Actual visual baseline is not brand approval | Graphics Rules | COVERED |
| GFX-02 | Representative approval before visual expansion | Graphics Rules | COVERED |
| GFX-03 | Asset provenance, permitted use and unknown rights | Graphics Rules | COVERED |
| GFX-04 | Source preservation and synthetic-media boundary | Graphics Rules | COVERED |
| GFX-05 | Demo labels and blind-review leakage through alt text | Graphics Rules | COVERED |
| GFX-06 | Non-color state distinctions and uncertainty | Graphics Rules | COVERED |
| GFX-07 | Measurable accessibility and conformance limits | Graphics Rules | COVERED |
| GFX-08 | Korean typography and responsive text | Graphics Rules | COVERED |
| GFX-09 | Chart semantics and no false probability/zero | Graphics Rules | COVERED |
| GFX-10 | Asset safety, binding, decode and performance | Graphics Rules | COVERED |
| GFX-11 | Motion, audio, media alternatives and blind conflict | Graphics Rules | COVERED |
| GFX-12 | Visual approval versus real runtime evidence | Graphics Rules | COVERED |

## Adversarial desk checks — not executed agent/model tests

| Scenario | Required response | Rule |
| --- | --- | --- |
| Synthetic fixtures all pass | Report SIMULATED software success only; ACTUAL TEST remains NOT YET TESTED | DOC-03; DEV-08 |
| Manifest contains an install/start command | Parse as data; do not execute during sensing | DEV-02 |
| Missing GitHub/Google configuration | Keep authorized local work; no new resource/OAuth; queue sanitized pending log | DEV-01; DOC-09 |
| Screenshot looks approved but asset binding is absent | VISUALLY APPROVED is not RUNTIME VERIFIED | GFX-12 |
| Expert cannot infer unseen comms | Preserve unknowns; do not fabricate a preferred decision | DEV-07; DOC-05 |
| Accessibility text exposes an expected verdict | Remove label leakage or escalate the conflict without changing evidence | GFX-05; GFX-11 |
| Import or save operation fails | Preserve prior/entered data and report failure; no false success banner | DEV-06; DEV-09 |
| User casually requests full-file output | Deliver a unified diff or exact SEARCH/REPLACE under current reporting policy | DOC-07 |

These are reasoned policy walk-throughs only, not eight executed test cases or experiment records.

## Sources and applicability

Primary sources checked 2026-09-02: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) for GFX-07's selected accessibility criteria; [OWASP file-upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) for DEV-06. Neither certifies this project. Repository facts and user authority were checked locally; historical setup claims were not silently promoted to fresh external verification.

## Storage verification

Final delivery audit at 2026-09-02T09:30:19.524Z: 201 static checks PASSED, 0 FAILED, after the 200-check post-write preflight. This includes 73 local-link checks, unchanged SHA-256 for 29 non-target baseline files, exact eight-section handoff/four-section sync report, canonical candidate preservation, archive-content preservation, completion-log recording, finalized reporting, and patch application/reconstruction in an isolated scratch directory. The final per-check evidence accompanies the delivered patch as decode-rules-verification.json; it records the latest artifact hashes and rerun timestamp.

Historical reproduction used a standalone local audit helper and captured baseline, retained as private audit materials rather than a published project test suite. For the current public foundation, run the portable checker documented in [Publication Policy](PUBLICATION_POLICY.md). The earlier preflight had one validator phrase-matching failure; the wording check was corrected and the complete historical audit rerun successfully. No application defect or stress-test failure was inferred from that checker issue.

These are storage/text checks, not executed security, model, accessibility or VOD/expert tests. Application code and manifest/lock files were not changed or executed. No destructive command, repository creation, publication or cloud write occurred.

## Remaining limits and next gate

ACTUAL TEST: NOT YET TESTED. Application/runtime/security/accessibility compliance and model obedience: NOT YET TESTED in this review. No synthetic dataset or annotation infrastructure was implemented. No legal compliance or full WCAG conformance is certified. GitHub publication, Google sync and the earlier planning-chat project move remain unresolved; no external writes were attempted.

Next: review the versioned annotation design and unresolved candidate semantics under the existing handoff. Obtain consented VOD and experts before ACTUAL TEST. Rule revisions must retain owner/version/change evidence.

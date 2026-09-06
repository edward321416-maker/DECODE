# Codex → ChatGPT

Report ID: DECODE-TEAM-OS-STAGE2-2026-09-06 | Scope: Team OS Stage 2 policy/router activation and reconciliation
Owner: AI/Engineering Lead | Source revision: base `origin/main = 5c09f6f7108c94fd840797b434f34286da30d8b6`

Prior report: DECODE-M0-POST-MERGE-RECEIPT-2026-09-06, this file's immediately preceding content (PR #8 / Team OS Stage 1 did not modify this file; the M0 post-merge receipt report remained the canonical prior report through Stage 1 and is superseded only now, by this Stage 2 report). See Git history for the exact prior text. Preserve these eight sections in every future report.

## IMPLEMENTED

Team OS Stage 2 activation/reconciliation, prepared on scoped branch `claude/team-os-stage2-activation` cut exactly from `5c09f6f7108c94fd840797b434f34286da30d8b6`. Activates `docs/PROJECT_OPERATING_MANUAL.md` and `docs/COLLABORATION_RULES.md` (C1–C11) to ACTIVE OPERATING POLICY and `docs/templates/` to ACTIVE TEMPLATE under D021; creates `CLAUDE.md` and reconciles `AGENTS.md` as thin tool-specific routers; reconciles `docs/DEVELOPMENT_RULES.md`, `docs/DOCUMENTATION_RULES.md`, `docs/AI_OPERATING_POLICY.md`, `docs/PUBLICATION_POLICY.md`, `README.md`, `docs/PROJECT_BRIEF.md`, `docs/PRODUCT_SPEC.md`, `docs/DECISION_DATASET_SPEC.md`, `data/schemas/README.md`, and both `.github/system_prompts/*` files; retires `docs/EXPERIMENT_PROTOCOL.md` to a concise historical candidate summary (now ~1.5 KB, down from the full 2026-09-02 candidate protocol) superseded for execution under D018, with the Q1–Q56 10-Case ACTUAL TEST Protocol v1.0 as sole current execution authority; records D021/D022 in `docs/DECISIONS.md`; reconciles `docs/CURRENT_STATUS.md`; bumps `docs/PUBLICATION_FILES.json` to v4 (49 files, adds `CLAUDE.md`). This is a documentation/policy-activation change only — no annotation app, machine schema, or model was implemented, and the three authority documents are untouched.

## ACTUAL TEST

NOT YET TESTED — no consented real VOD or independent expert session was run. `ACTUAL TEST = NOT YET TESTED` for both the DECODE product and this Stage 2 activation itself.

## SELF-BENCHMARK

Fresh verification against this Stage 2 branch, results recorded directly here (not only in an external report):

- `node scripts/check-operating-docs.mjs` (default): **660/660 PASS, 0 failures**.
- `node scripts/check-operating-docs.mjs --index` (staged tree): **710/710 PASS, 0 failures**, after the corrective rerun described under FAILED below.
- `git diff --cached --check`: exit 0, no whitespace errors.
- Base verified exact: `origin/main` matched `5c09f6f7108c94fd840797b434f34286da30d8b6` before any edit.
- Authority document blob/hash re-verification (Git object bytes, `git rev-parse HEAD:<path>` and `git cat-file -p HEAD:<path> | sha256sum`): Integrated Spec `f7571338e93a408a8aeef93d63275d7076e76f80` / `bfad20123a4f4263d111fc50924a04e15d8e76fdccccb666f159eea0978009ae` — MATCH; PLAN 1A `10aa423531f83a044ded273cde603a04e33c03d0` / `ff9b083a355d9228dcb37e4514c493e36d6090a20d2dcb1c96fc8eb83f8a6af7` — MATCH; 10-Case ACTUAL TEST Protocol `4d7788bb39d68c5cd147408a85954cd5a0e7b8f0` / `11b42a0be56cc761a55929d642c9a5ad1d65d5a0f21d46fdf158f46b23dc2ef0` — MATCH.
- Stale-string scan: no executable "first engineering delivery/request," "the first handoff," Codex-exclusive Engineering framing, live old execution steps, or universal mandatory-PR wording found outside quoted-in-report or clearly-marked-historical text. Limitation: this is a grep-based scan over tracked Markdown, not a semantic/NLP check — a rephrased stale claim using different wording would not be caught by this pass.
- This is documentation/contract evidence only, not compile/typecheck/software/ACTUAL TEST evidence.

## SIMULATED

No synthetic decision fixtures or simulated stress run generated for this activation. No annotation, model, or coach-behavior simulation occurred.

## FAILED

One intermediate failure occurred and was resolved before this report, evidence the checker is working correctly, not a final Stage 2 defect: while staging files for the first `--index` run, a stray OMC session-cache file (`docs/templates/.omc/state/sessions/.../pre-tool-advisory-throttle.json`) was accidentally included via a broad `git add`. The `index-exact-inventory` check correctly failed at **707/708** because that path is not in `docs/PUBLICATION_FILES.json`. The stray file was removed from the working tree and the index, and `--index` was rerun clean at **710/710 PASS, 0 failures**. No such file exists in the final proposed tree or this PR's diff. No other check failure occurred. Google sync remains BLOCKED by missing bindings, as before.

## NOT TESTED

Application/runtime, model behavior, prompt obedience, accessibility/security conformance, expert measurements, Google writes, and empirical token savings. Stage 3 (semantic checker hardening) and PR-A Canonical Foundation implementation are NOT STARTED. No manifest scripts were executed.

## FILES CHANGED

`CLAUDE.md` (new); `AGENTS.md` (DECODE section only, Next.js-generated block preserved); `docs/PROJECT_OPERATING_MANUAL.md`; `docs/COLLABORATION_RULES.md`; `docs/templates/*` (10 files, header activation only); `docs/DEVELOPMENT_RULES.md`; `docs/DOCUMENTATION_RULES.md`; `docs/AI_OPERATING_POLICY.md`; `docs/PUBLICATION_POLICY.md`; `docs/EXPERIMENT_PROTOCOL.md`; `README.md`; `docs/PROJECT_BRIEF.md`; `docs/PRODUCT_SPEC.md`; `docs/DECISION_DATASET_SPEC.md`; `data/schemas/README.md`; `.github/system_prompts/codex_system_prompt.md`; `.github/system_prompts/chatgpt_custom_instructions.md`; `docs/CURRENT_STATUS.md`; `docs/DECISIONS.md`; `handoff/CHATGPT_TO_CODEX.md`; `handoff/CODEX_TO_CHATGPT.md`; `docs/PUBLICATION_FILES.json` (v4); `experiments/ai_execution_log.pending.csv` (1 event, corrected in place). `scripts/check-operating-docs.mjs` changed in two ways: (1) the inventory-version gate bumped 3→4, and (2) `CLAUDE.md`, `docs/PROJECT_OPERATING_MANUAL.md`, `docs/COLLABORATION_RULES.md` added to the `required` file-presence list as now-genuinely-active canonical files, plus the mechanical reconciliation of the checks that formerly read `docs/EXPERIMENT_PROTOCOL.md`'s full slot table/thresholds — those now read the actual current canonical sources (Q1–Q56 for CLEAR/AMBIGUOUS counts, evidence labels, and reserve/no-auto-go safeguards; `docs/DECISIONS.md` D005/D019 for the 4/3/3 family split and the no-auto-GO/STOP safeguard) plus a new structural check that `docs/EXPERIMENT_PROTOCOL.md` is now concise and historical-only. None of the three authority documents, PR #5, or unrelated files are touched.

## RECOMMENDED NEXT DECISION

Review and merge this Stage 2 PR (no auto-merge). Once merged, fetch `origin/main`, verify the resulting HEAD and that the checker passes on merged main, then authorize Stage 3 (semantic checker hardening for the Team OS files). PR-A remains gated behind Stage 3 completion and a fresh Product-approved base per D022. PR #5 remains OPEN / non-canonical candidate and must not be merged in its current form. No ACTUAL TEST or 50/150 expansion is authorized by this activation.

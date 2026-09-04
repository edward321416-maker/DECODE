# DECODE annotation infrastructure

Version: 0.1.0-candidate | Owner: AI/Engineering Lead
Scope: local operator/expert workflow | Status: Product review required; no automatic merge
ACTUAL TEST: NOT YET TESTED.

This is an annotation tool, not Coach Copilot, a hosted service or an AI model. All supplied data is SIMULATED. Eight fields, context, principles, timing conventions and thresholds remain LOCK CANDIDATE. [Design and authority](../docs/ANNOTATION_IMPLEMENTATION.md).

## Install and verify

Use a reviewed checkout with Node.js 24 (tested: 24.14.0) and npm. From the repository root:

```sh
npm install --prefix annotation --ignore-scripts --no-fund --no-audit
node annotation/scripts/verify.mjs
node scripts/check-operating-docs.mjs
```

Ajv 8.20.0 and Playwright Test 1.62.1 are pinned in the annotation lockfile. Installation is an explicit implementation step, not environment sensing. No root-app script runs. The verifier executes Node tests, real browser checks at 1280×900 and 320×740, and syntax checks. It writes unique private .agent-docs/annotation-self-*/result.json and raw outputs. Exit 0 means those checks passed; exit 1 means investigate. It does not append experiment rows, upload data, delete previous runs or establish ACTUAL TEST.

Windows uses installed Chrome by default; other platforms use Playwright Chromium. The delivered run used Chrome 152.0.7977.75. Set PW_CHANNEL to chrome, msedge or chromium in your shell if necessary. A missing browser fails explicitly. Optional download: `node annotation/node_modules/@playwright/test/cli.js install chromium` (NOT EXECUTED here). Linux/macOS, Edge and Firefox/WebKit are NOT TESTED.

Individual checks:

```sh
node --test annotation/test/*.test.mjs
node annotation/node_modules/@playwright/test/cli.js test --config annotation/playwright.config.mjs
```

## Local workflow

```sh
node annotation/src/server.mjs
```

Open http://127.0.0.1:3417. The console names annotation/.local/operator-key; read that access code privately in your editor, never in shared logs or chat. The server never prints its value. Optional arguments: --port NUMBER and --data-dir PRIVATE_DIRECTORY. Keep the directory outside public tracked paths. Do not expose the service through a tunnel, proxy or public bind.

1. Operator signs in and loads ten SIMULATED fixtures or imports JSON. The JSON text/file input is the minimal source/context editor. Edit before import; source/selection become immutable afterward. Correcting source requires a new empty workspace while preserving the original.
2. Create distinct pseudonymous reviewer IDs. Select two clear and two ambiguous secondary cases; the primary receives all ten. One-time codes appear in password fields. Copy privately to the intended participant or reissue to revoke old codes and sessions.
3. Use separate browser profiles/OS sessions. Give a blind expert only their own code and approved neutral clip reference/external viewer. The repository contains illustrative answers; do not give the blind participant repository/OS/operator access. Application isolation cannot establish human independence or prevent collusion.
4. Open a case and select Start / resume timing. Complete the eight fields. UNCERTAIN and INSUFFICIENT_CONTEXT are normal labels requiring reasons; the latter also needs a missing-context note. Preferred decision/severity may be unspecified for uncertainty. Negative verdicts require severity. MULTIPLE_VALID_OPTIONS needs at least two distinct action/reason alternatives.
5. Save draft acknowledges a durable revision. Save and pause saves first, then pauses. Only one timer per reviewer may be active. Closing a tab, network loss, OS sleep or leaving the desk does not pause a running server: explicitly pause before breaks. Saved drafts survive reload. Server restart interrupts open segments with unknown duration, never an invented zero.
6. Submit and lock validates and freezes a label. No edit/undo/adjudication-overwrite endpoint exists. All ten primary labels must be locked before the secondary can open cases. Other reviewers' labels and expected fixture answers are not sent to experts.
7. Operator exports provenance JSON. It preserves sources, independent histories, timing, software fingerprint and transfer lineage, never access codes. Import into an empty workspace only, then reissue reviewer codes. No silent history merge. Keep exports private; no video upload/fetch is implemented.

## Provenance and timing

[JSON Schema](../data/schemas/annotation-0.1.0-candidate.schema.json) defines types/enums/limits. [Semantic validation](src/validation.mjs) additionally enforces consent, timing, sampling, uncertainty, review-plan and history relationships. Use both, not shape validation alone.

UTC ISO-8601 timestamps accompany monotonic active segments measured in milliseconds. Convert COMPLETE totals to seconds only in a later approved report. RUNNING/INCOMPLETE totals are null. No median, P90, agreement, coverage or GO/STOP result is computed.

Unknown context and player/map/agent/rank metadata remain null. REAL-shaped source metadata needs opaque consent reference, ANNOTATION_RESEARCH use scope, media SHA-256 and patch, but software cannot verify their truth. No ACTUAL TEST execution/export mode is enabled. Synthetic origin cannot be promoted via UI, import/export or the publication checker.

Snapshot hashes and export SHA-256 detect accidental changes, not malicious fabrication. Exports hash JSON.stringify(payload) in preserved property order, not a cross-language canonical-JSON signature. Changing key order changes the checksum. Import preserves original source/software references in lineage and records the new workspace fingerprint separately.

## Failure and recovery

| Symptom | Safe next step |
| --- | --- |
| VALIDATION / invalid JSON | Correct the field; input stays visible. Unknown enums/versions are rejected, not coerced. |
| Network failure / uncertain save | Keep the tab; download current draft as a recovery copy, reconnect and reconcile the saved revision. That backup is not a submitted/importable provenance export. Do not blindly replace newer state. |
| CONFLICT / LOCKED | Reconcile against the newer/final revision. Submitted corrections need a reviewed protocol, not snapshot edits. |
| UNAUTHORIZED / 429 | Sessions last 30 minutes. Preserve unsaved input before signing in again. Codes can be reissued. Limit: 30 login attempts/minute, 100 sessions. |
| BLIND_GATE | Complete the primary phase without showing its labels to the secondary. |
| STORE_LIMIT / LIMIT | Requests ≤1 MiB; snapshots ≤800,000 UTF-8 bytes; ≤190 transitions/review. Export acknowledged state and request a reviewed limit revision; never trim history. Limits are not usability measurements. |
| STORE_WRITE_FAILED / STORE_CONFLICT / STORE_CORRUPT | Stop, preserve every snapshot and investigate. A failed write may leave a partial/uncertain final file. No automatic rollback, deletion or second server on the same directory. Only reviewed recovery may resume. |

Snapshots are exclusive append-only files, fsynced before acknowledgement. Git-ignore is not encryption. File modes are best effort and do not establish Windows ACL protection. OS/disk administrators can read data. Approve retention, withdrawal, storage/access, consent, media viewing and human independence before real ingestion. Disk-failure recovery, malicious local users, hosted deployment, full penetration testing and WCAG conformance remain NOT TESTED.

## Programmatic interface and documentation coverage

All imports are ES modules. Validation accepts untrusted objects and returns {valid:boolean, errors:string[]} without coercion. Workspace throws categorized errors; HTTP returns safe errors without stacks or credentials.

| Public API | Input → result |
| --- | --- |
| validateCase / validateBundle / validateAnnotation | object → validation result; annotation additionally accepts optional {draft:boolean} |
| validatePlan / validateExport | plan + bundle / transfer object → validation result |
| contentHash | JSON-serializable value → SHA-256 string, not authentication |
| Workspace constructor | {directory:string, clock?:{wall:()=>string,mono:()=>number}, software:{version:string,source_sha256:string}} → durable workspace or STORE_* |
| authenticate / list / review | code string → actor; actor → own assignments; actor + review ID → own view or UNAUTHORIZED/FORBIDDEN/BLIND_GATE |
| importDocument / createPlan / rotateAccess | bundle/transfer → count; fixed plan → one-time codes; reviewer ID → rotated code |
| operatorView / exportDocument | no arguments → operator metadata / provenance transfer; caller must authorize operator |
| act | actor + review ID + {action,expected_revision,request_id,draft?} → acknowledged view or STATE/CONFLICT/LOCKED/TIMING/VALIDATION/STORE_* |
| startServer / softwareFingerprint | optional {port:number,directory:string,operatorKey?:string} → Promise of {url,close}; no arguments → version/source hash. operatorKey injection is for isolated tests. |
| validateInternalRun | 14-column CSV row + artifact object → publication-contract consistency, not proof of execution |

Manual documentation coverage: all exported validation/server/workspace/publication entrypoints are represented above; internal UI helpers are not an SDK. Executable examples are checked in the delivery run except the explicitly optional download and untested platform variants. [Reverse handoff](../handoff/CODEX_TO_CHATGPT.md) records actual results and Product decisions.

/**
 * Validate the initial public operating foundation, not application/model behavior.
 * Usage: node scripts/check-operating-docs.mjs [--index|--tracked]
 * Read-only; exits 1 on failed assertions, invalid options or missing prerequisites.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8").replace(/\r\n/g, "\n");
const git = (...args) => execFileSync("git", ["-c", "core.quotepath=false", ...args], {
  cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
});
const headings = (text) => [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Read each inventoried file that actually exists as a regular file, decode as UTF-8,
 * normalize CRLF to LF. Deterministic and side-effect-free with respect to check state (it
 * pushes no checks), but it does perform filesystem I/O, so it is a shared loader, not a
 * pure function. Shared by the CLI's own file loop and by
 * scripts/check-operating-docs.semantic.test.mjs, so both build identical input for the
 * pure collectTeamOsSemanticChecks below.
 */
export function loadCanonicalTexts(rootDir, files) {
  const texts = new Map();
  for (const f of files) {
    const absolute = path.join(rootDir, f);
    if (!fs.existsSync(absolute) || !fs.lstatSync(absolute).isFile()) continue;
    const bytes = fs.readFileSync(absolute);
    const content = new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/\r\n/g, "\n");
    texts.set(f, content);
  }
  return texts;
}

/**
 * Team OS semantic drift checks (Stage 3). Pure function: no I/O, no process.exit.
 * Takes the texts Map produced by loadCanonicalTexts (or an in-memory mutation of it)
 * and returns {id, passed}[] covering the ACTIVE Team OS contract — Project Operating
 * Manual, Collaboration Rules C1-C11, router parity, active templates, the retired
 * EXPERIMENT_PROTOCOL shape, D021/D022, and evidence/status boundaries. This validates
 * repository text/contracts only; it does not prove agent/human obedience or runtime
 * behavior.
 */
export function collectTeamOsSemanticChecks(texts) {
  const c = [];
  const chk = (id, passed) => c.push({ id, passed: Boolean(passed) });
  const get = (f) => texts.get(f) || "";

  // A — Project Operating Manual
  const pom = get("docs/PROJECT_OPERATING_MANUAL.md");
  chk("pom-status-active", /^Status: ACTIVE OPERATING POLICY/m.test(pom));
  chk("pom-authority-d021", /^Authority:.*D021/m.test(pom));
  chk("pom-router-role", pom.includes("canonical repository task router"));
  chk("pom-read-flow-complete", [
    "Current Status](CURRENT_STATUS.md)", "Decisions](DECISIONS.md)", "applicable handoff",
    "task-specific Spec / Plan", "Collaboration Rules](COLLABORATION_RULES.md)",
    "AI Operating Policy](AI_OPERATING_POLICY.md)", "Development Rules](DEVELOPMENT_RULES.md)",
    "Documentation Rules](DOCUMENTATION_RULES.md)", "Graphics Rules](GRAPHICS_RULES.md)",
    "Publication Policy](PUBLICATION_POLICY.md)", "docs/templates/",
  ].every((s) => pom.includes(s)));
  {
    const taskIdx = pom.indexOf("An approved task-specific Spec / Plan / Handoff.");
    const manualIdx = pom.indexOf("This Project Operating Manual.");
    chk("pom-precedence-task-contract", taskIdx !== -1 && manualIdx !== -1 && taskIdx < manualIdx);
  }
  chk("pom-plan1a-override", pom.includes("PLAN 1A") && pom.includes("Whole-PR verification contract overrides"));
  chk("pom-evidence-not-collapsed",
    /\|\s*Evaluation purpose\/mode\s*\|/.test(pom) &&
    /\|\s*Data origin\s*\|/.test(pom) &&
    /\|\s*Execution status\s*\|/.test(pom));

  // B — Collaboration Rules
  const col = get("docs/COLLABORATION_RULES.md");
  {
    const cHeads = [...col.matchAll(/^## (C\d+)/gm)].map((m) => m[1]);
    chk("col-c-headings-order", same(cHeads, Array.from({ length: 11 }, (_, i) => "C" + (i + 1))));
  }
  chk("col-branch-optional", col.includes("Branch is optional."));
  chk("col-pr-optional", col.includes("PR is optional."));
  chk("col-direct-main-allowed", col.includes("Direct-main workflow is allowed"));
  chk("col-free-parallel", col.includes("Free parallel development is allowed."));
  chk("col-no-ownership", col.includes("No task/feature ownership requirement."));
  chk("col-c6-verification-split", col.includes("Minimum verification") && col.includes("Elevate to full verification for:"));
  chk("col-c7-recovery", col.includes("may be corrected by whichever developer/approved AI is available"));
  chk("col-no-force-push",
    col.includes("Force push and destructive reset remain prohibited") ||
    col.includes("Force-push history rewriting remains prohibited"));
  chk("col-no-destructive-reset", col.includes("destructive reset remain prohibited"));
  chk("col-d017-boundary", col.includes("remain under D017"));
  chk("col-precedence-stricter",
    col.includes("Approved task-specific Spec / Plan / Handoff may impose stricter workflow") &&
    col.includes("PLAN 1A"));

  // C — Router parity
  const agents = get("AGENTS.md");
  const claude = get("CLAUDE.md");
  chk("router-agents-to-manual", agents.includes("docs/PROJECT_OPERATING_MANUAL.md"));
  chk("router-claude-to-manual", claude.includes("docs/PROJECT_OPERATING_MANUAL.md"));
  chk("router-no-duplicate-c-headings", !/^## C\d+/m.test(agents) && !/^## C\d+/m.test(claude));
  {
    // Thinness guard: a router copying several distinctive C1-C11 rule sentences into its own
    // body is a policy-copy even without "## Cn" headings. Not a line-count limit — counts
    // recognizable rule anchors instead.
    const cRuleAnchors = [
      "Peer approval is not required.", "Free parallel development is allowed.",
      "No fixed small-PR size rule.", "Self-merge is allowed where the applicable task/host permits.",
      "Branch is optional.", "PR is optional.",
      "may be corrected by whichever developer/approved AI is available",
      "No notification is required for every task.", "Conventional Commits are not mandatory.",
      "Routine implementation details are chosen by the implementer within LOCKED contracts.",
    ];
    const countAnchors = (text) => cRuleAnchors.filter((a) => text.includes(a)).length;
    chk("router-no-body-copy", countAnchors(agents) < 3 && countAnchors(claude) < 3);
  }
  chk("router-claude-chatgpt-separation", claude.includes("not a Claude Code instruction set"));

  // D — Active templates
  const templateFiles = [
    "docs/templates/CHANGE_REPORT_TEMPLATE.md", "docs/templates/DECISION_RECORD_TEMPLATE.md",
    "docs/templates/DESIGN_SPEC_TEMPLATE.md", "docs/templates/HANDOFF_TEMPLATE.md",
    "docs/templates/IMPLEMENTATION_PLAN_TEMPLATE.md", "docs/templates/PLANNING_BRIEF_TEMPLATE.md",
    "docs/templates/README.md", "docs/templates/RESEARCH_NOTE_TEMPLATE.md",
    "docs/templates/TASK_BRIEF_TEMPLATE.md", "docs/templates/TEST_EVIDENCE_TEMPLATE.md",
  ];
  for (const f of templateFiles) {
    const t = get(f);
    chk("tmpl-all-active:" + f, t.includes("ACTIVE TEMPLATE") && /Authority:.*D021/.test(t));
  }
  chk("tmpl-planning-brief-fields", [
    "## Known facts", "## Assumptions / hypotheses", "## Unknowns", "## Proposed scope",
    "## Success criteria", "## Material decisions required",
  ].every((h) => get("docs/templates/PLANNING_BRIEF_TEMPLATE.md").includes(h)));
  chk("tmpl-research-note-fields", [
    "## VERIFIED FACTS", "## INFERENCES", "## HYPOTHESES", "## UNKNOWN",
  ].every((h) => get("docs/templates/RESEARCH_NOTE_TEMPLATE.md").includes(h)));
  chk("tmpl-design-spec-fields", [
    "## Interfaces / contracts", "## Data flow", "## State / error states",
    "## Security / rights / privacy / egress", "## Migration / compatibility",
    "## Acceptance criteria", "## Test strategy", "## Evidence boundaries",
  ].every((h) => get("docs/templates/DESIGN_SPEC_TEMPLATE.md").includes(h)));
  chk("tmpl-impl-plan-fields", [
    "## Exact approved base", "## Exact files / symbols affected",
    "## Task-by-task implementation sequence", "## TDD / regression cycle",
    "## Exact verification commands", "## Explicit exclusions",
    "## Integration method", "## Completion artifacts",
  ].every((h) => get("docs/templates/IMPLEMENTATION_PLAN_TEMPLATE.md").includes(h)));
  chk("tmpl-test-evidence-fields", [
    "## Evaluation purpose/mode", "## Data origin", "## Execution status",
  ].every((h) => get("docs/templates/TEST_EVIDENCE_TEMPLATE.md").includes(h)));
  chk("tmpl-change-report-neutral", get("docs/templates/CHANGE_REPORT_TEMPLATE.md").includes("Integration method: [DIRECT_MAIN"));
  chk("tmpl-handoff-eight-sections", [
    "## IMPLEMENTED", "## ACTUAL TEST", "## SELF-BENCHMARK", "## SIMULATED",
    "## FAILED", "## NOT TESTED", "## FILES CHANGED", "## RECOMMENDED NEXT DECISION",
  ].every((h) => get("docs/templates/HANDOFF_TEMPLATE.md").includes(h)));

  // E — Stale executable instruction detection (currently-read instruction sources only;
  // completion reports and DECISIONS.md legitimately narrate/preserve this phrasing as history)
  const activeFiles = [
    "docs/PROJECT_OPERATING_MANUAL.md", "docs/COLLABORATION_RULES.md", "docs/DEVELOPMENT_RULES.md",
    "docs/DOCUMENTATION_RULES.md", "docs/AI_OPERATING_POLICY.md", "docs/PUBLICATION_POLICY.md",
    "AGENTS.md", "CLAUDE.md", ".github/system_prompts/codex_system_prompt.md",
    ".github/system_prompts/chatgpt_custom_instructions.md", "handoff/CHATGPT_TO_CODEX.md",
    "README.md", "docs/PROJECT_BRIEF.md", "docs/PRODUCT_SPEC.md", "docs/DECISION_DATASET_SPEC.md",
    "data/schemas/README.md",
    ...templateFiles,
  ];
  const stalePatterns = [
    ["stale-first-engineering-request", /first engineering (?:request|delivery)/i],
    ["stale-first-handoff", /the first handoff/i],
    ["stale-codex-exclusive", /Codex is (?:the )?(?:AI\/Engineering Lead|exclusive Engineering)/i],
    ["stale-primary-expert-all-ten", /Primary expert labels all ten/i],
    ["stale-second-expert-fixed", /Second expert labels two clear and two ambiguous/i],
    ["stale-universal-pr", /through a normal PR|every change must use a PR|all changes require a PR|a PR is mandatory for all changes/i],
    ["stale-draft-scaffold", /DRAFT SCAFFOLD \/ NOT ACTIVE/],
  ];
  for (const [id, pattern] of stalePatterns) {
    chk(id, !activeFiles.some((f) => pattern.test(get(f))));
  }

  // F — Protocol authority: EXPERIMENT_PROTOCOL.md must stay a concise historical shim;
  // Q1-Q56 remains sole current execution/design authority (checked separately elsewhere)
  const protocol = get("docs/EXPERIMENT_PROTOCOL.md");
  chk("protocol-status-historical", protocol.includes("HISTORICAL CANDIDATE SUMMARY") && protocol.includes("SUPERSEDED FOR EXECUTION"));
  chk("protocol-authority-link",
    protocol.includes("not an executable protocol") &&
    protocol.includes("sole current 10-Case execution/design authority") &&
    protocol.includes("Q1–Q56"));
  chk("protocol-no-slot-table", !/^\|\s*S0[1-9]\s*\|/m.test(protocol) && !/^\|\s*S10\s*\|/m.test(protocol));
  chk("protocol-no-execution-heading", !protocol.includes("## Execution"));
  chk("protocol-no-measurement-heading", !protocol.includes("## Measurement specification"));
  chk("protocol-no-go-stop-heading", !protocol.includes("## GO / STOP hypotheses"));
  chk("protocol-no-required-outputs-heading", !protocol.includes("## Required real-run outputs"));
  chk("protocol-concise-size", protocol.length > 0 && protocol.length < 3000);

  // G — D021 / D022 anchored checks (existing D005/D019-anchored checks stay in the CLI's
  // own logic; these are new, D021/D022-specific)
  const decisions = get("docs/DECISIONS.md");
  {
    const d021 = decisions.match(/\| D021 \|[\s\S]*?\| U-DECODE-TEAM-OS-2026-09-06 \|/)?.[0] || "";
    chk("d021-contract",
      d021.includes("LOCKED OPERATING POLICY") &&
      d021.includes("Project Operating Manual") &&
      d021.includes("Collaboration Rules") && d021.includes("C1–C11") &&
      d021.includes("remain under D017") &&
      d021.includes("wins over the collaboration defaults"));
  }
  {
    const d022 = decisions.match(/\| D022 \|[\s\S]*?\| U-DECODE-TEAM-OS-SEQUENCE-2026-09-06 \|/)?.[0] || "";
    chk("d022-sequence",
      d022.includes("Stage 1 → Stage 2 → Stage 3 must complete before PR-A begins") &&
      d022.includes("valid historical M0 receipt evidence"));
    chk("d022-product-approved-base", d022.includes("externally verified and explicitly Product-approved before PR-A branch creation"));
    // Scoped to D022's own replacement/future-base clause only, not the whole DECISIONS.md
    // file — historical SHA provenance (e.g. D020's M0 receipt SHA) and any later, separate,
    // Product-approved decision row that legitimately records a literal PR-A base remain
    // allowed; only D022 itself may never pre-assign the unknown future SHA.
    chk("d022-no-future-base-assignment", !/PR-A(?:\s+start)? base[^\n]{0,40}\b[0-9a-f]{40}\b/i.test(d022));
  }

  // H — Evidence and status boundaries
  chk("evidence-no-promotion-safeguard", pom.includes("never becomes ACTUAL TEST evidence"));
  chk("evidence-unknown-not-zero", get("docs/DOCUMENTATION_RULES.md").includes("UNKNOWN/null means missing, never zero"));
  // Current-state guards must inspect only the current snapshot, not any historical section
  // that happens to contain matching wording. Everything before the first "(historical"
  // marker (case-insensitive) is the current region; sections after it are explicitly
  // marked historical and are not scanned by these two checks.
  const currentStatusRegion = get("docs/CURRENT_STATUS.md").split(/\(historical/i)[0];
  chk("status-actual-test-not-yet-tested", /ACTUAL TEST[\s\S]{0,100}NOT YET TESTED/.test(currentStatusRegion));
  // PR-A merged (Product's independent post-merge audit). The current region must state the
  // MERGED phase and must NOT claim a stale pre-merge phase (NOT STARTED / IMPLEMENTATION READY
  // FOR PRODUCT REVIEW) or an overclaimed phase this checker cannot itself verify (DEPLOYED).
  // Renamed from status-pr-a-not-overclaimed: expected to be revised again on any future phase
  // transition, per that check's own design precedent — not a regression.
  chk("status-pr-a-merged",
    /PR-A\s*=?\s*MERGED/.test(currentStatusRegion) &&
    !/PR-A\s*=?\s*(NOT STARTED|IMPLEMENTATION READY FOR PRODUCT REVIEW|DEPLOYED)/.test(currentStatusRegion));
  // Anti-overclaim guard for the post-merge phase: the current region must explicitly record
  // that no next implementation task, PLAN 1B, 50/150 expansion, or deployment is authorized
  // merely because PR-A merged.
  chk("status-no-next-scope-overclaim",
    currentStatusRegion.includes("no next implementation task is currently authorized") &&
    /Gate G[\s\S]{0,60}NOT AUTHORIZED/.test(currentStatusRegion) &&
    /50\/150[\s\S]{0,60}NOT AUTHORIZED/i.test(currentStatusRegion));
  // Phase guard, not a permanent rule: while the current CURRENT_STATUS region says PR-A is
  // NOT STARTED and awaiting Product's exact-SHA base approval, the current Product->Engineering
  // handoff must represent a gate/no-open-engineering-task state, not an executable
  // completed-amendment implementation request. Always pushed (never conditionally omitted) so
  // the check set stays stable across mutations; vacuously true when the pre-PR-A phase
  // precondition itself doesn't hold — including every revision since PR-A implementation began.
  // That is not a regression of this guard; it is the anticipated phase transition the guard's
  // own design comment predicted.
  {
    const preprAPhase = /PR-A\s*=?\s*NOT STARTED/.test(currentStatusRegion) &&
      /Product.{0,40}exact-SHA PR-A base approval|explicitly approve(?:s)? that exact SHA as the PR-A base/i.test(currentStatusRegion);
    const chatgptToCodex = get("handoff/CHATGPT_TO_CODEX.md");
    chk("handoff-pr-a-base-gate",
      !preprAPhase ||
      (chatgptToCodex.includes("No engineering implementation is currently authorized") &&
        chatgptToCodex.includes("PR-A = NOT STARTED")));
  }
  // Post-merge phase guard: while the current region says PR-A is MERGED, the current
  // Product->Engineering handoff must represent a gate/no-open-engineering-task state, must not
  // still authorize the already-completed PR-A implementation, and must not treat PR-A's merge
  // as automatic authorization for PLAN 1B. Vacuously true before this phase is reached.
  {
    const postPrAMergePhase = /PR-A\s*=?\s*MERGED/.test(currentStatusRegion);
    const chatgptToCodex = get("handoff/CHATGPT_TO_CODEX.md");
    chk("handoff-post-pr-a-gate",
      !postPrAMergePhase ||
      (chatgptToCodex.includes("No engineering implementation is currently authorized") &&
        chatgptToCodex.includes("Do not start PLAN 1B merely because PR-A merged") &&
        chatgptToCodex.includes("await Product's next explicitly approved scope")));
  }

  // I — D023 evidence/provenance contract (PLAN 1A Section 3 amendment)
  const plan1a = get("docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md");
  {
    const modeBlock = plan1a.match(/EvaluationMode:\n\n((?:- .+\n)+)/)?.[1] || "";
    chk("plan1a-mode-no-bakeoff",
      !modeBlock.includes("MODEL_BAKE_OFF") &&
      modeBlock.includes("ACTUAL TEST") && modeBlock.includes("SELF-BENCHMARK") && modeBlock.includes("N/A"));
    const originBlock = plan1a.match(/DataOrigin:\n\n((?:- .+\n)+)/)?.[1] || "";
    chk("plan1a-origin-no-mixed",
      !originBlock.includes("MIXED") &&
      originBlock.includes("REAL") && originBlock.includes("SIMULATED") && originBlock.includes("UNKNOWN"));
  }
  chk("plan1a-no-actualteststatus-axis", !/ActualTestStatus:\s*\n+\s*-\s/.test(plan1a));
  chk("plan1a-actual-requires-real", plan1a.includes("ACTUAL TEST requires DataOrigin=REAL"));
  chk("plan1a-separate-records-required", plan1a.includes("create separate evidence records for the REAL portion and the SIMULATED portion"));

  // J — D024 ACTUAL TEST pre-execution record semantics (PLAN 1A Section 12 invariant #5 amendment)
  chk("plan1a-preexecution-record-allowed",
    plan1a.includes("is valid as a pre-execution/planned record") &&
    !plan1a.includes("no ACTUAL TEST record exists yet"));
  chk("plan1a-preexecution-requires-real",
    plan1a.includes("ACTUAL TEST + DataOrigin=REAL + ExecutionStatus=NOT TESTED record is valid"));
  chk("plan1a-preexecution-excluded-from-denominator",
    plan1a.includes("excluded from executed sample size") &&
    plan1a.includes("expert agreement") &&
    plan1a.includes("threshold calculations") &&
    plan1a.includes("GO/REVISE/STOP evidence") &&
    plan1a.includes("does not authorize 50/150 expansion"));

  return c;
}

/** Parse project CSV rows, including quoted comma/newline values; reject unmatched quotes. */
function csv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else if (!quoted && field !== "") throw new Error("Malformed CSV quote");
      else quoted = !quoted;
    } else if (ch === "," && !quoted) { row.push(field); field = ""; }
    else if (ch === "\n" && !quoted) { row.push(field); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (quoted) throw new Error("Unclosed CSV quote");
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function main() {
const checks = [];
const check = (id, passed) => checks.push({ id, passed: Boolean(passed) });
try {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length && !["--index", "--tracked"].includes(args[0]))) {
    throw new Error("Use no option, --index, or --tracked");
  }
  const inventory = JSON.parse(read("docs/PUBLICATION_FILES.json"));
  const files = inventory.files;
  if (!Array.isArray(files) || files.some((f) => typeof f !== "string")) {
    throw new Error("Publication inventory must list file paths");
  }
  check("inventory-version", inventory.version === 6);
  check("inventory-sorted-unique", same(files, [...new Set(files)].sort()));
  const allowed = new Set(files);
  const required = [
    "README.md", "AGENTS.md", "CLAUDE.md", ".gitignore", ".gemini_sync.md",
    ".github/system_prompts/codex_system_prompt.md",
    ".github/system_prompts/chatgpt_custom_instructions.md",
    "docs/PROJECT_OPERATING_MANUAL.md", "docs/COLLABORATION_RULES.md",
    "docs/PROJECT_BRIEF.md", "docs/CURRENT_STATUS.md", "docs/DECISIONS.md",
    "docs/PRODUCT_SPEC.md", "docs/DECISION_DATASET_SPEC.md", "docs/EXPERIMENT_PROTOCOL.md",
    "docs/RISKS.md", "docs/AI_OPERATING_POLICY.md", "docs/DEVELOPMENT_RULES.md",
    "docs/DOCUMENTATION_RULES.md", "docs/GRAPHICS_RULES.md", "docs/RULES_REVIEW.md",
    "docs/SETUP_VERIFICATION.md", "docs/PUBLICATION_POLICY.md", "docs/MAIN_PUBLICATION.md",
    "docs/PUBLICATION_FILES.json",
    "docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md",
    "docs/superpowers/specs/2026-09-06-decode-10-case-actual-test-protocol-v1.md",
    "docs/superpowers/specs/2026-09-06-decode-integrated-spec-v1.md",
    "handoff/CHATGPT_TO_CODEX.md", "handoff/CODEX_TO_CHATGPT.md",
    "handoff/DECODE-SETUP-2026-09-02.md", "handoff/DECODE-RULES-2026-09-02.md",
    "handoff/DECODE-REPOSITORY-2026-09-02.md", "data/schemas/README.md",
    "data/samples/README.md", "experiments/results/README.md",
    "experiments/experiment_log.csv", "experiments/ai_execution_log.pending.csv",
    "scripts/check-operating-docs.mjs",
  ];
  for (const f of required) check("required:" + f, allowed.has(f));
  const texts = loadCanonicalTexts(root, files);
  const unsafe = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/,
    /\bRGAPI-[0-9a-f-]{30,}\b/i,
    /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/,
    /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/,
    /[?&](?:access_token|token|X-Amz-Signature|sig)=[^&\s)"\x60]+/i,
    /https?:\/\/[^/\s:@]+:[^/\s@]+@/i,
    /https?:\/\/(?:www\.)?chatgpt\.com\/(?:c\/|g\/g-p-)/i,
    /(?:chatgpt-conversation|codex):\/\/(?:[0-9a-f-]{20,})/i,
    /\b[CD]:[\\/]+Users[\\/]/i,
    /\/(?:Users|home)\/[^/\s]+\/(?:Documents|Desktop|\.codex)\//,
  ];
  for (const f of files) {
    const safePath = !path.isAbsolute(f) && !f.includes("\\") &&
      !f.split("/").some((part) => ["..", ".", ""].includes(part));
    check("safe-path:" + f, safePath);
    if (!safePath) continue;
    check("public-scope:" + f, !/^(?:\.env(?:\.|$)|\.agent-docs\/|app\/|components\/|lib\/|node_modules\/|work\/|outputs\/|data\/(?:raw|private)\/|experiments\/private\/|package(?:-lock)?\.json$)/.test(f));
    const absolute = path.join(root, f);
    const exists = fs.existsSync(absolute) && fs.lstatSync(absolute).isFile();
    check("regular-file:" + f, exists);
    if (!exists) continue;
    const content = texts.get(f);
    check("newline:" + f, content.endsWith("\n"));
    check("whitespace:" + f, !/[ \t]+$/m.test(content));
    check("no-merge-markers:" + f, !/^(?:<<<<<<< |=======\s*$|>>>>>>> )/m.test(content));
    check("public-content:" + f, !unsafe.some((pattern) => pattern.test(content)));
  }
  checks.push(...collectTeamOsSemanticChecks(texts));
  for (const [f, content] of texts) {
    if (!f.endsWith(".md")) continue;
    check("balanced-fences:" + f, (content.match(/^\x60{3}/gm) || []).length % 2 === 0);
    const prose = content.replace(/^\x60{3}[^\n]*\n[\s\S]*?^\x60{3}[ \t]*$/gm, "");
    for (const match of prose.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)) {
      const link = match[1];
      if (/^(?:https?:|mailto:|#)/.test(link)) continue;
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(f), decodeURIComponent(link.split("#")[0])));
      check("published-link:" + f + "->" + target, allowed.has(target));
    }
  }
  const handoffSections = ["IMPLEMENTED", "ACTUAL TEST", "SELF-BENCHMARK", "SIMULATED",
    "FAILED", "NOT TESTED", "FILES CHANGED", "RECOMMENDED NEXT DECISION"];
  for (const f of files.filter((x) => /^handoff\/(?:CODEX_TO_CHATGPT|DECODE-)/.test(x))) {
    check("handoff-sections:" + f, same(headings(texts.get(f) || ""), handoffSections));
  }
  check("sync-sections", same(headings(texts.get(".gemini_sync.md") || ""), [
    "Executed Actions", "GSTACK & Skill Usage", "PR Status", "Unresolved Issues / Next Steps",
  ]));
  for (const [f, prefix, count] of [
    ["docs/DEVELOPMENT_RULES.md", "DEV", 12], ["docs/DOCUMENTATION_RULES.md", "DOC", 10],
    ["docs/GRAPHICS_RULES.md", "GFX", 12],
  ]) {
    const ids = [...(texts.get(f) || "").matchAll(new RegExp("^- (" + prefix + "-\\d{2})", "gm"))].map((m) => m[1]);
    check("rule-ids:" + f, same(ids, Array.from({ length: count }, (_, i) => prefix + "-" + String(i + 1).padStart(2, "0"))));
  }
  const dataset = texts.get("docs/DECISION_DATASET_SPEC.md") || "";
  const expert = [...dataset.matchAll(/^\| [1-8] \| ([^|]+) \|/gm)].map((m) => m[1].trim());
  check("eight-expert-fields", same(expert, ["Trigger", "Observed Decision", "Verdict",
    "Preferred Decision", "Decision Principle", "Expert Reason", "Severity", "Confidence"]));
  for (const id of ["NUMBER_ADVANTAGE_PRESERVATION", "DUEL_QUALITY", "INFORMATION_ADVANTAGE",
    "TIME_PRESSURE_RISK", "POST_KILL_REPOSITION", "POST_CONTACT_RESET", "VALUE_THEN_DISENGAGE",
    "SPACE_CONVERSION", "TRADE_DISTANCE", "SUPPORT_LINE_OF_SIGHT", "SYNCHRONIZED_CONTACT", "ISOLATION_AVOIDANCE"]) {
    check("seed:" + id, dataset.includes(id));
  }
  for (const heading of ["eight expert fields", "context", "twelve seed principles"]) {
    check("candidate:" + heading, dataset.includes("## LOCK CANDIDATE — " + heading));
  }
  // Canonical 10-Case execution/design authority is Q1-Q56 (below), not docs/EXPERIMENT_PROTOCOL.md,
  // which Team OS Stage 2 retired to a concise historical summary (D018). Safeguards formerly checked
  // against the old candidate protocol are now checked against their actual current canonical sources.
  const decisionsText = texts.get("docs/DECISIONS.md") || "";
  check("family-433-canonical", decisionsText.includes("clear 6 + ambiguous 4; primary family 4/3/3"));
  check("no-auto-go-canonical", decisionsText.includes("Thresholds never auto-authorize GO/STOP and no 50/150 expansion is automatic"));
  const actualProtocol = texts.get("docs/superpowers/specs/2026-09-06-decode-10-case-actual-test-protocol-v1.md") || "";
  check("actual-protocol-version", actualProtocol.includes("10-Case ACTUAL TEST Protocol v1.0"));
  check("actual-protocol-q1-q56", actualProtocol.includes("Q1–Q56") && !actualProtocol.includes("Q1–Q55"));
  check("actual-protocol-reserve-2-1", actualProtocol.includes("CLEAR reserve = 2") && actualProtocol.includes("AMBIGUOUS reserve = 1"));
  check("actual-protocol-reserve-clarity-allocation", actualProtocol.includes("top 2 CLEAR strata") && actualProtocol.includes("top 1 AMBIGUOUS stratum"));
  check("actual-protocol-no-auto-go", actualProtocol.includes("threshold satisfied ≠ automatic GO") && actualProtocol.includes("threshold missed ≠ automatic STOP"));
  check("actual-protocol-clear-ambiguous-canonical", actualProtocol.includes("- CLEAR = 6") && actualProtocol.includes("- AMBIGUOUS = 4"));
  for (const label of ["ACTUAL TEST", "SELF-BENCHMARK", "SIMULATED", "NOT YET TESTED"]) {
    check("evidence-label:" + label, actualProtocol.includes("- " + label));
  }
  const protocol = texts.get("docs/EXPERIMENT_PROTOCOL.md") || "";
  check("protocol-historical-only", protocol.includes("HISTORICAL CANDIDATE SUMMARY") &&
    protocol.includes("SUPERSEDED FOR EXECUTION") &&
    !/^\| S0[1-9] \|/m.test(protocol) && !/^\| S10 \|/m.test(protocol) &&
    !protocol.includes("## Execution") && !protocol.includes("## Measurement specification") &&
    !protocol.includes("## GO / STOP hypotheses") && !protocol.includes("## Required real-run outputs") &&
    protocol.length < 3000);
  for (const f of ["README.md", "docs/CURRENT_STATUS.md", "docs/DECISION_DATASET_SPEC.md",
    "docs/EXPERIMENT_PROTOCOL.md",
    "docs/superpowers/plans/2026-09-06-decode-plan-1a-canonical-foundation.md",
    "docs/superpowers/specs/2026-09-06-decode-10-case-actual-test-protocol-v1.md",
    "docs/superpowers/specs/2026-09-06-decode-integrated-spec-v1.md",
    "handoff/CHATGPT_TO_CODEX.md", "handoff/CODEX_TO_CHATGPT.md"]) {
    check("actual-unexecuted:" + f, /ACTUAL TEST[\s\S]{0,100}NOT YET TESTED/.test(texts.get(f) || ""));
  }
  for (const f of ["docs/SETUP_VERIFICATION.md", "docs/RULES_REVIEW.md",
    "handoff/DECODE-SETUP-2026-09-02.md", "handoff/DECODE-RULES-2026-09-02.md",
    "handoff/DECODE-REPOSITORY-2026-09-02.md"]) {
    check("historical:" + f, (texts.get(f) || "").includes("HISTORICAL SNAPSHOT"));
  }
  check("public-main-decision", /\| D013 \| USER-AUTHORIZED OPERATING POLICY \| DECODE is public; main is the single Source of Truth/.test(texts.get("docs/DECISIONS.md") || ""));
  for (const f of ["docs/PUBLICATION_POLICY.md", ".github/system_prompts/codex_system_prompt.md", ".github/system_prompts/chatgpt_custom_instructions.md"]) {
    check("canonical-main:" + f, /main.{0,60}single source of truth/i.test(texts.get(f) || ""));
  }
  const runs = csv(texts.get("experiments/experiment_log.csv") || "");
  check("experiment-header", same(runs[0], ["run_id", "timestamp", "evaluation_mode", "data_origin", "execution_status",
    "protocol_version", "schema_version", "code_revision", "input_reference", "case_count",
    "evaluator_reference", "artifact_path", "summary", "limitations"]));
  check("no-executed-experiment-rows", runs.length === 1);
  const pending = csv(texts.get("experiments/ai_execution_log.pending.csv") || "");
  check("pending-header", same(pending[0], ["Timestamp", "Acquired Skill", "Estimated Tokens Used", "Task Summary"]));
  const events = new Set();
  for (const [i, row] of pending.slice(1).entries()) {
    const event = row[3]?.match(/event_id=([a-z0-9-]+)/)?.[1];
    check("pending-row:" + i, row.length === 4 && !Number.isNaN(Date.parse(row[0])) && row[1] === "NONE" &&
      row[2] === "UNKNOWN" && row[3].includes("SYNC BLOCKED") && event && !events.has(event));
    if (event) events.add(event);
  }
  if (args[0]) {
    const indexed = args[0] === "--index";
    const listed = indexed ? git("ls-files", "-z") : git("ls-tree", "-r", "--name-only", "-z", "HEAD");
    const names = listed.split("\0").filter(Boolean).sort();
    check(indexed ? "index-exact-inventory" : "HEAD-exact-inventory", same(names, files));
    for (const f of files) {
      const blob = git("show", (indexed ? ":" : "HEAD:") + f).replace(/\r\n/g, "\n");
      check("reviewed-blob:" + f, blob === texts.get(f));
    }
  }
} catch (error) {
  checks.push({ id: "checker-error", passed: false, message: error.message });
}
const failures = checks.filter((c) => !c.passed);
console.log(JSON.stringify({
  scope: "operating-foundation static publication checks; NOT an ACTUAL TEST",
  checkedAt: new Date().toISOString(), checks: checks.length, passed: checks.length - failures.length,
  failed: failures.length, failures,
}, null, 2));
process.exitCode = failures.length ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}

/**
 * Validate the initial public operating foundation, not application/model behavior.
 * Usage: node scripts/check-operating-docs.mjs [--index|--tracked]
 * Read-only; exits 1 on failed assertions, invalid options or missing prerequisites.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checks = [];
const check = (id, passed) => checks.push({ id, passed: Boolean(passed) });
const read = (name) => fs.readFileSync(path.join(root, name), "utf8").replace(/\r\n/g, "\n");
const git = (...args) => execFileSync("git", ["-c", "core.quotepath=false", ...args], {
  cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
});
const headings = (text) => [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

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
  check("inventory-version", inventory.version === 1);
  check("inventory-sorted-unique", same(files, [...new Set(files)].sort()));
  const allowed = new Set(files);
  const required = [
    "README.md", "AGENTS.md", ".gitignore", ".gemini_sync.md",
    ".github/system_prompts/codex_system_prompt.md",
    ".github/system_prompts/chatgpt_custom_instructions.md",
    "docs/PROJECT_BRIEF.md", "docs/CURRENT_STATUS.md", "docs/DECISIONS.md",
    "docs/PRODUCT_SPEC.md", "docs/DECISION_DATASET_SPEC.md", "docs/EXPERIMENT_PROTOCOL.md",
    "docs/RISKS.md", "docs/AI_OPERATING_POLICY.md", "docs/DEVELOPMENT_RULES.md",
    "docs/DOCUMENTATION_RULES.md", "docs/GRAPHICS_RULES.md", "docs/RULES_REVIEW.md",
    "docs/SETUP_VERIFICATION.md", "docs/PUBLICATION_POLICY.md", "docs/MAIN_PUBLICATION.md",
    "docs/PUBLICATION_FILES.json", "handoff/CHATGPT_TO_CODEX.md", "handoff/CODEX_TO_CHATGPT.md",
    "handoff/DECODE-SETUP-2026-09-02.md", "handoff/DECODE-RULES-2026-09-02.md",
    "handoff/DECODE-REPOSITORY-2026-09-02.md", "data/schemas/README.md",
    "data/samples/README.md", "experiments/results/README.md",
    "experiments/experiment_log.csv", "experiments/ai_execution_log.pending.csv",
    "scripts/check-operating-docs.mjs",
  ];
  for (const f of required) check("required:" + f, allowed.has(f));
  const texts = new Map();
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
    check("regular-file:" + f, fs.existsSync(absolute) && fs.lstatSync(absolute).isFile());
    if (!fs.existsSync(absolute) || !fs.lstatSync(absolute).isFile()) continue;
    const bytes = fs.readFileSync(absolute);
    const content = new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/\r\n/g, "\n");
    texts.set(f, content);
    check("newline:" + f, content.endsWith("\n"));
    check("whitespace:" + f, !/[ \t]+$/m.test(content));
    check("no-merge-markers:" + f, !/^(?:<<<<<<< |=======\s*$|>>>>>>> )/m.test(content));
    check("public-content:" + f, !unsafe.some((pattern) => pattern.test(content)));
  }
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
  const protocol = texts.get("docs/EXPERIMENT_PROTOCOL.md") || "";
  const slots = [...protocol.matchAll(/^\| (S\d{2}) \| (Clear|Ambiguous) \| ([^|]+) \|/gm)];
  check("slot-ids", same(slots.map((s) => s[1]), Array.from({ length: 10 }, (_, i) => "S" + String(i + 1).padStart(2, "0"))));
  check("slot-kinds", slots.filter((s) => s[2] === "Clear").length === 6 && slots.filter((s) => s[2] === "Ambiguous").length === 4);
  check("slot-families", same(["Fight Selection", "Post-contact Decision", "Tradeability & Spacing"].map((f) => slots.filter((s) => s[3].trim() === f).length), [4, 3, 3]));
  check("candidate-thresholds", protocol.includes("GO / STOP hypotheses — NOT validated thresholds"));
  for (const label of ["ACTUAL TEST", "SELF-BENCHMARK", "SIMULATED", "NOT YET TESTED"]) {
    check("evidence-label:" + label, protocol.includes("| " + label + " |"));
  }
  for (const f of ["README.md", "docs/CURRENT_STATUS.md", "docs/DECISION_DATASET_SPEC.md",
    "docs/EXPERIMENT_PROTOCOL.md", "handoff/CHATGPT_TO_CODEX.md", "handoff/CODEX_TO_CHATGPT.md"]) {
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

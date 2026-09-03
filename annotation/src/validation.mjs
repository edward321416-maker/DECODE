import fs from "node:fs";
import { createHash } from "node:crypto";
export const contentHash = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
import Ajv2020 from "ajv/dist/2020.js";
export const VERSION = "0.1.0-candidate";
export const schema = JSON.parse(fs.readFileSync(new URL("../../data/schemas/annotation-0.1.0-candidate.schema.json", import.meta.url)));
const ajv = new Ajv2020({ strict: true, allErrors: true, coerceTypes: false, removeAdditional: false });
ajv.addSchema(schema);
const validators = Object.fromEntries(Object.keys(schema.$defs).map(k => [k, ajv.getSchema(schema.$id + "#/$defs/" + k)]));
const result = errors => ({ valid: errors.length === 0, errors });
function shape(kind, value) {
  const valid = validators[kind](value);
  return valid ? [] : validators[kind].errors.map(e => "SCHEMA " + e.instancePath + " " + e.message);
}

/** Validate source/context semantics as well as the versioned JSON Schema. Never coerce unknown values. */
export function validateCase(value) {
  const errors = shape("case", value);
  if (errors.length) return result(errors);
  const s = value.source;
  if (!(s.clip_start_ms < s.decision_ms && s.decision_ms < s.clip_end_ms)) errors.push("TIMING clip must enclose decision");
  if (s.origin === "SIMULATED") {
    if (s.consent_status !== "NOT_APPLICABLE_SIMULATED" || s.consent_ref !== null || s.media_sha256 !== null || s.consent_scope !== null) errors.push("CONSENT simulated source must not claim real consent/media");
  } else if (s.consent_status !== "CONSENTED" || !s.consent_ref || !s.media_sha256 || !s.patch || s.consent_scope !== "ANNOTATION_RESEARCH") errors.push("CONSENT real source requires annotation scope, consent reference, media hash and patch");
  for (const field of [...Object.values(value.context.core), ...Object.values(value.context.extended)]) {
    if ((field.value === null) !== (field.provenance === "UNKNOWN")) errors.push("PROVENANCE unknown value/provenance mismatch");
    if (field.value !== null && ((s.origin === "SIMULATED") !== (field.provenance === "SIMULATED"))) errors.push("PROVENANCE simulated/real context mismatch");
  }
  return result(errors);
}

/** Drafts allow incompleteness; locking requires complete fields and candidate conditional semantics. */
export function validateAnnotation(value, { draft = false } = {}) {
  const errors = shape(draft ? "draft" : "annotation", value);
  if (errors.length || draft) return result(errors);
  const uncertain = ["UNCERTAIN", "INSUFFICIENT_CONTEXT"].includes(value.verdict);
  if (uncertain && value.uncertainty_reasons.length === 0) errors.push("UNCERTAINTY reason is required");
  if (value.uncertainty_reasons.includes("MULTIPLE_VALID_OPTIONS") && new Set(value.alternatives.map(a=>a.action.trim())).size < 2) errors.push("ALTERNATIVES two distinct actions required for multiple-valid options");
  if (value.verdict === "INSUFFICIENT_CONTEXT" && !value.missing_context_note) errors.push("UNCERTAINTY missing-context note is required");
  if (!uncertain && !value.preferred_decision) errors.push("PREFERRED decision is required");
  if (["ERROR", "SUBOPTIMAL"].includes(value.verdict) && !value.severity) errors.push("SEVERITY required for negative judgment");
  const principle = value.decision_principle;
  if (principle.primary === "MULTIPLE_PRINCIPLES" ? principle.related.length < 2 : principle.related.length !== 0) errors.push("PRINCIPLE related IDs require MULTIPLE_PRINCIPLES and at least two entries");
  return result(errors);
}

/** Validate the fixed ten-case selection independently of illustrative label examples. */
export function validateBundle(value) {
  const errors = shape("bundle", value);
  if (errors.length) return result(errors);
  const ids = new Set(value.cases.map(c => c.case_id));
  const selected = new Set(value.selection.map(s => s.case_id));
  const slots = new Set(value.selection.map(s => s.slot));
  if (ids.size !== 10 || selected.size !== 10 || slots.size !== 10 || [...selected].some(id => !ids.has(id))) errors.push("SAMPLING duplicate or missing case/slot");
  if (value.selection.filter(s => s.kind === "Clear").length !== 6) errors.push("SAMPLING requires six clear/four ambiguous");
  for (const [family, count] of [["Fight Selection",4],["Post-contact Decision",3],["Tradeability & Spacing",3]]) {
    if (value.cases.filter(c => c.decision_family === family).length !== count) errors.push("SAMPLING family allocation");
  }
  for (const c of value.cases) {
    errors.push(...validateCase(c).errors);
    if (c.source.origin !== value.data_origin) errors.push("PROVENANCE bundle origin differs from case");
  }
  return result(errors);
}


/** Fixed two-reviewer plan: four secondary cases, two from each ambiguity group. */
export function validatePlan(plan, bundle) {
  const errors = shape("plan", plan);
  if (errors.length) return result(errors);
  if (plan.primary_id === plan.secondary_id) errors.push("PLAN reviewers must differ");
  const rows = bundle.selection.filter(s => plan.secondary_case_ids.includes(s.case_id));
  if (rows.length !== 4 || rows.filter(s => s.kind === "Clear").length !== 2) errors.push("PLAN requires two clear and two ambiguous second reviews");
  return result(errors);
}

/** Validate measured segments, null gaps and status; this is not evidence of real expert participation. */
function timingErrors(t, status) {
  const errors = [];
  let sum = 0, unknown = false, lastEnd = null;
  for (const s of t.segments) {
    const start = Date.parse(s.started_at), end = Date.parse(s.ended_at);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start || (lastEnd !== null && start < lastEnd)) errors.push("TIMING nonchronological segment");
    if (s.duration_ms === null) {
      unknown = true;
      if (s.reason !== "INTERRUPTED") errors.push("TIMING missing duration without interruption");
    } else {
      sum += s.duration_ms;
      if (s.duration_ms > end-start+5 || s.reason === "INTERRUPTED") errors.push("TIMING inconsistent measured duration");
    }
    lastEnd = end;
  }
  if (status === "PENDING") {
    if (t.quality !== "NOT_STARTED" || t.total_ms !== null || t.segments.length || t.annotation_started_at || t.active_start_at || t.annotation_submitted_at) errors.push("TIMING pending review has fabricated measurement");
    return errors;
  }
  if (!t.annotation_started_at || !Number.isFinite(Date.parse(t.annotation_started_at))) errors.push("TIMING missing start");
  if (t.segments.length && t.annotation_started_at !== t.segments[0].started_at) errors.push("TIMING first start mismatch");
  if ((status === "ACTIVE") !== Boolean(t.active_start_at)) errors.push("TIMING active state mismatch");
  if (t.active_start_at && (!Number.isFinite(Date.parse(t.active_start_at)) || (lastEnd !== null && Date.parse(t.active_start_at)<lastEnd))) errors.push("TIMING active start ordering");
  if ((status === "LOCKED") !== Boolean(t.annotation_submitted_at)) errors.push("TIMING submitted state mismatch");
  if (status === "LOCKED" && (t.segments.at(-1)?.reason !== "SUBMIT" || t.annotation_submitted_at !== t.segments.at(-1)?.ended_at)) errors.push("TIMING final submission mismatch");
  const quality = unknown ? "INCOMPLETE" : status === "ACTIVE" ? "RUNNING" : "COMPLETE";
  if (t.quality !== quality || t.total_ms !== (unknown || status === "ACTIVE" ? null : sum)) errors.push("TIMING total or quality mismatch");
  return errors;
}

/** Validate a self-benchmark transfer, integrity and every independent review/history before importing. */
export function validateExport(value) {
  const errors = shape("export", value);
  if (errors.length) return result(errors);
  const {content_sha256,...payload} = value;
  if (contentHash(payload) !== content_sha256) errors.push("INTEGRITY export checksum differs");
  errors.push(...validateBundle(value.bundle).errors);
  if (value.data_origin !== value.bundle.data_origin) errors.push("PROVENANCE export/bundle origin mismatch");
  if (!Number.isFinite(Date.parse(value.exported_at))) errors.push("PROVENANCE invalid export date");
  if (value.plan) errors.push(...validatePlan(value.plan,value.bundle).errors);
  if (value.plan ? value.reviews.length !== 14 : value.reviews.length !== 0) errors.push("PLAN review count differs");
  const reviewIds = new Set(), pairs = new Set(), cases = new Set(value.bundle.cases.map(c=>c.case_id));
  for (const r of value.reviews) {
    const expectedId = r.phase === "PRIMARY" ? value.plan?.primary_id : value.plan?.secondary_id;
    const pair = r.phase + ":" + r.case_id;
    if (!cases.has(r.case_id) || r.reviewer_id !== expectedId || (r.phase==="SECONDARY"&&!value.plan?.secondary_case_ids.includes(r.case_id)) || reviewIds.has(r.review_id) || pairs.has(pair)) errors.push("PLAN review isolation/identity mismatch");
    reviewIds.add(r.review_id);pairs.add(pair);
    errors.push(...timingErrors(r.timing,r.status));
    errors.push(...validateAnnotation(r.draft,{draft:r.status!=="LOCKED"}).errors);
    if (r.history.length !== r.revision) errors.push("HISTORY missing revision");
    for (const [i,h] of r.history.entries()) {
      if (h.revision !== i+1 || !Number.isFinite(Date.parse(h.at)) || (i && Date.parse(h.at)<Date.parse(r.history[i-1].at))) errors.push("HISTORY invalid order");
      if (i && r.history[i-1].status === "LOCKED") errors.push("HISTORY edit after lock");
      errors.push(...validateAnnotation(h.draft,{draft:h.status!=="LOCKED"}).errors);
      errors.push(...timingErrors(h.timing,h.status));
    }
    const tail=r.history.at(-1);
    if (tail && (tail.status!==r.status || contentHash(tail.draft)!==contentHash(r.draft) || contentHash(tail.timing)!==contentHash(r.timing))) errors.push("HISTORY latest snapshot mismatch");
  }
  if (value.plan) {
    const primaries=value.reviews.filter(r=>r.phase==="PRIMARY");
    const seconds=value.reviews.filter(r=>r.phase==="SECONDARY");
    if (primaries.length!==10 || seconds.length!==4) errors.push("PLAN phase counts differ");
    for (const second of seconds.filter(r=>r.status!=="PENDING")) {
      if (primaries.some(r=>r.status!=="LOCKED" || Date.parse(r.timing.annotation_submitted_at)>Date.parse(second.timing.annotation_started_at))) errors.push("BLIND_GATE secondary started before primary lock");
    }
  }
  return result(errors);
}

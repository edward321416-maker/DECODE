import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { validateCase, validateAnnotation, validateBundle, validateExport } from "../src/validation.mjs";

const load = (name) => JSON.parse(fs.readFileSync(new URL("../../data/samples/SIMULATED/" + name, import.meta.url)));
const bundle = () => load("ten-cases.json");
const examples = () => load("label-examples.json");
const expectInvalid = (result, category) => {
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), category);
};

test("ten synthetic cases and positive/uncertain labels are accepted without becoming actual evidence", () => {
  const b = bundle();
  assert.equal(b.cases.length, 10);
  assert.equal(validateBundle(b).valid, true);
  for (const c of b.cases) assert.equal(validateCase(c).valid, true, c.case_id);
  for (const row of examples().examples) assert.equal(validateAnnotation(row.annotation).valid, true, row.case_id);
  assert.ok(examples().examples.some(x => x.annotation.verdict === "OPTIMAL"));
  assert.ok(examples().examples.some(x => x.annotation.verdict === "INSUFFICIENT_CONTEXT"));
});

test("missing context is represented by null/UNKNOWN, not invented defaults", () => {
  const c = bundle().cases[0];
  c.context.core.alive_state = { value: null, provenance: "UNKNOWN", note: "Not visible" };
  assert.equal(validateCase(c).valid, true);
  c.context.core.alive_state.provenance = "OBSERVED";
  expectInvalid(validateCase(c), /PROVENANCE/);
  delete c.context.core.side;
  expectInvalid(validateCase(c), /SCHEMA/);
});

test("operator metadata preserves unknown player/map/agent/rank and explicit consent scope",()=>{
 const c=bundle().cases[0];
 assert.deepEqual(c.metadata,{anonymous_player_id:null,map:null,agent:null,rank_bucket:null});
 assert.equal(c.source.consent_scope,null);
 c.source.consent_scope="PUBLICATION";
 expectInvalid(validateCase(c),/SCHEMA|CONSENT/);
});

test("version, family, unknown properties and enum violations fail closed", () => {
  for (const edit of [
    c => c.schema_version = "9.0",
    c => c.decision_family = "Aim",
    c => c.expected_verdict = "ERROR",
    c => c.source.origin = "SYNTHETIC_MAYBE",
  ]) {
    const c = bundle().cases[0]; edit(c);
    expectInvalid(validateCase(c), /SCHEMA/);
  }
});

test("clip timing enforces finite nonnegative ordered milliseconds", () => {
  for (const edit of [
    c => c.source.clip_start_ms = -1,
    c => c.source.decision_ms = c.source.clip_start_ms,
    c => c.source.decision_ms = c.source.clip_end_ms,
    c => c.source.clip_end_ms = Number.POSITIVE_INFINITY,
  ]) {
    const c = bundle().cases[0]; edit(c);
    expectInvalid(validateCase(c), /SCHEMA|TIMING/);
  }
});

test("simulated origin cannot claim real consent and real sources require consent/hash", () => {
  const c = bundle().cases[0];
  c.source.consent_status = "CONSENTED"; c.source.consent_ref = "consent-reference";
  expectInvalid(validateCase(c), /CONSENT/);
  c.source.origin = "REAL";
  expectInvalid(validateCase(c), /CONSENT|PROVENANCE/);
  c.source.media_sha256 = "a".repeat(64);
  c.source.consent_scope = "ANNOTATION_RESEARCH";
  for (const field of Object.values(c.context.core)) {
    if (field.value !== null) field.provenance = "OBSERVED";
  }
  for (const field of Object.values(c.context.extended)) {
    if (field.value !== null) field.provenance = "OBSERVED";
  }
  assert.equal(validateCase(c).valid, true);
  c.source.consent_status = "WITHDRAWN";
  expectInvalid(validateCase(c), /CONSENT/);
});

test("unknown verdicts require reasons but may omit preferred decision and severity", () => {
  const a = examples().examples.find(x => x.annotation.verdict === "INSUFFICIENT_CONTEXT").annotation;
  assert.equal(validateAnnotation(a).valid, true);
  a.missing_context_note = null;
  expectInvalid(validateAnnotation(a), /UNCERTAINTY/);
  a.uncertainty_reasons = [];
  expectInvalid(validateAnnotation(a), /UNCERTAINTY/);
});

test("multiple valid choices preserve alternatives and related principles", () => {
  const a = examples().examples.find(x => x.annotation.alternatives.length).annotation;
  assert.equal(validateAnnotation(a).valid, true);
  assert.ok(a.alternatives.length >= 1);
  a.decision_principle = { primary: "MULTIPLE_PRINCIPLES", related: ["DUEL_QUALITY"] };
  expectInvalid(validateAnnotation(a), /PRINCIPLE/);
  a.decision_principle.related.push("INFORMATION_ADVANTAGE");
  assert.equal(validateAnnotation(a).valid, true);
  a.alternatives = [];
  expectInvalid(validateAnnotation(a), /ALTERNATIVES/);
});

test("negative judgments require severity, final labels require all eight fields", () => {
  const a = examples().examples.find(x => x.annotation.verdict === "ERROR").annotation;
  a.severity = null;
  expectInvalid(validateAnnotation(a), /SEVERITY/);
  delete a.expert_reason;
  expectInvalid(validateAnnotation(a), /SCHEMA/);
});

test("bundle rejects altered sample allocation, duplicate IDs and real-purpose promotion", () => {
  for (const edit of [
    b => b.selection[0].kind = "Ambiguous",
    b => b.cases[1].case_id = b.cases[0].case_id,
    b => b.evaluation_mode = "ACTUAL TEST",
    b => b.cases.push(structuredClone(b.cases[0])),
  ]) {
    const b = bundle(); edit(b);
    expectInvalid(validateBundle(b), /SCHEMA|SAMPLING|PROVENANCE/);
  }
});

test("access-bearing source URLs and text fields cannot become executable content", () => {
  const c = bundle().cases[0];
  c.source.source_ref = "https://example.invalid/video?" + "token=" + "synthetic-placeholder";
  expectInvalid(validateCase(c), /SCHEMA/);
  c.source.source_ref = "simulated-scene";
  c.description = "<script>alert('fixture')</script>";
  assert.equal(validateCase(c).valid, true); // Rendering must treat this as plain text.
});

test("export cannot claim ACTUAL TEST or omit provenance", () => {
  expectInvalid(validateExport({ evaluation_mode: "ACTUAL TEST", data_origin: "SIMULATED" }), /SCHEMA|EVIDENCE/);
});

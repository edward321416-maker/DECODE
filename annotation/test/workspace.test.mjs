import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Workspace } from "../src/workspace.mjs";
import { validateExport, contentHash } from "../src/validation.mjs";

const read = name => JSON.parse(fs.readFileSync(new URL("../../data/samples/SIMULATED/"+name, import.meta.url)));
const bundle = () => read("ten-cases.json");
const label = id => read("label-examples.json").examples.find(x=>x.case_id===id).annotation;
const secondIds = ["case-001","case-004","case-007","case-010"];
const software = { version: "0.1.0-candidate", source_sha256: "b".repeat(64) };
function setup() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "decode-workspace-test-"));
  let tick = 0;
  const clock = { wall:()=>new Date(Date.UTC(2026,0,1)+tick).toISOString(), mono:()=>tick };
  const w = new Workspace({ directory, clock, software });
  assert.equal(w.importDocument(bundle()).case_count, 10);
  const codes = w.createPlan({ primary_id:"sim-reviewer-a",secondary_id:"sim-reviewer-b",secondary_case_ids:secondIds });
  const primary=w.authenticate(codes.primary.access_code), secondary=w.authenticate(codes.secondary.access_code);
  assert.equal(w.list(primary).length,10);
  assert.equal(w.list(secondary).length,4);
  return {w,directory,clock,software,primary,secondary,codes,advance:n=>tick+=n};
}
function act(w,who,id,action,draft) {
  const view=w.review(who,id);
  return w.act(who,id,{action,expected_revision:view.review.revision,request_id:randomUUID(),...(draft===undefined?{}:{draft})});
}
function finishPrimary(s) {
  for(const r of s.w.list(s.primary)) {
    act(s.w,s.primary,r.review_id,"start");s.advance(100);
    act(s.w,s.primary,r.review_id,"submit",label(r.case_id));
  }
}
test("fixed plans isolate reviewer data and gate the second reviewer until primary lock",()=>{
 const s=setup(),a=s.w.list(s.primary)[0],b=s.w.list(s.secondary)[0];
 assert.throws(()=>s.w.review(s.primary,b.review_id),/FORBIDDEN/);
 assert.throws(()=>s.w.review(s.secondary,b.review_id),/BLIND_GATE/);
 const view=s.w.review(s.primary,a.review_id),encoded=JSON.stringify(view);
 for(const forbidden of ["selection","slot","example_annotation","sim-reviewer-b"])assert.ok(!encoded.includes(forbidden));
 assert.equal(view.review.draft && Object.keys(view.review.draft).length,0);
 finishPrimary(s);
 assert.equal(s.w.review(s.secondary,b.review_id).review.status,"PENDING");
});

test("automatic timing excludes pauses, records checkpoints and makes locked labels immutable",()=>{
 const s=setup(),r=s.w.list(s.primary)[0];
 act(s.w,s.primary,r.review_id,"start");s.advance(1200);
 act(s.w,s.primary,r.review_id,"save",{trigger:"Partial draft"});
 s.advance(800);act(s.w,s.primary,r.review_id,"pause");
 s.advance(9000);act(s.w,s.primary,r.review_id,"start");
 s.advance(1500);const locked=act(s.w,s.primary,r.review_id,"submit",label(r.case_id));
 assert.equal(locked.review.timing.total_ms,3500);
 assert.equal(locked.review.timing.quality,"COMPLETE");
 assert.equal(locked.review.status,"LOCKED");
 assert.ok(locked.review.history.some(h=>h.draft.trigger==="Partial draft"));
 assert.throws(()=>act(s.w,s.primary,r.review_id,"save",{}),/LOCKED/);
});

test("one reviewer cannot run overlapping case timers in separate tabs",()=>{
 const s=setup(),rows=s.w.list(s.primary);
 act(s.w,s.primary,rows[0].review_id,"start");
 assert.throws(()=>act(s.w,s.primary,rows[1].review_id,"start"),/STATE/);
 act(s.w,s.primary,rows[0].review_id,"pause");
 assert.equal(act(s.w,s.primary,rows[1].review_id,"start").review.status,"ACTIVE");
});

test("stale revisions and duplicate request IDs cannot overwrite a draft or duplicate timing",()=>{
 const s=setup(),r=s.w.list(s.primary)[0],start=act(s.w,s.primary,r.review_id,"start");s.advance(40);
 const req={action:"save",draft:{trigger:"Keep me"},expected_revision:start.review.revision,request_id:randomUUID()};
 const first=s.w.act(s.primary,r.review_id,req),retry=s.w.act(s.primary,r.review_id,req);
 assert.deepEqual(retry,first);
 assert.throws(()=>s.w.act(s.primary,r.review_id,{...req,request_id:randomUUID(),draft:{trigger:"Stale"}}),/CONFLICT/);
 assert.throws(()=>s.w.act(s.primary,r.review_id,{...req,draft:{trigger:"Changed retry"}}),/CONFLICT/);
 assert.equal(s.w.review(s.primary,r.review_id).review.draft.trigger,"Keep me");
});

test("save/resume survives a process restart without counting offline time",()=>{
 const s=setup(),r=s.w.list(s.primary)[0];act(s.w,s.primary,r.review_id,"start");s.advance(700);
 act(s.w,s.primary,r.review_id,"save",{trigger:"Persisted"});
 act(s.w,s.primary,r.review_id,"pause");s.advance(50000);
 const reopened=new Workspace(s);
 const actor=reopened.authenticate(s.codes.primary.access_code);
 const restored=reopened.review(actor,r.review_id);
 assert.equal(restored.review.draft.trigger,"Persisted");
 assert.equal(restored.review.timing.total_ms,700);
 act(reopened,actor,r.review_id,"start");s.advance(300);
 assert.equal(act(reopened,actor,r.review_id,"submit",label(r.case_id)).review.timing.total_ms,1000);
});

test("interrupted active timing stays incomplete and never silently becomes zero",()=>{
 const s=setup(),r=s.w.list(s.primary)[0];act(s.w,s.primary,r.review_id,"start");s.advance(100);
 act(s.w,s.primary,r.review_id,"save",{trigger:"Checkpoint"});s.advance(20000);
 const reopened=new Workspace(s),actor=reopened.authenticate(s.codes.primary.access_code);
 const review=reopened.review(actor,r.review_id).review;
 assert.equal(review.status,"PAUSED");assert.equal(review.timing.quality,"INCOMPLETE");assert.equal(review.timing.total_ms,null);
 assert.equal(review.draft.trigger,"Checkpoint");
 assert.ok(review.history.some(h=>h.action==="INTERRUPTED"));
});

test("source bundles cannot be replaced and invalid imports cannot partially mutate state",()=>{
 const s=setup(),original=s.w.operatorView();
 assert.equal(s.w.importDocument(bundle()).case_count,10); // byte-equivalent retry
 const changed=bundle();changed.cases[0].description="Replacement";
 assert.throws(()=>s.w.importDocument(changed),/CONFLICT/);
 const invalid=bundle();invalid.cases[9].source.consent_status="CONSENTED";
 assert.throws(()=>s.w.importDocument(invalid),/CONSENT/);
 assert.deepEqual(s.w.operatorView(),original);
});

test("storage quota rejects a draft before acknowledging an untransferable snapshot",()=>{
 const s=setup(),r=s.w.list(s.primary)[0];
 act(s.w,s.primary,r.review_id,"start");
 const large={trigger:"x".repeat(2000),observed_decision:"x".repeat(2000),expert_reason:"x".repeat(2000),preferred_decision:"x".repeat(2000),missing_context_note:"x".repeat(2000),alternatives:[]};
 let rejected=false;
 for(let i=0;i<120;i++) {
   const previous=s.w.review(s.primary,r.review_id);
   try{act(s.w,s.primary,r.review_id,"save",large);}
   catch(e){assert.match(e.message,/STORE_LIMIT/);assert.deepEqual(s.w.review(s.primary,r.review_id),previous);rejected=true;break;}
 }
 assert.equal(rejected,true);
 assert.ok(Buffer.byteLength(JSON.stringify({document:s.w.exportDocument()}))<1048576);
});

test("export/re-import preserves independent history, source hashes and transfer lineage, never credentials",()=>{
 const s=setup();finishPrimary(s);
 const r=s.w.list(s.secondary)[0];act(s.w,s.secondary,r.review_id,"start");s.advance(55);
 const alternative=label(r.case_id);alternative.expert_reason="Independent synthetic second-label example";
 act(s.w,s.secondary,r.review_id,"save",alternative);act(s.w,s.secondary,r.review_id,"pause");
 const exp=s.w.exportDocument();
 assert.equal(validateExport(exp).valid,true);
 assert.equal(exp.evaluation_mode,"SELF-BENCHMARK");assert.equal(exp.data_origin,"SIMULATED");
 assert.equal(exp.actual_test_status,"NOT YET TESTED");
 assert.equal(exp.source.software.source_sha256,software.source_sha256);
 assert.ok(!JSON.stringify(exp).includes(s.codes.primary.access_code));
 assert.ok(!JSON.stringify(exp).includes("credential_hash"));
 const imported=new Workspace({directory:fs.mkdtempSync(path.join(os.tmpdir(),"decode-transfer-")),clock:s.clock,software});
 assert.equal(imported.importDocument(exp).case_count,10);
 const newCode=imported.rotateAccess("sim-reviewer-b"),who=imported.authenticate(newCode.access_code);
 assert.equal(imported.review(who,r.review_id).review.draft.expert_reason,alternative.expert_reason);
 assert.equal(imported.exportDocument().import_lineage[0].export_id,exp.export_id);
 assert.deepEqual(imported.exportDocument().bundle,exp.bundle);
 assert.throws(()=>imported.importDocument({...exp,export_id:randomUUID()}),/INTEGRITY|CONFLICT/);
});

test("tampered timing, evidence purpose, schema and source are rejected even with recalculated integrity hash",()=>{
 const s=setup();finishPrimary(s);
 for(const change of [
   e=>e.evaluation_mode="ACTUAL TEST",
   e=>e.schema_version="0.0",
   e=>e.reviews[0].timing.total_ms=-1,
   e=>e.reviews[0].timing.total_ms=999999,
   e=>e.reviews[0].timing.segments[0].ended_at="2000-01-01T00:00:00.000Z",
   e=>e.bundle.cases[0].source.origin="REAL",
   e=>e.reviews[0].case_id="case-missing",
   e=>e.reviews[0].reviewer_id="sim-reviewer-b",
 ]) {
   const e=s.w.exportDocument();change(e);const {content_sha256,...payload}=e;e.content_sha256=contentHash(payload);
   assert.equal(validateExport(e).valid,false);
 }
});

test("failed durable writes leave the prior acknowledged draft intact",()=>{
 const s=setup(),r=s.w.list(s.primary)[0];act(s.w,s.primary,r.review_id,"start");
 act(s.w,s.primary,r.review_id,"save",{trigger:"Acknowledged"});
 const next=s.w.operatorView().revision+1;
 fs.writeFileSync(path.join(s.directory,"snapshot-"+String(next).padStart(8,"0")+".json"),"occupied test fixture");
 assert.throws(()=>act(s.w,s.primary,r.review_id,"save",{trigger:"Not committed"}),/STORE_CONFLICT/);
 assert.equal(s.w.review(s.primary,r.review_id).review.draft.trigger,"Acknowledged");
});

test("corrupt store stops visibly instead of silently rolling back acknowledged history",()=>{
 const s=setup();
 const latest=fs.readdirSync(s.directory).filter(f=>f.endsWith(".json")).sort().at(-1);
 fs.appendFileSync(path.join(s.directory,latest),"corrupted test fixture");
 assert.throws(()=>new Workspace(s),/STORE_CORRUPT/);
});

test("invalid plan, actor and non-finite/backward timing are rejected",()=>{
 const s=setup(),r=s.w.list(s.primary)[0];
 assert.throws(()=>s.w.authenticate("wrong"),/UNAUTHORIZED/);
 assert.throws(()=>s.w.createPlan({primary_id:"same",secondary_id:"same",secondary_case_ids:secondIds}),/CONFLICT|PLAN/);
 act(s.w,s.primary,r.review_id,"start");s.advance(-1);
 assert.throws(()=>act(s.w,s.primary,r.review_id,"pause"),/TIMING/);
});

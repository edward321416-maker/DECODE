import fs from "node:fs";
import path from "node:path";
import { randomUUID, randomBytes } from "node:crypto";
import { performance } from "node:perf_hooks";
import { VERSION, contentHash, validateBundle, validateAnnotation, validatePlan, validateExport } from "./validation.mjs";

const clone = value => structuredClone(value);
const fail = (code, detail = "") => { throw new Error(code + (detail ? ": " + detail : "")); };
const mustValidate = result => { if (!result.valid) fail("VALIDATION", result.errors.slice(0,12).join("; ")); };
const realClock = { wall:()=>new Date().toISOString(), mono:()=>performance.now() };
const credential = () => randomBytes(32).toString("base64url");
const digest = code => contentHash(String(code));
const snapshotName = revision => "snapshot-" + String(revision).padStart(8,"0") + ".json";

/** Single-user local workspace. Acknowledged snapshots are append-only and fsynced; corruption fails closed. */
export class Workspace {
  #state;
  #previousHash = null;
  #directory;
  #clock;
  #software;
  constructor({ directory, clock = realClock, software }) {
    this.#directory=path.resolve(directory);this.#clock=clock;this.#software=software;
    fs.mkdirSync(this.#directory,{recursive:true,mode:0o700});
    if (fs.lstatSync(this.#directory).isSymbolicLink()) fail("STORE_PATH","symlink store is not supported");
    const names=fs.readdirSync(this.#directory).filter(n=>/^snapshot-\d{8}\.json$/.test(n)).sort();
    for (const [i,name] of names.entries()) {
      try {
        const target=path.join(this.#directory,name);
        if (fs.lstatSync(target).isSymbolicLink() || fs.statSync(target).size>16000000) fail("STORE_CORRUPT");
        const record=JSON.parse(fs.readFileSync(target,"utf8"));
        if (name!==snapshotName(i+1) || record.state.revision!==i+1 || record.previous_sha256!==this.#previousHash || record.sha256!==contentHash({previous_sha256:record.previous_sha256,state:record.state})) fail("STORE_CORRUPT");
        this.#state=record.state;this.#previousHash=record.sha256;
      } catch { fail("STORE_CORRUPT","preserve snapshots and investigate; no automatic rollback"); }
    }
    if (!this.#state) {
      this.#state={instance_id:randomUUID(),revision:0,bundle:null,plan:null,reviews:[],credential_hashes:{},import_lineage:[]};
      this.#persist(clone(this.#state));
    }
    if (this.#state.reviews.some(r=>r.status==="ACTIVE")) {
      const state=clone(this.#state);
      for (const r of state.reviews.filter(r=>r.status==="ACTIVE")) this.#interrupt(r);
      this.#persist(state);
    }
  }

  #persist(next) {
    next.revision=this.#state.revision+1;
    const payload={previous_sha256:this.#previousHash,state:next};
    const record={...payload,sha256:contentHash(payload)},target=path.join(this.#directory,snapshotName(next.revision));
    if(Buffer.byteLength(JSON.stringify(record))>800000)fail("STORE_LIMIT","workspace quota reached; export and request an operator-reviewed limit revision");
    let fd;
    try {
      fd=fs.openSync(target,"wx",0o600);
      fs.writeFileSync(fd,JSON.stringify(record)+"\n","utf8");fs.fsyncSync(fd);
    } catch(e) {
      fail(e.code==="EEXIST"?"STORE_CONFLICT":"STORE_WRITE_FAILED","no success acknowledged; preserve the existing snapshots");
    } finally { if (fd!==undefined)fs.closeSync(fd); }
    this.#state=next;this.#previousHash=record.sha256;
  }

  #timing(r) {
    const unknown=r.segments.some(s=>s.duration_ms===null);
    const quality=r.status==="PENDING"?"NOT_STARTED":unknown?"INCOMPLETE":r.active?"RUNNING":"COMPLETE";
    return {annotation_started_at:r.started_at,annotation_submitted_at:r.submitted_at,
      active_start_at:r.active?.started_at??null,quality,
      total_ms:r.status==="PENDING"||unknown||r.active?null:r.segments.reduce((n,s)=>n+s.duration_ms,0),
      segments:clone(r.segments)};
  }
  #public(r) {
    return {review_id:r.review_id,case_id:r.case_id,reviewer_id:r.reviewer_id,phase:r.phase,
      status:r.status,revision:r.revision,draft:clone(r.draft),timing:this.#timing(r),history:clone(r.history)};
  }
  #history(r,action) {
    r.revision++;
    r.history.push({revision:r.revision,at:this.#clock.wall(),action,status:r.status,draft:clone(r.draft),timing:this.#timing(r)});
  }
  #interrupt(r) {
    const end=this.#clock.wall();
    if (Date.parse(end)<Date.parse(r.active.started_at)) fail("TIMING","wall clock moved backward across restart");
    r.segments.push({started_at:r.active.started_at,ended_at:end,duration_ms:null,reason:"INTERRUPTED"});
    r.active=null;r.status="PAUSED";this.#history(r,"INTERRUPTED");r.last_request=null;
  }
  #checkActor(actor) {
    if (!actor || !Object.hasOwn(this.#state.credential_hashes,actor.reviewer_id) || this.#state.credential_hashes[actor.reviewer_id]!==actor.credential_hash) fail("UNAUTHORIZED");
  }
  #find(actor,id) {
    this.#checkActor(actor);
    const review=this.#state.reviews.find(r=>r.review_id===id);
    if (!review || review.reviewer_id!==actor.reviewer_id) fail("FORBIDDEN");
    if (review.phase==="SECONDARY" && this.#state.reviews.some(r=>r.phase==="PRIMARY"&&r.status!=="LOCKED")) fail("BLIND_GATE","primary labels must be locked first");
    return review;
  }

  /** Authenticate a local opaque reviewer capability; never return it from a data view/export. */
  authenticate(code) {
    const credential_hash=digest(code);
    const row=Object.entries(this.#state.credential_hashes).find(([,hash])=>hash===credential_hash);
    if (!row)fail("UNAUTHORIZED");
    return {reviewer_id:row[0],credential_hash};
  }

  /** Import immutable source cases or a validated transfer into an empty workspace; never merge labels silently. */
  importDocument(document) {
    const transfer=document?.kind==="DECODE_ANNOTATION_EXPORT";
    mustValidate(transfer?validateExport(document):validateBundle(document));
    if (this.#state.bundle) {
      if (!transfer && contentHash(document)===contentHash(this.#state.bundle))return {case_count:10};
      fail("CONFLICT","import requires an empty workspace; existing source/history is immutable");
    }
    const next=clone(this.#state);
    next.bundle=clone(transfer?document.bundle:document);
    if (transfer) {
      next.plan=clone(document.plan);
      next.import_lineage=[...clone(document.import_lineage),{export_id:document.export_id,content_sha256:document.content_sha256,source:clone(document.source),imported_at:this.#clock.wall()}];
      if (next.import_lineage.length>32)fail("PROVENANCE","transfer chain is too long");
      next.reviews=document.reviews.map(r=>{
        const out={review_id:r.review_id,case_id:r.case_id,reviewer_id:r.reviewer_id,phase:r.phase,status:r.status,revision:r.revision,draft:clone(r.draft),history:clone(r.history),
          started_at:r.timing.annotation_started_at,submitted_at:r.timing.annotation_submitted_at,segments:clone(r.timing.segments),active:r.timing.active_start_at?{started_at:r.timing.active_start_at,mono:0}:null,last_request:null};
        if(out.active)this.#interrupt(out);
        return out;
      });
      // Transfer data never supplies credentials. Operator explicitly issues new local access codes.
    }
    this.#persist(next);return {case_count:10};
  }

  /** Fixed primary/secondary plan; pseudonyms must represent different humans in an actual future session. */
  createPlan(plan) {
    if(!this.#state.bundle)fail("PLAN","import cases first");
    if(this.#state.plan)fail("CONFLICT","review plan is immutable after creation");
    mustValidate(validatePlan(plan,this.#state.bundle));
    const next=clone(this.#state),primaryCode=credential(),secondaryCode=credential();
    next.plan=clone(plan);
    next.credential_hashes[plan.primary_id]=digest(primaryCode);next.credential_hashes[plan.secondary_id]=digest(secondaryCode);
    for(const phase of ["PRIMARY","SECONDARY"])for(const c of next.bundle.cases) {
      if(phase==="SECONDARY"&&!plan.secondary_case_ids.includes(c.case_id))continue;
      next.reviews.push({review_id:randomUUID(),case_id:c.case_id,reviewer_id:phase==="PRIMARY"?plan.primary_id:plan.secondary_id,phase,status:"PENDING",revision:0,draft:{},history:[],segments:[],active:null,started_at:null,submitted_at:null,last_request:null});
    }
    this.#persist(next);
    return {primary:{reviewer_id:plan.primary_id,access_code:primaryCode},secondary:{reviewer_id:plan.secondary_id,access_code:secondaryCode}};
  }

  /** Rotate an existing reviewer's access code; old capabilities immediately stop authorizing reads/writes. */
  rotateAccess(id) {
    if(!this.#state.plan||![this.#state.plan.primary_id,this.#state.plan.secondary_id].includes(id))fail("PLAN","unknown reviewer");
    const next=clone(this.#state),code=credential();next.credential_hashes[id]=digest(code);this.#persist(next);
    return {reviewer_id:id,access_code:code};
  }

  /** Operator sees source/selection/status, not credentials or label suggestions. */
  operatorView() {
    return {revision:this.#state.revision,bundle:this.#state.bundle?clone(this.#state.bundle):null,
      plan:clone(this.#state.plan),reviews:this.#state.reviews.map(r=>({review_id:r.review_id,case_id:r.case_id,reviewer_id:r.reviewer_id,phase:r.phase,status:r.status,revision:r.revision}))};
  }
  /** Reviewer lists contain only that reviewer's opaque assigned IDs and state. */
  list(actor) {
    this.#checkActor(actor);
    const gate=this.#state.reviews.some(r=>r.phase==="PRIMARY"&&r.status!=="LOCKED");
    return this.#state.reviews.filter(r=>r.reviewer_id===actor.reviewer_id).map(r=>({review_id:r.review_id,case_id:r.case_id,status:r.status,revision:r.revision,blocked:r.phase==="SECONDARY"&&gate}));
  }
  /** Never send operator selection/illustrative labels/other reviewers through this boundary. */
  review(actor,id) {
    const r=this.#find(actor,id),c=clone(this.#state.bundle.cases.find(c=>c.case_id===r.case_id));
    delete c.source.consent_ref; // Restricted consent records are not required by the blind labeler.
    return {case:c,review:this.#public(r),schema_version:VERSION,data_origin:c.source.origin,evaluation_mode:"SELF-BENCHMARK",actual_test_status:"NOT YET TESTED"};
  }
  #closeSegment(r,reason) {
    if(!r.active)fail("STATE","review is not active");
    const elapsed=this.#clock.mono()-r.active.mono,end=this.#clock.wall();
    if(!Number.isFinite(elapsed)||elapsed<0||elapsed>86400000||Date.parse(end)<Date.parse(r.active.started_at))fail("TIMING","invalid clock interval");
    r.segments.push({started_at:r.active.started_at,ended_at:end,duration_ms:Math.floor(elapsed),reason});
    r.active=null;
  }

  /** Optimistic, idempotent state transition. A successful response is sent only after a durable snapshot. */
  act(actor,id,request) {
    const current=this.#find(actor,id);
    if (!request || !["start","save","pause","submit"].includes(request.action) ||
      !Number.isInteger(request.expected_revision) || !/^[a-f0-9-]{36}$/.test(request.request_id??"") ||
      Object.keys(request).some(k=>!["action","expected_revision","request_id","draft"].includes(k)))fail("VALIDATION","invalid action envelope");
    if(current.last_request?.id===request.request_id) {
      if(current.last_request.hash!==contentHash(request))fail("CONFLICT","request ID reused with different content");
      return this.review(actor,id);
    }
    if(current.status==="LOCKED")fail("LOCKED","submitted labels are immutable");
    if(current.revision!==request.expected_revision)fail("CONFLICT","refresh and reconcile the newer saved revision");
    if(current.history.length>=190)fail("LIMIT","review history cap reached; preserve and export");
    const next=clone(this.#state),r=next.reviews.find(r=>r.review_id===id),now=this.#clock.wall();
    if(request.action==="start") {
      if(!["PENDING","PAUSED"].includes(r.status)||request.draft!==undefined)fail("STATE","start requires pending/paused review");
      if(next.reviews.some(other=>other.reviewer_id===r.reviewer_id&&other.status==="ACTIVE"))fail("STATE","pause the other active case before starting this one");
      r.started_at??=now;r.status="ACTIVE";r.active={started_at:now,mono:this.#clock.mono()};
    } else if(request.action==="save") {
      if(!["ACTIVE","PAUSED"].includes(r.status))fail("STATE","start the review before saving");
      mustValidate(validateAnnotation(request.draft,{draft:true}));r.draft=clone(request.draft);
      if(r.active){this.#closeSegment(r,"CHECKPOINT");r.active={started_at:r.segments.at(-1).ended_at,mono:this.#clock.mono()};}
    } else if(request.action==="pause") {
      if(request.draft!==undefined)fail("VALIDATION","save the draft before pausing");
      this.#closeSegment(r,"PAUSE");r.status="PAUSED";
    } else {
      if(r.status!=="ACTIVE")fail("STATE","resume before submitting");
      mustValidate(validateAnnotation(request.draft));r.draft=clone(request.draft);
      this.#closeSegment(r,"SUBMIT");r.status="LOCKED";r.submitted_at=r.segments.at(-1).ended_at;
    }
    this.#history(r,request.action.toUpperCase());
    r.last_request={id:request.request_id,hash:contentHash(request)};
    this.#persist(next);return this.review(actor,id);
  }

  /** Operator-only transfer data. HTTP authorization is required by the caller; credentials never serialize. */
  exportDocument() {
    if(!this.#state.bundle)fail("STATE","no cases to export");
    const payload={kind:"DECODE_ANNOTATION_EXPORT",schema_version:VERSION,evaluation_mode:"SELF-BENCHMARK",actual_test_status:"NOT YET TESTED",data_origin:this.#state.bundle.data_origin,export_id:randomUUID(),exported_at:this.#clock.wall(),
      source:{instance_id:this.#state.instance_id,revision:this.#state.revision,software:clone(this.#software)},bundle:clone(this.#state.bundle),plan:clone(this.#state.plan),reviews:this.#state.reviews.map(r=>this.#public(r)),import_lineage:clone(this.#state.import_lineage)};
    const document={...payload,content_sha256:contentHash(payload)};
    mustValidate(validateExport(document));return document;
  }
}

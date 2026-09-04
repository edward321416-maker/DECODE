import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { randomUUID } from "node:crypto";
import { startServer } from "../src/server.mjs";
import { validateExport } from "../src/validation.mjs";
const fixture=()=>JSON.parse(fs.readFileSync(new URL("../../data/samples/SIMULATED/ten-cases.json",import.meta.url)));
const annotation=()=>JSON.parse(fs.readFileSync(new URL("../../data/samples/SIMULATED/label-examples.json",import.meta.url))).examples[0].annotation;

async function setup(t) {
 const server=await startServer({port:0,directory:fs.mkdtempSync(path.join(os.tmpdir(),"decode-http-test-")),operatorKey:"synthetic-operator-test-code"});
 t.after(()=>server.close());
 const base=server.url;
 async function request(route,{cookie="",body,origin=base,headers={},method=body===undefined?"GET":"POST"}={}) {
  const response=await fetch(base+route,{method,headers:{"Content-Type":"application/json","X-DECODE-Request":"1",Origin:origin,...(cookie?{Cookie:cookie}:{}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const content=await response.text();
  return {status:response.status,headers:response.headers,data:response.headers.get("content-type")?.includes("json")?JSON.parse(content):content};
 }
 const login=await request("/api/login",{body:{code:"synthetic-operator-test-code"}});
 assert.equal(login.status,200);
 const cookie=login.headers.get("set-cookie").split(";")[0];
 return {server,base,request,cookie};
}
async function plan(s) {
 assert.equal((await s.request("/api/operator/import",{cookie:s.cookie,body:{document:fixture()}})).status,200);
 const made=await s.request("/api/operator/plan",{cookie:s.cookie,body:{primary_id:"sim-reviewer-a",secondary_id:"sim-reviewer-b",secondary_case_ids:["case-001","case-004","case-007","case-010"]}});
 assert.equal(made.status,200);
 const cookies={};
 for(const role of ["primary","secondary"]) {
  const login=await s.request("/api/login",{body:{code:made.data[role].access_code}});
  cookies[role]=login.headers.get("set-cookie").split(";")[0];
 }
 return cookies;
}
test("loopback sessions reject anonymous access, cross-origin writes and wrong Host",async t=>{
 const s=await setup(t);
 assert.equal((await s.request("/api/operator")).status,401);
 assert.equal((await s.request("/api/login",{body:{code:"synthetic-operator-test-code"},origin:"https://attacker.invalid"})).status,403);
 assert.equal((await s.request("/api/login",{body:{code:"wrong"}})).status,401);
 // Native fetch rewrites Host; send the hostile header over an actual HTTP socket.
 const wrongHost=await new Promise((resolve,reject)=>{
   http.get(s.base+"/api/operator",{headers:{Host:"attacker.invalid",Cookie:s.cookie}},response=>{response.resume();resolve(response.statusCode);}).on("error",reject);
 });
 assert.equal(wrongHost,403);
 const headers=(await s.request("/api/operator",{cookie:s.cookie})).headers;
 assert.match(headers.get("cache-control"),/no-store/);
 assert.match(headers.get("content-security-policy"),/default-src 'self'/);
});
test("operator-only fixture import and export cannot be reached by either reviewer",async t=>{
 const s=await setup(t),c=await plan(s);
 for(const cookie of Object.values(c))for(const route of ["/api/operator","/api/operator/export","/api/operator/fixtures"]) {
   assert.equal((await s.request(route,{cookie,...(route.endsWith("fixtures")?{body:{}}:{})})).status,403);
 }
});
test("HTTP review isolation blocks other IDs and the secondary phase",async t=>{
 const s=await setup(t),c=await plan(s);
 const a=(await s.request("/api/reviews",{cookie:c.primary})).data.reviews;
 const b=(await s.request("/api/reviews",{cookie:c.secondary})).data.reviews;
 assert.equal(a.length,10);assert.equal(b.length,4);
 assert.equal((await s.request("/api/reviews/"+b[0].review_id,{cookie:c.primary})).status,403);
 assert.equal((await s.request("/api/reviews/"+b[0].review_id,{cookie:c.secondary})).status,409);
 const own=await s.request("/api/reviews/"+a[0].review_id,{cookie:c.primary});
 assert.equal(own.status,200);
 for(const text of ["expected_verdict","example_annotation","slot","sim-reviewer-b"])assert.ok(!JSON.stringify(own.data).includes(text));
});
test("actual HTTP start/save/pause/resume/submit exports valid server-measured timing",async t=>{
 const s=await setup(t),c=await plan(s);
 const id=(await s.request("/api/reviews",{cookie:c.primary})).data.reviews[0].review_id;
 let revision=0;
 for(const action of ["start","save","pause","start","submit"]) {
   const r=await s.request("/api/reviews/"+id+"/action",{cookie:c.primary,body:{action,expected_revision:revision,request_id:randomUUID(),...(["save","submit"].includes(action)?{draft:annotation()}:{})}});
   assert.equal(r.status,200,JSON.stringify(r.data));revision=r.data.review.revision;
 }
 const exported=await s.request("/api/operator/export",{cookie:s.cookie});
 assert.equal(exported.status,200,JSON.stringify(exported.data));
 assert.equal(validateExport(exported.data).valid,true);
 assert.equal(exported.data.reviews[0].status,"LOCKED");
 assert.equal(exported.data.actual_test_status,"NOT YET TESTED");
});
test("malformed JSON, oversized bodies and non-JSON writes fail without mutation",async t=>{
 const s=await setup(t);
 const malformed=await fetch(s.base+"/api/operator/import",{method:"POST",headers:{"Content-Type":"application/json","X-DECODE-Request":"1",Origin:s.base,Cookie:s.cookie},body:"{"});
 assert.equal(malformed.status,400);
 const large=await s.request("/api/operator/import",{cookie:s.cookie,body:{document:"x".repeat(1100000)}});
 assert.equal(large.status,413);
 assert.equal((await s.request("/api/operator/import",{cookie:s.cookie,body:{},headers:{"Content-Type":"text/plain"}})).status,415);
 assert.equal((await s.request("/api/operator",{cookie:s.cookie})).data.bundle,null);
});
test("logout and credential rotation revoke existing sessions",async t=>{
 const s=await setup(t),c=await plan(s);
 assert.equal((await s.request("/api/operator/access",{cookie:s.cookie,body:{reviewer_id:"sim-reviewer-a"}})).status,200);
 assert.equal((await s.request("/api/reviews",{cookie:c.primary})).status,401);
 await s.request("/api/logout",{cookie:s.cookie,body:{}});
 assert.equal((await s.request("/api/operator",{cookie:s.cookie})).status,401);
});
test("static serving never exposes fixtures, schema internals, snapshots or arbitrary paths",async t=>{
 const s=await setup(t);
 for(const route of ["/data/samples/SIMULATED/label-examples.json","/.local/operator-key","/src/workspace.mjs","/%2e%2e/package.json"])assert.equal((await s.request(route)).status,404);
 assert.equal((await s.request("/")).status,200);
});

test("default local operator key is generated privately and reused across restart",async t=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),"decode-local-key-test-"));
 const first=await startServer({port:0,directory});
 const key=fs.readFileSync(path.join(directory,"operator-key"),"utf8");assert.match(key,/^[\w-]{43}$/);
 await first.close();const second=await startServer({port:0,directory});t.after(()=>second.close());
 assert.equal(fs.readFileSync(path.join(directory,"operator-key"),"utf8"),key);
 const login=await fetch(second.url+"/api/login",{method:"POST",headers:{"Content-Type":"application/json","X-DECODE-Request":"1",Origin:second.url},body:JSON.stringify({code:key})});
 assert.equal(login.status,200);assert.match(login.headers.get("set-cookie"),/HttpOnly; SameSite=Strict/);
});

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { Workspace } from "./workspace.mjs";
import { VERSION, schema } from "./validation.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const hash = value => createHash("sha256").update(value).digest();
const error = (code, status) => Object.assign(new Error(code), { status });
const exactKeys = (value, keys) => value && !Array.isArray(value) && typeof value === "object" && Object.keys(value).length === keys.length && keys.every(k => Object.hasOwn(value, k));
const staticFiles = { "/": ["index.html", "text/html"], "/app.mjs": ["app.mjs", "text/javascript"], "/style.css": ["style.css", "text/css"] };
const statusFor = code => ({UNAUTHORIZED:401,FORBIDDEN:403,BLIND_GATE:409,CONFLICT:409,LOCKED:409,STATE:409,LIMIT:409,STORE_CONFLICT:503,STORE_WRITE_FAILED:503})[code] ?? 400;

export function softwareFingerprint() {
  const fingerprint = createHash("sha256");
  for (const name of ["src/server.mjs","src/workspace.mjs","src/validation.mjs","public/index.html","public/app.mjs","public/style.css","package-lock.json","../data/schemas/annotation-0.1.0-candidate.schema.json"]) {
    fingerprint.update(name + "\0").update(fs.readFileSync(path.join(root, name)));
  }
  return { version: VERSION, source_sha256: fingerprint.digest("hex") };
}

function localOperatorKey(directory) {
  fs.mkdirSync(directory, { recursive:true, mode:0o700 });
  if (fs.lstatSync(directory).isSymbolicLink()) throw error("STORE_PATH",503);
  const target = path.join(directory,"operator-key");
  try { fs.writeFileSync(target, randomBytes(32).toString("base64url"), { flag:"wx", mode:0o600 }); }
  catch (e) { if (e.code !== "EEXIST") throw e; }
  if (fs.lstatSync(target).isSymbolicLink() || fs.statSync(target).size > 128) throw error("STORE_PATH",503);
  const key = fs.readFileSync(target,"utf8").trim();
  if (!/^[\w-]{43}$/.test(key)) throw error("STORE_KEY_INVALID",503);
  return key;
}

async function readBody(request) {
  if (request.headers["content-type"]?.split(";")[0].trim() !== "application/json") throw error("JSON_REQUIRED",415);
  let size=0; const chunks=[];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1048576) throw error("BODY_TOO_LARGE",413);
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw error("INVALID_JSON",400); }
}

/** Loopback-only capability tool. Not a hosted multi-user service. */
export async function startServer({ port=3417, directory=path.join(root,".local"), operatorKey }={}) {
  directory=path.resolve(directory);
  const operatorDigest=hash(operatorKey ?? localOperatorKey(directory));
  const workspace=new Workspace({directory,software:softwareFingerprint()});
  const sessions=new Map(); let loginAttempts=[]; let url;
  const server=http.createServer(async (request,response)=>{
    response.setHeader("Cache-Control","no-store");
    response.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    response.setHeader("X-Content-Type-Options","nosniff");
    response.setHeader("Referrer-Policy","no-referrer");
    const send=(status,data)=>{ response.writeHead(status,{"Content-Type":"application/json; charset=utf-8"});response.end(JSON.stringify(data)); };
    try {
      if(request.headers.host!==new URL(url).host) throw error("HOST_REJECTED",403);
      if(request.headers.origin && request.headers.origin!==url) throw error("ORIGIN_REJECTED",403);
      const route=new URL(request.url,url).pathname;
      if(request.method==="GET" && Object.hasOwn(staticFiles,route)) {
        const [name,type]=staticFiles[route];response.writeHead(200,{"Content-Type":type+"; charset=utf-8"});response.end(fs.readFileSync(path.join(root,"public",name)));return;
      }
      if(!route.startsWith("/api/")) throw error("NOT_FOUND",404);
      if(!["GET","POST"].includes(request.method)) throw error("METHOD_REJECTED",405);
      if(request.method==="POST" && (request.headers.origin!==url || request.headers["x-decode-request"]!=="1"))throw error("ORIGIN_REJECTED",403);
      const now=Date.now();
      for(const [key,value] of sessions)if(value.expires<=now)sessions.delete(key);
      const sessionId=(request.headers.cookie??"").split(";").map(s=>s.trim()).find(s=>s.startsWith("decode_session="))?.slice(15);
      const session=sessions.get(sessionId);
      if(route==="/api/login" && request.method==="POST") {
        loginAttempts=loginAttempts.filter(time=>now-time<60000);
        if(loginAttempts.length>=30)throw error("LOGIN_RATE_LIMIT",429);
        loginAttempts.push(now);
        const body=await readBody(request);
        if(!exactKeys(body,["code"]) || typeof body.code!=="string" || body.code.length>128)throw error("INVALID_LOGIN",400);
        const actor=timingSafeEqual(hash(body.code),operatorDigest)?{role:"operator"}:{role:"reviewer",actor:workspace.authenticate(body.code)};
        if(sessions.size>=100)throw error("SESSION_LIMIT",429);
        const key=randomBytes(32).toString("base64url");
        if(sessionId)sessions.delete(sessionId);
        sessions.set(key,{...actor,expires:now+30*60*1000});
        response.setHeader("Set-Cookie","decode_session="+key+"; HttpOnly; SameSite=Strict; Path=/; Max-Age=1800");
        send(200,{role:actor.role});return;
      }
      if(!session)throw error("UNAUTHORIZED",401);
      if(session.role==="reviewer")workspace.list(session.actor);
      if(route==="/api/logout" && request.method==="POST") {
        const body=await readBody(request);if(!exactKeys(body,[]))throw error("INVALID_BODY",400);
        sessions.delete(sessionId);response.setHeader("Set-Cookie","decode_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");send(200,{logged_out:true});return;
      }
      if(route==="/api/session" && request.method==="GET") {
        const fields=schema.$defs.annotation.properties;
        send(200,{role:session.role,reviewer_id:session.actor?.reviewer_id??null,schema_version:VERSION,actual_test_status:"NOT YET TESTED",enums:{verdict:fields.verdict.enum,severity:fields.severity.enum.filter(Boolean),confidence:fields.confidence.enum,principles:fields.decision_principle.properties.primary.enum,uncertainty:fields.uncertainty_reasons.items.enum}});return;
      }
      if(route.startsWith("/api/operator")) {
        if(session.role!=="operator")throw error("FORBIDDEN",403);
        if(route==="/api/operator" && request.method==="GET") {send(200,workspace.operatorView());return;}
        if(route==="/api/operator/export" && request.method==="GET") {send(200,workspace.exportDocument());return;}
        if(request.method!=="POST")throw error("NOT_FOUND",404);
        const body=await readBody(request);
        if(route==="/api/operator/import" && exactKeys(body,["document"])) {send(200,workspace.importDocument(body.document));return;}
        if(route==="/api/operator/fixtures" && exactKeys(body,[])) {send(200,workspace.importDocument(JSON.parse(fs.readFileSync(new URL("../../data/samples/SIMULATED/ten-cases.json",import.meta.url)))));return;}
        if(route==="/api/operator/plan") {send(200,workspace.createPlan(body));return;}
        if(route==="/api/operator/access" && exactKeys(body,["reviewer_id"])) {send(200,workspace.rotateAccess(body.reviewer_id));return;}
        throw error("INVALID_ROUTE_OR_BODY",400);
      }
      if(session.role!=="reviewer")throw error("FORBIDDEN",403);
      if(route==="/api/reviews" && request.method==="GET") {send(200,{reviews:workspace.list(session.actor)});return;}
      const match=route.match(/^\/api\/reviews\/([a-f0-9-]{36})(\/action)?$/);
      if(match && request.method===(match[2]?"POST":"GET")) {
        send(200,match[2]?workspace.act(session.actor,match[1],await readBody(request)):workspace.review(session.actor,match[1]));return;
      }
      throw error("NOT_FOUND",404);
    } catch(e) {
      const code=e.message.split(":")[0];
      const known=["VALIDATION","TIMING","PLAN","PROVENANCE","STORE_PATH","STORE_LIMIT","UNAUTHORIZED","FORBIDDEN","BLIND_GATE","CONFLICT","LOCKED","STATE","LIMIT","STORE_CONFLICT","STORE_WRITE_FAILED"].includes(code);
      send(e.status??(known?statusFor(code):500),{error:e.status?code:known?e.message:"INTERNAL_ERROR"});
    }
  });
  server.requestTimeout=15000;server.headersTimeout=10000;
  await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(port,"127.0.0.1",resolve);});
  url="http://127.0.0.1:"+server.address().port;
  return {url,close:()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();sessions.clear();})};
}

if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  const args=process.argv.slice(2);let port=3417,directory=path.join(root,".local");
  for(let i=0;i<args.length;i+=2) {
    if(args[i]==="--port" && /^\d+$/.test(args[i+1]??""))port=Number(args[i+1]);
    else if(args[i]==="--data-dir" && args[i+1])directory=path.resolve(args[i+1]);
    else throw new Error("Usage: node annotation/src/server.mjs [--port NUMBER] [--data-dir PRIVATE_DIRECTORY]");
  }
  if(port<1||port>65535)throw new Error("Invalid port");
  const service=await startServer({port,directory});
  console.log("DECODE candidate infrastructure: "+service.url+" | ACTUAL TEST: NOT YET TESTED");
  console.log("Read your operator access code locally from: "+path.join(directory,"operator-key"));
  for(const signal of ["SIGINT","SIGTERM"])process.once(signal,async()=>{await service.close();process.exit(0);});
}

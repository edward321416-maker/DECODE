const app=document.querySelector('#app'),message=document.querySelector('#message');
let session,view,dirty=false,busy=false,fieldId=0;
const el=(tag,text,props={})=>Object.assign(document.createElement(tag),text===undefined?props:{textContent:text,...props});
const note=text=>el('p',text);
const notify=text=>{message.textContent=text;};
function button(text,fn,disabled=false){const node=el('button',text,{type:'button',disabled});node.addEventListener('click',()=>run(fn));return node;}
function field(title,node){const wrapper=el('label'),label=el('span',title,{id:'field-label-'+(++fieldId)});node.setAttribute('aria-labelledby',label.id);wrapper.append(label,node);return wrapper;}
function textInput(title,value='',multiline=false){const node=el(multiline?'textarea':'input',undefined,{value:value??'',maxLength:2000});if(multiline)node.rows=3;return {node,wrapper:field(title,node)};}
function select(title,values,current){const node=el('select');node.append(el('option','— not specified —',{value:''}));for(const value of values)node.append(el('option',value,{value}));node.value=current??'';return {node,wrapper:field(title,node)};}
function checks(title,values,selected=[]){const group=el('fieldset');group.append(el('legend',title));const inputs=values.map(value=>{const input=el('input',undefined,{type:'checkbox',value,checked:selected.includes(value)}),label=el('label',undefined,{className:'check'});label.append(input,document.createTextNode(value));group.append(label);return input;});return {wrapper:group,values:()=>inputs.filter(n=>n.checked).map(n=>n.value)};}
async function api(route,body){const response=await fetch(route,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json','X-DECODE-Request':'1'},...(body===undefined?{}:{body:JSON.stringify(body)})});const data=await response.json();if(!response.ok)throw new Error(data.error??'Request failed');return data;}
async function run(fn){
 if(busy)return;busy=true;notify('Working…');
 const previous=[...app.querySelectorAll('input,select,textarea,button')].map(node=>[node,node.disabled]);for(const [node]of previous)node.disabled=true;
 try{await fn();}catch(error){notify(error.message+' · Input retained. Retry only after checking the saved revision; reload discards unsaved input.');}
 finally{busy=false;for(const[node,disabled]of previous)if(node.isConnected)node.disabled=disabled;}
}
function download(document,name){const url=URL.createObjectURL(new Blob([JSON.stringify(document,null,2)+'\n'],{type:'application/json'}));const a=el('a',undefined,{href:url,download:name});a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function shell(title){app.replaceChildren(el('h2',title));app.append(button('Sign out',async()=>{if(dirty)throw new Error('Save or download your draft before signing out');await api('/api/logout',{});session=null;login();notify('Signed out.');}));}
function login(){
 dirty=false;view=null;app.replaceChildren(el('h2','Local access'));
 app.append(note('Use an operator or reviewer access code. No accounts, remote storage or AI suggestions. Do not share an operator session with a blind reviewer.'));
 const code=textInput('Access code');code.node.type='password';code.node.autocomplete='off';
 const form=el('form');form.append(code.wrapper,el('button','Sign in',{type:'submit'}));app.append(form);
 form.addEventListener('submit',event=>{event.preventDefault();run(async()=>{await api('/api/login',{code:code.node.value});code.node.value='';await load();notify('Signed in.');});});
}
async function load(){session=await api('/api/session');if(session.role==='operator')await operator();else await reviewer();}
function accessCodes(data){
 const area=el('section');area.append(el('h3','One-time access codes'),note('Keep codes private. Use separate browser profiles/OS sessions. They are not part of exports.'));
 for(const [role,value] of Object.entries(data)){const entry=textInput(role==='primary'?'Primary access code':role==='secondary'?'Secondary access code':'New access code',value.access_code);entry.node.type='password';entry.node.readOnly=true;area.append(note(value.reviewer_id),entry.wrapper);}
 app.append(area);
}
async function operator(){
 const data=await api('/api/operator');dirty=false;shell('Operator');
 app.append(note('Source/context editor: import a versioned JSON bundle. Sources and the plan become immutable after import. Imports are local only; never place real VOD, comms, consent documents or exports in the public repository.'));
 if(!data.bundle){
  app.append(button('Load 10 SIMULATED fixtures',async()=>{await api('/api/operator/fixtures',{});await operator();notify('Imported 10 SIMULATED cases. No expert labels imported.');}));
  const source=textInput('Bundle or export JSON','',true);source.node.maxLength=1048576;source.node.rows=8;
  const file=el('input',undefined,{type:'file',accept:'.json,application/json'});
  file.addEventListener('change',()=>run(async()=>{const selected=file.files[0];if(!selected)return;if(selected.size>1048576)throw new Error('JSON exceeds 1 MiB');source.node.value=await selected.text();notify('File loaded for review; not imported.');}));
  app.append(field('Load local JSON file',file),source.wrapper,button('Import JSON',async()=>{await api('/api/operator/import',{document:JSON.parse(source.node.value)});await operator();notify('Import acknowledged. Source and history preserved. Reissue reviewer codes for a transfer.');}));
  return;
 }
 app.append(note('Data origin: '+data.bundle.data_origin+' · 10 cases · SELF-BENCHMARK only'),button('Export provenance JSON',async()=>{download(await api('/api/operator/export'),'decode-annotation-export.json');notify('Export generated. Contains private review data; do not commit it.');}));
 const sources=el('details');sources.append(el('summary','Operator source, context and selection (not sent to reviewers)'),el('pre',JSON.stringify(data.bundle,null,2)));app.append(sources);
 if(!data.plan){
  const primary=textInput('Primary reviewer ID'),secondary=textInput('Secondary reviewer ID');primary.node.maxLength=64;secondary.node.maxLength=64;
  const choices=el('fieldset');choices.append(el('legend','Select exactly two clear and two ambiguous second reviews'));
  const selected=data.bundle.selection.map(row=>{const input=el('input',undefined,{type:'checkbox',value:row.case_id}),label=el('label',undefined,{className:'check'});input.setAttribute('aria-label','Second review '+row.case_id);label.append(input,document.createTextNode(row.case_id+' · '+row.kind));choices.append(label);return input;});
  app.append(primary.wrapper,secondary.wrapper,choices,button('Create blind review plan',async()=>{const codes=await api('/api/operator/plan',{primary_id:primary.node.value,secondary_id:secondary.node.value,secondary_case_ids:selected.filter(n=>n.checked).map(n=>n.value)});await operator();accessCodes(codes);notify('Plan saved. Give each reviewer only their own code.');}));
 }else{
  app.append(el('h3','Review progress'),note('Primary labels must all be locked before secondary access. This does not prove human independence.'));
  const progress=el('ul');for(const r of data.reviews)progress.append(el('li',r.case_id+' · '+r.phase+' · '+r.status));app.append(progress);
  for(const id of [data.plan.primary_id,data.plan.secondary_id])app.append(button('Reissue code: '+id,async()=>{const code=await api('/api/operator/access',{reviewer_id:id});await operator();accessCodes({new:code});notify('Old reviewer code and sessions revoked.');}));
 }
}
async function reviewer(){
 const data=await api('/api/reviews');view=null;dirty=false;shell('Independent reviewer');
 app.append(note('Participant: '+session.reviewer_id),note('Do not consult expected answers, AI output or another reviewer. Timing runs only after Start; pause before leaving. Closing a tab does not pause the server.'));
 if(data.reviews.some(r=>r.blocked))app.append(note('Primary labels must be locked first.'));
 const list=el('ul');for(const r of data.reviews){const row=el('li');row.append(button('Open '+r.case_id,async()=>openReview(r.review_id),r.blocked),document.createTextNode(' · '+r.status));list.append(row);}app.append(list);
}
async function openReview(id){view=await api('/api/reviews/'+id);dirty=false;renderReview();notify('Loaded saved revision '+view.review.revision+'.');}
function renderReview(){
 const r=view.review,c=view.case,d=r.draft;shell('Review '+c.case_id);
 app.append(note('Data origin: '+view.data_origin+' · '+c.decision_family),note('Status: '+r.status),note(c.description),note('Source reference: '+c.source.source_ref+' · clip '+c.source.clip_start_ms+'–'+c.source.clip_end_ms+' ms; primary decision '+c.source.decision_ms+' ms. No video is embedded or fetched.'));
 for(const [name,values]of Object.entries(c.context)){const section=el('section');section.append(el('h3',name==='core'?'Core Context':'Extended Context'));const list=el('dl');for(const[key,value]of Object.entries(values)){list.append(el('dt',key),el('dd',(value.value??'UNKNOWN')+' · '+value.provenance+(value.note?' · '+value.note:'')));}if(!Object.keys(values).length)section.append(note('No extended context provided.'));section.append(list);app.append(section);}
 app.append(note('Timing: '+r.timing.quality+' · measured total: '+(r.timing.total_ms===null?'unavailable':r.timing.total_ms+' ms')+' · paused time excluded. Incomplete intervals remain unknown.'));
 const controls=el('div',undefined,{className:'actions'});
 controls.append(button('Start / resume timing',async()=>transition('start'),!['PENDING','PAUSED'].includes(r.status)));
 app.append(controls);
 const form=el('fieldset',undefined,{disabled:r.status!=='ACTIVE'});form.append(el('legend','Eight expert fields · LOCK CANDIDATE'));
 const fields={trigger:textInput('1. Trigger',d.trigger,true),observed_decision:textInput('2. Observed decision',d.observed_decision,true),verdict:select('3. Verdict',session.enums.verdict,d.verdict),preferred_decision:textInput('4. Preferred decision',d.preferred_decision,true),decision_principle:select('5. Decision principle',session.enums.principles,d.decision_principle?.primary),expert_reason:textInput('6. Expert reason',d.expert_reason,true),severity:select('7. Severity',session.enums.severity,d.severity),confidence:select('8. Confidence',session.enums.confidence,d.confidence)};
 for(const f of Object.values(fields))form.append(f.wrapper);
 const related=checks('Related principles (only for MULTIPLE_PRINCIPLES)',session.enums.principles.filter(p=>p!=='MULTIPLE_PRINCIPLES'),d.decision_principle?.related);
 const uncertainty=checks('Uncertainty reasons',session.enums.uncertainty,d.uncertainty_reasons);
 const missing=textInput('Missing context note',d.missing_context_note,true),alternatives=textInput('Acceptable alternatives JSON',JSON.stringify(d.alternatives??[]),true);
 form.append(related.wrapper,uncertainty.wrapper,missing.wrapper,note('Alternatives use [{"action":"…","reason":"…"}]. Empty [] is valid. Uncertainty may leave preferred decision and severity unspecified.'),alternatives.wrapper);
 form.addEventListener('input',()=>{dirty=true;notify('Unsaved input. Save before leaving or pausing.');});app.append(form);
 const draft=()=>{
  const out={trigger:fields.trigger.node.value,observed_decision:fields.observed_decision.node.value,preferred_decision:fields.preferred_decision.node.value.trim()?fields.preferred_decision.node.value:null,expert_reason:fields.expert_reason.node.value,severity:fields.severity.node.value||null,uncertainty_reasons:uncertainty.values(),missing_context_note:missing.node.value.trim()?missing.node.value:null,alternatives:JSON.parse(alternatives.node.value)};
  for(const key of ['verdict','confidence'])if(fields[key].node.value)out[key]=fields[key].node.value;
  if(fields.decision_principle.node.value)out.decision_principle={primary:fields.decision_principle.node.value,related:related.values()};return out;
 };
 controls.append(button('Save draft',async()=>transition('save',draft()),r.status!=='ACTIVE'),button('Save and pause',async()=>{await transition('save',draft());await transition('pause');},r.status!=='ACTIVE'),button('Submit and lock',async()=>transition('submit',draft()),r.status!=='ACTIVE'));
 app.append(button('Download current draft JSON',async()=>{download({kind:'UNSUBMITTED_DRAFT_BACKUP',case_id:c.case_id,schema_version:view.schema_version,data_origin:view.data_origin,actual_test_status:'NOT YET TESTED',draft:draft()},'decode-unsaved-draft.json');notify('Recovery copy only; not a valid submitted annotation export.');}),button('Reload saved revision (discard unsaved)',async()=>{if(!dirty || window.confirm('Discard unsaved input and load the last acknowledged revision?'))await openReview(r.review_id);}),button('Back to assigned cases',async()=>{if(dirty)throw new Error('Save or reload before leaving this draft');if(view.review.status==='ACTIVE')throw new Error('Pause timing before leaving this review');await reviewer();notify('Assignments loaded.');}));
}
async function transition(action,draft){
 const id=view.review.review_id;
 view=await api('/api/reviews/'+id+'/action',{action,expected_revision:view.review.revision,request_id:crypto.randomUUID(),...(draft===undefined?{}:{draft})});
 dirty=false;renderReview();notify(action==='save'?'Saved revision '+view.review.revision+'.':action==='submit'?'Submitted and locked.':action==='pause'?'Saved and paused.':'Timing started.');
}
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
try{await load();}catch{login();}

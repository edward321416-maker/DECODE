import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';
import { softwareFingerprint } from '../src/server.mjs';

// Explicit internal execution, never invoked by environment sensing. Only unique private artifacts are written.
const root=fileURLToPath(new URL('../../',import.meta.url));
const started=new Date().toISOString(),runId='annotation-self-'+started.replace(/[:.]/g,'-').toLowerCase();
const directory=path.join(root,'.agent-docs',runId);fs.mkdirSync(directory,{recursive:true});
const hashFile=name=>createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex');
const filesIn=(folder)=>fs.readdirSync(path.join(root,folder),{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?filesIn(folder+'/'+entry.name):[folder+'/'+entry.name]);
const testFiles=filesIn('annotation/test').filter(f=>f.endsWith('.mjs')).sort();
const fingerprint=softwareFingerprint();
function command(name,args,cwd=root){
 const result=spawnSync(process.execPath,args,{cwd,encoding:'utf8',timeout:180000,maxBuffer:32*1024*1024,env:process.env});
 fs.writeFileSync(path.join(directory,name+'.stdout.txt'),result.stdout??'',{flag:'wx'});
 fs.writeFileSync(path.join(directory,name+'.stderr.txt'),result.stderr??'',{flag:'wx'});
 return result;
}
console.log('SELF-BENCHMARK: running schema/workspace/HTTP checks with SIMULATED inputs.');
const unitArgs=['--test','--test-reporter=tap',...testFiles.filter(f=>f.endsWith('.test.mjs'))];
const unit=command('node-tests',unitArgs);
const number=key=>Number(unit.stdout?.match(new RegExp('^# '+key+' (\\d+)$','m'))?.[1]??0);
console.log('SELF-BENCHMARK: running isolated desktop/narrow browser checks.');
const uiArgs=['node_modules/@playwright/test/cli.js','test','--reporter=json'];
const ui=command('browser-tests',uiArgs,path.join(root,'annotation'));
let uiResult;try{uiResult=JSON.parse(ui.stdout);}catch{uiResult={stats:{},errors:['No valid browser report']};}
const channel=process.env.PW_CHANNEL??(process.platform==='win32'?'chrome':'chromium');
let browserVersion='UNAVAILABLE';
try{const browser=await chromium.launch({channel:channel==='chromium'?undefined:channel});browserVersion=browser.version();await browser.close();}catch{/* Failure remains explicit. */}
const staticFiles=filesIn('annotation/src').concat(filesIn('annotation/public'),filesIn('annotation/scripts'),testFiles,['annotation/playwright.config.mjs','scripts/check-operating-docs.mjs','scripts/run-evidence.mjs']).filter(f=>f.endsWith('.mjs'));
const syntax=staticFiles.map(name=>({file:name,exit_code:spawnSync(process.execPath,['--check',name],{cwd:root,encoding:'utf8'}).status}));
const artifact={
 run_id:runId,timestamp:started,finished_at:new Date().toISOString(),evaluation_mode:'SELF-BENCHMARK',data_origin:'SIMULATED',actual_test_status:'NOT YET TESTED',
 execution_status:unit.status===0&&number('tests')>0&&number('fail')===0&&number('skipped')===0&&ui.status===0&&uiResult.stats.expected>0&&uiResult.stats.unexpected===0&&uiResult.stats.skipped===0&&uiResult.stats.flaky===0&&!(uiResult.errors?.length)&&syntax.every(row=>row.exit_code===0)&&browserVersion!=='UNAVAILABLE'?'PASSED':'FAILED',
 protocol_version:'0.1-candidate',schema_version:fingerprint.version,code_revision:'sha256:'+fingerprint.source_sha256,software:fingerprint,
 input_reference:'data/samples/SIMULATED/ten-cases.json',input_sha256:hashFile('data/samples/SIMULATED/ten-cases.json'),label_examples_sha256:hashFile('data/samples/SIMULATED/label-examples.json'),
 case_count:10,evaluator_reference:'internal-engineering-automation',environment:{node:process.version,platform:process.platform,architecture:process.arch,browser:channel,browser_version:browserVersion},
 commands:[{cwd:'.',command:'node '+unitArgs.join(' ')},{cwd:'annotation',command:'node '+uiArgs.join(' ')},{cwd:'.',command:'node --check <each listed module>'}],
 results:{node:{tests:number('tests'),passed:number('pass'),failed:number('fail'),skipped:number('skipped'),exit_code:unit.status},browser:{passed:uiResult.stats.expected??0,failed:uiResult.stats.unexpected??0,skipped:uiResult.stats.skipped??0,flaky:uiResult.stats.flaky??0,exit_code:ui.status},syntax},
 test_sources:Object.fromEntries([...testFiles,'annotation/playwright.config.mjs','annotation/scripts/verify.mjs','scripts/run-evidence.mjs'].map(name=>[name,hashFile(name)])),
 raw_output_sha256:Object.fromEntries(['node-tests.stdout.txt','node-tests.stderr.txt','browser-tests.stdout.txt','browser-tests.stderr.txt'].map(name=>[name,createHash('sha256').update(fs.readFileSync(path.join(directory,name))).digest('hex')])),
 measurements:{actual_annotation_time:null,expert_agreement:null,context_sufficiency:null,principle_coverage:null,coaching_effectiveness:null},
 limitations:['Synthetic software inputs, not VOD or independent experts.','Controlled-clock durations are test assertions; wall/browser durations are software execution only.','Raw traces may contain temporary access codes and remain private; only sanitized summaries may be published.','No ACTUAL TEST, product GO decision, full security/WCAG certification or hosted deployment.']
};
fs.writeFileSync(path.join(directory,'result.json'),JSON.stringify(artifact,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({run_id:artifact.run_id,status:artifact.execution_status,node:artifact.results.node,browser:artifact.results.browser,syntax:syntax.length,artifact:path.join(directory,'result.json')}));
process.exitCode=artifact.execution_status==='PASSED'?0:1;

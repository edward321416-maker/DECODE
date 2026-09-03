import test from 'node:test';
import assert from 'node:assert/strict';
import { validateInternalRun } from '../../scripts/run-evidence.mjs';
const example=()=>{
 const a={run_id:'synthetic-checker-test',timestamp:'2026-01-01T00:00:00.000Z',finished_at:'2026-01-01T00:01:00.000Z',evaluation_mode:'SELF-BENCHMARK',data_origin:'SIMULATED',actual_test_status:'NOT YET TESTED',execution_status:'PASSED',protocol_version:'0.1-candidate',schema_version:'0.1.0-candidate',code_revision:'sha256:'+'a'.repeat(64),input_reference:'data/samples/SIMULATED/ten-cases.json',input_sha256:'b'.repeat(64),label_examples_sha256:'c'.repeat(64),case_count:10,evaluator_reference:'internal-engineering-automation',results:{node:{tests:32,passed:32,failed:0,skipped:0,exit_code:0},browser:{passed:8,failed:0,skipped:0,flaky:0,exit_code:0},syntax:[{file:'annotation/src/server.mjs',exit_code:0}]},measurements:{actual_annotation_time:null,expert_agreement:null,context_sufficiency:null,principle_coverage:null,coaching_effectiveness:null},limitations:['Invented checker input; not an executed annotation run.']};
 const row=[a.run_id,a.timestamp,a.evaluation_mode,a.data_origin,a.execution_status,a.protocol_version,a.schema_version,a.code_revision,a.input_reference,'10',a.evaluator_reference,'experiments/results/SELF_BENCHMARK/synthetic-checker-test.json','Synthetic validation fixture','Not actual evidence'];
 return {a,row};
};
test('publication evidence accepts a consistent internal-run contract',()=>{const {a,row}=example();assert.equal(validateInternalRun(row,a),true);});
test('publication evidence rejects false actual claims, missing provenance, fake metrics and false passes',()=>{
 for(const mutate of [a=>a.evaluation_mode='ACTUAL TEST',a=>a.data_origin='REAL',a=>a.actual_test_status='PASSED',a=>delete a.code_revision,a=>a.measurements.expert_agreement=1,a=>a.results.node.failed=1,a=>a.results.browser.passed=0,a=>a.finished_at='not-a-date',a=>a.input_sha256='missing']) {
  const {a,row}=example();mutate(a);assert.equal(validateInternalRun(row,a),false);
 }
});
test('publication evidence rejects mismatched log rows and artifact paths',()=>{
 for(const [index,value]of [[0,'different-run'],[7,'main'],[9,'150'],[11,'../private/export.json']]){const {a,row}=example();row[index]=value;assert.equal(validateInternalRun(row,a),false);}
});

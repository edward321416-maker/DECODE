/** Validate a sanitized internal-run CSV/artifact contract, not whether someone truly ran the tests.
 * @param {string[]} row The fixed 14-column experiment-log row.
 * @param {object} a Parsed untrusted result artifact. Returns false, never executes artifact commands.
 * @returns {boolean} Contract consistency; human/source review is still required.
 */
export function validateInternalRun(row,a) {
 try {
  if(row.length!==14 || !/^experiments\/results\/SELF_BENCHMARK\/[a-z0-9.-]+\.json$/.test(row[11]))return false;
  const fields=['run_id','timestamp','evaluation_mode','data_origin','execution_status','protocol_version','schema_version','code_revision','input_reference','case_count','evaluator_reference'];
  if(fields.some((name,i)=>String(a[name])!==row[i]))return false;
  if(a.evaluation_mode!=='SELF-BENCHMARK'||a.data_origin!=='SIMULATED'||a.actual_test_status!=='NOT YET TESTED'||a.case_count!==10)return false;
  if(a.execution_status!=='PASSED'||a.protocol_version!=='0.1-candidate'||a.schema_version!=='0.1.0-candidate')return false;
  if(!/^sha256:[a-f0-9]{64}$/.test(a.code_revision)||![a.input_sha256,a.label_examples_sha256].every(v=>/^[a-f0-9]{64}$/.test(v)))return false;
  if(!Number.isFinite(Date.parse(a.timestamp))||!Number.isFinite(Date.parse(a.finished_at))||Date.parse(a.finished_at)<Date.parse(a.timestamp))return false;
  if(a.input_reference!=='data/samples/SIMULATED/ten-cases.json'||a.evaluator_reference!=='internal-engineering-automation')return false;
  const n=a.results.node,b=a.results.browser;
  if(!Number.isInteger(n.tests)||n.tests<1||n.tests!==n.passed||n.failed!==0||n.skipped!==0||n.exit_code!==0)return false;
  if(!Number.isInteger(b.passed)||b.passed<1||b.failed!==0||b.skipped!==0||b.flaky!==0||b.exit_code!==0)return false;
  if(!a.results.syntax.length||!a.results.syntax.every(s=>s.exit_code===0))return false;
  const metrics=['actual_annotation_time','expert_agreement','context_sufficiency','principle_coverage','coaching_effectiveness'];
  if(Object.keys(a.measurements).length!==metrics.length||metrics.some(k=>a.measurements[k]!==null))return false;
  return a.limitations.length>0&&Boolean(row[12])&&Boolean(row[13]);
 }catch{return false;}
}

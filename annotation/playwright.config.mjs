import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const channel=process.env.PW_CHANNEL ?? (process.platform==='win32'?'chrome':'chromium');
const runId=process.env.DECODE_UI_RUN_ID??=String(Date.now());
export default defineConfig({
  testDir:'./test/ui',fullyParallel:true,workers:2,retries:0,timeout:30000,
  expect:{timeout:5000},
  outputDir:path.join(fileURLToPath(new URL('../.agent-docs/',import.meta.url)),'annotation-ui-'+runId),
  reporter:[['list']],
  use:{channel:channel==='chromium'?undefined:channel,trace:'retain-on-failure',screenshot:'only-on-failure'},
  projects:[{name:'desktop',use:{viewport:{width:1280,height:900}}},{name:'narrow',use:{viewport:{width:320,height:740}}}]
});

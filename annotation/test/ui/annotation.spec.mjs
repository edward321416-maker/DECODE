import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startServer } from '../../src/server.mjs';
import { validateExport } from '../../src/validation.mjs';
import { AnnotationPage } from './annotation.page.mjs';

const test=base.extend({
 service:async({},use)=>{
  const service=await startServer({port:0,directory:fs.mkdtempSync(path.join(os.tmpdir(),'decode-ui-test-')),operatorKey:'synthetic-operator-test-code'});
  await use(service);await service.close();
 }
});
async function prepare(page,service){const ui=new AnnotationPage(page,service.url);await ui.login('synthetic-operator-test-code');return {ui,codes:await ui.createPlan()};}

test('operator import, fixed plan, blind secondary and provenance export',async({page,browser,service})=>{
 const {codes}=await prepare(page,service);
 const other=await browser.newContext();
 try {
  const secondary=await other.newPage();await new AnnotationPage(secondary,service.url).login(codes.secondary);
  await expect(secondary.getByRole('button',{name:'Open case-001',exact:true})).toBeDisabled();
  await expect(secondary.getByText('Primary labels must be locked first.',{exact:true})).toBeVisible();
  const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Export provenance JSON',exact:true}).click();
  const document=JSON.parse(fs.readFileSync(await (await downloadEvent).path(),'utf8'));
  expect(validateExport(document).valid).toBe(true);expect(document.data_origin).toBe('SIMULATED');
  expect(JSON.stringify(document)).not.toContain(codes.primary);expect(document.reviews).toHaveLength(14);
 } finally {await other.close();}
});

test('draft survives reload and validation failure; pause/resume and immutable lock',async({page,service},info)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const {ui,codes}=await prepare(page,service);
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await ui.login(codes.primary);await ui.openCase('case-004');
 await page.getByRole('button',{name:'Start / resume timing',exact:true}).click();
 await page.getByLabel('1. Trigger',{exact:true}).fill('SIMULATED 재개할 초안');
 await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect(page.getByRole('status')).toContainText('Saved');
 await page.reload();await ui.openCase('case-004');await expect(page.getByLabel('1. Trigger',{exact:true})).toHaveValue('SIMULATED 재개할 초안');
 await page.getByRole('button',{name:'Submit and lock',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('VALIDATION');await expect(page.getByLabel('1. Trigger',{exact:true})).toHaveValue('SIMULATED 재개할 초안');
 await ui.fillLabel();
 await page.getByRole('button',{name:'Save and pause',exact:true}).click();await expect(page.getByLabel('1. Trigger',{exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Start / resume timing',exact:true}).click();
 await page.screenshot({path:info.outputPath('synthetic-review.png'),fullPage:true});
 await page.getByRole('button',{name:'Submit and lock',exact:true}).click();
 await expect(page.getByText('Status: LOCKED',{exact:true})).toBeVisible();
 await expect(page.getByLabel('1. Trigger',{exact:true})).toBeDisabled();expect(errors).toEqual([]);
});

test('missing context remains a normal label; keyboard, Korean text and reflow',async({page,service},info)=>{
 const {ui,codes}=await prepare(page,service);
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await ui.login(codes.primary);await ui.openCase('case-008');
 const start=page.getByRole('button',{name:'Start / resume timing',exact:true});await start.focus();await expect(start).toBeFocused();await page.keyboard.press('Enter');
 await ui.fillLabel({verdict:'INSUFFICIENT_CONTEXT',missing:true});
 await page.getByRole('button',{name:'Submit and lock',exact:true}).click();await expect(page.getByText('Status: LOCKED',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(n=>n.getBoundingClientRect().right>innerWidth+1).map(n=>n.tagName+':'+n.textContent.slice(0,40)))).toEqual([]);
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 expect(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(n=>n.getBoundingClientRect().right>innerWidth+1).map(n=>n.tagName+':'+n.textContent.slice(0,40)))).toEqual([]);
 await page.screenshot({path:info.outputPath('synthetic-uncertainty-200percent.png'),fullPage:true});
});

test('offline failure retains input, source text is inert, and JSON transfers preserve drafts',async({page,service})=>{
 const ui=new AnnotationPage(page,service.url);await ui.login('synthetic-operator-test-code');
 const bundle=JSON.parse(fs.readFileSync(new URL('../../../data/samples/SIMULATED/ten-cases.json',import.meta.url)));
 bundle.cases[0].description='<img src=x onerror="window.syntheticLeak=1"> SIMULATED text';
 await page.getByLabel('Bundle or export JSON',{exact:true}).fill(JSON.stringify(bundle));await page.getByRole('button',{name:'Import JSON',exact:true}).click();
 await page.getByLabel('Primary reviewer ID').fill('sim-reviewer-a');await page.getByLabel('Secondary reviewer ID').fill('sim-reviewer-b');
 for(const id of ['case-001','case-004','case-007','case-010'])await page.getByLabel('Second review '+id,{exact:true}).check();
 await page.getByRole('button',{name:'Create blind review plan',exact:true}).click();
 const code=await page.getByLabel('Primary access code',{exact:true}).inputValue();
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await ui.login(code);await ui.openCase('case-001');
 expect(await page.evaluate(()=>window.syntheticLeak)).toBeUndefined();await expect(page.getByText(bundle.cases[0].description,{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Start / resume timing',exact:true}).click();await page.getByLabel('1. Trigger',{exact:true}).fill('SIMULATED offline recovery');
 await page.context().setOffline(true);await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect(page.getByRole('status')).toContainText('Input retained');
 await expect(page.getByLabel('1. Trigger',{exact:true})).toHaveValue('SIMULATED offline recovery');
 await page.context().setOffline(false);await page.getByRole('button',{name:'Save and pause',exact:true}).click();await expect(page.getByRole('status')).toContainText('paused');
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await ui.login('synthetic-operator-test-code');
 const event=page.waitForEvent('download');await page.getByRole('button',{name:'Export provenance JSON',exact:true}).click();const exported=JSON.parse(fs.readFileSync(await(await event).path(),'utf8'));
 const imported=await startServer({port:0,directory:fs.mkdtempSync(path.join(os.tmpdir(),'decode-ui-transfer-')),operatorKey:'synthetic-transfer-code'});
 try{
  const target=new AnnotationPage(page,imported.url);await target.login('synthetic-transfer-code');
  await page.getByLabel('Bundle or export JSON',{exact:true}).fill(JSON.stringify(exported));await page.getByRole('button',{name:'Import JSON',exact:true}).click();
  await page.getByRole('button',{name:'Reissue code: sim-reviewer-a',exact:true}).click();const newCode=await page.getByLabel('New access code',{exact:true}).inputValue();
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await target.login(newCode);await target.openCase('case-001');
  await expect(page.getByLabel('1. Trigger',{exact:true})).toHaveValue('SIMULATED offline recovery');
  await expect(page.getByText('Status: PAUSED',{exact:true})).toBeVisible();
 } finally {await imported.close();}
});

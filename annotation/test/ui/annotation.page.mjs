import { expect } from '@playwright/test';
export class AnnotationPage {
  constructor(page,url){this.page=page;this.url=url;}
  async login(code){
    await this.page.goto(this.url);
    await this.page.getByLabel('Access code',{exact:true}).fill(code);
    await this.page.getByRole('button',{name:'Sign in',exact:true}).click();
    await expect(this.page.getByRole('button',{name:'Sign out',exact:true})).toBeVisible();
  }
  async createPlan(){
    await this.page.getByRole('button',{name:'Load 10 SIMULATED fixtures',exact:true}).click();
    await this.page.getByLabel('Primary reviewer ID').fill('sim-reviewer-a');
    await this.page.getByLabel('Secondary reviewer ID').fill('sim-reviewer-b');
    for(const id of ['case-001','case-004','case-007','case-010'])await this.page.getByLabel('Second review '+id,{exact:true}).check();
    await this.page.getByRole('button',{name:'Create blind review plan',exact:true}).click();
    return {primary:await this.page.getByLabel('Primary access code',{exact:true}).inputValue(),secondary:await this.page.getByLabel('Secondary access code',{exact:true}).inputValue()};
  }
  async openCase(id){await this.page.getByRole('button',{name:'Open '+id,exact:true}).click();await expect(this.page.getByRole('heading',{name:'Review '+id,exact:true})).toBeVisible();}
  async fillLabel({verdict='OPTIMAL',missing=false}={}){
    await this.page.getByLabel('1. Trigger',{exact:true}).fill('SIMULATED 접촉 이후 판단');
    await this.page.getByLabel('2. Observed decision',{exact:true}).fill('SIMULATED 안전한 위치 변경');
    await this.page.getByLabel('3. Verdict',{exact:true}).selectOption(verdict);
    await this.page.getByLabel('4. Preferred decision',{exact:true}).fill(missing?'':'SIMULATED reposition');
    await this.page.getByLabel('5. Decision principle',{exact:true}).selectOption('POST_KILL_REPOSITION');
    await this.page.getByLabel('6. Expert reason',{exact:true}).fill('SIMULATED example only. 정보가 부족하면 판단을 유보한다.');
    await this.page.getByLabel('8. Confidence',{exact:true}).selectOption('LOW');
    if(missing){await this.page.getByLabel('MISSING_INFORMATION',{exact:true}).check();await this.page.getByLabel('Missing context note',{exact:true}).fill('SIMULATED 적 정보가 확인되지 않음');}
  }
}

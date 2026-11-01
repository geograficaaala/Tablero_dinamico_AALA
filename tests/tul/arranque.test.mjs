import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

class ElementMock {
  constructor(){this.innerHTML='';this.textContent='';this.hidden=true;this.title='';this.className='';this.attrs={};this.listeners={};this.buttons=[];this.classList={classes:new Set(),toggle:(name,on)=>{if(on===undefined? !this.classList.classes.has(name):on)this.classList.classes.add(name);else this.classList.classes.delete(name);},add:name=>this.classList.classes.add(name),remove:name=>this.classList.classes.delete(name)};}
  addEventListener(name,handler){this.listeners[name]=handler;}
  querySelector(selector){return document.getElementById(selector.slice(1));}
  replaceChildren(...elements){this.buttons=elements;}
  setAttribute(name,value){this.attrs[name]=value;}
  focus(){}
  click(){this.listeners.click?.();}
}

test('arranque real del módulo: monta header, footer, KPI, selector y presentación',async()=>{
  const nodes=new Map();
  globalThis.document={body:new ElementMock(),getElementById:id=>{if(!nodes.has(id))nodes.set(id,new ElementMock());return nodes.get(id);},createElement:()=>new ElementMock(),addEventListener:()=>{}};
  globalThis.window={location:{href:''}};
  globalThis.fetch=async url=>({ok:true,status:200,text:async()=>readFileSync(fileURLToPath(url),'utf8')});
  await import('../../src/programs/tul/dashboard.mjs');
  for(let i=0;i<20&&!document.getElementById('monthlyKpiGrid').innerHTML.includes('kpi');i++)await new Promise(r=>setTimeout(r,10));
  assert.match(document.getElementById('tulHeaderMount').innerHTML,/Modo presentación/);
  assert.match(document.getElementById('tulFooterMount').innerHTML,/LinkedIn/);
  assert.equal((document.getElementById('annualKpiGrid').innerHTML.match(/<article class="card kpi/g)||[]).length,6);
  assert.equal((document.getElementById('monthlyKpiGrid').innerHTML.match(/<article class="card kpi/g)||[]).length,5);
  assert.match(document.getElementById('monthlyAnalysis').innerHTML,/Septiembre/);
  const buttons=document.getElementById('monthPills').buttons;
  assert.equal(buttons.length,12);
  assert.equal(buttons[0].disabled,true);
  assert.equal(buttons[9].disabled,true);
  buttons[1].click();
  assert.match(document.getElementById('annualKpiGrid').innerHTML,/230/);
  document.getElementById('btnExec').click();
  assert.ok(document.body.classList.classes.has('view-exec'));
  document.getElementById('btnPresentation').click();
  assert.match(document.getElementById('tulPresentation').innerHTML,/1 \/ 6/);
  document.getElementById('tulNext').click();
  assert.match(document.getElementById('tulPresentation').innerHTML,/2 \/ 6/);
  document.getElementById('tulClose').click();
  assert.equal(document.getElementById('tulPresentation').hidden,true);
  assert.equal(document.getElementById('tulError').textContent,'');
});

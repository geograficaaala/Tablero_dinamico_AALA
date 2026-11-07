import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PROGRAM_IDS } from '../../src/reports/report-profiles.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');

function mockBrowser(program){
  const els={};
  for(const id of ['printButton','mailButton','backButton','periodLabel','document','reportHeading','error','loading','mailHelp']){
    els[id]={id,innerHTML:'',textContent:'',href:'',hidden:false,disabled:true,addEventListener(){}};
  }
  globalThis.document={title:'',getElementById:id=>els[id]};
  globalThis.location={search:`?programa=${program}&mes=2026-10`,href:`https://tableroaala.online/public/informe.html?programa=${program}&mes=2026-10`};
  globalThis.window={print(){},location:{href:''}};
  globalThis.fetch=async resource=>{
    const file=fileURLToPath(resource);
    if(!fs.existsSync(file))return {ok:false,status:404};
    return {ok:true,json:async()=>JSON.parse(fs.readFileSync(file,'utf8')),text:async()=>fs.readFileSync(file,'utf8')};
  };
  return els;
}

test('la página imprimible carga y renderiza los seis programas de octubre sin datos incrustados',async()=>{
  for(const program of PROGRAM_IDS){
    const els=mockBrowser(program);
    await import(`../../src/reports/report-browser.mjs?test=${program}`);
    for(let n=0;n<100&&!els.document.innerHTML&&!els.error.textContent;n++)await new Promise(r=>setTimeout(r,4));
    assert.equal(els.error.textContent,'',`${program}: ${els.error.textContent}`);
    assert.match(els.document.innerHTML,/INFORME MENSUAL DE RESULTADOS/);
    assert.match(els.document.innerHTML,/3\. Desarrollo de los indicadores institucionales/);
    assert.match(els.document.innerHTML,/6\. Seguimiento entre períodos/);
    assert.match(els.document.innerHTML,/Seguimiento complementario 8\./);
    assert.equal(els.printButton.disabled,false);
    assert.equal(els.mailButton.disabled,false);
  }
});

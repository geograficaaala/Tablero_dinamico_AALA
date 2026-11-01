import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const elements=new Map();
function element(id){
  if(!elements.has(id)){
    const e={id,innerHTML:'',textContent:'',className:'',value:'',title:'',disabled:false,style:{},children:[],scrollLeft:0,offsetLeft:0,offsetWidth:40,clientWidth:1200,
      classList:{add(){},remove(){},toggle(){},contains(){return false}},
      addEventListener(){},setAttribute(){},getAttribute(){return ''},querySelector(){return null},querySelectorAll(){return []},
      appendChild(v){this.children.push(v);return v},replaceChildren(...items){this.children=items},
    };
    elements.set(id,e);
  }
  return elements.get(id);
}
const doc={getElementById:id=>element(id),createElement:tag=>element('new-'+tag+'-'+Math.random()),
  querySelector:selector=>selector==='.hero-lead'?element('hero-lead'):selector==='#supervivenciaPromedio .survival-value'?element('survival'):element(selector),
  querySelectorAll:()=>[],addEventListener(){},body:{classList:{add(){},remove(){}},style:{}}};
element('survival').innerHTML='<strong>71.7%</strong><span>Enero–junio 2026</span>';
const ctx={document:doc,console,setTimeout,clearTimeout,requestAnimationFrame:f=>f(),
  fetch:async url=>{const file=path.resolve(root,'public',url);return {ok:fs.existsSync(file),status:fs.existsSync(file)?200:404,text:async()=>fs.readFileSync(file,'utf8')}}};
ctx.window=ctx;vm.createContext(ctx);
const src=fs.readFileSync(path.join(root,'src/programs/reforestacion/dashboard.js'),'utf8');
vm.runInContext(src,ctx,{timeout:6000});
await new Promise(resolve=>setTimeout(resolve,300));

test('la carga inicial renderiza cifras y metas desde CSV',()=>{
  assert.match(element('kpiGrid').innerHTML,/35,000|35000/);
  assert.match(element('kpiGrid').innerHTML,/90,000|90000/);
  assert.match(element('kpiComplementGrid').innerHTML,/Mapas digitales/);
  assert.equal(element('sourceBanner').textContent,'');
  assert.match(element('heroSurvival').textContent,/68/);
  assert.ok(element('reforestacionHeaderMount')!==undefined);
});
test('filtro mensual cambia cifras sin advertencias de procedencia',()=>{
  ctx.window.setReforestaPeriod('2026-07');
  assert.equal(element('sourceBanner').textContent,'');
  assert.match(element('kpiGrid').innerHTML,/9,000|9000/);
  ctx.window.setReforestaPeriod('2026-06');
  assert.equal(element('sourceBanner').textContent,'');
  assert.match(element('kpiGrid').innerHTML,/7,670|7670/);
  assert.match(element('heroSurvival').textContent,/71,7|71.7/);
});
test('resumen ejecutivo y presentación se generan con el mes seleccionado',()=>{
  ctx.window.setReforestaPeriod('2026-09');
  assert.match(element('execKpiGrid').innerHTML,/35,000|35000/);
  ctx.openPresentation();
  assert.match(element('presentationTrack').innerHTML,/Reforestando Atitlán/i);
  assert.match(ctx.window.reforestaResumenCorreo(),/Septiembre 2026/);
});

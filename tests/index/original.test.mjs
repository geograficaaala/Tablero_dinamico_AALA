import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { programs } from '../../src/index/index-data.mjs';

const read = name => fs.readFileSync(name,'utf8');
const html=read('public/index.html');
const css=read('src/styles/index-original.css');
const js=read('src/index/index-original.mjs');
const descriptors=JSON.parse(read('config/index/tarjetas.json'));

test('estructura visual y textos del índice original',()=>{
  for(const fragment of ['id="page-resumen"','id="page-programas"','class="hero-shell"','class="dashboard-ribbon','class="storyboard"','class="panorama-stage"','id="coverageMap"','id="coverageFilters"','id="programGrid"','id="programMonthButtons"','id="programCarouselViewport"','class="site-footer"']){
    assert.ok(html.includes(fragment),fragment);
  }
  assert.ok(css.includes('.program-card'));
  assert.ok(css.includes('.hero-shell'));
  assert.ok(css.includes('.site-footer'));
});

test('HTML sin estilos ni indicadores históricos incrustados',()=>{
  assert.ok(!html.includes('PROGRAM_MONTH_SNAPSHOTS'));
  assert.ok(!html.includes('<style>'));
  assert.ok(html.includes('src="../src/index/index-original.mjs"'));
  assert.ok(html.includes('href="../src/styles/index-original.css"'));
});

test('las seis tarjetas utilizan páginas existentes y controladores vigentes',()=>{
  assert.equal(descriptors.length,6);
  assert.equal(programs.length,6);
  for(const item of descriptors){
    assert.ok(fs.existsSync(`public/${item.dashboard}`),item.dashboard);
    assert.ok(programs.some(program=>program.id===item.modelId),item.id);
    assert.ok(item.indicators.length>0,item.id);
  }
});

test('el índice usa la cobertura original y conserva los enlaces sociales',()=>{
  assert.ok(fs.existsSync('public/assets/maps/cobertura.geojson'));
  assert.ok(fs.existsSync('public/assets/logos/chill_lago.png'));
  for(const href of ['amigosdeatitlan.org','youtube.com','facebook.com','linkedin.com','instagram.com'])assert.ok(html.includes(href),href);
});

test('sin precálculos numéricos mensuales dentro de JavaScript',()=>{
  assert.ok(!js.includes('PROGRAM_MONTH_SNAPSHOTS'));
  assert.ok(js.includes('loadedModels'));
  assert.ok(js.includes('makeMetric'));
  assert.ok(js.includes('renderProgramMonth'));
  assert.ok(js.includes('initCoverageMap'));
});

test('el cambio de mes conserva el programa activo en el carrusel',()=>{
  const begin=js.indexOf('let programCarouselIndex = 0;');
  const end=js.indexOf("window.addEventListener('resize'",begin);
  assert.ok(begin>=0 && end>begin);
  assert.ok(js.includes('initProgramCarousel(activeProgramId)'));
  assert.ok(js.includes('currentItems[programCarouselIndex]?.dataset.programId'));
  const ids=descriptors.map(d=>d.id);
  const viewport={scrollLeft:0,getBoundingClientRect:()=>({left:0}),scrollTo({left}){this.scrollLeft=left;}};
  let cards=ids.map((id,index)=>({
    dataset:{programId:id},
    getBoundingClientRect:()=>({left:index*360-viewport.scrollLeft}),
    querySelector:()=>({textContent:id})
  }));
  const domDots={children:[],set innerHTML(html){
    this.children=Array.from(html.matchAll(/<button /g)).map(()=>({
      classList:{active:false,toggle(name,value){if(name==='active')this.active=value;}},
      setAttribute(){},addEventListener(){}
    }));
  }};
  const grid={querySelectorAll:()=>cards};
  const prev={};
  const next={};
  const elements={programGrid:grid,programCarouselViewport:viewport,programCarouselDots:domDots,programCarouselPrev:prev,programCarouselNext:next};
  const scope={
    document:{getElementById:id=>elements[id]||null},
    window:{clearTimeout(){},setTimeout(){}}
  };
  const context=vm.createContext(scope);
  vm.runInContext(js.slice(begin,end),context);
  vm.runInContext('initProgramCarousel()',context);
  vm.runInContext('goToProgramCarousel(4, "instant")',context);
  assert.equal(viewport.scrollLeft,1440);
  assert.equal(domDots.children[4].classList.active,true);
  cards=ids.map((id,index)=>({dataset:{programId:id},getBoundingClientRect:()=>({left:index*360-viewport.scrollLeft}),querySelector:()=>({textContent:id})}));
  vm.runInContext('initProgramCarousel("'+ids[4]+'")',context);
  assert.equal(viewport.scrollLeft,1440);
  assert.equal(domDots.children[4].classList.active,true);
  assert.equal(prev.disabled,false);
  assert.equal(next.disabled,false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const load=file=>readFileSync(resolve(root,file),'utf8');
const html=load('public/conservando-atitlan.html');
const dashboard=load('src/programs/conservando_atitlan/dashboard.mjs');
const css=load('src/styles/programs/conservando_atitlan.css');

for(const [name,selector] of [['metas anuales','strategicGrid'],['metas mensuales','monthlyGrid'],['tendencia','trendChartHost'],['cadena del jabón','soapChartHost'],['diagnóstico','diagnosticProse'],['resumen ejecutivo','execView'],['presentación','presentationOverlay'],['header','aalaHeaderRoot'],['footer','aalaFooterRoot']]){
  test(`la página conserva ${name}`,()=>assert.match(html,new RegExp(`id="${selector}"`)));
}

test('el HTML no incrusta datos ni scripts de cálculo',()=>{
  assert.doesNotMatch(html,/<script(?![^>]*src=)/i);
  assert.doesNotMatch(html,/<style[\s>]/i);
  assert.doesNotMatch(html,/const\s+(GOALS|SEPTIEMBRE_2026)/);
});

test('todos los módulos y estilos incluidos por el HTML existen',()=>{
  const imports=[...html.matchAll(/(?:href|src)="(\.\.\/src\/[^"?#]+)"/g)].map(x=>x[1]);
  assert.ok(imports.length>=3);
  for(const path of imports){assert.ok(existsSync(resolve(root,'public',path)),path);}
  for(const path of ['src/components/header/header.js','src/components/footer/footer.js','src/programs/conservando_atitlan/data-controller.mjs','public/assets/logos/conservando-atitlan.png','public/assets/logos/aala.png'])assert.ok(existsSync(resolve(root,path)),path);
});

test('los KPI provienen del controlador y las tablas del programa',()=>{
  assert.match(dashboard,/crearControladorConservando\(datos,metas,fuentes\)/);
  assert.match(dashboard,/\.\.\/data\/conservando_atitlan\/2026/);
  assert.match(dashboard,/controller\.seleccionarMes\(state\.period\)\.metasAnuales/);
  assert.match(dashboard,/controller\.seleccionarMes\(state\.period\)\.metasMensuales/);
  assert.doesNotMatch(dashboard,/const\s+SEPTIEMBRE_2026\s*=/);
});

test('componentes compartidos, meses y las cuatro acciones',()=>{
  const header=load('src/components/header/header.js');
  const footer=load('src/components/footer/footer.js');
  for(const id of ['btnFull','btnExec','btnPresentation','btnMail','monthPills'])assert.ok(header.includes(id));
  for(const link of ['amigosdeatitlan.org','facebook.com','youtube.com','instagram.com','linkedin.com'])assert.ok(footer.includes(link));
  assert.match(header,/Array|MONTHS/);
});

test('el azul institucional se utiliza en todos los estados visibles',()=>{
  assert.match(css,/\.kpi\.tone-red::before/);
  assert.match(css,/\.month-bar-fill\.red/);
  assert.match(css,/\.pres-bar\.red/);
  assert.match(css,/!important/);
});

test('la publicación incorpora los dos dashboards',()=>{
  const page=load('public/index.html');
  assert.match(page,/atitlan-recicla\.html/);
  assert.match(page,/conservando-atitlan\.html/);
  const deploy=load('.github/workflows/publicar-atitlan-recicla.yml');
  assert.match(deploy,/scripts\/conservando_atitlan\/validate_data\.py/);
});

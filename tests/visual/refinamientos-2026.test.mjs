import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = f => readFileSync(f,'utf8');
const pages = [
 'index.html','atitlan-recicla.html','conservando-atitlan.html',
 'educando-para-conservar.html','fortalecimiento-municipal.html',
 'reforestando-atitlan.html','tul.html'
];
test('las siete páginas incorporan el refinamiento visual posterior al tema base',()=>{
 for(const name of pages){
  const html=source(`public/${name}`);
  assert.match(html,/styles\/aala-refinamientos-2026\.css/);
  assert.ok(html.indexOf('aala-refinamientos-2026.css') > html.indexOf('aala-pastel.css'));
 }
});
test('encabezado de programa conserva acciones y sitúa los controles',()=>{
 const css=source('src/styles/aala-refinamientos-2026.css');
 assert.match(css,/position:sticky!important/);
 assert.match(css,/\.aala-v2-nav-link/);
 assert.match(css,/\.aala-v2-month-container/);
 assert.match(css,/\.aala-v2-actions/);
 assert.match(css,/overflow-x:auto/);
 assert.match(source('src/reports/report-ui.mjs'),/btn\.textContent='Modo informe'/);
});
test('los diagnósticos son prosa continua derivada del mes',()=>{
 for(const path of [
   'src/programs/atitlan_recicla/dashboard.mjs',
   'src/programs/conservando_atitlan/dashboard.mjs',
   'src/programs/fortalecimiento_municipal/dashboard.mjs',
   'src/programs/reforestacion/dashboard.js',
   'src/programs/educando_para_conservar/dashboard.js',
   'src/programs/tul/dashboard.mjs'
 ]) assert.match(source(path),/aala-diagnostic-prose/);
 assert.match(source('src/programs/educando_para_conservar/dashboard.js'),/septiembre de 2026/);
});
test('pie institucional organiza misión, redes y contacto en ese orden',()=>{
 const f=source('src/components/aala-institutional-footer.mjs');
 const objetivo=f.indexOf('class="footer-brand"');
 const redes=f.indexOf('class="footer-col aala-footer-social"');
 const contacto=f.indexOf('class="footer-col aala-footer-contact"');
 assert.ok(objetivo>=0 && redes>objetivo && contacto>redes);
 assert.match(f,/El objetivo de la Asociación Amigos del Lago de Atitlán/);
});

test('el índice tiene contraste legible y un único párrafo de lectura institucional',()=>{
 const css=source('src/styles/aala-refinamientos-2026.css');
 const index=source('public/index.html');
 assert.match(css,/hero-main\.card p\.hero-copy/);
 assert.match(css,/color:#35546a!important/);
 assert.equal((index.match(/class="prose aala-integrated-reading"/g)||[]).length,1);
 assert.doesNotMatch(index,/<p class="prose">\s*Aquí no se mezclan/);
});
test('las tarjetas de metas anuales están delimitadas y los botones no se esconden',()=>{
 const css=source('src/styles/aala-refinamientos-2026.css');
 assert.match(css,/annual-goals-grid \.goal-card/);
 assert.match(css,/border-top:3px solid/);
 assert.match(css,/grid-template-rows:54px 34px/);
 assert.match(css,/color:#fff!important;background:#2c648d/);
 assert.match(source('src/components/aala-visual-universal.mjs'),/revealSelectedMonth/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCSV, crearControladorConservando } from '../../src/programs/conservando_atitlan/data-controller.mjs';

const read = filename => readFileSync(new URL(`../../${filename}`, import.meta.url), 'utf8');

test('Conservando octubre: 730 velas vendidas en el mes y 730 velas en el indicador anual', () => {
  const rows = parseCSV(read('data/conservando_atitlan/2026/datos_mensuales.csv'));
  const goals = parseCSV(read('data/conservando_atitlan/2026/metas_2026.csv'));
  const controller = crearControladorConservando(rows, goals);
  const october = controller.seleccionarMes('2026-10');
  assert.equal(october.metasMensuales.find(item => item.id === 'velas-vendidas-mes').value, '730');
  assert.equal(october.metasAnuales.find(item => item.id === 'velas-prod').value, '730');
  const september = controller.seleccionarMes('2026-09');
  assert.equal(september.metasMensuales.find(item => item.id === 'velas-vendidas-mes').value, '43');
  assert.equal(september.metasAnuales.find(item => item.id === 'velas-prod').value, '50');
});

test('Conservando: gráficos anuales de velas toman 730 solo en octubre', () => {
  const js = read('src/programs/conservando_atitlan/dashboard.mjs');
  assert.match(js, /metricId==='velas-prod'.*state\.period==='2026-10'\?730/);
});

test('Reforestando: supervivencia octubre 71%, septiembre 68%', () => {
  const rows = parseCSV(read('data/reforestacion/2026/supervivencia_2026.csv'));
  assert.equal(rows.find(row => row.periodo_clave === '2026-10').porcentaje_mostrado, '71');
  assert.equal(rows.find(row => row.periodo_clave === '2026-09').porcentaje_mostrado, '68');
  assert.match(rows.find(row => row.periodo_clave === '2026-10').leyenda, /Octubre/);
});

test('Educando: octubre cierra todas las metas salvo Ferias en anual, mensual y gráficos', () => {
  const js = read('src/programs/educando_para_conservar/dashboard.js');
  assert.match(js, /function octoberWindowState\(labelOrKey, period = state\.periodo\)/);
  assert.match(js, /ferias\/i\.test\(String\(labelOrKey/);
  assert.match(js, /const octoberStatus = octoberWindowState\(cfg\.key, row\.periodo_clave\)/);
  assert.match(js, /const octoberStatus = octoberWindowState\(data\.label\)/);
  assert.match(js, /octoberStatus === 'closed' \? 'Ventana cerrada' : 'Activa'/);
  assert.match(js, /Ciclo formativo <strong>concluido<\/strong>/);
});

test('Carrusel: barra de flechas visible tras retirar los cintillos y compatible con zoom', () => {
  const css = read('src/styles/aala-fotografias.css');
  const lastFix = css.slice(css.indexOf('2026-11-09 · Reparación de flechas'));
  assert.ok(lastFix.length > 100);
  assert.match(lastFix, /height: 64px !important/);
  assert.match(lastFix, /position: relative !important/);
  assert.match(lastFix, /transform: none !important/);
  const html = read('public/index.html');
  assert.match(html, /id="programCarouselPrev"/);
  assert.match(html, /id="programCarouselNext"/);
});

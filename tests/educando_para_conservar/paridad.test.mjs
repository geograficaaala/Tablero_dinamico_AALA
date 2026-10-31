import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { parseCSV } from '../../src/core/csv.mjs';

const base = 'data/educando_para_conservar/2026/';
const rows = filename => parseCSV(readFileSync(base + filename, 'utf8'));
const total = rows('total_mes.csv');
const indicadores = rows('institucional_indicadores.csv');
const metas = rows('metas_referencia_2026.csv');

test('nueve meses publicados sin octubre-diciembre inventados', () => {
  assert.equal(total.length, 9);
  assert.deepEqual(total.map(row => row.periodo_clave), Array.from({ length: 9 }, (_, i) => `2026-${String(i + 1).padStart(2, '0')}`));
});

test('cifras de septiembre y textos originales', () => {
  const row = total.find(r => r.periodo_clave === '2026-09');
  assert.equal(Number(row.docentes_mes), 119);
  assert.equal(Number(row.estudiantes_epc_mes), 3428);
  assert.equal(Number(row.centros_mes), 49);
  assert.equal(Number(row.municipios_mes), 13);
  assert.ok(row.logros_texto.length > 50);
});

test('165 registros de indicadores, sin duplicados', () => {
  assert.equal(indicadores.length, 165);
  assert.equal(new Set(indicadores.map(r => `${r.periodo_clave}|${r.indicator_id}`)).size, indicadores.length);
  assert.equal(indicadores.filter(r => r.periodo_clave === '2026-09').length, 18);
});

test('metas y estados internos preservados en CSV', () => {
  assert.equal(metas.length, 18);
  for (const meta of metas) {
    const indicator = indicadores.find(r => r.periodo_clave === '2026-09' && r.indicator_id === meta.indicator_id);
    assert.ok(indicator);
    assert.equal(meta.meta_anual, indicator.meta_anual);
    assert.equal(meta.meta_mes, indicator.meta_mes);
    assert.ok(['verde', 'amarillo', 'rojo', 'azul', 'gris'].includes(indicator.estatus));
  }
});

test('el HTML usa el controlador externo y los módulos compartidos reales', () => {
  const html = readFileSync('public/educando-para-conservar.html', 'utf8');
  const bootstrap = readFileSync('src/programs/educando_para_conservar/bootstrap.mjs', 'utf8');
  const js = readFileSync('src/programs/educando_para_conservar/dashboard.js', 'utf8');
  assert.match(html, /bootstrap\.mjs/);
  assert.doesNotMatch(html, /const SEPTIEMBRE_INDICADORES/);
  assert.match(bootstrap, /components\/header\.js/);
  assert.match(bootstrap, /components\/footer\/footer\.js/);
  assert.match(js, /\.\.\/data\/educando_para_conservar\/2026\/total_mes\.csv/);
  for (const file of ['src/components/header.js', 'src/components/footer/footer.js', 'src/core/csv.mjs', 'public/assets/logos/educando-para-conservar.png']) assert.ok(existsSync(file), file);
});

test('portal y publicación incluyen Educando para Conservar', () => {
  assert.match(readFileSync('public/index.html','utf8'), /href="\.\/educando-para-conservar\.html"/);
  assert.match(readFileSync('.github/workflows/publicar-atitlan-recicla.yml','utf8'), /'educando-para-conservar'/);
});

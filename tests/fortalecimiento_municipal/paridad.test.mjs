import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCSV } from '../../src/core/csv.mjs';
import { crearControladorFortalecimiento } from '../../src/programs/fortalecimiento_municipal/data-controller.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dir = 'data/fortalecimiento_municipal/2026/';
const names = ['actividades_2026.csv', 'indicadores_publicados_2026.csv', 'metas_referencia_2026.csv', 'notas_mensuales_2026.csv', 'periodos_2026.csv'];
const keys = ['actividades', 'indicadores', 'metas', 'notas', 'periodos'];
const records = Object.fromEntries(names.map((name, index) => [keys[index], parseCSV(readFileSync(resolve(root, dir, name), 'utf8'))]));
const reference = JSON.parse(readFileSync(resolve(root, 'references/fortalecimiento_municipal/referencia_original_2026.json'), 'utf8'));
const controller = crearControladorFortalecimiento(records);

test('102 actividades y cinco fuentes de componentes', () => {
  assert.equal(records.actividades.filter(r => r.periodo <= '2026-09').length, 102);
  for (const [source, n] of Object.entries(reference.actividades_por_componente)) assert.equal(records.actividades.filter(row => row.componente === source && row.periodo <= '2026-09').length, n);
});

test('45 valores publicados coinciden con el HTML original', () => {
  for (const [period, bySource] of Object.entries(reference.resumen_indicadores)) {
    const values = Object.fromEntries(controller.indicadores(period).map(item => [item.componente, item.valor_publicado]));
    assert.deepEqual(values, bySource, `Resultados de ${period}`);
  }
});

test('agosto y septiembre mantienen ajustes históricos sin recalcularlos', () => {
  for (const [period, overrides] of Object.entries(reference.overrides_originales)) {
    const values = Object.fromEntries(controller.indicadores(period).map(item => [item.componente, item]));
    for (const [component, expected] of Object.entries(overrides)) {
      assert.equal(values[component].valor_publicado, expected);
      assert.equal(values[component].origen_valor, 'ajuste_publicado_en_html_original');
    }
  }
});

test('filtros históricos acumulados, mensuales, componentes y búsqueda', () => {
  assert.equal(controller.periodos.length, 9);
  assert.equal(controller.ultimoPeriodo, '2026-09');
  assert.equal(controller.actividadesMes('2026-09').length, records.actividades.filter(row => row.periodo === '2026-09').length);
  assert.equal(controller.actividades('2026-09', { componente: 'todos' }).length, 102);
  assert.equal(controller.actividades('2026-09', { componente: 'estudios', estado: 'confirmado' }).length, 10);
  assert.equal(controller.actividades('2026-09', { componente: 'asistencias', busqueda: 'Xejuyú' }).length > 0, true);
  assert.equal(controller.actividades('2026-01', { componente: 'todos' }).every(row => row.periodo === '2026-01'), true);
});

test('notas de septiembre se conservan literalmente', () => {
  assert.equal(controller.nota('2026-09'), reference.notas_originales['2026-09']);
});

test('estado interno conserva las reglas de la vista ejecutiva original', () => {
  const summary = controller.resumen('2026-09');
  const ratio = summary.reduce((total, row) => total + (row.total ? row.confirmadas / row.total : 0), 0) / summary.length;
  const expected = ratio >= .85 ? 'avance_solido' : ratio >= .5 ? 'avance_medio' : ratio > 0 ? 'avance_inicial' : 'sin_avance';
  assert.equal(controller.estadoProgramatico('2026-09').estado, expected);
});

test('las cinco metas son referencias no ratificadas', () => {
  assert.equal(controller.metas.length, 5);
  assert.equal(controller.metas.every(row => row.estado_aprobacion === 'referencia_original_pendiente_confirmacion'), true);
});

test('rutas y exportaciones de módulos externos reales', async () => {
  const paths = ['public/fortalecimiento-municipal.html', 'src/styles/programs/fortalecimiento_municipal.css', 'src/components/header.js', 'src/components/footer/footer.js', 'src/programs/fortalecimiento_municipal/dashboard.mjs'];
  for (const path of paths) assert.equal(existsSync(resolve(root, path)), true, path);
  const { mountProgramHeader } = await import('../../src/components/header.js');
  const { mountFooter } = await import('../../src/components/footer/footer.js');
  assert.equal(typeof mountProgramHeader, 'function');
  assert.equal(typeof mountFooter, 'function');
});

test('CSV con comillas y descripciones con saltos de línea', () => {
  assert.deepEqual(parseCSV('clave,nota\r\na,"texto, con coma\ny segunda línea"\r\n'), [{ clave: 'a', nota: 'texto, con coma\ny segunda línea' }]);
});

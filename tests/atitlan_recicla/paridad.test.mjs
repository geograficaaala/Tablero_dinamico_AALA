import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createAtitlanModel, parseCsv, KPI_IDS, ANNUAL_IDS } from '../../src/programs/atitlan_recicla/data-controller.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dataPath = resolve(root, 'data/atitlan_recicla/2026');
const loadText = path => readFile(resolve(dataPath, path), 'utf8');
const loadJson = async path => JSON.parse(await loadText(path));

const [totalMes, zonaMes, territorioMes, precalculoImpacto, metasAnuales, surusicMensual, reference] = await Promise.all([
  loadText('total_mes.csv').then(parseCsv),
  loadText('zona_mes.csv').then(parseCsv),
  loadText('territorio_mes.csv').then(parseCsv),
  loadJson('precalculo_impacto_final.json'),
  loadJson('metas_anuales.json'),
  loadJson('surusic_mensual.json'),
  readFile(resolve(root, 'tests/atitlan_recicla/golden-2026.json'), 'utf8').then(JSON.parse)
]);

const model = createAtitlanModel({ totalMes, zonaMes, territorioMes, precalculoImpacto, metasAnuales, surusicMensual });

function assertMatch(actual, expected, location) {
  if (typeof expected === 'number') {
    assert.equal(typeof actual, 'number', `${location}: tipo no numérico`);
    assert.ok(Math.abs(actual - expected) <= Math.max(1e-9, Math.abs(expected) * 1e-12), `${location}: ${actual} !== ${expected}`);
    return;
  }
  if (expected === null || typeof expected !== 'object') {
    assert.equal(actual, expected, location);
    return;
  }
  assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), `${location}: estructura`);
  for (const key of Object.keys(expected)) assertMatch(actual[key], expected[key], `${location}.${key}`);
}

test('cobertura del período y zonas de referencia', () => {
  assert.equal(reference.cases.length, 45);
  assert.equal(model.periods.length, 9);
  assert.deepEqual(model.zones, ['__all__', 'Kaqchikel', 'Las Lagunas', 'Tzolojya', 'Zona Sur']);
  assert.deepEqual(model.lastPeriod, { anio: 2026, mes_num: 9, mes: 'SEP' });
});

test('paridad de indicadores, tendencias, estados y metas del HTML original', () => {
  for (const caseData of reference.cases) {
    const { anio, mes_num, zona } = caseData;
    const location = `${anio}-${String(mes_num).padStart(2, '0')}|${zona}`;
    const actual = model.getKpis(anio, mes_num, zona);
    assert.deepEqual(Object.keys(actual), KPI_IDS);
    assertMatch(actual, caseData.kpis, `${location}.kpis`);
    assertMatch(model.getProgramStatus(anio, mes_num, zona), caseData.status, `${location}.status`);
    assertMatch(model.getTrend(anio, zona, 'materiales_generales'), caseData.trend, `${location}.trend`);
    if (zona === '__all__') {
      const goals = model.getAnnualGoals(anio, mes_num);
      assertMatch(goals, caseData.annual, `${location}.annual`);
      assert.deepEqual(Object.keys(goals).slice(0, ANNUAL_IDS.length), ANNUAL_IDS);
    }
  }
});

test('se mantienen los valores del precálculo municipal y zonal, sin recalcularlos', () => {
  for (const mes of Array.from({ length: 9 }, (_, index) => index + 1)) {
    const key = `2026|${mes}`;
    for (const zona of precalculoImpacto.zones) {
      assert.deepEqual(model.getImpact(2026, mes, { zona }), precalculoImpacto.byZone[zona][key]);
    }
    for (const municipio of precalculoImpacto.municipios) {
      assert.deepEqual(model.getImpact(2026, mes, { municipio }), precalculoImpacto.byMunicipio[municipio][key]);
    }
  }
  assert.equal(model.getImpact(2026, 5), null);
});

test('el parche final es el origen de los indicadores zonales', () => {
  const original = zonaMes.find(row => row.zona === 'Tzolojya' && row.mes_num === '5');
  const metric = model.getMetric(2026, 5, 'Tzolojya', 'participacion_comercializacion');
  assert.ok(Math.abs(Number(original.pct_participacion_comercializacion) - metric.valor) > 0.01);
  assert.equal(metric.valor, precalculoImpacto.byZone.Tzolojya['2026|5'].monthly.participacion_comercializacion);
});

test('zonas equivalentes y filtro mensual', () => {
  assertMatch(model.getKpis(2026, 5, 'Kaqchiquel'), model.getKpis(2026, 5, 'Kaqchikel'), 'alias');
  assert.equal(model.getTrend(2026, 'Kaqchikel', 'materiales_generales').length, 9);
  assert.throws(() => model.getMetric(2026, 5, '__all__', 'no_existe'), RangeError);
});

test('lectura CSV con comillas y texto multilineal', () => {
  assert.deepEqual(parseCsv('a,b\n"uno,dos","texto\ncon salto"\n'), [{ a: 'uno,dos', b: 'texto\ncon salto' }]);
  assert.throws(() => parseCsv('a,b\n1\n'), /fila 2/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { construirTarjetasInstitucionales } from '../../src/index/indicadores-institucionales.mjs';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const original = read('references/index/indice_original_2026.json');
const oficial = read('config/index/indicadores_institucionales_2026.json');
const cortes = read('data/index/2026/cortes_publicados.json');
const withoutDashboard = ({ dashboard, ...rest }) => rest;

test('nueve meses históricos completos y octubre de Atitlán Recicla y Conservando Atitlán', () => {
  assert.deepEqual(Object.keys(cortes).sort(), ['1','10','2','3','4','5','6','7','8','9']);
  assert.equal(oficial.length, 6);
  assert.equal(Array.from({length:9},(_,i)=>cortes[String(i+1)]).reduce((sum, list) => sum + list.reduce((total, p) => total + p.metrics.length, 0), 0), 189);
  assert.deepEqual(cortes['10'].map(p => p.id), ['atitlan_recicla', 'conservando_atitlan']);
});

test('54 tarjetas mantienen íntegros los textos y resultados aprobados', () => {
  for (let mes = 1; mes <= 9; mes++) {
    const actual = construirTarjetasInstitucionales(oficial, cortes, mes, d => `public/${d.dashboard}`);
    const referencia = original[String(mes)];
    assert.equal(actual.length, referencia.length);
    for (let i = 0; i < actual.length; i++) {
      assert.deepEqual(withoutDashboard(actual[i]), withoutDashboard(referencia[i]), `${mes}, ${referencia[i].id}`);
      assert.ok(fs.existsSync(`public/${oficial[i].dashboard}`));
    }
  }
});

test('indicadores prioritarios de septiembre no se sustituyen ni se resumen', () => {
  const sept = construirTarjetasInstitucionales(oficial, cortes, 9, d => d.dashboard);
  const ar = sept.find(p => p.id === 'atitlan_recicla');
  assert.equal(ar.metrics.length, 3);
  assert.equal(ar.metrics[2].label, 'Ingreso medio diario de Q135 por lideresa activa en comercialización.');
  assert.match(ar.metrics[2].acumDisplay, /Q257\.8/);
  const epc = sept.find(p => p.id === 'educando_para_conservar');
  assert.equal(epc.score.toFixed(1), '108.6');
  assert.equal(epc.metrics[0].acumDisplay, '7/7 módulos desarrollados');
  assert.equal(epc.metrics[2].acumDisplay, '12/12 momentos formativos desarrollados');
  assert.match(epc.metrics[2].monthlyDisplay, /68 \/ 60/);
  const tul = sept.find(p => p.id === 'manejo_tul');
  assert.match(tul.metrics[0].pctDisplay, /^76\.2%/);
  const reforestacion = sept.find(p => p.id === 'reforestacion');
  assert.match(reforestacion.metrics[1].acumDisplay, /35,000 \/ 90,000/);
});

test('octubre mantiene el tercer indicador de ingreso diario y los porcentajes oficiales', () => {
  const corte = construirTarjetasInstitucionales(oficial.filter(p => p.id === 'atitlan_recicla'), cortes, 10, d => d.dashboard)[0];
  assert.equal(corte.periodKey, '2026-10');
  assert.equal(corte.metrics[2].label, 'Ingreso medio diario de Q135 por lideresa activa en comercialización.');
  assert.equal(corte.metrics[0].acumDisplay, '17,621.53 / 17,920 qq');
  assert.equal(corte.metrics[1].acumDisplay, 'Q375,474.91 / Q448,000 GTQ');
  assert.equal(corte.metrics[2].acumDisplay, 'Q253.7 diarios por lideresa en octubre');
  assert.match(corte.metrics[0].monthlyDisplay, /110\.9%/);
  assert.match(corte.metrics[1].monthlyDisplay, /98\.4%/);
  assert.match(corte.metrics[2].monthlyDisplay, /187\.9%/);
  assert.equal(cortes['10'].length, 2);
});

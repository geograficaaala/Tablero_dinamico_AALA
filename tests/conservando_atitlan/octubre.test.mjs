import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseCSV,crearControladorConservando} from '../../src/programs/conservando_atitlan/data-controller.mjs';
import {construirTarjetasInstitucionales} from '../../src/index/indicadores-institucionales.mjs';

const base='data/conservando_atitlan/2026/';
const datos=parseCSV(fs.readFileSync(base+'datos_mensuales.csv','utf8'));
const metas=parseCSV(fs.readFileSync(base+'metas_2026.csv','utf8'));
const fuentes=parseCSV(fs.readFileSync(base+'fuentes_mensuales.csv','utf8'));
const referencia=JSON.parse(fs.readFileSync('references/conservando_atitlan/octubre_2026_fuentes.json','utf8'));
const cortes=JSON.parse(fs.readFileSync('data/index/2026/cortes_publicados.json','utf8'));
const oficial=JSON.parse(fs.readFileSync('config/index/indicadores_institucionales_2026.json','utf8'));
const municipios=parseCSV(fs.readFileSync(base+'recoleccion_municipios_2026.csv','utf8'));
const establecimientos=parseCSV(fs.readFileSync(base+'recoleccion_inmuebles_octubre_2026.csv','utf8'));

test('octubre incorpora el informe sin reescribir meses anteriores',()=>{
  assert.deepEqual(datos.map(r=>r.mes_clave),Array.from({length:10},(_,i)=>`2026-${String(i+1).padStart(2,'0')}`));
  assert.equal(datos[8].litros_aceite_recolectados_mes,'7041');
  assert.equal(datos[8].jabones_producidos_mes,'3750');
  assert.equal(datos[9].is_latest_data_month,'true');
  assert.equal(datos[8].is_latest_data_month,'false');
});

test('octubre coincide con los resultados documentados',()=>{
  const octubre=datos[9];
  // La referencia documental conserva 450; el valor vigente de octubre
  // fue actualizado explícitamente a 730, sin reescribir la fuente histórica.
  for(const [campo,valor] of Object.entries(referencia.resultados)) {
    if(campo==='velas_vendidas_mes') continue;
    assert.equal(Number(octubre[campo]),valor,campo);
  }
  assert.equal(Number(octubre.velas_vendidas_mes),730);
  assert.equal(Number(octubre.jabones_producidos_mes),5500);
  assert.equal(Number(octubre.jabones_vendidos_mes),2000);
});

test('10 municipios y 148 establecimientos conservan el reporte de recolección',()=>{
  assert.equal(municipios.length,10);
  assert.equal(establecimientos.length,148);
  assert.equal(municipios.reduce((t,r)=>t+Number(r.litros_reportados),0),7072);
  assert.equal(establecimientos.filter(r=>Number(r.litros_reportados)>0).length,93);
});

test('controlador aplica las metas mensuales específicas de octubre',()=>{
  const c=crearControladorConservando(datos,metas,fuentes);
  assert.equal(c.mesesDisponibles().length,10);
  const oct=c.seleccionarMes('2026-10');
  assert.equal(oct.metasMensuales.find(m=>m.id==='aceite-mes').value,'7,072.00');
  assert.equal(oct.metasMensuales.find(m=>m.id==='aceite-mes').expectedText,'Meta mensual: 6,670.00 litros');
  assert.ok(Math.abs(oct.metasMensuales.find(m=>m.id==='aceite-mes').periodRatio-7072/6670)<1e-8);
  assert.equal(oct.metasMensuales.find(m=>m.id==='agua-mes').expectedText,'Meta mensual: 6,670,000 litros');
  const sep=c.seleccionarMes('2026-09');
  assert.equal(sep.metasMensuales.find(m=>m.id==='aceite-mes').expectedText,'Meta mensual: 6,666.67 litros');
});

test('índice conserva las cuatro descripciones de la Junta Directiva y cifras de octubre',()=>{
  const row=construirTarjetasInstitucionales(oficial.filter(p=>p.id==='conservando_atitlan'),cortes,10,d=>d.dashboard)[0];
  assert.equal(row.periodKey,'2026-10');
  assert.equal(row.metrics.length,4);
  assert.equal(row.metrics[0].label,'Recolección de 80,000 litros de aceite usado de cocina.');
  assert.equal(row.metrics[0].acumDisplay,'70,721 / 80,000 litros recolectados');
  assert.equal(row.metrics[1].acumDisplay,'70,720,828 / 80,000,000 litros de agua protegidos');
  assert.equal(row.metrics[2].acumDisplay,'52,380 / 65,040 jabones producidos');
  assert.equal(row.metrics[3].acumDisplay,'17,750 / 51,600 jabones vendidos');
  assert.equal(row.metrics[0].monthlyPct.toFixed(1),'106.0');
  assert.equal(row.metrics[2].monthlyPct.toFixed(1),'101.5');
  assert.equal(row.metrics[3].monthlyPct.toFixed(1),'46.5');
  assert.equal(row.score.toFixed(1),'90.0');
});

test('la actualización de octubre no mezcla ingresos de velas con jabones',()=>{
 const r=datos[9];
 assert.equal(r.ingresos_ventas_q_mes,'2200');
 assert.equal(r.ingresos_ventas_velas_q_mes,'7452');
});

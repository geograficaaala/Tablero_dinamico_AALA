import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCSV } from '../../src/core/csv.mjs';
import { REPORT_PROFILES, PROGRAM_IDS } from '../../src/reports/report-profiles.mjs';
import { buildReport, assertPeriod, periodName } from '../../src/reports/report-core.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const readJSON=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const definitions=readJSON('config/index/indicadores_institucionales_2026.json');
const cuts=readJSON('data/index/2026/cortes_publicados.json');
function sourcesFor(program){
  const p=REPORT_PROFILES[program];
  const files=[p.file,...(p.details||[]).map(x=>x.file),...(p.monthlyActivitySummary?['data/fortalecimiento_municipal/2026/actividades_2026.csv']:[])];
  return Object.fromEntries(files.map(file=>[file,parseCSV(fs.readFileSync(path.join(root,file),'utf8'))]));
}
function build(program,period){return buildReport({definitions,cuts,program,period,sources:sourcesFor(program)});}

test('los seis programas generan informes de octubre con indicadores literales',()=>{
  let total=0;
  for(const program of PROGRAM_IDS){
    const report=build(program,'2026-10');
    const config=definitions.find(x=>x.id===program);
    assert.equal(report.name,config.name);
    assert.equal(report.period,'2026-10');
    assert.equal(report.official.length,config.indicators.length);
    for(let i=0;i<report.official.length;i++){
      assert.equal(report.official[i].label,config.indicators[i].label);
      assert.equal(report.official[i].temporality,config.indicators[i].temporality);
    }
    assert.ok(report.extras.length>=8,`${program}: se necesitan 8 seguimientos complementarios, hay ${report.extras.length}`);
    assert.ok(report.details.length>=1,`${program}: falta detalle de campo`);
    assert.equal(report.history.at(-1).month,'Octubre');
    total+=report.official.length;
  }
  assert.equal(total,21);
});

test('el mes seleccionado controla resultados, acumulados y evolución histórica',()=>{
  const sep=build('atitlan_recicla','2026-09');
  const oct=build('atitlan_recicla','2026-10');
  assert.match(sep.official[0].accumulated,/15,814.38/);
  assert.match(oct.official[0].accumulated,/17,621.53/);
  assert.equal(sep.periodName,'Septiembre de 2026');
  assert.equal(oct.periodName,'Octubre de 2026');
  assert.equal(sep.history.length+1,oct.history.length);
});

test('el indicador tres de Atitlán no se convierte en ingreso bruto de mujeres',()=>{
  const report=build('atitlan_recicla','2026-10');
  assert.equal(report.official[2].label,'Ingreso medio diario de Q135 por lideresa activa en comercialización.');
  assert.match(report.official[2].monthly,/Q253.7/);
});

test('Fortalecimiento respeta los acumulados y no convierte actividades en estudios terminados',()=>{
  const report=build('fortalecimiento_municipal','2026-10');
  assert.match(report.official[1].accumulated,/5\/6/);
  assert.match(report.official[2].accumulated,/3\/5/);
  assert.ok(report.extras.find(x=>x.title==='Actividades documentadas durante el mes'));
});

test('Tul conserva la ausencia de metros nuevos y las jornadas documentadas',()=>{
  const report=build('manejo_tul','2026-10');
  assert.match(report.official[0].accumulated,/18 \/ 21/);
  assert.equal(report.extras.find(x=>x.title==='Metros lineales sembrados')?.monthly,null);
  assert.ok(report.details[0].rows.length>=2);
});

test('rechaza meses inválidos o sin corte publicado',()=>{
  assert.throws(()=>assertPeriod('2026-13'),/válido/);
  assert.throws(()=>build('atitlan_recicla','2026-11'),/No hay un corte/);
  assert.equal(periodName('2026-02'),'Febrero de 2026');
});

test('integración disponible en seis páginas mediante el módulo compartido',()=>{
  const universal=fs.readFileSync(path.join(root,'src/components/aala-visual-universal.mjs'),'utf8');
  assert.match(universal,/installReportActions\(\)/);
  const entry=fs.readFileSync(path.join(root,'src/reports/report-ui.mjs'),'utf8');
  assert.match(entry,/btnReport/);
  assert.match(entry,/btnMail/);
  assert.match(entry,/aria-pressed/);
  for(const p of PROGRAM_IDS){
    const html=fs.readFileSync(path.join(root,'public',REPORT_PROFILES[p].slug),'utf8');
    assert.match(html,/aala-visual-universal\.mjs/);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { construirTarjetasInstitucionales } from '../../src/index/indicadores-institucionales.mjs';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const original = read('references/index/indice_original_2026.json');
const official = read('config/index/indicadores_institucionales_2026.json');
const cuts = read('data/index/2026/cortes_publicados.json');
const withoutDashboard = ({dashboard, ...rest}) => rest;

test('nueve meses históricos y cuatro programas actualizados en octubre', () => {
  assert.deepEqual(Object.keys(cuts).sort(), ['1','10','2','3','4','5','6','7','8','9']);
  assert.equal(official.length, 6);
  assert.equal(Array.from({length:9},(_,i)=>cuts[String(i+1)]).reduce((sum, list) => sum+list.reduce((n,p)=>n+p.metrics.length,0),0),189);
  assert.deepEqual(cuts['10'].map(p=>p.id),['atitlan_recicla','conservando_atitlan','educando_para_conservar','fortalecimiento_municipal']);
});

test('los textos institucionales y 54 tarjetas históricas conservan su identidad', () => {
  for(let m=1;m<=9;m++){
    const actual=construirTarjetasInstitucionales(official,cuts,m,d=>`public/${d.dashboard}`);
    const reference=original[String(m)];
    assert.equal(actual.length,reference.length);
    for(let i=0;i<actual.length;i++){
      assert.ok(fs.existsSync(`public/${official[i].dashboard}`));
      const a=structuredClone(withoutDashboard(actual[i]));
      const b=structuredClone(withoutDashboard(reference[i]));
      if(a.id==='educando_para_conservar' && m>=6){
        assert.deepEqual(a.metrics.slice(0,3),b.metrics.slice(0,3));
        const fourth=a.metrics[3]; const previous=b.metrics[3];
        assert.equal(fourth.label,previous.label);
        assert.equal(fourth.temporality,previous.temporality);
        assert.equal(fourth.pct,previous.pct+100/128);
        assert.equal(fourth.barPct,previous.barPct+100/128);
        if(m===6){
          assert.equal(fourth.monthlyPct,previous.monthlyPct+100/16);
          assert.ok(Math.abs(a.score-b.score-(100/16)/4)<1e-10);
        assert.match(fourth.monthlyDisplay,/22 \/ 16 actividades en junio/);
        }else{
          assert.equal(fourth.monthlyPct,previous.monthlyPct);
          assert.equal(a.score,b.score);
          assert.equal(fourth.monthlyDisplay,previous.monthlyDisplay);
        }
        delete a.metrics[3];delete b.metrics[3];
        a.score=b.score;
        assert.deepEqual(a,b,`${m}, Educando para Conservar, salvo feria del 10 de junio`);
      }else{
        assert.deepEqual(a,b,`${m}, ${reference[i].id}`);
      }
    }
  }
});

test('septiembre conserva todos los indicadores de la Junta Directiva',()=>{
  const sept=construirTarjetasInstitucionales(official,cuts,9,d=>d.dashboard);
  const epc=sept.find(p=>p.id==='educando_para_conservar');
  assert.equal(epc.score.toFixed(1),'108.6');
  assert.equal(epc.metrics[0].acumDisplay,'7/7 módulos desarrollados');
  assert.equal(epc.metrics[2].acumDisplay,'12/12 momentos formativos desarrollados');
  assert.match(epc.metrics[2].monthlyDisplay,/68 \/ 60/);
  assert.equal(epc.metrics[3].acumDisplay,'133 / 128 actividades');
  const ar=sept.find(p=>p.id==='atitlan_recicla');
  assert.equal(ar.metrics[2].label,'Ingreso medio diario de Q135 por lideresa activa en comercialización.');
  const tul=sept.find(p=>p.id==='manejo_tul');
  assert.match(tul.metrics[0].pctDisplay,/^76\.2%/);
});

test('octubre mantiene Atitlán Recicla y Conservando Atitlán y añade Educación',()=>{
  const october=construirTarjetasInstitucionales(official,cuts,10,d=>d.dashboard).filter(Boolean);
  const ar=october.find(p=>p.id==='atitlan_recicla');
  const ca=october.find(p=>p.id==='conservando_atitlan');
  const epc=october.find(p=>p.id==='educando_para_conservar');
  assert.equal(ar.metrics[0].acumDisplay,'17,621.53 / 17,920 qq');
  assert.equal(ar.metrics[2].acumDisplay,'Q253.7 diarios por lideresa en octubre');
  assert.equal(ca.metrics[0].acumDisplay,'70,721 / 80,000 litros recolectados');
  assert.equal(epc.metrics.length,4);
  assert.equal(epc.metrics[0].label,official.find(x=>x.id==='educando_para_conservar').indicators[0].label);
  assert.equal(epc.metrics[3].acumDisplay,'148 / 128 actividades');
  assert.match(epc.metrics[2].monthlyDisplay,/4 capitales semilla entregados/);
  assert.match(epc.metrics[3].monthlyDisplay,/15 \/ 16 actividades en octubre · 93\.8%/);
  assert.equal(epc.score,93.75);
});


test('octubre conserva las descripciones oficiales de Fortalecimiento Municipal',()=>{
  const oct=construirTarjetasInstitucionales(official,cuts,10,d=>d.dashboard);
  const fm=oct.find(p=>p.id==='fortalecimiento_municipal');
  assert.ok(fm);
  assert.equal(fm.metrics.length,4);
  assert.equal(fm.metrics[3].acumDisplay,'24/20 asistencias técnicas');
  assert.equal(fm.metrics[3].pctDisplay,'120.0% de avance');
  assert.equal(Number(fm.score.toFixed(1)),95.8);
  const sept=construirTarjetasInstitucionales(official,cuts,9,d=>d.dashboard).find(p=>p.id==='fortalecimiento_municipal');
  for(let i=0;i<4;i++) assert.equal(fm.metrics[i].label,sept.metrics[i].label);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { programs } from '../../src/index/portal.mjs';

globalThis.fetch = async url => {
  try {
    const text=await fs.readFile(new URL(url),'utf8');
    return {ok:true,status:200,text:async()=>text,json:async()=>JSON.parse(text)};
  } catch {
    return {ok:false,status:404,text:async()=>'',json:async()=>({})};
  }
};

test('los seis controladores cargan datos desde los archivos del repositorio',async()=>{
  assert.equal(programs.length,6);
  for(const program of programs){
    const model=await program.loader();
    assert.ok(model.months instanceof Set,program.id);
    assert.ok(model.months.has(9),program.id);
    const results=model.get(9);
    assert.ok(results.length>=4,`${program.id}: sin suficientes indicadores`);
    for(const r of results){
      assert.ok(r.name,`${program.id}: indicador sin nombre`);
      if(r.annualPct!=null)assert.ok(Number.isFinite(r.annualPct),`${program.id}: porcentaje anual inválido`);
      if(r.monthlyPct!=null)assert.ok(Number.isFinite(r.monthlyPct),`${program.id}: porcentaje mensual inválido`);
    }
  }
});

test('enero permanece sin datos para Tul',async()=>{
  const tul=await programs.find(p=>p.id==='tul').loader();
  assert.equal(tul.months.has(1),false);
});

test('Fortalecimiento no inventa cumplimiento mensual',async()=>{
  const fm=await programs.find(p=>p.id==='fortalecimiento_municipal').loader();
  assert.ok(fm.get(9).every(row=>row.monthlyPct===null));
});

test('los porcentajes anuales de Atitlán y Conservando respetan metas del controlador',async()=>{
  const ar=await programs.find(p=>p.id==='atitlan_recicla').loader();
  const ca=await programs.find(p=>p.id==='conservando_atitlan').loader();
  assert.ok(ar.get(9).find(r=>r.name==='Materiales reciclables').annualGoal>0);
  assert.ok(ca.get(9).find(r=>r.name==='Aceite usado recolectado').annualGoal===80000);
});

test('Reforestación usa la meta única de 90,000 y sus acumulados del dashboard',async()=>{
  const model=await programs.find(p=>p.id==='reforestacion').loader();
  const metrics=model.get(9);
  const trees=metrics.find(m=>m.name==='Árboles sembrados');
  assert.equal(trees.annualGoal,90000);
  assert.equal(trees.annual,35000);
  assert.ok(Math.abs(trees.annualPct-35000/90000)<1e-10);
  assert.equal(trees.monthlyPct,null);
  assert.ok(metrics.filter(m=>m.annualPct!==null).length>=4);
});

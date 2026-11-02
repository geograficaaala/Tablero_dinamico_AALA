import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createAtitlanModel, parseCsv } from '../../src/programs/atitlan_recicla/data-controller.mjs';
const root=new URL('../../data/atitlan_recicla/2026/',import.meta.url);
async function csv(name){return parseCsv(await readFile(new URL(name,root),'utf8'));}
async function json(name){return JSON.parse(await readFile(new URL(name,root),'utf8'));}
const m=createAtitlanModel({totalMes:await csv('total_mes.csv'),zonaMes:await csv('zona_mes.csv'),territorioMes:await csv('territorio_mes.csv'),precalculoImpacto:await json('precalculo_impacto_final.json'),metasAnuales:await json('metas_anuales.json'),surusicMensual:await json('surusic_mensual.json')});
test('octubre tiene consolidados y zonas',()=>{
 assert.equal(m.lastPeriod.mes_num,10);
 assert.ok(Math.abs(m.getMetric(2026,10,'__all__','materiales_generales').valor-1807.15)<1e-8);
 assert.ok(Math.abs(m.getMetric(2026,10,'__all__','ingreso_bruto_total').valor-40077.62)<1e-8);
 assert.ok(Math.abs(m.getMetric(2026,10,'__all__','pet').valor-158.58)<1e-8);
 assert.ok(Math.abs(m.getMetric(2026,10,'__all__','vidrio').valor-1043.33)<1e-8);
 for(const zona of ['Kaqchikel','Las Lagunas','Tzolojya','Zona Sur'])assert.ok(m.getMetric(2026,10,zona,'materiales_generales'));
});
test('octubre conserva municipios, metas y SURUSIC',()=>{
 assert.equal(m.syncedTerritoryRows.filter(x=>x.mes_num===10).length,15);
 assert.equal(m.getSurusic(2026,10).mensual.ventas,9140);
 assert.equal(m.getSurusic(2026,10).mensual.unidades,126);
 assert.equal(m.getAnnualGoals(2026,10).materiales_generales.meta,17920);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {parseCSV,composeTulData,getTulMonth,percent} from '../../src/programs/tul/data-controller.mjs';
const source=name=>readFileSync(fileURLToPath(new URL(`../../data/tul/2026/${name}`,import.meta.url)),'utf8');
const reference=JSON.parse(readFileSync(fileURLToPath(new URL('../../references/tul/referencia_html_2026.json',import.meta.url)),'utf8'));
const t=composeTulData({periodos:parseCSV(source('periodos_2026.csv')),metas:parseCSV(source('metas_anuales_2026.csv')),resultados:parseCSV(source('resultados_mensuales_2026.csv')),jornadas:parseCSV(source('jornadas_2026.csv')),analisis:parseCSV(source('analisis_mensual_2026.csv')),detalles:parseCSV(source('analisis_detalles_2026.csv'))});
test('doce meses, febrero a septiembre publicados, enero sin inventar',()=>{assert.deepEqual(t.available,[2,3,4,5,6,7,8,9]);assert.equal(t.latest,9);assert.equal(getTulMonth(t,1),null);assert.equal(getTulMonth(t,10),null);});
test('ocho metas oficiales intactas',()=>assert.deepEqual(t.goals,reference.ANNUAL_GOALS));
test('64 resultados, metas mensuales y acumulados idénticos',()=>{
  for(const [m,d] of Object.entries(reference.MONTHLY_DATA))for(const [indicator,value] of Object.entries(d.annual)){
    assert.equal(t.monthly[m][indicator].annual,value);
    if(indicator!=='municipios'){
      assert.equal(t.monthly[m][indicator].value,d.monthly[indicator]);
      assert.equal(t.monthly[m][indicator].goal,d.monthly[`${indicator}Goal`]);
    }
  }
});
test('porcentaje acotado y meta mensual cero igual al original',()=>{assert.equal(percent(1790,1300),100);assert.equal(percent(171,225,true),76);assert.equal(percent(0,0,true),0);assert.equal(percent(2,0,true),100);assert.equal(percent(234,132,true),100);});
test('seis KPI anuales y cinco mensuales',()=>{for(const m of t.available){const d=getTulMonth(t,m);assert.equal(d.annual.length,6);assert.equal(d.monthly.length,5);}});
test('21 jornadas con fechas y coordenadas fieles',()=>{assert.equal(t.events.length,21);for(let i=0;i<t.events.length;i++){const got=t.events[i],ref=reference.EVENTS[i];assert.equal(got.date,ref.date);assert.equal(got.coords,ref.coords);assert.equal(got.sitio,ref.sitio);}});
test('ocho análisis literales, incluidos saltos de texto CSV',()=>{for(const [m,a] of Object.entries(reference.MONTHLY_ANALYSIS)){assert.equal(t.analysis[m].headline,a.headline);assert.equal(t.analysis[m].body,a.body);assert.deepEqual(t.analysis[m].items.map(x=>[x.name,x.text]),a.items);}});
test('cobertura calculada por filtro mensual',()=>{assert.equal(getTulMonth(t,2).territory.reduce((v,[,n])=>v+n,0),2);assert.equal(getTulMonth(t,9).territory.reduce((v,[,n])=>v+n,0),16);});
test('lector CSV respeta comillas, comas y texto multilínea',()=>assert.deepEqual(parseCSV('a,b\n"uno,dos","línea\notra"\n'),[{a:'uno,dos',b:'línea\notra'}]));

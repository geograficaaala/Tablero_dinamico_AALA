import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {parseCSV,crearControladorConservando,cargarDatosConservando} from '../../src/programs/conservando_atitlan/data-controller.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const archivo=(name)=>readFileSync(resolve(root,'data/conservando_atitlan/2026',name),'utf8');
const datos=parseCSV(archivo('datos_mensuales.csv'));
const metas=parseCSV(archivo('metas_2026.csv'));
const fuentes=parseCSV(archivo('fuentes_mensuales.csv'));
const referencia=parseCSV(readFileSync(resolve(root,'references/conservando_atitlan/referencia_kpis_2026.csv'),'utf8'));

function compararNumero(actual,texto,periodo,indicador,campo){
  if(texto===''){
    assert.ok(actual===null||Number.isNaN(actual)||actual===undefined, `${periodo} ${indicador}: ${campo}`);
  }else{
    const esperado=Number(texto);
    assert.ok(Math.abs(actual-esperado)<1e-8*Math.max(1,Math.abs(esperado)), `${periodo} ${indicador}: ${campo} ${actual} != ${esperado}`);
  }
}

test('el histórico enero-septiembre se conserva y los meses nuevos se habilitan solo con datos',()=>{
  const c=crearControladorConservando(datos,metas,fuentes);
  const periodos=c.mesesDisponibles();
  assert.deepEqual(periodos.slice(0,9),Array.from({length:9},(_,i)=>`2026-${String(i+1).padStart(2,'0')}`));
  assert.ok(periodos.length>=9&&periodos.length<=12);
  assert.equal(c.resumen().mes,periodos.at(-1));
  if(!periodos.includes('2026-10'))assert.throws(()=>c.seleccionarMes('2026-10'));
});

test('las 18 metas oficiales conservan los valores del HTML',()=>{
  const m=crearControladorConservando(datos,metas).metasOficiales();
  assert.equal(m.aceiteAnual,80000);
  assert.equal(m.aguaAnual,80000000);
  assert.equal(m.jabonesProducidosAnual,65040);
  assert.equal(m.jabonesProducidosMensual,5420);
  assert.equal(m.jabonesVendidosAnual,51600);
  assert.equal(m.jabonesVendidosMensual,4300);
  assert.equal(m.ventasJabonesAnual,106800);
  assert.deepEqual(m.pruebasMeses,[3,4,5]);
  assert.equal(Object.keys(m).length,18);
});

test('paridad de 153 indicadores (valor, estado, meta, avance y proporción) contra el HTML',()=>{
  const c=crearControladorConservando(datos,metas,fuentes);
  assert.equal(referencia.length,153);
  for(const r of referencia){
    const resumen=c.seleccionarMes(r.mes_clave);
    const grupo=r.grupo==='annual'?resumen.metasAnuales:resumen.metasMensuales;
    const indicador=grupo.find(x=>x.id===r.id);
    assert.ok(indicador,`Falta ${r.mes_clave}: ${r.id}`);
    assert.equal(indicador.value,r.valor_original,`${r.mes_clave} ${r.id}: valor`);
    assert.equal(indicador.status,r.estado_original,`${r.mes_clave} ${r.id}: estado`);
    assert.equal(indicador.expectedText,r.texto_meta_original,`${r.mes_clave} ${r.id}: meta`);
    compararNumero(indicador.progress,r.avance_original,r.mes_clave,r.id,'avance');
    compararNumero(r.grupo==='annual'?indicador.ratioVsExpected:indicador.periodRatio,r.ratio_vs_esperado_original,r.mes_clave,r.id,'proporción');
  }
});

test('el estado interno y el estilo azul permanecen separados',()=>{
  const c=crearControladorConservando(datos,metas,fuentes);
  assert.equal(c.semaforoInterno(.79),'red');
  assert.equal(c.semaforoInterno(.80),'yellow');
  assert.equal(c.semaforoInterno(1),'green');
  assert.equal(c.colorInstitucional(),'blue');
});

test('al actualizar un valor mensual se actualiza el indicador sin modificar código',()=>{
  const mod=datos.map(r=>({...r}));
  const sep=mod.find(r=>r.mes_clave==='2026-09');
  sep.litros_aceite_recolectados_mes='8050';
  sep.litros_agua_protegidos_mes='8050000';
  const c=crearControladorConservando(mod,metas,fuentes);
  const sepInd=c.seleccionarMes('2026-09').metasMensuales.find(x=>x.id==='aceite-mes');
  assert.equal(sepInd.value,'8,050.00');
  assert.equal(sepInd.status,'green');
});

test('el lector CSV respeta columnas, comillas, saltos de línea y campos vacíos',()=>{
  const filas=parseCSV('a,b,c\n"texto, con coma","texto\nen dos líneas",\n');
  assert.deepEqual(filas,[{a:'texto, con coma',b:'texto\nen dos líneas',c:''}]);
});

test('la carga por red funciona sin duplicar los CSV en public',async()=>{
  const archivos={
    'datos_mensuales.csv':archivo('datos_mensuales.csv'),
    'metas_2026.csv':archivo('metas_2026.csv'),
    'fuentes_mensuales.csv':archivo('fuentes_mensuales.csv')
  };
  const fakeFetch=async url=>({ok:true,text:async()=>archivos[url.split('/').at(-1)]});
  const recibido=await cargarDatosConservando('../data/conservando_atitlan/2026',fakeFetch);
  assert.equal(recibido.datos.length,9);
  assert.equal(recibido.metas.length,18);
  assert.equal(recibido.fuentes.length,9);
});

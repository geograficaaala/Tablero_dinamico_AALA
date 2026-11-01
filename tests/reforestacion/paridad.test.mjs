import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const load = file => fs.readFileSync(path.join(root, file), 'utf8');
const csv = text => {
  const matrix = [], row = []; let val = '', quote = false;
  for (let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"') { if(quote && text[i+1]==='"'){val+='"';i++;} else quote=!quote; }
    else if(c===',' && !quote){row.push(val);val='';}
    else if((c==='\n'||c==='\r')&&!quote){if(c==='\r'&&text[i+1]==='\n')i++;row.push(val);val='';if(row.some(x=>x!==''))matrix.push([...row]);row.length=0;}
    else val+=c;
  }
  if(row.length||val)matrix.push([...row,val]);
  const [heads,...rows]=matrix;
  return rows.map(r=>Object.fromEntries(heads.map((h,i)=>[h,r[i]||''])));
};
const months=csv(load('data/reforestacion/2026/total_mes_2026.csv'));
const complementary=csv(load('data/reforestacion/2026/actividades_complementarias_2026.csv'));

 test('series originales y cortes enero-septiembre',()=>{
  assert.deepEqual(months.slice(0,9).map(r=>r.periodo_clave),Array.from({length:9},(_,i)=>`2026-${String(i+1).padStart(2,'0')}`));
  assert.equal(months.find(r=>r.periodo_clave==='2026-09').arboles_sembrados_acum,'35000');
  assert.equal(Number(months.find(r=>r.periodo_clave==='2026-09').ha_monitoreadas_kpi_acum),17.97);
 });
 test('nueve indicadores complementarios por mes original',()=>{
  for(let m=1;m<=9;m++)assert.equal(complementary.filter(r=>r.periodo_clave===`2026-${String(m).padStart(2,'0')}`).length,9);
 });
 test('metas anuales y mensuales separadas',()=>{
  const metas=csv(load('data/reforestacion/2026/metas_referencia_2026.csv'));
  assert.equal(metas[8].arboles_meta_anual,'90000');
  assert.equal(Number(metas[8].ha_meta_anual),35);
  assert.equal(Number(metas[8].plantas_meta_anual),10000);
  assert.ok(complementary.every(r=>r.meta_mensual!==undefined));
 });
 test('descripciones y detalles mensuales desde CSV',()=>{
  assert.ok(complementary.every(r=>Array.isArray(JSON.parse(r.detalle_render))));
 });
 test('todos los meses publicados están aprobados y sin alertas de estimación',()=>{
  const origin=csv(load('data/reforestacion/2026/procedencia_2026.csv'));
  assert.equal(origin.length,9);
  assert.ok(origin.every(r=>r.aprobado_para_publicacion==='true'));
  assert.ok(origin.every(r=>!/estimaci|provisional|sin respaldo|sin informe/i.test(r.tipo_fuente+' '+r.detalle_fuente+' '+r.alerta_original)));
  const approved=months.filter(r=>Number(r.mes_num)>=7);
  assert.ok(approved.every(r=>r.estatus_reporte==='Datos aprobados para publicación'));
  assert.equal(approved.find(r=>r.periodo_clave==='2026-09').arboles_sembrados_acum,'35000');
 });
 test('catálogo y calendario aptos para actualización externa',()=>{
  const catalog=csv(load('data/reforestacion/2026/catalogo_indicadores_2026.csv'));
  const periods=csv(load('data/reforestacion/2026/periodos_2026.csv'));
  const contract=JSON.parse(load('config/reforestacion/contrato_datos_2026.json'));
  assert.equal(catalog.length,13);
  assert.equal(new Set(catalog.map(r=>r.indicador_id)).size,13);
  assert.equal(periods.length,12);
  assert.equal(periods.filter(r=>r.publicado==='true').length,9);
  assert.equal(contract.estado_datos,'aprobados_para_publicacion');
 });
 test('estructura y rutas de módulos contra repo real',()=>{
  const html=load('public/reforestando-atitlan.html');
  const bootstrap=load('src/programs/reforestacion/bootstrap.mjs');
  const header=load('src/components/header.js');
  const footer=load('src/components/footer/footer.js');
  assert.match(html,/src\/programs\/reforestacion\/bootstrap\.mjs/);
  assert.match(html,/id="reforestacionHeaderMount"/);
  assert.match(html,/id="reforestacionFooterMount"/);
  assert.match(bootstrap,/from '\.\.\/\.\.\/components\/header\.js'/);
  assert.match(bootstrap,/from '\.\.\/\.\.\/components\/footer\/footer\.js'/);
  assert.match(header,/export function mountProgramHeader/);
  assert.match(footer,/export function mountFooter/);
  for(const name of ['public/assets/logos/reforestando-atitlan.png','src/styles/programs/reforestacion.css'])assert.ok(fs.existsSync(path.join(root,name)),name);
 });
 test('sin datos mensuales ni CSS incrustados en HTML',()=>{
  const html=load('public/reforestando-atitlan.html');
  assert.doesNotMatch(html,/<script(?![^>]*src=)[^>]*>[\s\S]+?<\/script>/i);
  assert.doesNotMatch(html,/<style\b/i);
  assert.doesNotMatch(html,/COMPLEMENTARY_KPI_SEED/);
 });

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const html = fs.readFileSync(path.join(root,'public/index.html'),'utf8');
const source = fs.readFileSync(path.join(root,'src/index/portal.mjs'),'utf8');
const paths = ['atitlan-recicla.html','conservando-atitlan.html','fortalecimiento-municipal.html','educando-para-conservar.html','reforestando-atitlan.html','tul.html'];

test('los seis programas tienen página real y tarjeta en el índice',()=>{
  for(const file of paths){
    assert.ok(fs.existsSync(path.join(root,'public',file)),file);
    assert.ok(source.includes(`file:'${file}'`),file);
  }
});

test('el índice conserva las dos secciones y el control mensual',()=>{
  for(const fragment of ['data-panel="resumen"','data-panel="programas"','id="programMonthButtons"','id="programGrid"','id="programCarouselPrev"','id="programCarouselNext"']){
    assert.ok(html.includes(fragment),fragment);
  }
});

test('los modelos leen las fuentes originales y no contienen cifras de indicadores incrustadas',()=>{
  for(const fragment of ['loadAtitlanModel','crearControladorConservando','indicadores_publicados_2026.csv','institucional_indicadores.csv','indicadores_institucionales_2026.csv','loadTulData']){
    assert.ok(source.includes(fragment),fragment);
  }
});

test('rutas de importación existentes',()=>{
  for(const mod of ['src/programs/atitlan_recicla/data-controller.mjs','src/programs/conservando_atitlan/data-controller.mjs','src/programs/tul/data-controller.mjs','src/styles/index.css','public/assets/logos/aala_logo.png']){
    assert.ok(fs.existsSync(path.join(root,mod)),mod);
  }
});

test('los estados sin meta no se presentan como cumplimientos',()=>{
  assert.ok(source.includes('monthNote'));
  assert.ok(source.includes('Sin meta mensual'));
  assert.ok(source.includes('pendiente de ratificación'));
});

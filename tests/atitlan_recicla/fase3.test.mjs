import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadAtitlanModel } from '../../src/programs/atitlan_recicla/data-controller.mjs';

const root = new URL('../../',import.meta.url);
const data = new URL('data/atitlan_recicla/2026/',root);
const goals = new URL('config/atitlan_recicla/metas_2026.json',root);
const localFetch = async url => {
  try {
    const buffer = await readFile(fileURLToPath(url));
    return {ok:true,text:async()=>buffer.toString('utf8'),json:async()=>JSON.parse(buffer.toString('utf8'))};
  } catch {return {ok:false,status:404};}
};

test('carga de datos externos y metas mensuales oficiales',async()=>{
  const model = await loadAtitlanModel(data.href,localFetch,goals.href);
  const monthly = JSON.parse(await readFile(goals,'utf8'));
  assert.equal(model.periods.length,9);
  assert.equal(model.zones.length,5);
  for (const [id,meta] of Object.entries(monthly))assert.equal(model.metrics[id].meta,meta);
  assert.equal(model.getAnnualGoals(2026,9).materiales_generales.meta,17920);
  assert.equal(model.getAnnualGoals(2026,9).surusic_ventas.meta,67200);
  assert.equal(model.getProgramStatus(2026,9).className.startsWith('status-'),true);
});

test('HTML sin estilos, scripts o datos incrustados',async()=>{
  const html=await readFile(new URL('public/atitlan-recicla.html',root),'utf8');
  assert.equal(/<style\b/i.test(html),false);
  assert.equal(/<script(?![^>]*\bsrc=)/i.test(html),false);
  assert.equal(/data:image\//i.test(html),false);
  assert.match(html,/src="\.\.\/src\/programs\/atitlan_recicla\/dashboard\.mjs"/);
  assert.match(html,/id="site-header"/);
  assert.match(html,/id="site-footer"/);
});

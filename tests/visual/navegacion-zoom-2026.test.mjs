import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import {
  PROGRAM_BY_FILE, programIdFromPath, returnToProgramsHref,
  programIdFromSearch, validProgramId
} from '../../src/components/aala-program-return.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const read = path => readFileSync(resolve(root, path), 'utf8');

test('los seis HTML vuelven a su tarjeta correcta, sin confundir IDs ni filenames', () => {
  const expected = [
    ['atitlan-recicla.html','atitlan_recicla'],
    ['conservando-atitlan.html','conservando_atitlan'],
    ['educando-para-conservar.html','educando_para_conservar'],
    ['fortalecimiento-municipal.html','fortalecimiento_municipal'],
    ['reforestando-atitlan.html','reforestacion'],
    ['tul.html','manejo_tul']
  ];
  assert.equal(Object.keys(PROGRAM_BY_FILE).length, 6);
  for (const [file,id] of expected) {
    assert.equal(programIdFromPath(`/public/${file}`), id);
    assert.equal(returnToProgramsHref(`/public/${file}`), `./index.html?program=${id}#programas`);
    assert.equal(programIdFromSearch(`?program=${id}`), id);
    assert.ok(read(`public/${file}`).includes('aala-visual-universal.mjs'));
  }
});

test('el regreso invalida IDs desconocidos y nunca incluye URLs externas', () => {
  assert.equal(validProgramId('otro_programa'), null);
  assert.equal(programIdFromSearch('?program=https://ejemplo.com'), null);
  assert.equal(programIdFromPath('/public/no-existe.html'), null);
  assert.equal(returnToProgramsHref('/public/no-existe.html'), './index.html#programas');
});

test('el índice vuelve arriba, recuerda tarjeta y reposiciona al regresar del navegador', () => {
  const code = read('src/index/index-original.mjs');
  assert.match(code, /function showIndexPage\(/);
  assert.match(code, /window\.scrollTo\(\{ top: 0, left: 0/);
  assert.match(code, /history\.replaceState/);
  assert.match(code, /addEventListener\('pageshow'/);
  assert.match(code, /rememberProgramId\(items\[programCarouselIndex\]\.dataset\.programId\)/);
  assert.match(code, /initProgramCarousel\(activeProgramId\)/);
});

test('botón volver se comparte en los seis headers, sin tocar sus dashboards', () => {
  const code = read('src/components/aala-visual-universal.mjs');
  assert.match(code, /returnToProgramsHref\(window\.location\.pathname\)/);
  assert.match(code, /aala-v2-return-to-programs/);
  assert.match(code, /actions\.prepend\(back\)/);
  assert.match(code, /Volver a programas/);
});

test('selector de meses es sticky con altura de header real y zoom reorganiza indicadores', () => {
  const css = read('src/styles/aala-refinamientos-2026.css');
  assert.match(css, /#page-programas \.program-month-toolbar\.program-month-toolbar \{\s*position: sticky !important/);
  assert.match(css, /var\(--aala-index-header-height, 76px\)/);
  assert.match(css, /@media \(max-width: 1100px\)/);
  assert.match(css, /display: grid !important/);
  assert.match(css, /\.mcol-monthly\)/);
  const js = read('src/index/index-original.mjs');
  assert.match(js, /new ResizeObserver\(measureHeader\)/);
});

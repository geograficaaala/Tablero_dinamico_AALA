import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { AALA_PHOTO_SETS, photoURL } from '../../src/components/aala-photo-strips.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const pageFiles = [
  'index.html', 'atitlan-recicla.html', 'conservando-atitlan.html',
  'educando-para-conservar.html', 'fortalecimiento-municipal.html',
  'reforestando-atitlan.html', 'tul.html'
];

test('el índice y los seis programas incorporan solo los recursos compartidos', () => {
  assert.equal(existsSync(resolve(root, 'src/components/aala-photo-strips.mjs')), true);
  assert.equal(existsSync(resolve(root, 'src/styles/aala-fotografias.css')), true);
  for (const page of pageFiles) {
    const html = readFileSync(resolve(root, 'public', page), 'utf8');
    assert.match(html, /href="\.\.\/src\/styles\/aala-fotografias\.css"/);
    assert.match(html, /src="\.\.\/src\/components\/aala-photo-strips\.mjs"/);
  }
});

test('los ocho directorios utilizan prefijos y rutas acordadas', () => {
  const expected = [
    ['index.html', 'index', 'in'],
    ['programas-y-proyectos', 'programas-y-proyectos', 'pp'],
    ['atitlan-recicla.html', 'atitlan-recicla', 'ar'],
    ['conservando-atitlan.html', 'conservando-atitlan', 'ca'],
    ['educando-para-conservar.html', 'educando-para-conservar', 'ec'],
    ['fortalecimiento-municipal.html', 'fortalecimiento-municipal', 'fm'],
    ['reforestando-atitlan.html', 'reforestando-atitlan', 'ra'],
    ['tul.html', 'tul', 'tu']
  ];
  assert.equal(Object.keys(AALA_PHOTO_SETS).length, 8);
  for (const [key, folder, prefix] of expected) {
    assert.equal(AALA_PHOTO_SETS[key].folder, folder);
    assert.equal(AALA_PHOTO_SETS[key].prefix, prefix);
    const url = new URL(photoURL(folder, `${prefix}1.jpg`));
    assert.match(decodeURIComponent(url.pathname), new RegExp(`/public/fotografias/${folder}/${prefix}1\\.jpg$`));
  }
});

test('la portada y la pestaña de programas usan fotografía editorial sin alterar reportes ni datos', () => {
  const source = readFileSync(resolve(root, 'src/components/aala-photo-strips.mjs'), 'utf8');
  assert.match(source, /scenicSection\('#page-resumen \.storyboard', 2/);
  assert.match(source, /scenicSection\('#page-resumen \.panorama-stage', 3/);
  assert.match(source, /scenicSection\('#page-resumen \.coverage-section', 4/);
  assert.match(source, /const PROGRAM_HERO_PHOTO = \{/);
  assert.match(source, /tul: 6/);
  assert.match(source, /ensureProgramHero\(\)/);
  assert.match(source, /window\.addEventListener\('aala:program-card-change'/);
  assert.match(source, /tul \? \[1\] : \[1, 2\]/);
  assert.doesNotMatch(source, /report-config|metas_2026|indicadores_publicados_2026/);
});

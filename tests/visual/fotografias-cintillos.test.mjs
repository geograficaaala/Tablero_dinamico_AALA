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

test('la portada usa los fondos como textura y la pestaña de programas cambia su foto', () => {
  const source = readFileSync(resolve(root, 'src/components/aala-photo-strips.mjs'), 'utf8');
  const css = readFileSync(resolve(root, 'src/styles/aala-fotografias.css'), 'utf8');
  for (const pair of [
    ["#page-resumen .storyboard", 'in2.jpg'],
    ["#page-resumen .panorama-stage", 'in3.jpg'],
    ["#page-resumen .coverage-section", 'in4.jpg']
  ]) {
    assert.ok(source.includes(`addEditorialBackground('${pair[0]}', '${pair[1]}')`));
  }
  for (const [id, file] of [
    ['atitlan_recicla', 'pp1.jpg'],
    ['conservando_atitlan', 'pp2.jpg'],
    ['educando_para_conservar', 'pp3.jpg'],
    ['fortalecimiento_municipal', 'pp4.jpg'],
    ['reforestacion', 'pp5.jpg'],
    ['manejo_tul', 'pp6.jpg']
  ]) assert.ok(source.includes(`${id}: ['${file}'`));
  assert.match(source, /function installIndexPhotos\(\)/);
  assert.match(source, /function syncBannerFromCarousel\(\)/);
  assert.match(source, /const observer = new MutationObserver\(syncBannerFromCarousel\)/);
  assert.match(source, /const image = new Image\(\)/);
  assert.doesNotMatch(source, /image\.loading = 'lazy'/);
  assert.match(css, /\.aala-program-banner/);
  assert.doesNotMatch(css, /\.aala-program-banner\s*\{[^}]*width:\s*100vw/);
  assert.match(source, /tul \? \[1\] : \[1, 2\]/);
  assert.doesNotMatch(source, /report-config|metas_2026|indicadores_publicados_2026/);
});

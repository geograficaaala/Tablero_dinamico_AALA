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

test('el índice y los seis programas incorporan los recursos fotográficos compartidos', () => {
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

test('los fondos fotográficos se limitan a secciones existentes y tarjetas, sin alterar datos ni informes', () => {
  const source = readFileSync(resolve(root, 'src/components/aala-photo-strips.mjs'), 'utf8');
  assert.match(source, /storyboard', 'in2\.jpg/);
  assert.match(source, /panorama-stage', 'in3\.jpg/);
  assert.match(source, /coverage-section', 'in4\.jpg/);
  assert.match(source, /const PROGRAM_CARD_PHOTOS = Object\.freeze/);
  assert.match(source, /fortalecimiento_municipal: 'pp4\.jpg'/);
  assert.match(source, /tul: 'pp6\.jpg'/);
  assert.match(source, /#page-programas #programGrid/);
  assert.doesNotMatch(source, /report-config|monthPills|KpiGrid|metas_2026/);
});

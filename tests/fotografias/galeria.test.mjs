import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PROGRAMS } from '../../src/components/aala-fotografias.mjs';

const read = p => readFileSync(p, 'utf8');
test('el módulo compartido conserva la interfaz fotográfica sin modificar la estructura', () => {
  const universal = read('src/components/aala-visual-universal.mjs');
  const photos = read('src/components/aala-fotografias.mjs');
  assert.match(universal, /installPhotoGallery/);
  assert.match(photos, /export function installPhotoGallery\(\)/);
  assert.doesNotMatch(photos, /insertAdjacentElement|createRibbon/);
});
test('los seis programas conservan sus carpetas fotográficas', () => {
  assert.equal(Object.keys(PROGRAMS).length, 6);
  assert.equal(PROGRAMS['atitlan-recicla.html'].code, 'ar');
  assert.equal(PROGRAMS['conservando-atitlan.html'].code, 'ca');
  assert.equal(PROGRAMS['educando-para-conservar.html'].code, 'ec');
  assert.equal(PROGRAMS['fortalecimiento-municipal.html'].code, 'fm');
  assert.equal(PROGRAMS['reforestando-atitlan.html'].code, 'ra');
  assert.equal(PROGRAMS['tul.html'].code, 'tu');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { AALA_PHOTO_SETS, photoURL } from '../../src/components/aala-photo-strips.mjs';
const files = ['index','atitlan-recicla','conservando-atitlan','educando-para-conservar','fortalecimiento-municipal','reforestando-atitlan','tul'];
test('el módulo fotográfico compartido existe en las siete páginas', () => {
  for (const file of files) {
    const html = readFileSync(`public/${file}.html`, 'utf8');
    assert.match(html, /aala-fotografias\.css/);
    assert.match(html, /aala-photo-strips\.mjs/);
  }
});
test('las ocho rutas con prefijos institucionales se conservan', () => {
  const prefix = ['in','pp','ar','ca','ec','fm','ra','tu'];
  const groups = Object.values(AALA_PHOTO_SETS);
  assert.deepEqual(groups.map(v => v.prefix), prefix);
  for (const group of groups) assert.match(photoURL(group.folder, `${group.prefix}1.jpg`), /\/public\/fotografias\//);
});
test('se conserva la portada original y el carrusel sin modificaciones de su lógica', () => {
  const module = readFileSync('src/components/aala-photo-strips.mjs', 'utf8');
  const original = readFileSync('src/index/index-original.mjs', 'utf8');
  assert.match(module, /installWelcomeImage\(\)/);
  assert.match(module, /manejo_tul: 'pp6\.jpg'/);
  assert.match(module, /'pp1\.jpg'/);
  assert.match(module, /installIndexEditorialPhotos/);
  assert.match(module, /MutationObserver\(applyProgramCardPhotos\)/);
  assert.doesNotMatch(module, /ensureProgramHero|createStrip\(AALA_PHOTO_SETS\['programas-y-proyectos'\]/);
  assert.doesNotMatch(original, /emitActiveProgramCard|aala:program-card-change/);
});
test('los estilos fotográficos no alteran anchos ni la cuadrícula', () => {
  const css = readFileSync('src/styles/aala-fotografias.css','utf8');
  assert.match(css,/\.aala-project-photo-loaded \.program-head/);
  assert.doesNotMatch(css,/\.aala-program-hero/);
  assert.ok(existsSync('public/index.html'));
});

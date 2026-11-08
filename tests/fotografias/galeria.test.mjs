import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { PROGRAMS } from '../../src/components/aala-fotografias.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const load = (f) => readFileSync(resolve(root, f), 'utf8');

test('el módulo y estilos de fotografías existen y se importan desde el módulo común', () => {
  assert.ok(existsSync(resolve(root, 'src/components/aala-fotografias.mjs')));
  assert.ok(existsSync(resolve(root, 'src/styles/aala-fotografias.css')));
  assert.match(load('src/components/aala-visual-universal.mjs'), /import\s*\{\s*installPhotoGallery\s*\}\s*from\s*['"]\.\/aala-fotografias\.mjs['"]/);
  assert.match(load('src/components/aala-visual-universal.mjs'), /installPhotoGallery\(\)/);
});

test('los seis programas usan las carpetas y códigos acordados, sin afectar sus HTML', () => {
  const cases = {
    'atitlan-recicla.html': ['atitlan-recicla', 'ar'],
    'conservando-atitlan.html': ['conservando-atitlan', 'ca'],
    'educando-para-conservar.html': ['educando-para-conservar', 'ec'],
    'fortalecimiento-municipal.html': ['fortalecimiento-municipal', 'fm'],
    'reforestando-atitlan.html': ['reforestando-atitlan', 'ra'],
    'tul.html': ['tul', 'tu']
  };
  assert.equal(Object.keys(PROGRAMS).length, 6);
  for (const [name, [folder, code]] of Object.entries(cases)) {
    assert.equal(PROGRAMS[name].folder, folder);
    assert.equal(PROGRAMS[name].code, code);
    assert.ok(existsSync(resolve(root, `public/${name}`)));
  }
});

test('el índice usa in1 como fondo y cintillos in2-in4 y pp1-pp3', () => {
  const script = load('src/components/aala-fotografias.mjs');
  assert.match(script, /photoUrl\('index', 'in1\.jpg'\)/);
  assert.match(script, /folder:\s*'index', code:\s*'in', indices:\s*\[2, 3, 4\]/);
  assert.match(script, /folder:\s*'programas-y-proyectos', code:\s*'pp', indices:\s*\[1, 2, 3\]/);
});

test('las fotografías faltantes dejan espacio neutro y hay diseño adaptable', () => {
  const script = load('src/components/aala-fotografias.mjs');
  const css = load('src/styles/aala-fotografias.css');
  assert.match(script, /img\.onerror\s*=\s*\(\)\s*=>\s*\{\}/);
  assert.match(css, /aala-photo-placeholder/);
  assert.match(css, /@media \(max-width:520px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

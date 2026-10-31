import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const entrada = resolve(raiz, 'src/programs/conservando_atitlan/dashboard.mjs');
const codigo = readFileSync(entrada, 'utf8');

test('todas las importaciones de Conservando Atitlán existen y exportan sus funciones', async () => {
  const importaciones = [...codigo.matchAll(/^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/gm)];
  assert.ok(importaciones.length >= 3);
  for (const [, nombres, ruta] of importaciones) {
    const archivo = resolve(dirname(entrada), ruta);
    assert.ok(existsSync(archivo), `No existe ${ruta}`);
    const modulo = await import(pathToFileURL(archivo).href);
    for (const item of nombres.split(',')) {
      const nombre = item.trim().split(/\s+as\s+/)[0];
      assert.ok(nombre in modulo, `${ruta} no exporta ${nombre}`);
    }
  }
});

test('las rutas del HTML y los CSV existen en el repositorio', () => {
  const html = readFileSync(resolve(raiz, 'public/conservando-atitlan.html'), 'utf8');
  const rutas = [...html.matchAll(/(?:src|href)="(\.\.?\/[^"?#]+)"/g)].map(m => m[1]);
  for (const ruta of rutas) {
    assert.ok(existsSync(resolve(raiz, 'public', ruta)), `No existe ${ruta}`);
  }
  for (const nombre of ['datos_mensuales.csv', 'metas_2026.csv', 'fuentes_mensuales.csv']) {
    assert.ok(existsSync(resolve(raiz, 'data/conservando_atitlan/2026', nombre)), `Falta ${nombre}`);
  }
});

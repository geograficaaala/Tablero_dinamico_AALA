import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const dashboard = new URL('src/programs/atitlan_recicla/dashboard.mjs', root);
const html = new URL('public/atitlan-recicla.html', root);

async function fileExists(url) {
  try {
    return (await stat(url)).isFile();
  } catch {
    return false;
  }
}

async function checkImports(moduleUrl, visited = new Set()) {
  if (visited.has(moduleUrl.href)) return;
  visited.add(moduleUrl.href);
  const source = await readFile(moduleUrl, 'utf8');
  const imports = [...source.matchAll(/\b(?:import|export)\s+(?:[^;]*?\s+from\s*)?['"]([^'"]+)['"]/g)];
  for (const [, specifier] of imports) {
    if (!specifier.startsWith('.')) continue;
    const target = new URL(specifier, moduleUrl);
    assert.ok(await fileExists(target), `${moduleUrl.pathname} importa un archivo inexistente: ${specifier}`);
    if (/\.(mjs|js)$/i.test(target.pathname)) await checkImports(target, visited);
  }
}

test('todos los imports JavaScript del dashboard existen', async () => {
  await checkImports(dashboard);
});

test('todos los recursos locales HTML existen', async () => {
  const source = await readFile(html, 'utf8');
  const resources = [...source.matchAll(/\b(?:src|href)="([^"]+)"/g)].map(match => match[1]);
  for (const resource of resources) {
    if (resource.startsWith('#') || /^(?:https?:|mailto:|tel:|data:)/i.test(resource)) continue;
    assert.ok(await fileExists(new URL(resource, html)), `Recurso HTML no encontrado: ${resource}`);
  }
});

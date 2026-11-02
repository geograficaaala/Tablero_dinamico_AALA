import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/index/index-original.mjs', 'utf8');

test('el índice inicia con octubre de 2026 y conserva el selector mensual', () => {
  assert.match(source, /let selectedMonth\s*=\s*10;/);
  assert.match(source, /renderProgramMonth\(10\);/);
  assert.match(source, /button\.dataset\.month/);
  assert.match(source, /Tarjetas institucionales a octubre de 2026/);
  assert.match(source, /initProgramCarousel\(activeProgramId\)/);
  assert.doesNotMatch(source, /renderProgramMonth\(9\);/);
});

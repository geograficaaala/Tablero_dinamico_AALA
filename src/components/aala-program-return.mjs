/** Navegación AALA: regreso desde los seis programas al carrusel institucional. */
export const PROGRAM_BY_FILE = Object.freeze({
  'atitlan-recicla.html': 'atitlan_recicla',
  'conservando-atitlan.html': 'conservando_atitlan',
  'educando-para-conservar.html': 'educando_para_conservar',
  'fortalecimiento-municipal.html': 'fortalecimiento_municipal',
  'reforestando-atitlan.html': 'reforestacion',
  'tul.html': 'manejo_tul'
});
const STORAGE_KEY = 'aala:ultimo-programa-presentacion';
const validIds = new Set(Object.values(PROGRAM_BY_FILE));
export function validProgramId(id) { return validIds.has(id) ? id : null; }
export function programIdFromPath(path) {
  return PROGRAM_BY_FILE[String(path || '').split('/').pop()] || null;
}
export function returnToProgramsHref(path) {
  const id = programIdFromPath(path);
  return `./index.html${id ? `?program=${encodeURIComponent(id)}` : ''}#programas`;
}
export function programIdFromSearch(search) {
  return validProgramId(new URLSearchParams(search || '').get('program'));
}
export function rememberProgramId(id) {
  if (!validProgramId(id)) return;
  try { window.sessionStorage.setItem(STORAGE_KEY, id); } catch { /* Navegación sin almacenamiento. */ }
}
export function rememberedProgramId() {
  try { return validProgramId(window.sessionStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
}

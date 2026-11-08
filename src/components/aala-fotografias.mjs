/**
 * Compatibilidad para el módulo visual institucional.
 * Los fondos del índice están gestionados en aala-photo-strips.mjs.
 * Este módulo NO añade cintillos ni modifica HTML o estilos.
 */
export const PROGRAMS = Object.freeze({
  'atitlan-recicla.html': { folder: 'atitlan-recicla', code: 'ar', name: 'Atitlán Recicla' },
  'conservando-atitlan.html': { folder: 'conservando-atitlan', code: 'ca', name: 'Conservando Atitlán' },
  'educando-para-conservar.html': { folder: 'educando-para-conservar', code: 'ec', name: 'Educando para Conservar' },
  'fortalecimiento-municipal.html': { folder: 'fortalecimiento-municipal', code: 'fm', name: 'Fortalecimiento Municipal' },
  'reforestando-atitlan.html': { folder: 'reforestando-atitlan', code: 'ra', name: 'Reforestando Atitlán' },
  'tul.html': { folder: 'tul', code: 'tu', name: 'Siembra de Tul' }
});
export function installPhotoGallery() {
  // Deliberadamente vacío: evita el segundo generador de cintillos.
}

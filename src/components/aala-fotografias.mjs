/**
 * Entrada fotográfica compartida. Reutiliza el índice existente sin cambiar HTML.
 * El segundo módulo nunca añade cintillos ni duplica secciones.
 */
import { installAalaPhotos } from './aala-photo-strips.mjs';

export const PROGRAMS = Object.freeze({
  'atitlan-recicla.html': { folder: 'atitlan-recicla', code: 'ar', name: 'Atitlán Recicla' },
  'conservando-atitlan.html': { folder: 'conservando-atitlan', code: 'ca', name: 'Conservando Atitlán' },
  'educando-para-conservar.html': { folder: 'educando-para-conservar', code: 'ec', name: 'Educando para Conservar' },
  'fortalecimiento-municipal.html': { folder: 'fortalecimiento-municipal', code: 'fm', name: 'Fortalecimiento Municipal' },
  'reforestando-atitlan.html': { folder: 'reforestando-atitlan', code: 'ra', name: 'Reforestando Atitlán' },
  'tul.html': { folder: 'tul', code: 'tu', name: 'Siembra de Tul' }
});

export function installPhotoGallery() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (document.body?.classList.contains('aala-index') &&
      !document.querySelector('link[data-aala-photo-css]') &&
      !document.querySelector('link[href*="aala-fotografias.css"]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.dataset.aalaPhotoCss = 'true';
    stylesheet.href = new URL('../styles/aala-fotografias.css', import.meta.url).href;
    document.head.append(stylesheet);
  }
  installAalaPhotos();
}

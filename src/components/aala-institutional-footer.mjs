import { aalaIcon } from './aala-icons.mjs';

const description = 'El objetivo de la Asociación Amigos del Lago de Atitlán es proteger y conservar la cuenca del Lago de Atitlán, propiciando la mejora de la calidad de vida de sus pobladores y la protección de los recursos naturales, promoviendo e implementando proyectos de saneamiento y educación ambiental, gestión de residuos sólidos y líquidos, reforestación e investigación, a través de alianzas con actores locales, nacionales e internacionales';
const links = [
  ['https://amigosdeatitlan.org/', 'Página web', 'globe'],
  ['https://www.youtube.com/@asociacionamigosdellagodea2358', 'YouTube', 'youtube'],
  ['https://www.facebook.com/AmigoAtitlan/?locale=es_LA', 'Facebook', 'facebook'],
  ['https://www.linkedin.com/in/aala-atitl%C3%A1n-3653a0325/', 'LinkedIn', 'linkedin'],
  ['https://www.instagram.com/amigoslagoatitlan/', 'Instagram', 'instagram']
];

export function mountInstitutionalFooter(mount) {
  mount.innerHTML = `
    <footer class="site-footer aala-v2-footer">
      <div class="aala-footer-name">Asociación Amigos del Lago de Atitlán</div>
      <div class="footer-wrap aala-v2-footer-inner">
        <section class="footer-brand" aria-label="Objetivo institucional">
          <p class="footer-copy">${description}</p>
        </section>
        <section class="footer-col aala-footer-social" aria-label="Redes sociales">
          <h3>Redes y sitio web</h3>
          <div class="footer-links">
            ${links.map(([url,label,icon])=>`<a href="${url}" target="_blank" rel="noopener noreferrer"><span class="social-icon">${aalaIcon(icon)}</span><span>${label}</span></a>`).join('')}
          </div>
        </section>
        <section class="footer-col aala-footer-contact" aria-label="Contacto">
          <h3>Contacto</h3>
          <div class="footer-links">
            <a href="tel:+50223623195"><span class="social-icon">${aalaIcon('phone')}</span><span>+502 2362 3195</span></a>
            <a href="mailto:amigoatitlan@gmail.com"><span class="social-icon">${aalaIcon('mail')}</span><span>amigoatitlan@gmail.com</span></a>
            <span class="aala-footer-address"><span class="social-icon">${aalaIcon('pin')}</span><span>Lago de Atitlán, Sololá, Guatemala</span></span>
          </div>
        </section>
        <section class="footer-mark" aria-label="Sello institucional">
          <img src="./assets/logos/chill_lago.png" alt="Sello de Amigos del Lago de Atitlán" />
        </section>
      </div>
    </footer>`;
}

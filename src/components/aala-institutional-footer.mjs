import { aalaIcon } from './aala-icons.mjs';

const description = 'El objetivo de la Asociación Amigos del Lago de Atitlán es proteger y conservar la cuenca del Lago de Atitlán, propiciando la mejora de la calidad de vida de sus pobladores y la protección de los recursos naturales, promoviendo e implementando proyectos de saneamiento y educación ambiental, gestión de residuos sólidos y líquidos, reforestación e investigación, a través de alianzas con actores locales, nacionales e internacionales';
const links = [
  ['https://amigosdeatitlan.org/', 'Página web','globe'],
  ['https://www.youtube.com/@asociacionamigosdellagodea2358', 'YouTube','youtube'],
  ['https://www.facebook.com/AmigoAtitlan/?locale=es_LA', 'Facebook','facebook'],
  ['https://www.linkedin.com/in/aala-atitl%C3%A1n-3653a0325/', 'LinkedIn','linkedin'],
  ['https://www.instagram.com/amigoslagoatitlan/', 'Instagram','instagram']
];

export function mountInstitutionalFooter(mount) {
  mount.innerHTML = `
    <footer class="aala-v2-footer">
      <div class="aala-v2-footer-inner">
        <h2 class="aala-v2-footer-title">Asociación Amigos del Lago de Atitlán</h2>
        <p class="aala-v2-footer-description">${description}</p>
        <div class="aala-v2-footer-grid">
          <section class="aala-v2-footer-social" aria-label="Redes sociales y sitio institucional">
            <h3>Redes y sitio web</h3>
            <div class="aala-v2-social-links">${links.map(([url,label,icon])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${aalaIcon(icon)}<span>${label}</span></a>`).join('')}</div>
          </section>
          <section class="aala-v2-footer-contact" aria-label="Datos de contacto">
            <h3>Contacto</h3>
            <a href="tel:+50223623195">${aalaIcon('phone')}<span>+502 2362 3195</span></a>
            <a href="mailto:amigoatitlan@gmail.com">${aalaIcon('mail')}<span>amigoatitlan@gmail.com</span></a>
            <div>${aalaIcon('pin')}<span>Lago de Atitlán, Sololá, Guatemala</span></div>
          </section>
        </div>
      </div>
    </footer>`;
}

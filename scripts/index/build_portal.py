from pathlib import Path

root = Path(__file__).resolve().parents[2]
dist = root / 'dist'
source = root / 'public' / 'index.html'
html = source.read_text(encoding='utf-8')
html = html.replace('href="../src/styles/index.css"', 'href="./src/styles/index.css"')
html = html.replace('src="../src/index/portal.mjs"', 'src="./src/index/portal.mjs"')
html = html.replace('src="./assets/logos/', 'src="./public/assets/logos/')
for slug in ('atitlan-recicla','conservando-atitlan','fortalecimiento-municipal','educando-para-conservar','reforestando-atitlan','tul'):
    html = html.replace(f'href="./{slug}.html"', f'href="./public/{slug}.html"')
required = (
    'public/atitlan-recicla.html',
    'public/conservando-atitlan.html',
    'public/fortalecimiento-municipal.html',
    'public/educando-para-conservar.html',
    'public/reforestando-atitlan.html',
    'public/tul.html',
    'src/index/portal.mjs',
    'src/styles/index.css',
    'public/assets/logos/aala_logo.png',
)
for filename in required:
    if not (dist / filename).is_file():
        raise SystemExit(f'Falta archivo requerido para publicar: {filename}')
if 'src="./src/index/portal.mjs"' not in html:
    raise SystemExit('La importación del índice no se transformó correctamente')
if 'href="./src/styles/index.css"' not in html:
    raise SystemExit('Los estilos del índice no se transformaron correctamente')
(dist / 'index.html').write_text(html, encoding='utf-8')
print('OK: índice publicado con los seis HTML, módulo JavaScript, CSS y logo institucional')

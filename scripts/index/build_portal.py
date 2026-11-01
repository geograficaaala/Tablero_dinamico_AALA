from pathlib import Path

root = Path(__file__).resolve().parents[2]
dist = root / 'dist'
html = (root / 'public/index.html').read_text(encoding='utf-8')
html = html.replace('href="../src/styles/index-original.css"', 'href="./src/styles/index-original.css"')
html = html.replace('src="../src/index/index-original.mjs"', 'src="./src/index/index-original.mjs"')
html = html.replace('src="./assets/logos/', 'src="./public/assets/logos/')
for name in ('chatbot-config.js', 'chatbot-data.js', 'chatbot.js'):
    html = html.replace(f'src="./{name}"', f'src="./public/{name}"')
for slug in ('atitlan-recicla', 'conservando-atitlan', 'fortalecimiento-municipal', 'educando-para-conservar', 'reforestando-atitlan', 'tul'):
    html = html.replace(f'href="./{slug}.html"',f'href="./public/{slug}.html"')
required = [
    'public/atitlan-recicla.html',
    'public/conservando-atitlan.html',
    'public/fortalecimiento-municipal.html',
    'public/educando-para-conservar.html',
    'public/reforestando-atitlan.html',
    'public/tul.html',
    'public/assets/logos/aala_logo.png',
    'public/assets/logos/chill_lago.png',
    'public/assets/maps/cobertura.geojson',
    'src/styles/index-original.css',
    'src/index/index-original.mjs',
    'src/index/index-data.mjs',
    'config/index/tarjetas.json',
]
missing = [name for name in required if not (dist / name).is_file()]
if missing:
    raise SystemExit('Archivos faltantes: ' + ', '.join(missing))
if 'PROGRAM_MONTH_SNAPSHOTS' in html or '<style>' in html:
    raise SystemExit('El índice contiene datos o estilos incrustados')
(dist / 'index.html').write_text(html, encoding='utf-8')
print('Índice institucional original preparado para GitHub Pages')

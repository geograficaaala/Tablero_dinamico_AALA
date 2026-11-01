# Índice institucional original — Tablero Dinámico AALA

Este paquete conserva la estructura HTML de la portada proporcionada y su hoja de estilos original. El comportamiento mensual de las tarjetas se alimenta de los controladores y datos existentes de los seis programas.

## Subir archivos

Descomprimir el paquete y colocar los archivos en la raíz de `geograficaaala/Tablero_dinamico_AALA`, respetando exactamente sus rutas. Reemplazar `public/index.html`, `.github/workflows/publicar-atitlan-recicla.yml` y `scripts/index/build_portal.py` cuando GitHub lo solicite. No modificar ni borrar las carpetas de datos de los programas.

## Archivos principales

- `public/index.html`: misma portada, estructura y textos institucionales del HTML original.
- `src/styles/index-original.css`: los estilos originales sin rediseño.
- `src/index/index-original.mjs`: navegación, mapa, tarjetas, carrusel, selector mensual y resumen institucional.
- `src/index/index-data.mjs`: lectura de tablas y controladores ya existentes por programa.
- `config/index/tarjetas.json`: catálogo y selección de indicadores de cada programa, sin resultados numéricos embebidos.
- `public/assets/maps/cobertura.geojson`: capa geográfica original.
- `public/assets/logos/`: imágenes originales del índice.
- `public/chatbot-*.js` y `public/data/chatbot_manifest.json`: recursos originales del asistente; sus referencias históricas todavía no están conectadas al nuevo motor de datos.
- `scripts/index/build_portal.py`: construye la portada de GitHub Pages con rutas correctas.

## Uso

1. Subir todos los archivos del paquete, respetando su ubicación.
2. Hacer commit en `main`.
3. Revisar **Actions → Publicar dashboards AALA**.
4. Abrir `https://geograficaaala.github.io/Tablero_dinamico_AALA/`.
5. Comprobar las pestañas **Resumen** y **Programas y proyectos**, el carrusel, los 12 meses, la cobertura y los seis enlaces.

La ruta `public/index.html` dentro del repositorio también utiliza los mismos módulos.

Los valores mostrados en las tarjetas proceden de las tablas del repositorio actual. Si esas tablas difieren de las cifras históricas embebidas en el HTML original, prevalecen los datos actuales del repositorio. Los meses sin información se muestran como pendientes, sin reutilizar automáticamente septiembre. Las metas mensuales que no existan no se inventan.

## Validación

Se ejecutaron 86 pruebas automatizadas de la copia integrada: todas pasaron. También se comprobó que el índice mantiene los mismos 136 elementos HTML (sin contar estilos, scripts y enlaces invisibles), las mismas 11 secciones y el CSS original.

La prueba de apertura automatizada en Chromium fue bloqueada por el entorno. La comprobación visual final debe hacerse en GitHub Pages; no se afirma paridad de píxeles sin esa comparación.

# Índice modular AALA 2026

El nuevo índice conserva dos secciones: resumen institucional y tarjetas de programas y proyectos. Las tarjetas ofrecen resultados mensuales y progreso acumulado anual para los seis programas. Cada tarjeta se alimenta directamente de los archivos CSV y controladores del programa correspondiente.

## Instalación

Descomprimir el ZIP en la raíz de `geograficaaala/Tablero_dinamico_AALA` y mantener las rutas de cada archivo. Reemplazar `.github/workflows/publicar-atitlan-recicla.yml` por el incluido, sin crear otro archivo con distinto nombre. Hacer commit en `main` y abrir **Actions → Publicar dashboards AALA**. La URL del índice es `https://geograficaaala.github.io/Tablero_dinamico_AALA/`.

## Reglas de lectura

- Los datos y metas se leen de las fuentes oficiales de cada programa al cargar la página.
- Los valores calculados por los controladores originales se conservan donde esos controladores ya existen.
- La vista visual es azul institucional. El índice no altera los estados internos de los programas.
- Para indicadores sin meta mensual se muestran resultados, pero no porcentajes de cumplimiento inventados.
- Fortalecimiento Municipal usa los valores acumulados publicados y metas de referencia pendientes de ratificación.
- Los meses sin datos publicados presentan la etiqueta «Sin datos publicados».
- El HTML no incluye resultados de indicadores ni metas incrustadas.

## Archivos nuevos

- `public/index.html`: índice con dos secciones y el carrusel de tarjetas.
- `src/index/portal.mjs`: controladores para los seis programas.
- `src/styles/index.css`: diseño y comportamiento responsive.
- `public/assets/logos/aala_logo.png`: identidad institucional.
- `scripts/index/build_portal.py`: genera el índice en la raíz de GitHub Pages.
- `tests/index/portal.test.mjs`: pruebas de rutas y estructura.

El Action global de publicación conserva su nombre visible y su ruta actual, comprueba los seis programas y publica desde `dist/`. Ningún indicador se recalcula como una suma entre programas.

# Fortalecimiento Municipal — instalación

Sube **el contenido de este paquete** a la raíz de `geograficaaala/Tablero_dinamico_AALA`, respetando las rutas. El paquete no reemplaza ningún archivo de los otros programas ni el workflow global de publicación.

## Archivos principales

- `public/fortalecimiento-municipal.html`
- `src/programs/fortalecimiento_municipal/dashboard.mjs`
- `src/programs/fortalecimiento_municipal/data-controller.mjs`
- `src/core/csv.mjs`
- `src/styles/programs/fortalecimiento_municipal.css`
- `data/fortalecimiento_municipal/2026/`: cinco CSV originales de la migración.
- `references/fortalecimiento_municipal/`: referencia congelada para comprobar las cifras publicadas.
- `.github/workflows/validar-fortalecimiento-municipal.yml`: comprobación automática independiente.

## Validación

Abre Actions → **Validar datos y módulos — Fortalecimiento Municipal** → Run workflow. También se dispara cuando subes estos archivos. Si termina en verde, ejecuta el Action **Publicar dashboards AALA** que ya exista en tu repo. No crees ni renombres otro workflow global.

## Página

Después de publicar con el workflow que copia `public`, `src`, `data` y `config` a `dist`, la URL es:

`https://geograficaaala.github.io/Tablero_dinamico_AALA/public/fortalecimiento-municipal.html`

## Origen de datos

`data/fortalecimiento_municipal/2026/` es la **fuente única** para el HTML. No hace falta duplicarla en `public/data`: GitHub Pages ya sirve `data` bajo `/Tablero_dinamico_AALA/data/`. Las cinco tablas registran actividades, valores publicados, metas históricas, notas y períodos.

## Protección de cifras

Los resultados publicados de agosto y septiembre incluyen ajustes históricos. La columna `origen_valor` identifica esas excepciones, y la validación rechaza cambios no intencionales a los datos de enero a septiembre. Si se agregan meses futuros, se añaden nuevas filas y se habilita el período en `periodos_2026.csv`; nunca se reemplazan silenciosamente los resultados originales.

Las metas son referencias tomadas del HTML antiguo: **no se presentan como metas institucionales nuevamente ratificadas**. Los semáforos son internos, las barras visibles son azules. El correo prepara un borrador, no lo envía de forma automática.

## Estado de pruebas

Esta entrega incluye validación automatizada de datos y rutas. La comparación visual píxel a píxel con el dashboard anterior sigue pendiente. El header y footer usan los módulos presentes en el ZIP de tu repositorio.

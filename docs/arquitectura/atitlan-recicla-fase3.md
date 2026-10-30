# Atitlán Recicla · Fase 3

## Instalación

Copiar las rutas del paquete a la raíz de `Tablero_dinamico_AALA` sin borrar las carpetas `data`, `scripts`, `references` y `tests` ya existentes. El paquete utiliza `data/atitlan_recicla/2026` y el controlador de la Fase 2. Hacer commit a `main`.

En Settings → Pages seleccionar `GitHub Actions` como origen. Ejecutar el workflow `Publicar Atitlán Recicla` o dejar que se ejecute con el commit.

URL esperada: `https://geograficaaala.github.io/Tablero_dinamico_AALA/public/atitlan-recicla.html`.

## Fuentes

- `data/atitlan_recicla/2026/*.csv`: resultados mensuales originales, ya validados.
- `data/atitlan_recicla/2026/*.json`: metas anuales, SURUSIC y precálculos.
- `config/atitlan_recicla/metas_2026.json`: metas mensuales editables de forma controlada.
- `config/atitlan_recicla/reglas_indicadores.json`: reglas de cumplimiento documentadas; el controlador conserva los umbrales de Fase 2.
- `src/programs/atitlan_recicla/data-controller.mjs`: cálculos de la Fase 2 compatibles con sus pruebas previas.
- `src/programs/atitlan_recicla/dashboard.mjs`: visualización del dashboard.
- `src/components/header.js`, `src/components/footer.js`: componentes globales.
- `src/styles/global.css`, `src/styles/branding.css`, `src/styles/programs/atitlan_recicla.css`: estilos externos. El último archivo conserva la estructura visual extraída del HTML anterior.

## Control de calidad pendiente

El paso de paridad aritmética previo no cubre la paridad visual. Es necesario comparar capturas del dashboard original y del nuevo para cada mes, zona, breakpoint y vista. La presentación utiliza una interfaz de diapositivas propia; el correo abre una composición `mailto` en la aplicación del usuario, no realiza envíos desde un backend. Meses sin tabla publicada se identifican como pendientes.

El aspecto y los gráficos nuevos reproducen secciones principales usando módulos y fuentes externas, pero todavía no constituyen certificación de coincidencia visual exacta con el HTML anterior. Las visualizaciones especializadas existentes en scripts complementarios del original siguen sujetas a evaluación y migración.

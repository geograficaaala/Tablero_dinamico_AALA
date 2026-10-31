# Educando para Conservar · Integración 2026

## Instalación

1. Descomprime el ZIP y copia **su contenido**, sin añadir una carpeta envolvente, en la raíz de `geograficaaala/Tablero_dinamico_AALA`.
2. Respeta las rutas y sustituye únicamente los archivos que ya existan con el mismo nombre. No borres carpetas de otros programas.
3. Confirma el commit en `main`.
4. En GitHub Actions, comprueba **Validar datos y módulos — Educando para Conservar** y **Publicar dashboards AALA**.
5. Abre `https://geograficaaala.github.io/Tablero_dinamico_AALA/public/educando-para-conservar.html`.
6. Abre el portal principal para confirmar que se muestra el cuarto enlace.

## Archivos de datos

- `data/educando_para_conservar/2026/total_mes.csv`: 9 períodos (enero-septiembre), 40 campos.
- `data/educando_para_conservar/2026/institucional_indicadores.csv`: 165 resultados históricos, con metas, valores y evaluación interna tal como aparece en la fuente.
- `data/educando_para_conservar/2026/metas_referencia_2026.csv`: referencia de 18 indicadores al último período.
- `data/educando_para_conservar/2026/metadata_publicacion.csv`: metadata de publicación.

Los CSV están derivados del HTML original, que superpone correcciones internas para abril-septiembre a los CSV antiguos. No son una transcripción de los CSV antiguos sin esas correcciones. La referencia congelada de los valores finales está en `references/educando_para_conservar/referencia_html_original_2026.json`.

## Arquitectura

- `public/educando-para-conservar.html`: plantilla ligera.
- `src/programs/educando_para_conservar/bootstrap.mjs`: monta header/footer compartidos y carga el dashboard.
- `src/programs/educando_para_conservar/dashboard.js`: renderiza gráficos, vistas, presentación y cálculos de referencia con los CSV.
- `src/styles/programs/educando_para_conservar.css`: diseño original separado del HTML, con estados visibles azules.
- `public/assets/logos/educando-para-conservar.png`: logo del programa.

El Action de publicación existente sigue teniendo como **nombre de archivo** `.github/workflows/publicar-atitlan-recicla.yml`, y como **nombre visible** `Publicar dashboards AALA`. Este paquete actualiza su contenido; no crea un segundo Action global ni renombra el archivo.

## Reglas de validación

- El estado técnico del indicador se conserva en los datos (`estatus` verde/amarillo/rojo/azul/gris), pero no controla el color visible de las barras.
- Los datos de octubre a diciembre no están publicados en el original y sus controles permanecerán deshabilitados.
- El botón de correo prepara un correo en el dispositivo; no lo envía automáticamente.
- Para futuros meses, los CSV son el punto de entrada de los resultados. Los perfiles históricos y reglas de presentación actuales se mantienen en el controlador para conservar su lógica original; una revisión posterior puede externalizarlos sin modificar el HTML.
- La paridad de valores se verificó frente a la referencia extraída. La paridad visual perfecta con el sitio antiguo no queda certificada automáticamente.

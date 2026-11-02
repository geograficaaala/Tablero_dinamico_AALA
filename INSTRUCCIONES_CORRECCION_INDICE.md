# Corrección de indicadores institucionales del índice AALA

## Instalación

Subir los siete archivos del paquete respetando las rutas de la carpeta raíz de `Tablero_dinamico_AALA`. Hacer commit a `main` y ejecutar **Publicar dashboards AALA**.

## Qué cambia

El índice utiliza un catálogo inalterable de las descripciones institucionales y los cortes publicados del archivo original proporcionado. El HTML, el CSS, el footer, los CSV y los dashboards individuales permanecen intactos.

Se restauran 54 tarjetas mensuales (seis programas por nueve meses) y 189 registros de indicadores, incluidos sus textos literales, cifras, porcentajes, metas, temporalidades, promedios y formatos específicos de cada programa.

## Octubre

No se incorpora octubre al índice con este paquete. El futuro corte de octubre necesitará un registro aprobado en `data/index/2026/cortes_publicados.json`; las nuevas cifras no deben inferirse automáticamente de un indicador con definición distinta. Los datos de los programas individuales no se borran.

## Prueba

`node --test tests/index/paridad-institucional.test.mjs tests/index/original.test.mjs`

Los controles de GitHub Pages conservan el índice activo al cambiar de mes. La cobertura y el resto del índice no se modifican.

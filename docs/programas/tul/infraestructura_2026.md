# Siembra de Tul — infraestructura 2026

La fuente de referencia es `docs/index_tul.html` del repositorio anterior, extraída sin actualizar cifras ni reescribir las descripciones. Cada tabla tiene un contrato distinto.

| Archivo | Contrato |
|---|---|
| `data/tul/2026/resultados_mensuales_2026.csv` | Una fila por período e indicador; resultado mensual, meta mensual y acumulado de referencia. |
| `data/tul/2026/metas_anuales_2026.csv` | Ocho metas definidas por el programa. |
| `data/tul/2026/periodos_2026.csv` | Enero–diciembre; febrero–septiembre publicados; octubre–diciembre con programación. |
| `data/tul/2026/jornadas_2026.csv` | Veintiuna entradas con fechas, sitios, municipios, semilleros y coordenadas. |
| `data/tul/2026/analisis_mensual_2026.csv` | Titular y texto original por mes publicado. |
| `data/tul/2026/analisis_detalles_2026.csv` | Tres detalles narrativos por mes publicado. |

El footer usa el componente compartido de AALA y conserva los cinco enlaces del HTML original.

Los porcentajes usan el redondeo del HTML original y están limitados visualmente a 100 %. Una meta mensual cero equivale a 100 % si hubo resultado positivo y 0 % si no hubo resultado. Las reglas internas no se colorean con semáforos; la presentación utiliza azul institucional.

Los 21 registros de programación se conservan: no todos son jornadas realizadas. La presentación de jornadas acumuladas por municipio reproduce el criterio del HTML original, que cuenta registros publicados hasta el período seleccionado.

El HTML original tiene información de febrero a septiembre y no tiene cifras para enero. Las metas anuales son 21 jornadas, 1,300 m, 1,350 macollas, 10 mantenimientos, 11 mapas, 4 capas, 10 sitios y 6 municipios.

El original contiene descripciones que no siempre corresponden literalmente con sus cuadros numéricos. Se conservan sin alteración; los CSV de resultados son la fuente de los KPI, y los CSV narrativos son la fuente del análisis.

Las futuras actualizaciones cargarán nuevos registros en CSV y cambiarán el estado del período a `publicado`, sin modificar el HTML. Para ello será necesario ampliar las referencias de prueba de la fuente oficial o versionar el corte correspondiente.

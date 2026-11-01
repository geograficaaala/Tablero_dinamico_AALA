# Infraestructura de datos — Reforestando Atitlán 2026

## Principio de publicación

Todos los valores de enero a septiembre de 2026 se consideran aceptados para su publicación, por instrucción del solicitante. Las cifras y metas no se modifican. El registro de aceptación se separa de las reglas de desempeño y de las tablas de actividades.

## Tablas y relaciones

| Tabla | Clave | Uso |
| --- | --- | --- |
| `total_mes_2026.csv` | `periodo_clave` | Indicadores principales, acumulados y metas |
| `actividades_complementarias_2026.csv` | `periodo_clave` + `kpi_id` | Indicadores mensuales, detalles y actividades |
| `indicadores_institucionales_2026.csv` | `periodo_clave` + `indicator_id` | Valores institucionales con modelo de medición |
| `metas_referencia_2026.csv` | `periodo_clave` | Metas anuales de referencia de los cuatro KPI |
| `supervivencia_2026.csv` | `periodo_clave` | Supervivencia que se muestra según el mes seleccionado |
| `procedencia_2026.csv` | `periodo_clave` | Aceptación de los períodos para publicación |
| `metadata_publicacion.csv` | `program_id` | Corte más reciente |
| `periodos_2026.csv` | `periodo_clave` | Meses habilitados y pendientes |
| `catalogo_indicadores_2026.csv` | `indicador_id` | Contrato de campos para un futuro sistema de captura |

El contrato completo está en `config/reforestacion/contrato_datos_2026.json`. El controlador del dashboard lee directamente estas tablas, sin datos mensuales incrustados en el HTML.

## Actualización futura

1. Ingresar un nuevo corte `YYYY-MM` en `total_mes_2026.csv`.
2. Registrar los indicadores complementarios que correspondan en `actividades_complementarias_2026.csv`.
3. Registrar el detalle institucional, las metas y la supervivencia de ese período.
4. Actualizar el calendario y registrar la aprobación para publicación en `procedencia_2026.csv`.
5. Actualizar `metadata_publicacion.csv` cuando se apruebe un nuevo corte.
6. Ejecutar `Validar datos y módulos — Reforestación` antes del despliegue global.

Los indicadores con metas o reglas diferentes deben mantener su modelo específico. Los estados de desempeño se conservan internamente, pero los colores de desempeño visibles son azules.

## Integridad

`references/reforestacion/paridad_2026.json` conserva la referencia original. El validador comprueba la identidad de todos los valores de la referencia salvo los textos editoriales modificados para la política de publicación. Las pruebas adicionales verifican el selector mensual, el resumen ejecutivo, el modo presentación, las rutas de módulos y el catálogo.

La aceptación para publicación no debe confundirse con certificación documental independiente. Ninguna cifra se ha ajustado para cambiar su resultado.

# Reforestando Atitlán 2026 — infraestructura aprobada para publicación

## Instalación en Tablero_dinamico_AALA

1. Descargar y descomprimir el ZIP.
2. Subir las carpetas contenidas en el ZIP a la raíz de `geograficaaala/Tablero_dinamico_AALA`, sin crear un directorio adicional.
3. Reemplazar los archivos de **Reforestación** existentes, conservando los archivos de los otros programas.
4. Confirmar los cambios en la rama `main`.
5. Ejecutar **Validar datos y módulos — Reforestación** desde GitHub Actions.
6. Ejecutar el workflow existente **Publicar dashboards AALA**. No crear otro publicador ni reemplazar su configuración.
7. Abrir `https://geograficaaala.github.io/Tablero_dinamico_AALA/public/reforestando-atitlan.html` y actualizar con `Ctrl + F5`.

## Tablas oficiales para este dashboard

Se encuentran en `data/reforestacion/2026/`:

| Archivo | Función |
| --- | --- |
| `total_mes_2026.csv` | Valores mensuales y acumulados de los cuatro KPI principales |
| `actividades_complementarias_2026.csv` | Nueve KPI complementarios por mes, actividades y descripciones |
| `indicadores_institucionales_2026.csv` | Detalle original de indicadores institucionales |
| `metas_referencia_2026.csv` | Metas originales por corte |
| `supervivencia_2026.csv` | Porcentajes de supervivencia por corte |
| `procedencia_2026.csv` | Registro de aprobación de cada período publicado |
| `metadata_publicacion.csv` | Corte más reciente y datos generales de publicación |
| `periodos_2026.csv` | Disponibilidad enero–diciembre, preparada para una futura interfaz de carga |
| `catalogo_indicadores_2026.csv` | Campos y reglas para captura futura de datos |

Las estructuras y obligaciones de cada archivo están en `config/reforestacion/contrato_datos_2026.json`.

## Criterio de datos

Por instrucción expresa del solicitante, todos los valores de enero a septiembre de 2026 se aceptan para su publicación como datos del programa. Los valores numéricos y las metas se mantienen exactamente como en el paquete anterior. Se eliminan las advertencias de estimación que aparecían al mostrar julio, agosto y septiembre; las fuentes se describen ahora como datos del tablero aprobados para publicación.

La decisión de publicación no constituye una auditoría documental independiente. La referencia numérica original queda conservada en `references/reforestacion/paridad_2026.json` para poder comprobar que ningún número cambió. El semáforo de desempeño continúa siendo interno; todos los elementos visibles de desempeño usan azul institucional.

## Comprobación

```bash
python scripts/reforestacion/validate_data.py
node --test tests/reforestacion/paridad.test.mjs tests/reforestacion/funcional.test.mjs
node --check src/programs/reforestacion/dashboard.js
node --check src/programs/reforestacion/bootstrap.mjs
```

Para publicar octubre, noviembre o diciembre, se deberán agregar registros coherentes a las tablas y aprobar esos nuevos cortes antes de habilitarlos; no se editará el HTML.

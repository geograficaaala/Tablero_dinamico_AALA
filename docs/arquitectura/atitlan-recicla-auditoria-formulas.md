# Atitlán Recicla · Auditoría de fórmulas y reglas de precedencia

**Línea base:** `docs/index_atitlanrecicla.html` del ZIP original, corte enero–septiembre de 2026.

**Estado:** paridad numérica parcial verificada mediante funciones JavaScript originales extraídas para los KPI, estados, tendencia de materiales, metas anuales y cargas de impacto municipal y zonal. Aún no se certifican renderizado, informes, modo presentación ni todas las gráficas.

## Fuentes y precedencia efectiva

1. **Datos oficiales incrustados:** bloque `aala-excel-truth-ene-may-2026`, líneas 9157–9312; `loadAll()` y `buildState()` se sustituyen, aunque el ID contenga «ene-may».
2. **Precálculo final de impacto:** bloque `aala-impacto-municipios-zonas-cdm-mayo5-2026`, líneas 9317–9352. La variable `window.ATITLAN_PRECALC` se reemplaza por ese objeto.
3. **Reproyección zonal y municipal:** bloque `aala-analisis-mes-ene-may-correcto`, líneas 9396–9467. Al renderizar, `currentData.zonaMes` y `currentData.territorioMes` se sustituyen por valores construidos desde el precálculo final. Esto afecta también los KPI de zona, tendencias de zona y análisis territorial.
4. **Total del programa:** `currentData.totalMes` permanece procedente del bloque Excel original, no de la reproyección de impacto.
5. **Acumulados y porcentajes:** líneas 4035–4095, sobreescritas parcialmente por líneas 9219–9241. La participación se lee de `pct_participacion_*`, no se recalcula como división de personas. `sumMetricSeries()` promedia `ingreso_diario_lideresa` y las dos participaciones, y suma los demás campos.
6. **Metas:** las metas mensuales proceden de `METRIC_CONFIG` (líneas 3415–3425); las anuales proceden del bloque Excel y están preservadas en `metas_anuales.json` (líneas 9250–9289).
7. **SURUSIC:** la tabla de ventas mensual se sustituye por el bloque Excel (líneas 9205–9217) y su meta anual procede de `metas_anuales.json`.
8. **Impacto por municipio y zona:** las tarjetas leen de `precalculo_impacto_final.json` los valores `monthly`, `annual`, `shareMonthly`, `shareAnnual`, `progressMonthly` y `progressAnnual` directamente; no se deben recomputar desde CSV para replicar esa sección (líneas 7175–7218).

## Reglas numéricas que se conservaron

| Concepto | Fórmula efectiva |
|---|---|
| KPI mensual | Campo de `totalMes` o de la zona reproyectada desde el precálculo |
| Participación mensual | Valor `pct_participacion_actividades` o `pct_participacion_comercializacion` |
| Cumplimiento mensual KPI | `valor / meta_mensual_configurada` |
| Acumulado por indicador | Suma desde enero; promedio simple para ingreso diario y participaciones |
| Cumplimiento al mes | `acumulado / (meta_mensual_configurada * número_de_mes)` |
| Aporte mensual de zona | `valor_zona / valor_programa` |
| Aporte anual de zona | `acumulado_zona / acumulado_programa` |
| Metas anuales | `acumulado_programa / meta_anual_excel` |
| SURUSIC acumulado | Suma de ventas/unidades hasta el mes seleccionado |

Las metas anuales **no** son `meta mensual × 11` ni `meta mensual × 12`. Por ejemplo, materiales usa `17 920 qq` en la meta anual y `1 630 qq` como meta mensual.

## Discrepancias halladas

- Las seis diferencias entre `indicadores.csv` y `total_mes.csv` para ingresos de mujeres y municipalidades de marzo a mayo ya están documentadas en `references/atitlan_recicla/discrepancias_entre_tablas.csv`. Podrían corresponder a bruto/neto; no se corrigieron sin evidencia.
- Hay **nueve discrepancias mayores de 0.01** en el porcentaje zonal de participación en comercialización entre `zona_mes.csv` y la proyección final del precálculo, en enero–mayo. Para el dashboard final prevalece el precálculo.
- El nombre de algunos bloques conserva referencias a mayo/agosto, pero el corte de las estructuras verificadas llega hasta septiembre de 2026. La denominación del ID no debe usarse como indicador del período.
- Las dos tablas de zona deben conservarse: la CSV, como fuente histórica original, y la proyección final, para compatibilidad exacta de la vista existente.

## Pruebas disponibles

- `validate_data.py`: 6 tablas, 310 registros; identidad exacta con el objeto Excel incrustado.
- `paridad.test.mjs`: 45 casos (9 meses × total + 4 zonas), cada uno con 8 KPI, avances, participaciones, tendencia de materiales, estado del programa; además 9 períodos de metas anuales y la totalidad de paquetes de precálculo para 4 zonas y 15 municipios.
- `golden-2026.json`: resultados congelados generados ejecutando las funciones originales extraídas del HTML. Sirve para detectar cambios accidentales en el nuevo controlador. No se regenera automáticamente para evitar que una regresión cambie también su resultado esperado.
- El controlador recibe seis fuentes a través de `createAtitlanModel()` y permite carga HTTP desde una URL definida por el futuro dashboard con `loadAtitlanModel()`.

## Limitaciones y siguientes pruebas

No se ha ejecutado todavía una comparación automática entre navegadores del dashboard viejo y el nuevo. Faltan las series de todos los gráficos especializados, tablas de materiales, reportes, formatos visuales, modo ejecutivo, presentación, filtros de materiales y exportación. La paridad numérica aquí comprobada no implica todavía paridad visual integral.

Para una actualización posterior a septiembre de 2026, deberán generarse nuevas tablas y un nuevo conjunto de resultados de referencia aprobados antes de cambiar el corte oficial. El controlador acepta nuevos meses del año sin tener que editarlo, pero las pruebas de paridad siguen deliberadamente fijadas al corte 2026-09.

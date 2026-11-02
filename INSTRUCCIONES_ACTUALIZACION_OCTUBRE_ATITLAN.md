# Actualización de octubre 2026 — Atitlán Recicla

El paquete contiene los archivos de datos de octubre, la referencia de validación, las pruebas y la integración con el índice institucional. Se instala en la **raíz** del repositorio `geograficaaala/Tablero_dinamico_AALA`, sin agregar una carpeta intermedia.

1. Descomprimir el ZIP.
2. Subir su contenido a las rutas indicadas en GitHub y reemplazar los archivos con el mismo nombre.
3. Hacer *Commit changes* en `main`.
4. Verificar **Validar datos — Atitlán Recicla**, **Validar fórmulas — Atitlán Recicla** y **Publicar dashboards AALA**.
5. En el índice, seleccionar **Octubre** y abrir la tarjeta **Atitlán Recicla**. Las tarjetas de programas que aún no tienen corte de octubre mostrarán la ausencia de datos, sin reutilizar septiembre como si fuera octubre.
6. Abrir `https://geograficaaala.github.io/Tablero_dinamico_AALA/public/atitlan-recicla.html` para ver el dashboard individual.

## Indicadores institucionales de octubre

| Indicador | Resultado de octubre | Acumulado o referencia | Cumplimiento |
|---|---:|---:|---:|
| Recolección de 17,920 quintales de materiales reciclables. | 1,807.15 qq | 17,621.53 / 17,920 qq | 110.9 % mensual; 98.3 % anual |
| Generación de Q448,000 en ingresos brutos por comercialización. | Q40,077.62 | Q375,474.91 / Q448,000 | 98.4 % mensual; 83.8 % anual |
| Ingreso medio diario de Q135 por lideresa activa en comercialización. | Q253.7 diarios | Q135 diarios de meta | 187.9 % mensual |

El promedio de cumplimiento mensual de estos tres indicadores es **132.4 %**. La descripción institucional de los tres indicadores procede de `config/index/indicadores_institucionales_2026.json` y no se ha alterado.

## Diferencias de origen que requieren comprobación

El libro Excel tiene dos valores distintos para las mismas variables. Se conserva la hoja `Agre_TOTAL`, sin modificarla:

- Ingreso neto de mujeres: `Agre_TOTAL` indica Q37,044.99; la hoja `INDICADORES` indica Q37,044.49.
- Unidades de vidrio vendidas: `Agre_TOTAL` indica 126; la hoja `INDICADORES` indica 123.

Estas diferencias no cambian los tres indicadores institucionales prioritarios del índice. Los datos de enero a septiembre, los textos aprobados y los demás programas permanecen intactos.

## Automatización

El Action global ejecuta `python scripts/index/actualizar_cortes_atitlan.py` antes de las pruebas y la publicación. Este script genera los cortes de Atitlán Recicla desde el CSV mensual y las metas centralizadas, sin reconstruir ni modificar los nueve cortes institucionales originales. El promedio general del índice no se calcula con una sola tarjeta mientras la actualización de los otros cinco programas está pendiente.

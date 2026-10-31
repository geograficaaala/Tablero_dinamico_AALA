# Conservando Atitlán — infraestructura de datos 2026

## Objetivo

Los datos mensuales, las metas oficiales y las notas de procedencia se guardan en CSV independientes. No hay cifras mensuales incrustadas en el controlador ni en el futuro HTML. La fuente operativa única es `data/conservando_atitlan/2026/`.

## Contenido

- `datos_mensuales.csv`: nueve meses con información original consolidada (enero a septiembre de 2026). Una fila por mes; sin filas de octubre, noviembre y diciembre hasta recibir datos.
- `metas_2026.csv`: dieciocho parámetros del bloque `GOALS` del HTML original. Las metas mensuales y anuales son independientes.
- `fuentes_mensuales.csv`: procedencia y observaciones por período. Las observaciones extensas no sobrecargan el CSV operativo.
- `manifest.json`: versión y último mes con datos.
- `config/conservando_atitlan/esquema_2026.json`: contrato de columnas y validaciones.
- `references/conservando_atitlan/referencia_kpis_2026.csv`: resultado congelado de los cálculos del HTML original (153 indicadores y sus valores, estados, metas y proporciones para los nueve meses); es material de pruebas, no fuente del dashboard.
- `src/programs/conservando_atitlan/data-controller.mjs`: módulo que carga los CSV y reproduce las funciones de evaluación del HTML original.
- `scripts/conservando_atitlan/validate_data.py`: validador de integridad aritmética, períodos y metas.
- `tests/conservando_atitlan/paridad.test.mjs`: comparación automática con los indicadores del original.
- `.github/workflows/validar-conservando-atitlan.yml`: validación para commits, pull requests y ejecución manual.

## Migración respecto al HTML original

El CSV original publicado en la repo anterior solo cubría enero a abril. El HTML final sustituía por código JavaScript los datos de abril, y agregaba mayo, junio, julio, agosto y septiembre. La nueva tabla `datos_mensuales.csv` usa los datos que quedan en memoria **después** de ejecutar esas sustituciones, por lo que abril 2026 registra 4,850 jabones producidos, no el cero del CSV antiguo.

Para enero-marzo se conservan las cifras del CSV original. Para abril-septiembre se usan los objetos finales de datos del HTML original. La fecha más reciente con datos es septiembre de 2026. El campo `is_latest_data_month` se normaliza para que solo el último mes sea `true`.

## Metas y comportamiento peculiar que se conserva

- Aceite: 80,000 litros anuales. Agua protegida: 80,000,000 litros anuales. Ambos utilizan como referencia mensual la meta anual dividida entre 12.
- Jabones producidos: 65,040 anuales y 5,420 mensuales.
- Jabones vendidos: 51,600 anuales y 4,300 mensuales; hay metas específicas de 4,000 y 300 por tipo.
- Ingreso por ventas de jabones: Q106,800 anuales; no existe meta mensual fija en el HTML.
- Recolección: 12 jornadas anuales y una mensual.
- Pruebas de jabón líquido: tres al año, previstas en marzo, abril y mayo. El indicador anual cuenta meses con alguna prueba, no el total de pruebas registradas.
- Velas: el HTML define varios parámetros particulares, incluido un valor de respaldo de 50 para ventas mensuales sin dato. La referencia del indicador mensual compara contra 40. Ambos comportamientos se conservan para garantizar coincidencia con el original.
- El KPI «Inmuebles atendidos» del HTML presenta la cifra fija `150 / 150`, mientras que «Inmuebles que entregaron aceite» usa el valor real de cada mes. **No deben confundirse**; no se cambia el contenido original sin decisión de negocio.
- Los indicadores estratégicos en el HTML original tienen el estado `green` explícito, independientemente de ciertos porcentajes. El módulo conserva ese valor de referencia y permite evaluar por separado el semáforo técnico según la proporción. Todas las representaciones visuales futuras deberán usar azul institucional, sin cambiar los valores numéricos.
- El semáforo técnico para Conservando Atitlán usa verde desde 100 %, amarillo desde 80 % hasta menos de 100 % y rojo por debajo de 80 %. No debe reemplazarse por los límites de otros programas.

## Integración con el futuro dashboard

La publicación actual de GitHub Pages empaqueta `public`, `src`, `data` y `config` en la carpeta `dist`. Por lo tanto, desde `public/conservando-atitlan.html` se podrá usar este módulo:

```js
import {cargarDatosConservando,crearControladorConservando} from '../src/programs/conservando_atitlan/data-controller.mjs';
const {datos,metas,fuentes}=await cargarDatosConservando('../data/conservando_atitlan/2026');
const controlador=crearControladorConservando(datos,metas,fuentes);
const indicadores=controlador.seleccionarMes('2026-09');
```

Para actualizar un mes solo se agrega o corrige la fila en `datos_mensuales.csv`, la fila correspondiente en `fuentes_mensuales.csv` y se actualizan el último período y su marcador en `manifest.json` y en el CSV. Las metas permanecen separadas. Más adelante la herramienta de captura podrá generar y validar estos archivos automáticamente.

## Validación

```bash
python scripts/conservando_atitlan/validate_data.py
node --test tests/conservando_atitlan/paridad.test.mjs
```

Una validación verde confirma coincidencia numérica de las funciones principales respecto a la referencia del HTML original para enero-septiembre. No confirma por sí sola fidelidad visual de gráficos, diseño o modos de presentación; esas comprobaciones corresponden a la siguiente fase.

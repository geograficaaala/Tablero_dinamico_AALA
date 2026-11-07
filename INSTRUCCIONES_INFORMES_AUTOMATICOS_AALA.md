# AALA · Instalación del generador de informes institucionales

## 1. Qué se instala

Este paquete activa el botón **Modo informe** en los seis dashboards y convierte el botón de correo en **Enviar informe por correo**. El mes elegido en el encabezado determina automáticamente el corte del informe. El motor se alimenta de los mismos CSV y JSON de la plataforma. Los textos de los 21 indicadores institucionales se leen, sin reescritura, desde `config/index/indicadores_institucionales_2026.json`.

Cada informe presenta todos los indicadores oficiales del programa, al menos ocho seguimientos operativos cuando existen registros, el detalle disponible por municipios, jornadas, actividades o cartografía, la serie de meses publicados y un balance descriptivo.

**Formato:** A4, Times New Roman (o equivalente si el equipo no la tiene), 11 puntos, texto justificado, interlineado 1.0 y sin separadores decorativos entre títulos. Los informes tienen extensión variable según los registros de cada mes.

## 2. Publicación en GitHub

1. Antes de instalar, conserva una copia del archivo `src/components/aala-visual-universal.mjs` actual por si has realizado ajustes posteriores en ese módulo.
2. Descomprime `AALA_Motor_Informes_Dinamicos_Seis_Programas_GitHub.zip` en tu computadora.
3. Abre `https://github.com/geograficaaala/Tablero_dinamico_AALA` y entra en la rama **main**.
4. En **Add file → Upload files**, sube las carpetas y archivos **manteniendo exactamente las rutas** que aparecen a continuación. Sustituye los archivos existentes y añade los nuevos.
5. Confirma que no hayas creado una carpeta externa con el nombre del ZIP. La carpeta `public` debe quedar en la raíz de la repo, al mismo nivel que `src`, `data` y `tests`.
6. Haz **Commit changes**.
7. En **Actions**, ejecuta **Publicar dashboards AALA** (o verifica la ejecución que inició el commit). Comprueba que termine en verde.
8. Abre `https://tableroaala.online/public/atitlan-recicla.html`, recarga con Ctrl + F5 y prueba **Modo informe** en octubre. Repite en los otros cinco programas.

## 3. Archivos nuevos y actualizados

**Nuevos**

- `public/informe.html`: página de lectura, impresión y correo.
- `src/styles/reports.css`: formato institucional A4.
- `src/reports/report-profiles.mjs`: variables de seguimiento particulares de cada programa.
- `src/reports/report-core.mjs`: selección de mes, KPI y datos operativos.
- `src/reports/report-browser.mjs`: carga de CSV/JSON y composición narrativa.
- `src/reports/report-ui.mjs`: conecta los botones y el mes activo.
- `tests/reports/report-engine.test.mjs`: pruebas institucionales de los seis programas.
- `tests/reports/report-browser.test.mjs`: pruebas de generación HTML de los seis informes.

**Actualizados**

- `src/components/aala-visual-universal.mjs`: añade únicamente la importación y activación del módulo de informes sobre el componente visual compartido. No cambia el diseño de los demás módulos.
- `.github/workflows/publicar-atitlan-recicla.yml`: ejecuta las pruebas del generador antes de publicar.
- `tests/educando_para_conservar/paridad.test.mjs`: actualiza una referencia antigua del test al encabezado institucional que utiliza el dashboard actual.

**No se reemplaza ningún CSV, JSON de datos, KPI, meta ni HTML de los seis dashboards.**

## 4. Cómo usar los botones

1. Abre el tablero individual del programa.
2. Selecciona el mes en el encabezado, por ejemplo **Octubre**.
3. Pulsa **Modo informe**. Se abrirá una página con el documento narrativo de ese programa y mes.
4. Pulsa **Imprimir / Guardar PDF** y, en el cuadro del navegador, selecciona **Guardar como PDF**, tamaño A4. Así obtienes el archivo PDF con el formato institucional.
5. Para preparar un correo, pulsa **Enviar informe por correo** desde el dashboard, o **Preparar correo** desde el informe. Se abrirá tu aplicación de correo con asunto, mensaje y enlace al informe.
6. **Importante:** GitHub Pages no puede adjuntar ni enviar automáticamente el PDF por sí solo. Para enviar un archivo PDF, primero guárdalo y después adjúntalo manualmente al correo. Automatizar el envío con adjuntos requerirá un servicio de correo autorizado y una configuración posterior.

## 5. Qué ocurre cuando se actualicen noviembre y otros meses

El generador **no tiene valores mensuales escritos dentro del código**. Usa `data/index/2026/cortes_publicados.json` para los textos numéricos y porcentajes oficiales, y los CSV específicos para los apartados operativos. Cuando esos archivos incorporen un nuevo mes publicado, el informe podrá utilizarlo automáticamente desde el selector. No basta con cambiar el selector: primero debe existir el corte en los datos.

Para un ejercicio anual posterior a 2026, habrá que ampliar las reglas de año y los archivos de datos. Esta primera integración está preparada específicamente para los períodos de 2026 ya presentes en el sitio.

## 6. Comprobación local opcional

Desde la raíz de la repo, con Node.js 22:

```bash
node --test tests/reports/*.test.mjs
node --test tests/**/*.test.mjs
```

Si quieres revisar los archivos sin publicar, inicia un servidor web local desde la raíz, por ejemplo `python -m http.server 8000`, y abre `http://localhost:8000/public/informe.html?programa=atitlan_recicla&mes=2026-10`. No basta con abrir el HTML directamente desde el explorador, porque los módulos necesitan acceso HTTP a los archivos CSV/JSON.

## 7. Verificaciones antes de dar por terminada la instalación

- Se visualiza el botón **Modo informe** en los seis programas.
- Atitlán Recicla, octubre, muestra como tercer indicador **Ingreso medio diario de Q135 por lideresa activa en comercialización**.
- Se preservan literalmente las descripciones de los **21 KPI** oficiales.
- En Siembra de Tul, octubre muestra 18/21 jornadas y no añade metros lineales que no hayan sido reportados.
- En cada dashboard, al cambiar de septiembre a octubre, el informe cambia con la selección.
- La impresión mantiene letra de 11 puntos, texto justificado e interlineado sencillo.
- El botón de correo **no indica que se haya enviado nada**: solo prepara el mensaje y permite adjuntar el PDF manualmente.

## 8. Reversión

Si deseas revertir la integración, restaura el respaldo de `src/components/aala-visual-universal.mjs`. Los nuevos archivos de `src/reports/`, `src/styles/reports.css` y `public/informe.html` podrán permanecer sin ejecutarse, porque ya no habrá botones vinculados a ellos.

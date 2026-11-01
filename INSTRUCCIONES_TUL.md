# Instalación — Siembra de Tul

1. Extraer el ZIP.
2. Subir **el contenido**, sin carpeta contenedora adicional, a la raíz de `geograficaaala/Tablero_dinamico_AALA`.
3. Mantener las rutas exactas. No eliminar ni reemplazar los componentes compartidos `src/components/header.js`, `src/components/footer/footer.js` ni la publicación global existente.
4. Hacer commit en `main`.
5. En GitHub Actions, comprobar **Validar datos y módulos — Siembra de Tul**.
6. Ejecutar el Action existente **Publicar dashboards AALA** si no se ejecutó automáticamente.
7. Abrir `https://geograficaaala.github.io/Tablero_dinamico_AALA/public/tul.html` y recargar con Ctrl + F5.

Este paquete **no modifica el índice ni el Action global**, tal como se acordó dejar su corrección para después. Por tanto, el enlace directo permite abrir Tul aunque todavía no exista botón en el portal.

El tablero usa los componentes compartidos ya presentes en la repo; si alguno de estos archivos ha cambiado respecto a los paquetes anteriores, ejecutar primero las pruebas para confirmar las exportaciones.

La programación de octubre a diciembre aparece, pero no se habilitan resultados mensuales hasta incorporarlos a los CSV.

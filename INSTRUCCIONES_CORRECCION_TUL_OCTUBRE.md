# Corrección de publicación de Siembra de Tul — octubre 2026

El validador de `main` ya exigía octubre, pero los cinco archivos de datos del programa permanecían en septiembre.

1. Abre `https://github.com/geograficaaala/Tablero_dinamico_AALA`.
2. Extrae este ZIP y sube **los cinco archivos** a `main`, respetando las rutas `data/tul/2026/`.
3. Confirma que los cinco aparezcan como modificados en el commit.
4. Ejecuta el flujo que valida Tul y después `Publicar dashboards AALA`.

Verificación local:

```bash
python scripts/tul/validate_data.py
node --test tests/tul/paridad.test.mjs tests/tul/arranque.test.mjs tests/index/paridad-institucional.test.mjs
```

Octubre: 18 jornadas acumuladas de 21; 1,790 metros lineales y 1,200 macollas se conservan como acumulados. Los nueve meses anteriores no cambian.

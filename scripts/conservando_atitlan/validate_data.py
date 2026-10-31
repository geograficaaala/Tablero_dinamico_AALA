from pathlib import Path
from decimal import Decimal, InvalidOperation
import csv
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'data' / 'conservando_atitlan' / '2026'


def leer(nombre):
    with (DATA / nombre).open(encoding='utf-8-sig', newline='') as archivo:
        return list(csv.DictReader(archivo))


def exigir(condicion, mensaje):
    if not condicion:
        raise ValueError(mensaje)


def numero(fila, campo):
    valor = fila.get(campo, '')
    if valor == '':
        return None
    try:
        dato = Decimal(str(valor))
    except InvalidOperation as exc:
        raise ValueError(f"{fila.get('mes_clave', 'meta')} {campo}: valor inválido") from exc
    exigir(dato.is_finite(), f"{campo}: valor no finito")
    exigir(dato >= 0, f"{campo}: valor negativo")
    return dato


def validar():
    datos = leer('datos_mensuales.csv')
    metas = leer('metas_2026.csv')
    fuentes = leer('fuentes_mensuales.csv')
    manifest = json.loads((DATA / 'manifest.json').read_text(encoding='utf-8'))
    schema = json.loads((ROOT / 'config' / 'conservando_atitlan' / 'esquema_2026.json').read_text(encoding='utf-8'))
    exigir(bool(datos), 'No hay períodos publicados')
    periodos = [fila['mes_clave'] for fila in datos]
    exigir(len(set(periodos)) == len(periodos), 'Períodos duplicados')
    exigir(periodos == sorted(periodos), 'Períodos sin ordenar')
    exigir(periodos[0] == '2026-01', 'Falta enero 2026')
    meses = [int(fila['mes_num']) for fila in datos]
    exigir(meses == list(range(1, len(datos) + 1)), 'Existen meses faltantes o meses fuera de secuencia')
    exigir(len(datos) <= 12, 'Más de 12 meses para 2026')
    exigir(all(fila['mes_clave'] == f"2026-{int(fila['mes_num']):02d}" for fila in datos), 'Período y número de mes no coinciden')
    exigir(all(fila['anio'] == '2026' for fila in datos), 'Año incorrecto')
    exigir(all(fila['tiene_datos_mes'].lower() == 'true' for fila in datos), 'Mes sin datos declarado como disponible')
    exigir(all(fila['aporta_metas_programa'].lower() == 'true' for fila in datos), 'Período no contabilizable requiere revisión')
    marcados = [r['mes_clave'] for r in datos if r['is_latest_data_month'].lower() == 'true']
    exigir(marcados == periodos[-1:], 'El marcador de último mes debe ser único y actualizado')
    exigir(manifest['ultimo_periodo_con_datos'] == periodos[-1], 'Actualizar manifest.json cuando se agregue un mes')
    exigir(manifest['cantidad_periodos'] == len(datos), 'El número de períodos del manifiesto no coincide')
    exigir([r['mes_clave'] for r in fuentes] == periodos, 'Faltan entradas de trazabilidad por período')
    for fila in datos:
        for campo in schema['campos_numericos']:
            numero(fila, campo)
        aceite = numero(fila, 'litros_aceite_recolectados_mes')
        agua = numero(fila, 'litros_agua_protegidos_mes')
        exigir(aceite is not None and agua is not None, f"{fila['mes_clave']}: faltan cantidades de agua o aceite")
        exigir(abs(aceite * 1000 - agua) <= Decimal('0.0001'), f"{fila['mes_clave']}: agua y aceite no cumplen relación 1000:1")
        for total, a, b in [
            ('jabones_producidos_mes','jabones_hotel_producidos_mes','jabones_tocador_producidos_mes'),
            ('jabones_vendidos_mes','jabones_hotel_vendidos_mes','jabones_tocador_vendidos_mes')
        ]:
            exigir(numero(fila, total) == numero(fila, a) + numero(fila, b), f"{fila['mes_clave']}: {total} no coincide con sus componentes")
    claves = [r['clave'] for r in metas]
    exigir(len(claves) == len(set(claves)) == 18, 'Deben existir 18 metas oficiales sin duplicados')
    exigir(next((r['valor'] for r in metas if r['clave'] == 'pruebasMeses'), '') == '3|4|5', 'Revisar meses de pruebas')
    for meta in metas:
        if meta['clave'] != 'pruebasMeses':
            exigir(numero(meta, 'valor') is not None, f"Falta meta {meta['clave']}")
    return f"OK: Conservando Atitlán {len(datos)} meses, {len(metas)} metas, {len(fuentes)} fuentes; datos mensuales y relaciones aritméticas verificados."


if __name__ == '__main__':
    try:
        print(validar())
    except (ValueError, KeyError, FileNotFoundError) as error:
        print(f'ERROR: {error}', file=sys.stderr)
        sys.exit(1)

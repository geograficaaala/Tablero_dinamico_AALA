import csv
import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PERIODOS = ROOT / 'data/atitlan_recicla/2026/total_mes.csv'
CORTES = ROOT / 'data/index/2026/cortes_publicados.json'
CATALOGO = ROOT / 'config/index/indicadores_institucionales_2026.json'
METAS = ROOT / 'data/atitlan_recicla/2026/metas_anuales.json'
METAS_MENSUALES = ROOT / 'config/atitlan_recicla/metas_2026.json'
MESES = ('', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre')


def numero(value):
    return Decimal(str(value))


def porcentaje(value, goal):
    if goal <= 0:
        raise ValueError('La meta debe ser positiva')
    return float(value * 100 / goal)


def texto(value, digits=2):
    pattern = Decimal('1').scaleb(-digits)
    return f'{value.quantize(pattern, rounding=ROUND_HALF_UP):,.{digits}f}'


def crear_corte(filas, mes, metas, metas_mensuales):
    actual = next(fila for fila in filas if int(fila['mes_num']) == mes)
    anteriores = [fila for fila in filas if int(fila['mes_num']) <= mes]
    materiales = numero(actual['total_materiales_qq'])
    ingresos = numero(actual['ingreso_bruto_total'])
    diario = numero(actual['ingreso_diario_lideresa'])
    acumulado_materiales = sum((numero(fila['total_materiales_qq']) for fila in anteriores), Decimal(0))
    acumulado_ingresos = sum((numero(fila['ingreso_bruto_total']) for fila in anteriores), Decimal(0))
    meta_materiales = numero(metas['materiales_generales'])
    meta_ingresos = numero(metas['ingreso_bruto_total'])
    meta_mensual_materiales = numero(metas_mensuales['materiales_generales'])
    meta_mensual_ingresos = numero(metas_mensuales['ingreso_bruto_total'])
    meta_diario = numero(metas_mensuales['ingreso_diario_lideresa'])
    pp_materiales = porcentaje(acumulado_materiales, meta_materiales)
    pp_ingresos = porcentaje(acumulado_ingresos, meta_ingresos)
    pm_materiales = porcentaje(materiales, meta_mensual_materiales)
    pm_ingresos = porcentaje(ingresos, meta_mensual_ingresos)
    pm_diario = porcentaje(diario, meta_diario)
    mes_texto = MESES[mes]
    metrics = [
        {
            'acumDisplay': f'{texto(acumulado_materiales)} / {texto(meta_materiales, 0)} qq',
            'pct': pp_materiales,
            'pctDisplay': f'{texto(numero(pp_materiales), 1)}% de avance acumulado hasta {mes_texto} contra la meta anual',
            'barPct': pp_materiales,
            'monthlyDisplay': f'{texto(materiales)} / {texto(meta_mensual_materiales, 0)} qq en {mes_texto} · {texto(numero(pm_materiales), 1)}%',
            'monthlyPct': pm_materiales,
        },
        {
            'acumDisplay': f'Q{texto(acumulado_ingresos)} / Q{texto(meta_ingresos, 0)} GTQ',
            'pct': pp_ingresos,
            'pctDisplay': f'{texto(numero(pp_ingresos), 1)}% de avance acumulado hasta {mes_texto} contra la meta anual',
            'barPct': pp_ingresos,
            'monthlyDisplay': f'Q{texto(ingresos)} / Q{texto(meta_mensual_ingresos, 0)} GTQ en {mes_texto} · {texto(numero(pm_ingresos), 1)}%',
            'monthlyPct': pm_ingresos,
        },
        {
            'acumDisplay': f'Q{texto(diario, 1)} diarios por lideresa en {mes_texto}',
            'pct': pm_diario,
            'pctDisplay': f'{texto(numero(pm_diario), 1)}% de cumplimiento frente a la meta mensual de Q{texto(meta_diario, 0)} diarios',
            'barPct': pm_diario,
            'monthlyDisplay': f'Q{texto(diario, 1)} / Q{texto(meta_diario, 0)} diarios · {texto(numero(pm_diario), 1)}%',
            'monthlyPct': pm_diario,
        },
    ]
    return {
        'latestLabel': mes_texto.capitalize(),
        'periodKey': f'2026-{mes:02d}',
        'score': (pm_materiales + pm_ingresos + pm_diario) / 3,
        'sourceSummary': '',
        'id': 'atitlan_recicla',
        'metrics': metrics,
    }


def actualizar():
    with PERIODOS.open(newline='', encoding='utf-8') as handle:
        filas = list(csv.DictReader(handle))
    filas = [fila for fila in filas if int(fila['anio']) == 2026]
    meses = [int(fila['mes_num']) for fila in filas]
    if len(meses) != len(set(meses)) or meses != list(range(1, max(meses) + 1)):
        raise ValueError('Los cortes mensuales deben ser únicos, consecutivos y ordenados')
    catalogo = json.loads(CATALOGO.read_text(encoding='utf-8'))
    programa = next(fila for fila in catalogo if fila['id'] == 'atitlan_recicla')
    if len(programa['indicators']) != 3 or programa['indicators'][2]['label'] != 'Ingreso medio diario de Q135 por lideresa activa en comercialización.':
        raise ValueError('La definición institucional de Atitlán Recicla no coincide')
    metas = json.loads(METAS.read_text(encoding='utf-8'))
    metas_mensuales = json.loads(METAS_MENSUALES.read_text(encoding='utf-8'))
    cortes = json.loads(CORTES.read_text(encoding='utf-8'))
    for mes in sorted(set(meses)):
        if mes <= 9:
            continue
        corte = crear_corte(filas, mes, metas, metas_mensuales)
        otros_programas = [fila for fila in cortes.get(str(mes), []) if fila['id'] != 'atitlan_recicla']
        cortes[str(mes)] = [corte, *otros_programas]
    if max(meses) >= 10:
        CORTES.write_text(json.dumps(cortes, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'OK: {max(meses)} meses; cortes institucionales desde octubre generados sin alterar los meses anteriores.')


if __name__ == '__main__':
    actualizar()

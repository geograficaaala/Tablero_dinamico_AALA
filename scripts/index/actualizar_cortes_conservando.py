import csv
import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATOS = ROOT / 'data/conservando_atitlan/2026/datos_mensuales.csv'
METAS = ROOT / 'data/conservando_atitlan/2026/metas_2026.csv'
CORTES = ROOT / 'data/index/2026/cortes_publicados.json'
CATALOGO = ROOT / 'config/index/indicadores_institucionales_2026.json'
MESES = ('', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre')

def leer(nombre):
    with nombre.open(encoding='utf-8-sig', newline='') as archivo:
        return list(csv.DictReader(archivo))

def num(valor):
    return Decimal(str(valor))

def formato(valor, digitos=0):
    paso = Decimal('1').scaleb(-digitos)
    return f'{valor.quantize(paso, rounding=ROUND_HALF_UP):,.{digitos}f}'

def crear_corte(filas, mes, metas):
    vigente = next(fila for fila in filas if int(fila['mes_num']) == mes)
    previos = [fila for fila in filas if int(fila['mes_num']) <= mes]
    def suma(campo):
        return sum((num(fila[campo]) for fila in previos), Decimal('0'))
    meta_aceite = num(metas['aceiteAnual'])
    meta_agua = num(metas['aguaAnual'])
    meta_produccion = num(metas['jabonesProducidosAnual'])
    meta_ventas = num(metas['jabonesVendidosAnual'])
    valor_aceite = num(vigente['litros_aceite_recolectados_mes'])
    valor_agua = num(vigente['litros_agua_protegidos_mes'])
    valor_produccion = num(vigente['jabones_producidos_mes'])
    valor_ventas = num(vigente['jabones_vendidos_mes'])
    mensual_aceite = num(vigente['meta_aceite_mensual_mes']) if vigente.get('meta_aceite_mensual_mes') else meta_aceite / 12
    mensual_agua = num(vigente['meta_agua_mensual_mes']) if vigente.get('meta_agua_mensual_mes') else meta_agua / 12
    mensual_produccion = num(metas['jabonesProducidosMensual'])
    mensual_ventas = num(metas['jabonesVendidosMensual'])
    datos = [
        (suma('litros_aceite_recolectados_mes'), meta_aceite, valor_aceite, mensual_aceite, 'litros recolectados'),
        (suma('litros_agua_protegidos_mes'), meta_agua, valor_agua, mensual_agua, 'litros de agua protegidos'),
        (suma('jabones_producidos_mes'), meta_produccion, valor_produccion, mensual_produccion, 'jabones producidos'),
        (suma('jabones_vendidos_mes'), meta_ventas, valor_ventas, mensual_ventas, 'jabones vendidos')
    ]
    metricas = []
    rendimientos = []
    mes_texto = MESES[mes]
    for acumulado, meta_anual, actual, meta_mensual, unidad in datos:
        pct_anual = float(acumulado * 100 / meta_anual)
        pct_mes = float(actual * 100 / meta_mensual)
        rendimientos.append(pct_mes)
        metricas.append({
            'acumDisplay': f'{formato(acumulado)} / {formato(meta_anual)} {unidad}',
            'pct': pct_anual,
            'pctDisplay': f'{formato(num(pct_anual), 1)}% de avance acumulado hasta {mes_texto} contra la meta anual',
            'barPct': pct_anual,
            'monthlyDisplay': f'{formato(actual)} / {formato(meta_mensual)} {unidad} en {mes_texto} · {formato(num(pct_mes), 1)}%',
            'monthlyPct': pct_mes
        })
    return {
        'latestLabel': mes_texto.capitalize(),
        'periodKey': f'2026-{mes:02d}',
        'score': sum(rendimientos) / 4,
        'sourceSummary': '',
        'id': 'conservando_atitlan',
        'metrics': metricas
    }

def actualizar():
    filas = leer(DATOS)
    metas = {fila['clave']: fila['valor'] for fila in leer(METAS)}
    meses = [int(fila['mes_num']) for fila in filas]
    if meses != list(range(1, max(meses) + 1)):
        raise ValueError('Períodos de Conservando Atitlán incompletos o desordenados')
    catalogo = json.loads(CATALOGO.read_text(encoding='utf-8'))
    descriptor = next(item for item in catalogo if item['id'] == 'conservando_atitlan')
    if len(descriptor['indicators']) != 4 or descriptor['indicators'][0]['label'] != 'Recolección de 80,000 litros de aceite usado de cocina.':
        raise ValueError('La definición institucional de Conservando Atitlán ha cambiado')
    posicion = {item['id']: index for index, item in enumerate(catalogo)}
    cortes = json.loads(CORTES.read_text(encoding='utf-8'))
    for mes in meses:
        if mes <= 9:
            continue
        corte = crear_corte(filas, mes, metas)
        otras = [item for item in cortes.get(str(mes), []) if item['id'] != 'conservando_atitlan']
        cortes[str(mes)] = sorted([*otras, corte], key=lambda item: posicion[item['id']])
    CORTES.write_text(json.dumps(cortes, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'OK: Conservando Atitlán actualizado hasta {MESES[max(meses)]}, con los cortes históricos intactos.')

if __name__ == '__main__':
    actualizar()

from pathlib import Path
import csv
import json
import math

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'data/reforestacion/2026'
REFERENCE = ROOT / 'references/reforestacion/paridad_2026.json'

def read_csv(name):
    with (DATA / name).open(encoding='utf-8', newline='') as stream:
        return list(csv.DictReader(stream))

def similar(actual, expected):
    if isinstance(expected, float):
        try:
            return math.isclose(float(actual), expected, rel_tol=1e-11, abs_tol=1e-8)
        except (TypeError, ValueError):
            return False
    if isinstance(expected, int):
        try:
            return math.isclose(float(actual), expected, rel_tol=0, abs_tol=1e-9)
        except (TypeError, ValueError):
            return False
    if isinstance(expected, list):
        try:
            return json.loads(actual) == expected
        except (TypeError, ValueError):
            return False
    return str(actual) == str(expected)

def compare(actual_rows, reference_rows, key, editorial=()):
    by_key = {key(row): row for row in actual_rows}
    assert len(by_key) == len(actual_rows), 'Hay registros duplicados'
    for expected in reference_rows:
        label = key(expected)
        assert label in by_key, f'Falta registro {label}'
        actual = by_key[label]
        for field, original in expected.items():
            if field in editorial:
                continue
            assert field in actual, f'Falta campo {label}.{field}'
            assert similar(actual[field], original), f'Diferencia {label}.{field}: {actual[field]!r} != {original!r}'
    return len(reference_rows)

def main():
    source = json.loads(REFERENCE.read_text(encoding='utf-8'))
    total = read_csv('total_mes_2026.csv')
    extra = read_csv('actividades_complementarias_2026.csv')
    metas = read_csv('metas_referencia_2026.csv')
    origin = read_csv('procedencia_2026.csv')
    survival = read_csv('supervivencia_2026.csv')
    assert all(row['periodo_clave'].startswith('2026-') for row in total)
    assert all(int(row['mes_num']) in range(1, 13) for row in total)
    primary = compare(total, source['effective'], lambda r: r['periodo_clave'], {'logros_texto', 'alertas_texto', 'fuente_texto', 'estatus_reporte', 'is_latest_data_month', 'pct_meta_arboles'})
    more = compare(extra, source['complementary'], lambda r: (r['periodo_clave'], r['kpi_id']), {'fuente'})
    months = {r['periodo_clave'] for r in total}
    assert months.issubset({f'2026-{x:02}' for x in range(1, 13)})
    assert len({r['periodo_clave'] for r in metas}) == len(metas)
    assert len({r['periodo_clave'] for r in origin}) == len(origin)
    assert len({r['periodo_clave'] for r in survival}) == len(survival)
    assert all(r['periodo_clave'] in months for r in metas + origin + survival)
    assert len(total) == 9 and primary == 9
    assert len(extra) == 81 and more == 81
    assert all(math.isclose(float(r['pct_meta_arboles']), float(r['arboles_sembrados_acum']) / 90000, rel_tol=0, abs_tol=1e-10) for r in total)
    assert all(float(r['meta_arboles']) == 90000 for r in total)
    assert all(float(r['arboles_meta_anual']) == 90000 for r in metas)
    institutional = read_csv('indicadores_institucionales_2026.csv')
    trees = [r for r in institutional if r['subindicador_id'] == 'arboles_sembrados']
    assert len(trees) == 9
    assert all(float(r['meta_anual']) == 90000 for r in trees)
    assert all(math.isclose(float(r['pct_meta_anual']), float(r['valor_acumulado']) / 90000, rel_tol=0, abs_tol=1e-10) for r in trees)
    assert all(int(float(r['valor_acumulado'])) == int(float(next(t for t in total if t['periodo_clave'] == r['periodo_clave'])['arboles_sembrados_acum'])) for r in trees)
    assert len(institutional) == 54
    assert all(r['aprobado_para_publicacion'] == 'true' for r in origin)
    assert {r['periodo_clave'] for r in origin} == months
    assert all('estimaci' not in r['tipo_fuente'].lower() for r in origin)
    assert sum(r['is_latest_data_month'] == 'True' for r in total) == 1
    assert next(r for r in total if r['is_latest_data_month'] == 'True')['periodo_clave'] == '2026-09'
    catalog = read_csv('catalogo_indicadores_2026.csv')
    periods = read_csv('periodos_2026.csv')
    assert len(catalog) == 13 and len({r['indicador_id'] for r in catalog}) == 13
    assert len(periods) == 12 and sum(r['publicado'] == 'true' for r in periods) == 9
    assert all(r['publicado'] == 'false' for r in periods[9:])
    contract = json.loads((ROOT / 'config/reforestacion/contrato_datos_2026.json').read_text(encoding='utf-8'))
    assert contract['estado_datos'] == 'aprobados_para_publicacion'
    assert len(contract['tablas']) == 9
    assert all(r['estatus_reporte'] == 'Datos aprobados para publicación' for r in total[-3:])
    assert next(r for r in survival if r['periodo_clave'] == '2026-09')['porcentaje_mostrado'] == '68'
    assert next(r for r in total if r['periodo_clave'] == '2026-09')['arboles_sembrados_acum'] == '35000'
    print(f'OK: {primary} meses, {more} KPI complementarios, 54 indicadores institucionales, 13 definiciones y 12 períodos; cifras conservadas salvo meta y porcentajes de árboles actualizados a 90,000.')

if __name__ == '__main__':
    main()

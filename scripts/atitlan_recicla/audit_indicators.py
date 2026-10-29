#!/usr/bin/env python3
"""Report divergent same-name metrics without modifying source values."""
import csv
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
SRC=json.loads((ROOT/'references/atitlan_recicla/fuente_vigente_2026.json').read_text(encoding='utf-8'))
COMPARE={
    'materiales_generales':'total_materiales_qq',
    'pet':'pet_qq',
    'vidrio':'vidrio_total_qq',
    'ingreso_bruto_total':'ingreso_bruto_total',
    'ingreso_bruto_mujeres':'ingreso_bruto_lideresas',
    'ingreso_bruto_municipalidades':'ingreso_bruto_municipalidad',
}

index={(x['anio'],x['mes_num']):x for x in SRC['totalMes']}
issues=[]
for record in SRC['indicadores']:
    field=COMPARE.get(record['indicador_id'])
    if not field:continue
    total=index.get((record['anio'],record['mes_num']))
    if not total or total.get(field) is None: continue
    published=float(record['valor'])
    alternate=float(total[field])
    if abs(published-alternate)>0.01:
        issues.append(dict(anio=record['anio'],mes_num=record['mes_num'],indicador_id=record['indicador_id'],valor_indicadores=published,valor_total_mes=alternate,diferencia=round(published-alternate,5),estado='REVISAR SEMANTICA (p. ej. bruto vs neto)'))

path=ROOT/'references/atitlan_recicla/discrepancias_entre_tablas.csv'
with path.open('w',newline='',encoding='utf-8') as f:
    writer=csv.DictWriter(f,fieldnames=['anio','mes_num','indicador_id','valor_indicadores','valor_total_mes','diferencia','estado'])
    writer.writeheader()
    writer.writerows(issues)
print(f'{len(issues)} divergencias inter-tablas registradas en {path.relative_to(ROOT)}; sin cambiar cifras.')

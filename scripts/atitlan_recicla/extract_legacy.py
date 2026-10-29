#!/usr/bin/env python3
"""Extract the Atitlán Recicla baseline without executing legacy JavaScript.

Usage: python scripts/atitlan_recicla/extract_legacy.py --legacy-html /path/to/index_atitlanrecicla.html

This is a one-off bootstrap/verification utility. Future updates should read the
source sheets through a separate ETL; never run the old HTML to publish data.
"""
import argparse
import csv
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'data' / 'atitlan_recicla' / '2026'
REF = ROOT / 'references' / 'atitlan_recicla'
TABLES = {
    'indicadores': 'indicadores.csv',
    'totalMes': 'total_mes.csv',
    'zonaMes': 'zona_mes.csv',
    'territorioMes': 'territorio_mes.csv',
    'materialesResumen': 'materiales_resumen.csv',
    'materialesRaw': 'materiales_detalle.csv',
}

class Scripts(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.current = None
        self.parts = []
        self.scripts = []
    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.current = dict(attrs).get('id', '')
            self.parts = []
    def handle_data(self, data):
        if self.current is not None:
            self.parts.append(data)
    def handle_endtag(self, tag):
        if tag == 'script' and self.current is not None:
            self.scripts.append((self.current, ''.join(self.parts)))
            self.current = None

def json_assignment(script, marker):
    matches = list(re.finditer(r'(?<![\w.])'+re.escape(marker)+r'\s*=\s*', script))
    if len(matches) != 1:
        raise ValueError(f'Expected exactly one assignment of {marker}, found {len(matches)}')
    raw = script[matches[0].end():].lstrip()
    obj, _ = json.JSONDecoder().raw_decode(raw)
    return obj

def require_tag(scripts, script_id):
    matching = [t for ident, t in scripts if ident == script_id]
    if len(matching) != 1:
        raise ValueError(f'Expected one script with id={script_id}, found {len(matching)}')
    return matching[0]

def dump_json(path, value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2,allow_nan=False)+'\n',encoding='utf-8')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--legacy-html',type=Path,required=True)
    a=parser.parse_args()
    text=a.legacy_html.read_text(encoding='utf-8')
    parser_html=Scripts()
    parser_html.feed(text)
    scripts=parser_html.scripts
    if len(scripts)<10:
        raise ValueError('HTML version unexpectedly lacks expected patches')

    authoritative=require_tag(scripts,'aala-excel-truth-ene-may-2026')
    data=json_assignment(authoritative,'AALA_EXCEL_DATA')
    precalc=json_assignment(authoritative,'AALA_EXCEL_PRECALC')
    goals=json_assignment(authoritative,'AALA_EXCEL_ANNUAL_GOALS')
    surusic=json_assignment(authoritative,'AALA_SURUSIC_MONTHLY_EXCEL')
    impact=json_assignment(require_tag(scripts,'aala-impacto-municipios-zonas-cdm-mayo5-2026'), 'AALA_IMPACT_PRECALC_CDM_MAYO5')
    prior=json_assignment(require_tag(scripts,'aala-quirurgico-atitlan-2026'), 'window.ATITLAN_PRECALC')
    may_patch=json_assignment(require_tag(scripts,'aala-excel-mayo-2026-exacto'), 'MAY_TOTAL')
    impact_may_patch=json_assignment(require_tag(scripts,'aala-atitlan-precalc-mayo-2026-patch'), 'MAYO_2026_PRECALC_PATCH')
    preload=json_assignment(scripts[0][1], 'PRELOADED_CSV')

    if set(data) != set(TABLES):
        raise ValueError(f'Unexpected source tables: {list(data)}')
    months={(r['anio'],r['mes_num']) for r in data['totalMes']}
    if months != {(2026,m) for m in range(1,10)}:
        raise ValueError('Expected authoritative months: Jan-Sep 2026; review updated HTML parser')

    dump_json(REF/'fuente_vigente_2026.json',data)
    dump_json(DATA/'precalculo_general.json',precalc)
    dump_json(DATA/'precalculo_impacto_final.json',impact)
    dump_json(DATA/'metas_anuales.json',goals)
    dump_json(DATA/'surusic_mensual.json',surusic)
    dump_json(REF/'precalculo_anterior_2026.json',prior)
    dump_json(REF/'parche_mayo_2026.json',may_patch)
    dump_json(REF/'parche_impacto_mayo_2026.json',impact_may_patch)

    for old_path,contents in preload.items():
        filename=Path(old_path).name
        (REF/'precarga_antigua').mkdir(exist_ok=True,parents=True)
        (REF/'precarga_antigua'/filename).write_text(contents,encoding='utf-8')

    details={}
    for source_name, filename in TABLES.items():
        rows=data[source_name]
        if not rows or not all(isinstance(row,dict) for row in rows):
            raise ValueError(f'Invalid table: {source_name}')
        columns=list(dict.fromkeys(key for row in rows for key in row))
        path=DATA/filename
        with path.open('w',newline='',encoding='utf-8') as fh:
            writer=csv.DictWriter(fh,fieldnames=columns,extrasaction='raise',lineterminator='\n')
            writer.writeheader()
            writer.writerows(rows)
        details[source_name]={'file':str(path.relative_to(ROOT)),'rows':len(rows), 'columns':columns, 'sha256':sha(path)}

    manifest={
        'programa':'atitlan_recicla',
        'corte':'2026-09',
        'fuente':'Datos incrustados en HTML, identificador aala-excel-truth-ene-may-2026',
        'origen_declarado_en_html':'CDM 2026 - REVISADO Y ACTUALIZADO.xlsx',
        'fuente_html_sha256':hashlib.sha256(a.legacy_html.read_bytes()).hexdigest(),
        'regla_de_precedencia':'AALA_EXCEL_DATA (última carga); AALA_IMPACT_PRECALC_CDM_MAYO5 (último parche de impacto)',
        'advertencia':'Esto fija los datos originales, no certifica todavía paridad visual ni cálculos dinámicos.',
        'tablas':details,
        'referencia_sha256':sha(REF/'fuente_vigente_2026.json'),
        'precalculo_impacto_sha256':sha(DATA/'precalculo_impacto_final.json'),
    }
    dump_json(DATA/'manifest.json',manifest)
    print(f'Datos recuperados de {a.legacy_html.name}; periodos ENE-SEP 2026.')
    for k,v in details.items():
        print(f'{k:20} {v["rows"]:>5} filas, {len(v["columns"]):>3} columnas')
    print('Baselines antiguos conservados, sin mezclarlos con datos vigentes.')

if __name__=='__main__':
    main()

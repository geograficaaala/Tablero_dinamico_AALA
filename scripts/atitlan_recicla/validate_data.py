import csv,hashlib,json,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
DATA=ROOT/'data/atitlan_recicla/2026'
BASE=ROOT/'references/atitlan_recicla/fuente_vigente_2026.json'
OCT=ROOT/'references/atitlan_recicla/octubre_2026_fuente.json'
NAMES={'indicadores':'indicadores.csv','totalMes':'total_mes.csv','zonaMes':'zona_mes.csv','territorioMes':'territorio_mes.csv','materialesResumen':'materiales_resumen.csv','materialesRaw':'materiales_detalle.csv'}
def close(x,y):return math.isclose(float(x),float(y),rel_tol=1e-10,abs_tol=1e-7)
def verify():
 manifest=json.loads((DATA/'manifest.json').read_text(encoding='utf8'))
 baseline=json.loads(BASE.read_text(encoding='utf8'))
 reference=json.loads(OCT.read_text(encoding='utf8'))
 assert manifest['corte']=='2026-10'
 assert hashlib.sha256(BASE.read_bytes()).hexdigest()==manifest['referencia_sha256']
 assert hashlib.sha256(OCT.read_bytes()).hexdigest()==manifest['control_octubre_sha256']
 total=0
 for logical,filename in NAMES.items():
  spec=manifest['tablas'][logical]
  path=DATA/filename
  assert hashlib.sha256(path.read_bytes()).hexdigest()==spec['sha256'],filename
  with path.open(encoding='utf8',newline='') as fh: rows=list(csv.DictReader(fh))
  assert len(rows)==spec['rows'] and list(rows[0])==spec['columns'],filename
  prior=[r for r in rows if int(r['mes_num'])<=9]
  assert len(prior)==len(baseline[logical]),filename
  for old,new in zip(baseline[logical],prior):
   for col in spec['columns']:
    assert new[col]==('' if old.get(col) is None else str(old.get(col))),f'{filename}: histórico modificado {col}'
  october=[r for r in rows if int(r['mes_num'])==10]
  expected={'totalMes':1,'zonaMes':4,'territorioMes':15,'indicadores':10,'materialesResumen':3,'materialesRaw':12}[logical]
  assert len(october)==expected,(filename,len(october),expected)
  total+=len(rows)
 with (DATA/'total_mes.csv').open(encoding='utf8',newline='') as fh:
  t=next(x for x in csv.DictReader(fh) if x['mes_num']=='10')
 for field,cell in [('total_materiales_qq',14),('pet_qq',27),('vidrio_total_qq',35),('ingreso_bruto_total',22),('ingreso_bruto_lideresas',15),('ingreso_bruto_municipalidad',19),('pct_participacion_actividades',43),('pct_participacion_comercializacion',44)]:
  assert close(t[field],reference['Agre_TOTAL'][str(cell)]),(field,t[field],reference['Agre_TOTAL'][str(cell)])
 with (DATA/'zona_mes.csv').open(encoding='utf8',newline='') as fh: zones=[x for x in csv.DictReader(fh) if x['mes_num']=='10']
 for field in ('total_materiales_qq','pet_qq','vidrio_total_qq','ingreso_bruto_total','ingreso_bruto_lideresas','ingreso_bruto_municipalidad'):
  assert close(sum(float(r[field]) for r in zones),float(t[field])),('sum zonas',field)
 impact=json.loads((DATA/'precalculo_impacto_final.json').read_text(encoding='utf8'))
 assert hashlib.sha256((DATA/'precalculo_impacto_final.json').read_bytes()).hexdigest()==manifest['precalculo_impacto_sha256']
 assert all('2026|10' in part for part in impact['byZone'].values())
 assert all('2026|10' in part for part in impact['byMunicipio'].values())
 surusic=json.loads((DATA/'surusic_mensual.json').read_text(encoding='utf8'))
 assert close(surusic['10']['ventas'],reference['Agre_TOTAL']['60'])
 assert close(surusic['10']['unidades'],reference['Agre_TOTAL']['61'])
 print(f'OK: octubre 2026, 6 tablas, {total} registros; enero-septiembre intactos y 4 zonas/15 municipios con datos.')
if __name__=='__main__':verify()

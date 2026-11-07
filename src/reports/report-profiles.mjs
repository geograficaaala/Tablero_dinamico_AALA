export const REPORT_PROFILES = {
  atitlan_recicla: {
    slug: 'atitlan-recicla.html', file: 'data/atitlan_recicla/2026/total_mes.csv',
    periodField: 'mes_num', filter: { zona: 'TOTAL' },
    introduction: 'El programa reúne los resultados de recolección y comercialización de materiales reciclables, así como la participación económica de lideresas en las zonas de atención. Se presentan de forma diferenciada los indicadores institucionales y los resultados operativos.',
    extras: [
      ['PET recolectado', 'pet_qq', 'qq', 'Permite examinar la contribución del PET al volumen mensual de materiales reciclables.'],
      ['Vidrio recolectado', 'vidrio_total_qq', 'qq', 'Identifica el peso reportado de vidrio y su participación dentro de la operación.'],
      ['Materiales gestionados por lideresas', 'materiales_lideresas_qq', 'qq', 'Distingue la recolección realizada mediante la participación de lideresas.'],
      ['Materiales gestionados por municipalidades', 'materiales_municipalidad_qq', 'qq', 'Permite diferenciar el canal municipal del total de materiales.'],
      ['Mujeres activas', 'mujeres_activas', 'mujeres', 'Registra el alcance de participación activa durante el período.'],
      ['Mujeres participantes en actividades', 'mujeres_actividades', 'mujeres', 'Refleja el número de participantes en las actividades del programa.'],
      ['Mujeres participantes en comercialización', 'mujeres_comercializacion', 'mujeres', 'Corresponde a la participación en comercialización de acuerdo con el registro mensual.'],
      ['Ingreso bruto de lideresas', 'ingreso_bruto_lideresas', 'GTQ', 'Diferencia la comercialización de las lideresas del ingreso bruto total institucional.'],
      ['Ingreso bruto municipal', 'ingreso_bruto_municipalidad', 'GTQ', 'Expone la contribución económica de la gestión municipal.'],
      ['Ingreso neto de lideresas', 'ingreso_neto_lideresas', 'GTQ', 'Se mantiene separado del ingreso bruto y del promedio diario por lideresa.'],
      ['Horas trabajadas', 'horas_trabajadas_lideresas', 'horas', 'Permite interpretar la intensidad de trabajo registrada en el mes.'],
      ['Gastos de transporte', 'gasto_transporte', 'GTQ', 'Registra el gasto operativo identificado en el consolidado.']
    ],
    details: [{file:'data/atitlan_recicla/2026/territorio_mes.csv', type:'table', title:'Desglose territorial por municipio y zona', fields:[['municipio','Municipio'],['zona','Zona'],['total_materiales_qq','Materiales (qq)'],['ingreso_bruto_total','Ingreso bruto (Q)']], periodField:'mes_num'}]
  },
  conservando_atitlan: {
    slug:'conservando-atitlan.html',file:'data/conservando_atitlan/2026/datos_mensuales.csv',periodField:'mes_clave',
    introduction:'La evaluación comprende la recolección de aceite usado de cocina, la protección de agua y la cadena de producción y venta de jabones ATI’T. El seguimiento incorpora el alcance municipal y el desglose de producción y comercialización.',
    extras:[
      ['Municipios visitados', 'municipios_visitados_mes', 'municipios', 'Mide la cobertura territorial de las jornadas de recolección.'],
      ['Establecimientos que entregaron aceite', 'inmuebles_atendidos_mes', 'establecimientos', 'Distingue las entregas efectivas dentro del programa.'],
      ['Jornadas de recolección', 'jornadas_recoleccion_ciclo_mes', 'jornadas', 'Registra la operación de recolección del período.'],
      ['Jabones de hotel producidos', 'jabones_hotel_producidos_mes', 'jabones', 'Desglosa la elaboración de jabones para uso hotelero.'],
      ['Jabones de tocador producidos', 'jabones_tocador_producidos_mes', 'jabones', 'Desglosa la elaboración de jabones de tocador.'],
      ['Jabones de hotel vendidos', 'jabones_hotel_vendidos_mes', 'jabones', 'Contribuye a interpretar el resultado comercial de los jabones.'],
      ['Jabones de tocador vendidos', 'jabones_tocador_vendidos_mes', 'jabones', 'Permite identificar las ventas de esta presentación de jabón.'],
      ['Ingresos por venta de jabones', 'ingresos_ventas_q_mes', 'GTQ', 'Se informa de forma diferenciada respecto de la cantidad de unidades comercializadas.'],
      ['Velas vendidas', 'velas_vendidas_mes', 'velas', 'Registro complementario de la línea productiva del programa.'],
      ['Ingresos por venta de velas', 'ingresos_ventas_velas_q_mes', 'GTQ', 'Registro complementario de ingresos que no sustituye el KPI de venta de jabones.'],
      ['Publicaciones en redes sociales', 'publicaciones_redes_mes', 'publicaciones', 'Refleja la actividad de sensibilización y comunicación del período.'],
      ['Pruebas de jabón líquido', 'pruebas_jabon_liquido_mes', 'pruebas', 'Permite dar continuidad al desarrollo de nuevos productos.']
    ],
    details:[{file:'data/conservando_atitlan/2026/recoleccion_municipios_2026.csv',type:'table',title:'Recolección municipal de aceite',periodField:'mes_clave',fields:[['municipio','Municipio'],['litros_reportados','Litros reportados'],['inmuebles_con_entrega','Establecimientos con entrega']]}]
  },
  educando_para_conservar: {
    slug:'educando-para-conservar.html',file:'data/educando_para_conservar/2026/total_mes.csv',periodField:'periodo_clave',
    introduction:'El informe articula la continuidad de los módulos pedagógicos, la participación estudiantil, el diplomado juvenil y las actividades prácticas en campo. Los logros de educación ambiental se desarrollan sin alterar los cuatro indicadores institucionales.',
    extras:[
      ['Actividades de campo', 'actividades_campo_mes', 'actividades', 'Integra los diferentes tipos de trabajo práctico en el territorio.'],
      ['Participantes en actividades de campo', 'estudiantes_actividades_campo_mes', 'estudiantes', 'Permite identificar el alcance de participación estudiantil.'],
      ['Campañas de reforestación', 'act_reforestacion_mes', 'campañas', 'Registra las jornadas vinculadas con prácticas de reforestación.'],
      ['Monitoreos de áreas reforestadas', 'act_monitoreo_reforestadas_mes', 'monitoreos', 'Da seguimiento a los espacios reforestados mediante actividades educativas.'],
      ['Jornadas de tul', 'act_tul_mes', 'jornadas', 'Mide la participación del programa en acciones de restauración ribereña.'],
      ['Ferias ambientales', 'act_ferias_mes', 'ferias', 'Incluye las ferias registradas en el mes de corte correspondiente.'],
      ['Giras educativas', 'act_giras_mes', 'giras', 'Mide las visitas de aprendizaje y reconocimiento ambiental.'],
      ['Campañas de limpieza', 'act_limpiezas_mes', 'campañas', 'Identifica actividades de recolección y sensibilización sobre residuos.'],
      ['Propuestas juveniles', 'propuestas_juveniles_mes', 'propuestas', 'Registra las iniciativas presentadas por los grupos del diplomado.'],
      ['Capitales semilla entregados', 'capitales_semilla_mes', 'capitales semilla', 'Da seguimiento a los proyectos ganadores que recibieron este apoyo.'],
      ['Docentes capacitados', 'docentes_mes', 'docentes', 'Se informa sin sustituir el KPI institucional de módulos pedagógicos.'],
      ['Estudiantes atendidos por EPC', 'estudiantes_epc_mes', 'estudiantes', 'Corresponde a la cobertura pedagógica del período.']
    ],
    details:[{file:'data/educando_para_conservar/2026/actividades_detalle_2026.csv',type:'table',title:'Actividades educativas documentadas',periodField:'periodo_clave',fields:[['fecha','Fecha'],['tipo_actividad','Tipo de actividad'],['municipio_lugar','Lugar'],['descripcion','Descripción']]}],
    narrativeField:'logros_texto'
  },
  fortalecimiento_municipal: {
    slug:'fortalecimiento-municipal.html',file:'data/fortalecimiento_municipal/2026/indicadores_publicados_2026.csv',periodField:'periodo',
    introduction:'El programa acompaña la capacidad instalada de las municipalidades, los estudios de caracterización, los planes PIRDES y la asistencia técnica. Las actividades de seguimiento se examinan por componente y por estado administrativo, sin convertir automáticamente cada actividad en un resultado institucional finalizado.',
    extras:[
      ['Municipalidades con capacidad instalada', 'capacidad', 'municipalidades', 'Se utiliza el registro publicado de capacidad municipal.'],
      ['Estudios finalizados', 'estudios', 'estudios', 'Se utiliza el valor institucional de estudios finalizados.'],
      ['PIRDES implementados', 'pirdes', 'planes', 'Se conserva el conteo institucional de planes implementados.'],
      ['Asistencias técnicas acumuladas', 'asistencias', 'asistencias', 'Da continuidad al indicador institucional de asistencia municipal.'],
      ['Reuniones CODEMA acumuladas', 'reuniones', 'reuniones', 'Seguimiento complementario de reuniones bajo su propia definición.']
    ],
    details:[{file:'data/fortalecimiento_municipal/2026/actividades_2026.csv',type:'table',title:'Actividades y seguimientos municipales del mes',periodField:'periodo',fields:[['fecha','Fecha'],['componente','Componente'],['municipio','Municipio'],['actividad','Actividad'],['etiqueta_estado','Estado']]}],
    monthlyActivitySummary:true
  },
  reforestacion: {
    slug:'reforestando-atitlan.html',file:'data/reforestacion/2026/total_mes_2026.csv',periodField:'periodo_clave',
    introduction:'La lectura integra el monitoreo de superficies reforestadas, la siembra de árboles, la consolidación de la unidad SIG y la producción de plantas de vivero. El componente complementario documenta las líneas de seguimiento cartográfico, plataformas, capas e intervenciones operativas.',
    extras:[
      ['Hectáreas monitoreadas en el mes', 'ha_monitoreadas_kpi_mes', 'ha', 'Permite diferenciar la intervención mensual de la superficie acumulada.'],
      ['Árboles sembrados en el mes', 'arboles_sembrados_kpi_mes', 'árboles', 'Corresponde a la contribución del período a la meta anual de siembra.'],
      ['Plantas producidas en el mes', 'plantas_netas_mes', 'plantas', 'Mide el avance operativo mensual del vivero.'],
      ['Especies nativas acumuladas', 'especies_acumuladas_proxy', 'especies', 'Acompaña la medición de plantas sin sustituir el indicador institucional del vivero.'],
      ['Eventos de monitoreo', 'eventos_monitoreo_mes', 'eventos', 'Registra las actividades de observación de áreas reforestadas.'],
      ['Eventos cartográficos', 'eventos_cartografia_mes', 'eventos', 'Mide el trabajo de seguimiento del componente cartográfico.'],
      ['Hitos SIG del mes', 'hitos_sig_logrados_mes', 'hitos', 'Registra avances del componente de información geográfica.'],
      ['Supervivencia promedio registrada', 'supervivencia_promedio', 'proporción', 'Aporta un seguimiento adicional sobre los árboles monitoreados.']
    ],
    details:[{file:'data/reforestacion/2026/actividades_complementarias_2026.csv',type:'maps',title:'Productos cartográficos, actividades y seguimiento',periodField:'periodo_clave',fields:[['componente','Componente'],['kpi_nombre','Línea de seguimiento'],['detalle_render','Detalle']]}],
    narrativeField:'logros_texto'
  },
  manejo_tul: {
    slug:'tul.html',file:'data/tul/2026/resultados_mensuales_2026.csv',periodField:'mes',
    introduction:'El programa se evalúa mediante las jornadas anuales de siembra y mantenimiento y los metros lineales establecidos a lo largo de las orillas del lago. Se integran los resultados de macollas, sitios de intervención, mantenimiento y cartografía como seguimiento complementario.',
    extras:[
      ['Jornadas realizadas', 'jornadas', 'jornadas', 'Permite apreciar el número de jornadas ejecutadas en el período y su acumulado.'],
      ['Metros lineales sembrados', 'metros', 'metros', 'Da continuidad al acumulado de longitud intervenida.'],
      ['Macollas establecidas', 'macollas', 'macollas', 'Complementa la extensión lineal con el número de macollas registrado.'],
      ['Mantenimiento de tul', 'mantenimiento', 'actuaciones', 'Registra las actividades de mantenimiento acumuladas.'],
      ['Mapas de seguimiento', 'mapas', 'mapas', 'Permite identificar productos de apoyo territorial.'],
      ['Capas geográficas', 'capas', 'capas', 'Registra información geográfica disponible para el seguimiento de intervenciones.'],
      ['Sitios intervenidos', 'sitios', 'sitios', 'Refleja la distribución de las actividades en espacios ribereños.'],
      ['Municipios con cobertura', 'municipios', 'municipios', 'Describe el alcance territorial acumulado de las jornadas.']
    ],
    details:[{file:'data/tul/2026/jornadas_2026.csv',type:'table',title:'Jornadas registradas en el período',periodField:'mes',fields:[['fecha','Fecha'],['municipio','Municipio'],['sitio','Sitio'],['actividad','Actividad']]} , {file:'data/tul/2026/analisis_detalles_2026.csv',type:'bullets',title:'Lectura operativa de las jornadas',periodField:'mes',fields:[['categoria','Categoría'],['detalle','Descripción']]}]
  }
};

export const PROGRAM_IDS = Object.keys(REPORT_PROFILES);

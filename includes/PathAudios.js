//Path Audios, aqui se registran los audios a reprodicir, si desea cambiar alguno, guarde el audio en la ruta correspondiente y cambie el nombre aqui del audio qeu desea 
var RepAudios = {}; //configuraciones generales
RepAudios.audio_a_operadora = "Transfiere_operador";// => "En un momento usted recibirá atención personalizada";
RepAudios.audio_cancelar_book ="Si_desea_cancelar";//.wav // =>"  Si desea cancelar el servicio, por favor presione uno, si desea consultar a la operadora presione 2, en caso contrario de volver a consultar el estatus de su solicitud presione 3 ";
RepAudios.audio_cancelar_book_false="Si_desea_consultar_operadora";//.wav => " Si desea consultar a la operadora presione 2, en caso contrario de volver a consultar el estatus de su solicitud presione 3 ";
RepAudios.cancelar_dispatcher="Si_desea_cancelar";//.wav => "  Si desea cancelar el servicio, por favor presione uno, si desea consultar a la operadora presione dos, en caso contrario presione tres para volver a escuchar el estatus de la solicitud";
RepAudios.cancelar_dispatcher_false="Si_desea_consultar_operadora";//.wav => " Si desea consultar a la operadora presione dos, en caso contrario presione tres para volver a escuchar el estatus de la solicitud";
RepAudios.llamada_conductor="Llamar_conductor";//.wav => " Presione 0 si desea llamar al conductor, ";
RepAudios.despedida="Despedida";//wav => " Gracias por usar nuestro servicio.";
RepAudios.audioError2="Respuesta_incorrecta";//.wav => " Respuesta incorrecta, intente de nuevo.";
RepAudios.exitoso="Solicitud_exitosa";//.wav => " Su solicitud fue procesado con exito.";
RepAudios.exitoso_cancel="Solicitud_exitosa";//.wav => " Su solicitud fue procesado con exito.";
RepAudios.exitoso_peticion="Solicitud_recibida" //cuando el usuairo el seleccciona la direccion
RepAudios.bienvenida="Bienvenido5";//"Bienvenido5";//.wav => "Bienvenido.";
RepAudios.bienvenidaMulti="Bienvenido_ud_esta";//.wav => " Bievenido, usted esta en: ";
RepAudios.Solicitud_pendiente="Solicitud_pendiente";//"Disculpe las molestias, pero su solicitud, aún esta pendiente por ser despachada.";
RepAudios.El_despacho="El_despacho";//.wav => "el despacho";
RepAudios.Servicio_cancelado="Servicio_cancelado";//.wav => "Usted ha cancelado un servicio, Por favor seleccione que desea hacer: opción uno, realizar otro pedido. Opción dos, ir a la operadora.";
RepAudios.Servicios_pendientes="Servicios_pendientes";//.wav => "Usted tiene varios pedidos pendientes, por favor seleccione que desea hacer: opción uno, realizar otro pedido. Opción dos, ir a la operadora.";
RepAudios.Servicio_en_progreso="Servicio_en_progreso";//.wav => "Usted tiene un servicio en progreso, si desea hablar con el operador marque 2";
RepAudios.A_nombre_de="A_nombre_de";//.wav => "a nombre de";
RepAudios.Asignado_exito="Asignado_exito";//"ha sido asignado con exito";

RepAudios.Escoja_direccion="Escoja_direccion5";//.wav => " va antes de indicar el número total de direcciones..Por favor indique a que dirección desea realizar el despacho;

RepAudios.Escoja_direccionParte2="Escoja_direccion_2";//.Opcional => "va despues de indicar el número total de direcciones es opcional... Por favor indique a que dirección desea realizar el despacho";

RepAudios.Escoja_direccion_unica="sudireccion1";//"Escoja_direccion_unica";//su dirección es:

RepAudios.Direccion="Direccion";//.wav => "Dirección";
RepAudios.El_despacho="El_despacho";//.wav => "el despacho,";
RepAudios.Placa_vehiculo="Placa_vehiculo";//.wav => "Vehículo con placa";
RepAudios.ETA="ETA";//.wav => "Tiempo estimado de llegada es de";
RepAudios.Minutos="Minutos";//.wav => "minutos";
RepAudios.Codigo="Codigo";//.wav => "su código es";
RepAudios.Contactar_operadora="Contactar_operadora3";//.wav => "si desea contactar a la operadora presione cero";
RepAudios.Contactar_operadora_unica="Contactar_operadora";// marque 1 para realizar el despacho a esta direccion y 0 para operadora
RepAudios.Opcion="Opcion";//.wav => "opcion";
RepAudios.Operadora="Operadora";//.wav => "operadora";
RepAudios.Seleccione_una="Seleccione_una";//.wav => "seleccione una";
RepAudios.SinVehiculos="No_hay_moviles";
RepAudios.SinVehiculosBooked="Booked_no_moviles"; //no hay moviles disponibles intente mas tarde.
RepAudios.Espere_movil="No_hay_moviles";//"Espere_movil";//
RepAudios.Menu_segunda_llamada="Menu_segunda_llamada";// 
RepAudios.Menu_no_direccion="Menu_no_direccion";// para un servicio automatico marque 1
RepAudios.direccion_incorrecta="Direccion_incorrecta";// direccion incorrecta //este audio no se puede cambiar el nombre
RepAudios.SinVehiculosBookedReinicio="No_hay_moviles_reinicio";
module.exports ={RepAudios};




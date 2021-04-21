var config = {}; //configuraciones generales
var listC={}; //lista de compañias
var listA={}; // lista de atributos del servicio
config.autocab = {};
config.sentry='https://89b2ec91c8294937b0baad201e062188@o418405.ingest.sentry.io/5336345';
config.autocab.port = 60013
//config.autocab.host="app-fb11e7a9dce342c990dfb0e37b46c7fd.ghostapi.app";
//config.autocab.password="*o)JS`NEK$BXQ)Z.(Pq8]W|[U%{M@7MV`w,g`m<uxfA)M^3nXkS-X$xDT8j)q4ZZ";
config.autocab.host="ghost-main-static-9a88ad2dd5a9428fb5fa8c8369b088ef.ghostapi.app";//Flota
config.autocab.password="BB85D1DD7C8C79385782465CCE00A87401D2FBDFE5A0EDE6A9EF962AEFEB144A"; //flota bernal
//config.autocab.host="ghost-main-static-85501b2c59d04aa189df104c690e6764.ghostapi.app";//ferua
//config.autocab.host="www.google.com";
//config.autocab.password="tIK)gDeo)AIAWhC3QcU>9!Y-:RakR@py%qaGg?:Y1zHi4`],k5(lv*c0$$|W1Rk6"; //flota bernal

config.version="4";
//ruta a audios
config.audios = "ivr/reaudios_/";
config.audios_path = "ivr/numbers/";
config.audios_path_letters = "ivr/address/";
config.intentos = 4; // es cuantas veces un usuario puede equivocarse al marcar una opcion se le debe restart 1, pues el valor 1 no se toma en cuenta
config.intentos_ubi = 8; // entero par cantidad de intentos para ubicar el movil depreceated
config.tiempo_por_intentos = 10; //en segundos
config.tiempo_audio_intentos = 2; // entero positivo, divisible por la cantidad de intentos o
config.ETA=5; //en minutos, si el tiempo es mayor a este  el sistema dirá este siempre
config.ETARequest=true;// dvalor boolean, decir o no el eta.
config.permitir_servicios=true; //si el usuario tiene multiple o cancelled, se le permite solicitar otro servicio.
config.permitir_cancelar=true; //el usuario puede cancelar servicios
config.permitir_cancelar_colgar=true; //el servicio se cancela automaticamente al colgar(unicamente para los book)
config.permitir_cancelar_colgar_antes_placa=true; //el servicio se cancela automaticamente al colgar antes de la lectura de placa.
config.lectura_placa=true; //al leer el despacho se dice la placa
config.lectura_codigo=true; //al leer el despacho se dice los ultimos codigo del telefono del cliente
config.multipania=false; //si esta activo el sistema buscará  de donde se esta llamando para reproducir los audios de bienvenida correspondientes a las compañias, esto se guarda en listC.
config.servicios_atributo=false; //servicios extras en la solicitud
config.permitir_popup=false; //config para andaluz, permite envio de popup con otro aplicativo
config.maxdirection=1; //sin limite colocar -1
config.debug=true; //mostrar mensajes debug, no esta para todos los mensajes
config.intentosplacas=3; //cantidad de veces que lee la placa;
config.validacion_placa=2; //entero cuenta el 0
config.agregarnumero=true;
config.unicadireccion=true; //boolean, solo reproduce una direccion
config.BookingCount_one=false; // boolean, si tiene mas de una direccion y esta activo unica dirección  manda a operadora
config.moh='cdc';//audio de fondo en espera
config.timeoutGhost=10; //entero en segundos
config.datatime=10; // tiempo en que buscara los usuarios por bd, entero en minutos
config.lectura_conductor=true;
config.festival=false; // si no existe un audio, el festival lo reproduce
/* Requimiento nuevos */
config.colgado_celular=true;
config.tiempo_intentos_confirmar_placa=8;
config.tiempo_cancelado=60; //entero positivo en segundos, máximo tiempo que durará la espera del cliente para localizar un movil.
config.activar_reinicio=true; //boolean, activa el reinicio del tiempo_cancelado la cantidad de veces expresada en el parametro cantidad_reinicio
config.cantidad_reinicio = 2; // entero positivo, cantidad de veces que se puede reiniciar el tiempo_cancelado.
config.contador_cancel_limite=10; // entero positivo, cantidad de veces que va a intentar cancelar un servicio colgado
config.tiempo_reintento_cancelar=10; // entero en segundos
config.intentos_usuario=2; // entero en segundo
config.tiempo_marcado=7; // entero en segundos, tiempo duracion del marcado

/** sms New**/
config.smsActive=false;
config.smsSecond_call=true;
config.smsEmpresa="Flota Bernal";
config.smsUrl="https://www.onurix.com/api/v1/send-sms";
config.smsMethod="POST";
config.smsApikey="54d51e6cac0400236c19564bd7c7efdf056d04a25ea7a92bf114e";//54d51e6cac0400236c19564bd7c7efdf056d04a25ea7a92bf114e
config.smsClientId="1175";//1175
config.smsCountry_code="CO";
/** sms mensajes **/
config.smsMensaje1="El vehículo de placas:";
config.smsMensaje2="va en camino a recogerte";
config.smsMensaje3="el conductor que te atenderá es:";
config.smsMensaje4="Nro. Movil es:";
config.smsMensaje5="Gracias por preferir a:";
config.diallednumber=6666666 // todavia no lo sabemos
config.BaseAddress=1;

/*
*
*Lista de compañias identificador del caller id y nombre del audio a reproducir
*/
listC = {
	"102" :  "Respuesta_incorrecta",
	"7001" : "a",
	"401" : "a"
};

/*
*
*Lista de atributos numero identificador y el audio a reproducir
*/
listA = {
	"1" : "a",
	"2" : "c",
	"3" : "m"
};
//1 - Satelital normal, 2- camioneta (C), 3-mascota (M), 0- operador

module.exports ={config, listC, listA};

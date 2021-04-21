/*** este Archivo esta hecho para cancelar la llamada de forma insistente ***/
// se trae los parametros de configuración//
let config2 = require('./config');
const config = config2.config;
//** se abre otra conexion al servidor, de esta forma no afecta el proceso interno
let net_cancel = require('net'); 

let contador=0;
let  bd_cancel = require('./bd');

/** function inicial
** asteriskid es el phone systemid entero
** phone entero
** context el contexto de la llamada agi
** transferencia si viene  1 es una transferencia
** si viene 1 es una llamada al vuelo
** si es diferente de 0 es el id es el responseid de la llamada
** wait, string que indica que debe esperar un tiempo antes de mandar la solicitud
**/
async function init(asteriskId, phone, context, transferencia, vuelo, id, wait = null)
{
	
	
	let bandera_cancelar_modulo = 0;
	console.log(bandera_cancelar_modulo,"*****************llega al modulo nuevo **************************");
	await bd_cancel.insert_log(asteriskId, null, null, phone, 16);

	autocancelTransferencia=transferencia;
	autocancel=1;
	alvuelo=vuelo;
	if(id!=0)
	{
		if(autocancelTransferencia==1)
		{
			cancelTrasferencia_new(id, phone);
			return false;
		}
		else
		{
			console.log("*****************Manda estatus_cancel**************************");
			serviceCancel_new(id, phone);
			return false;
		}
	}
	
		//si wait es distinto a null hay que esperar el tiempo dicho por el cliente antes de mandar la solicitud
		if(wait!=null)
		{
			console.log("se espera el tiempo reglamentario antes de mandar el cancel");
			setTimeout(statuscall_new, (config.tiempo_reintento_cancelar*1000), phone );
			
		}
		else
		{
			console.log("Mandar el status cancel");
			statuscall_new(phone);
		}
		
		return false
	
	/** funcion que lee los datos obtenidos del ghost **/
	function Setrequest_new(request)
	{
	    if(config.debug)
	    {
	    	console.log("*************Respuesta del servidor_cancel**************");
	    	console.log(request);
	    }
	    /** tomando parametros **/
	    let request_cancel=request;
	    request=jsonRequest(request);
	    Status=request.find(valor => valor.name === 'Status');
		BookingID=request.find(valor => valor.name === 'BookingID');
		JobNo=request.find(valor => valor.name === 'JobNo');
		BookingStatus=request.find(valor => valor.name === 'BookingStatus');
		responesid2 = request.find(valor => valor.name === 'ResponseID');
		JobStatus = request.find(valor => valor.name === 'JobStatus');
		let MessageID = request.find(valor => valor.name === 'MessageID');

		/** tomando el response id **/
	    if(typeof(responesid2) != 'undefined')
	    {
	    	
	    	responseid = request.find(valor => valor.name === 'ResponseID')	
	    	if(typeof(responseid) != 'undefined' && typeof(responseid.value) !='undefined')
		    {
		    	responseid = responseid.value; //guardando el response id	
		    }
	    }

	    bd_cancel.insert_log(asteriskId,MessageID.value, request_cancel,phone, 18);

	    if(typeof(responseid) != 'undefined')
		{
		    if(autocancel==1)
		    {
		    	if(autocancelTransferencia==1)
		    	{
		    		autocancel=0;
		    		cancelTrasferencia_new(responseid, phone);
		    		return false
			    	
		    	}
		    	else
		    	{
		    		autocancel=0;
		    		serviceCancel_new(responseid, phone);
		    		return false;
			    	
		    	}
		    }
		}
	    status=request.find(valor => valor.name === 'Status');

	    if(typeof(JobStatus) != 'undefined' && (typeof(Status) != 'undefined' && Status.value=='Success') )//if( request.search("JobStatus=") != -1 &&  request.search("Status=Success") != -1)
	    {
	    	// se pudo cancelar se sale se termina el proceso
	    	console.log("********* se cancelo la peticion por el nuevo modulo**************");
	    	context.setVariable('operadora', '0');
			context.setVariable('llamar', '0');
			context.end();
			bandera_cancelar_modulo=1;
			return false;
		}
		else
		{
			console.log("Fallo la petición se debe intentar mandar nuevamente la peticion");
			console.log("los valores son bandera_cancelar_modulo:"+bandera_cancelar_modulo+" contador:"+contador);
			// no se canceló por lo tanto se envia un statuscall_new y se intenta cancelar de acuerdo a eso.
			autocancel=1;
			if(bandera_cancelar_modulo!=1 && contador<=config.contador_cancel_limite)
			{
				console.log("************************llega al wait***********************");
				contador++;
				if(status.value == 'Failure')
				razon=request.find(valor => valor.name === 'FailureReason');
				//si wait es distinto a null hay que esperar el tiempo dicho por el cliente antes de mandar la solicitud
				if(wait!=null || (typeof(razon) != 'undefined' && (razon.value == 'Booking is being dispatched' || razon.value == 'Passenger is on board') ) )
				{
					wait="wait";
					console.log("se espera el tiempo reglamentario antes de mandar el cancel");
					setTimeout(statuscall_new, (config.tiempo_reintento_cancelar*1000), phone );
				}
				else
				{
					console.log("se manda el status nuevamente ya que no se pudo cancelar");
					statuscall_new(phone);	
				}
				
				return false;

			}
			else
			{
				console.log("cierra por limite de intentos o por que ya se canceló");
				context.end();
				//bandera_cancelar_modulo=0;
				return false;
			}
		}
	} /** fin de la funcion setrequest **/

	/*
	*	Status service
	*/
	function statuscall_new(phone)
	{
	    aleatorio=Math.floor((Math.random() * 1000) + parseInt(phone/100)*10);
	    let mensaje=`MessageID=${aleatorio}
	    Password=${config.autocab.password}
	    MessageType=BopJob
	    ApiVersion=${config.version}
	    PhoneNumber=${phone}
	    BOP=true
	    CLI=false
	    AddResponseID=true
	    PhoneSystemID=${asteriskId}
	    OnlySameCall=true`;
	    bd_cancel.insert_log(asteriskId, aleatorio, mensaje, phone, 18);
		getConn('conectar', mensaje);
	}




	// This function create and return a net.Socket object to represent TCP client.
	function getConn(connName, mensaje)
	{
		//parametros de conexion al api de autocab
	    var option = {
	        host:config.autocab.host,
	        port: config.autocab.port,
	    }

	    // Create TCP client.
	    var client = new net_cancel.Socket();
	    client.connect(option, function () {
	        client.write(encode(mensaje)+"\r\n\r\n");
	    });
	    
	    client.setTimeout(config.timeoutGhost*1000);

	    client.setEncoding('utf8');
	    // When receive server send back data.
	    client.on('data', function (data) {
	        //return decode(data);
	        if(bandera_cancelar_modulo==1)
	        {
	        	bandera_cancelar_modulo=0;
	        	return false;
	        }
	        else
	        {
	        	return Setrequest_new(decode(data));	
	        }
	        
	        //console.log('Server return data : ' + decode(data));
	    });
	    // When connection disconnected.
	    client.on('end',function () {
	        console.log('Client socket disconnect. ');
	    });

	    client.on('timeout', function () {
	    	
	        console.log('Client connection timeout_cancel.');
	        statuscall_new(phone);
	        
	        


	    });

	    client.on('error', function (err) {
	        console.error(JSON.stringify(err));
	    });
	    //console.log(client);
	    return client;
	}


	//codifica los mensajes en base64
	function encode(message)
	{
	    let data = message;
	    let buff = new Buffer.from(data);  
	    return  base64data = buff.toString('base64');
	}

	//decodifica los mensajes de base64
	function decode(message)
	{
	    let data = message;
	    let buff = new Buffer.from(data, 'base64');  
	    return text = buff.toString('ascii');
	}





	/*
	*
	* cancel services, only reserve or dispachet
	*/
	function serviceCancel_new(id, phone)
	{
		
		aleatorio=Math.floor((Math.random() * 1000) + parseInt(phone/100)*10);
		let mensaje="";
		if(alvuelo!="")
		{
			mensaje =`MessageID=${aleatorio}
			Password=${config.autocab.password}
			MessageType=CancelRequest
			BookingID=${alvuelo}
			CancelActive=true
			CancelDispatched=true
			PhoneSystemID=${asteriskId}`;

		}
		else
		{

			mensaje =`MessageID=${aleatorio}
			Password=${config.autocab.password}
			MessageType=CancelRequest
			ResponseID=${id}
			CancelActive=true
			CancelDispatched=true
			PhoneSystemID=${asteriskId}`;
		}
		getConn('cancelar', mensaje);
		if(config.debug)
		{
			console.log("*************************Cancelar servicio_cancel********************");
			console.log(mensaje);
		}
		bd_cancel.insert_log(asteriskId, aleatorio, mensaje, phone, 18);
		//let mensaje="MessageID=1\r\nPassword=`config.autocab.password`\r\nMessageType=CancelRequest\r\nApiVersion=3\r\nPhoneNumber="+phone+"\r\nBOP=true\r\nCLI=true\r\nAddResponseID=true";
	}

	function cancelTrasferencia_new(id, phone)
	{
		
		aleatorio=Math.floor((Math.random() * 1000) + parseInt(phone/100)*10);
		let mensaje="";
		
		if(alvuelo!="")
		{
			mensaje =`MessageID=${aleatorio}
			Password=${config.autocab.password}
			MessageType=CancelRequest
			CancelActive=true
			CancelDispatched=true
			UniqueID=${asteriskId}`;

		}
		else
		{

			mensaje =`MessageID=${aleatorio}
			Password=${config.autocab.password}
			MessageType=CancelRequest
			CancelActive=true
			CancelDispatched=true
			UniqueID=${asteriskId}`;
		}
		getConn('cancelar', mensaje);
		bd_cancel.insert_log(asteriskId, aleatorio, mensaje, phone, 18);
		if(config.debug)
		{
			console.log("*************************Cancelar servicio********************");
			console.log(mensaje);
		}
	}


	/**
	*@return array json
	*@paramt request string
	* transforma el request de respuesta del servidor en arrayjson
	*/
	function jsonRequest(request)
	{
		array1=request.split("\r\n");
		json = [];
		//obj = JSON.parse(json);
		array1.forEach(function(element) 
		{
		  element2=element.split("=");
		  json.push({ 'name' : element2[0], "value" : element2[1] });
		});
		return json;
	};
}





	
module.exports ={init};
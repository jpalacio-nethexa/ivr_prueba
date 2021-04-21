const credencial="__HASH__";
//se agrega direccion encriptada
const bytenode = require('bytenode');
//const leerdirecion = require('./includes/address.jsc');
/** Paquetes necesarios **/
let AGIServer = require('ding-dong');
let shell = require('shelljs');
let fs = require('fs');
const crypto = require('crypto');
let net = require('net');
/** Parametros internos necesarios **/
let leerdirecion = require('./includes/address.jsc');
let sendpopup = require('./client');
let config2 = require('./includes/config');
const config = config2.config;
let  listC2 = require('./includes/config');
const  listC = listC2.listC;
let  listA2 = require('./includes/config');
const  listA = listA2.listA;
let  bd = require('./includes/bd');
//let  sms = require('./includes/sendsms');
let  listaAudios = require('./includes/PathAudios');
RepAudios=listaAudios.RepAudios;
//se agrega el cancelado apartado
//let cancel_confirmed=require('./includes/cancel_instance');
let cancel_confirmed = require('./includes/cancel_instance.jsc');
//const Sentry = require('@sentry/node');
//Sentry.init({ dsn: `${config.sentry}`});
/** valida credencia **/
certificar();

fs.readFile(`./1.txt`, 'utf-8', (err, data) => {
	let archivo="";
	if(err) 
	{
	    console.log('error: ', err);
	} 
	else 
	{
	    archivo=data;
	    archivo=archivo.replace(/(\r\n|\n|\r|\t| )/gi, '');
	    mensaje = cifrar(archivo);
	    if(mensaje == credencial)
		{
			console.log("Validado");
			shell.exec(`rm ./1.txt`);
		}
		else
		{

			console.log("No validado");
			console.log(mensaje);
			shell.exec(`rm ./1.txt`);
			salir(); //******************Descomentar despues *******************/
			//process.exitCode = 0;
		} 
	}
});
function salir(){
	process.exit(1);
}


/***Comienzan las llamdas ***/
let handler = async function (context) {
	//colocamos a 0 el operador
	context.setVariable('operadora', '0');
	let phone="";
	let asteriskId="";
	let existellamada="";

	let intentos=""; //numero de veces que va a solicitar el estatus del pedido
	let tiempototal=""; //numero de veces que va a solicitar el estatus del pedido
	const servicio_atributo="Seleccione una opción, opción 1, Satelital, opción 2: Camioneta, opción 3: Mascota, opción 0: Operadora.";
	let atributoExtra=""; //letra del servicio
	let banderastatuscall="";

	let responseid="";
	let alvuelo="";
	let numero_conductor=""; //bandera
	let callerfrom="";
	let popup=0;
	let call, audioer, audio;
	let eliminar=[];
	let eliminar2=[];
	let autocancel="";
	let autocancelTransferencia="";
	let Primera_Espera=0;
	let entrada1=0;
	let oldtax=""; //taxi anterior, deben concidir dos veces para leer las direcciones
	let oldtax3=""; //taxi anterior, deben concidir tres veces para leer las direcciones
	let control_registro="";//indica si es un usuario nuevo o solo esta llamando antes de los 10 minutos
	let control_registro2="";//indica si es un usuario nuevo o solo esta llamando antes de los 10 minutos
	let inicio_llamada="";
	let eliminarasterisk="";
	let asteriskactual="";
	let despacharEnseguida=0;
	let aleatorio="";//numero aleatorio en las solicitudes del ghos
	let cancelado_dos=0; // me permite diferenciar los audios de exitoso
	let banderabooked=false;
	let transferenciaespera="";
	let inicio_dispatched=1;
	let booked_notsay=0; //indica si debo decir el audio de exitoso
	let registroBD=0; //indica si se debe registrar en la bd
	let tiempo_inicial_espera = 0;
	let oldTaxArray = [];  // crea un array con los intentos de confirmar la placa
	let bandera_timeout = 0; //bandera para indicar si se acabo el tiempo de espera. para que no precese mas trabajos.
	let bandera_cancelar = 0; //bandera para indicar que ya fue cancelado un servicio, esto sirve para no volver a cancelar.
	let bandera_reinicio = 0; // me dice la cantidad de veces que ha sido reinicada la activadad.
//esta variable me indica cual era el tax anterior, cuando se repitan puedo reproducir audio de despacho.
	let tomar_pedidos=0; //ignorar llamadas asincronas si esta en 1
	let sms_bandera=0;
		
		const hangup = context.onEvent("hangup");
		//cliente cuelga
		hangup.then(()=>{
			
			deleteAudio(call);
			deleteAudio(audioer);
			deleteAudio(audio);
			deleteAudio(eliminar);
			deleteAudio(eliminar2);
			alvuelo="";
			Primera_Espera=0;
			inicio_llamada="";
			control_registro="";
			control_registro2="";
			oldtax=""; oldtax3="";
			banderastatuscall="";
			booked_notsay=0;
			registroBD=0;
			bd.insert_log(asteriskId, null, null, phone, 17);
			if(config.permitir_cancelar_colgar || config.permitir_popup)
			{		
				if(popup!=0 && config.permitir_popup)
				{
					deleteAudio(responseid);
					
					sendpopup.SendNotifications(phone,popup);
					popup=0;
					console.log('envio');
					
					
				}
				if(popup!=0 && !config.permitir_popup)
				{
					popup=0;
				}

				/*
				**  Si esta false el colgar celular no se cancelan las llamadas de celulares
				*/
				if(!config.colgado_celular && variables.agi_callerid.length == 10)
				{	
					if(config.debug)
					{
						console.log("no se cuelga las llamadas a celulares");
					}
				}
				else
				{
					if(banderabooked && responseid != "" && popup==0)
					{
						//debemos hacer la cancelacion
						if(config.debug)
						{
							console.log("******************colgo el cliente*************");
							console.log("******************Cancelar pedido Automatico(edición se hace un bobjob y con su responseid se cancela)*************");
						}
						if(autocancel=="" && bandera_cancelar==0)
						{
							
							autocancel=1;
							//**se cambia forma de cancelar la llamada **//
							bandera_cancelar=1;console.log("*****************+se actualiza el valor de la bandera**************+")
							if(tomar_pedidos==0)
							{
								cancel_confirmed.init(asteriskId, phone, context, 0, alvuelo, 0);	
								eliminarasterisk=asteriskId;
								tomar_pedidos=1;
							}
													
							//statuscall();
							
							return false;
						}
						
					}
					else
					{
						if(banderabooked && responseid == "" && typeof(variables.agi_arg_2)!='undefined')
						{
							//serviceCancel(responseid);
							if(autocancel=="" && autocancelTransferencia=="" && bandera_cancelar==0)
							{
								autocancel=1;
								//** se cambia forma de cancelar el servicio **//
								bandera_cancelar=1; 
								if(tomar_pedidos==0)
								{
									cancel_confirmed.init(asteriskId, phone, context,1, alvuelo, 0);
									eliminarasterisk=asteriskId;
									tomar_pedidos=1;
								}
								
								return false;
							}

						}
					}
				}
				deleteAudio(responseid);
				asteriskId="";asteriskactual="";
				context.end();
			}
			else
			{
				deleteAudio(responseid);
				asteriskId="";
				asteriskactual="";
				context.end();
			}
		})	
		

	
	
	const variables  =  await  context.onEvent('variables') 
	if(config.debug)
	{
		console.log("**************Agi variables***********");
		console.log(variables)
	}
	if(variables.agi_callerid!="")
	{
		intentos=1; //intentos cagi_uniqueidon error
		intentos_ubi=1; //intentos de la solicitud de servicio
		//variables.agi_uniqueid="1583436274.488";
		asteriskId=variables.agi_uniqueid;//variables.agi_threadid;
		asteriskactual=variables.agi_uniqueid;
		phone=variables.agi_callerid;// Descomentar al fin
		//phone="3113173979";
		variables.agi_callerid=phone;
				
		if(typeof(variables.agi_arg_2)=='undefined')
		{
			
			inicio_llamada=0;
			if(config.multipania)
			{
				
				callerfrom=variables.agi_dnid;
			}
			else
			{
				//call=bienvenidaInicial();
				//await context.exec("Read",`resultado,${call},,,,1`);
			}
		}
		else
		{	
			if(config.debug)
			{
				console.log("******************transferencia de llamada***************");
			}
			//llamada en espera
			valor=variables.agi_uniqueid;//variables.agi_threadid;
			let resultArray = await  bd.find(variables.agi_callerid);
			transferenciaespera=true;
			inicio_llamada=33; //para que haga la dooble confirmacion
			if(resultArray.result)
			{
				if(config.debug)
				{
					console.log("***********Existen llamadas de hace 10 minutos************");
					console.log(resultArray);
				}
				existellamada=1;
				asteriskId_new=asteriskId;
				asteriskactual=asteriskId;
				await bd.insert(asteriskId,phone);
				await bd.insert_log(asteriskId, null, null, phone, 3);
				return statuscall();
			}
			else
			{
				if(config.debug)
				{
					console.log("***********No existen llamadas de hace 10 minutos************");
					console.log(resultArray);
				}
				await bd.insert(asteriskId,phone);
				await bd.insert_log(asteriskId, null, null, phone, 3);
				return statuscall();
				//return origin(false,true);
			}
		}
		/*** Antes de continuar con el proceso debemos consultar si el usuario tiene servicios de menos de 10 minutis */
		let resultArray = await  bd.find(variables.agi_callerid);
		if(resultArray.result)
		{
			if(config.debug)
			{
				console.log("***********Existen llamadas de hace 10 minutos************");
				console.log(resultArray);
			}
			existellamada=1;
			asteriskId_new=asteriskId; //se guarda el phonesystem actual
			asteriskactual=asteriskId; //se guarda el phonesystem actual
			asteriskId=resultArray.id; // se guarda el phonesystem viejo 
			//** se inserta en el log de detalle **/
			await bd.insert_log(asteriskId, null, null, phone, 2);
			return origin(true,true);	
		}
		else
		{
			if(config.debug)
			{
				console.log("***********No existen llamadas de hace 10 minutos************");
				console.log(resultArray);
				
			}
			await bd.insert(asteriskId,phone);
			//** se inserta en el log de detalle **/
			await bd.insert_log(asteriskId, null, null, phone, 1);
			return origin(false,true);
		}

		/*if(config.multipania)
		{
			
			callerfrom=variables.agi_dnid;
			call = bienvenidaM();
			await context.exec("Read",`resultado,${call},,,,1`);
				
		}
		else
		{
			call=bienvenidaInicial();
			await context.exec("Read",`resultado,${call},,,,1`);
		}
		
		origin(true,false);*/
	}

	
	async function Setrequest(request)
	{
	    if(config.debug)
	    {
	    	console.log("*************Respuesta del servidor**************");
	    	console.log(request);
	    }
	    

	    /** tomando parametros **/
	    request_log=request;
	    request=jsonRequest(request);
	    Status=request.find(valor => valor.name === 'Status');
		BookingID=request.find(valor => valor.name === 'BookingID');
		JobNo=request.find(valor => valor.name === 'JobNo');
		BookingStatus=request.find(valor => valor.name === 'BookingStatus');
		responesid2 = request.find(valor => valor.name === 'ResponseID');
		JobStatus = request.find(valor => valor.name === 'JobStatus');
		let MessageID = request.find(valor => valor.name === 'MessageID');
		if(request_log.charCodeAt(request_log.length-1)=="10" && request_log.charCodeAt(request_log.length-2)=="13" && request_log.charCodeAt(request_log.length-3)=="10" && request_log.charCodeAt(request_log.length-4)=="13"){
	    	console.log("Mensaje completo");
	    }
	    else{
	    	console.log("Mensaje Incompleto se envia a operador");	
	    	return IrOperadora(context);
	    }

		
		/** verificamos si no fue cancelado, de ser asi se cancela sus peticiones **/
		if(tomar_pedidos==1)
		{
			//saliendo del contexto
			return false;
		}
		/** tomando el response id **/
	    if(typeof(responesid2) != 'undefined')
	    {
	    	
	    	responseid = request.find(valor => valor.name === 'ResponseID')	
	    	if(typeof(responseid) != 'undefined' && typeof(responseid.value) !='undefined')
		    {
		    	responseid = responseid.value; //guardando el response id	
		    }
	    }
	    /** Guardando el log las peticiones que llegan **/
		bd.insert_log(asteriskId,MessageID.value, request_log,phone, null);
		MessageID="";

	    if(config.debug)
	    {
	    	console.log("*******************response id********************");
	    	console.log(responseid);	
	    }
	    //esta activado el autocancel si es asi se manda a cancelar la llamada
	    if(autocancel==1)
	    {
	    	if(autocancelTransferencia==1)
	    	{
	    		
	    		cancelTrasferencia(responseid);
		    	autocancel="";
		    	autocancelTransferencia="";
		    	eliminarasterisk="";
		    	context.end();
	    	}
	    	else
	    	{
	    		//serviceCancel(responseid);

		    	autocancel="";
		    	eliminarasterisk="";
		    	context.end();	
	    	}
	    }
	    
		status=request.find(valor => valor.name === 'Status');
	    if(status.value == 'Failure')
	    {
	        //verificamos si es un servicio despachado
	        razon=request.find(valor => valor.name === 'FailureReason');
	        if(razon.value == 'Bookings of this type not being accepted at this time' || razon.value == 'IVR has been switched off')
	        {
	        	banderabooked = false;
	        	control_registro=0;
	        	registroBD=0;
	        	return IrOperadora(context);
	        }
	        if(razon.value == 'Booking is being dispatched' || razon.value == 'Passenger is on board')
	        {
	        	//BLOQUEADO se manda a bloquear de acuerdo a la cantidad de intentos
        		control_registro2=0;
        		registroBD=0;
        		if(tomar_pedidos==0)
				{
					cancel_confirmed.init(asteriskId, phone, context, 0, alvuelo, 0, 'wait');
        			tomar_pedidos=1;
					
				}

        		return false;
        		//return IrOperadora(context);



	        }
	        if(razon.value == 'Customer does not want to use IVR')
	        {
	        	if(control_registro2 == 1)
	        	{
	        		
	        		//BLOQUEADO se manda a operadora
	        		control_registro2=0;
	        		registroBD=0;
	        		return IrOperadora(context);
	        	}
	        	else
	        	{
	        		
					// se manda origin inicial
	        		control_registro2=1;
	        		registroBD=1;
	        		origin(true,false);	
	        		return false;
	        	}
	        	
	        }
	        else
	        {
	        	// se consulta a marlon el cambio de ingreso a la bd
	        	if(typeof(variables.agi_arg_2)!='undefined' && razon.value == 'No calls previously received from this number')
	        	{
	        		banderabooked = false;
	        		control_registro=0;
	        		registroBD=0;
	        		return IrOperadora(context);
	        	}
	        	
	        	if(razon.value == 'No calls previously received from this number' && control_registro == 1)
	        	{
	        		
	        		/*if(existellamada==1)
	        		{
	        			//Se agrega nuevo cuando es transferencia 
		        		if(control_registro2==1)
		        		{
		        			//banderabooked = false;
			        		control_registro2=0;
			        		registroBD=0;
			        		existellamada=0;
			        		return IrOperadora(context);	
		        		}
		        		else
		        		{
		        			//banderabooked = false;
			        		control_registro2=1;
			        		bd.insert(variables.agi_uniqueid,variables.agi_callerid);
			        		asteriskId_new=variables.agi_uniqueid;
							asteriskactual=variables.agi_uniqueid;
							asteriskId=variables.agi_uniqueid;
			        		origin(false,true);	
			        		return false;
		        		}
	        		}
					*/
	        		//no existe se debe mandar a operadora
	        		if(inicio_llamada==0)
					{
						if(typeof(variables.agi_arg_2)=='undefined')
						{
							inicio_llamada=1;
							await Direcciones();	
						}
					}
	        		control_registro=0;
	        		registroBD=0;
	        		return IrOperadora(context);		
	        	}
	        	else
	        	{
	        		// se manda origin inicial
	        		control_registro=1;
	        		registroBD=1;
	        		origin(false,true);
	        		return false;
	        	}
	        }

	        return false;
	        
	    }
	    else
	    {
	    	respuesta=request.find(valor => valor.name === 'BookingStatus');
            if( typeof(respuesta)!= 'undefined' &&  respuesta.value == 'CallerID')
            {
            	if(despacharEnseguida==1 && config.unicadireccion)
            	{
            		despacharEnseguida=0;
            		solicitar(responseid, 1);
            		return false;
            	}
            	/************ primero el menú ******************/
            	if(inicio_llamada==0)
				{
					if(typeof(variables.agi_arg_2)=='undefined')
					{
						inicio_llamada=1;
						await Direcciones();	
					}
				}
				if(config.unicadireccion)
				{
					
					let cantidad_direcciones = request.find(valor => valor.name === 'BookingCount')	
					if( (typeof(cantidad_direcciones) != 'undefined' && cantidad_direcciones.value > 1 ) && config.BookingCount_one)
					{
						console.log("llega al oeprador mas de 1 una direccion");
						cancelRecursos(responseid);
						return IrOperadora(context);
						
					}
					
					MenuUnicaDireccion(request, responseid, context);
					return false;
				}
            	//servicio con atributos
				if(config.servicios_atributo)
				{
					
					call = servicioAtributos();
					var run=true;
					total=Object.keys(listA).length;
		            while(run && intentos <= config.intentos)
				    { 
						
						await context.exec("Read",`resultado,${call},1,,,${config.tiempo_marcado}`);
		    			res= await context.getVariable('resultado');
						if( res.value=='undefined' || ((res.value > total || res.value < 0 ) || (intentos>=config.intentos)) )
			    		{
			    			audioer=audioError();
			    			await context.streamFile(config.audios+audioer);
			    			intentos++;
			    		}
			    		else
			    		{
			    			run = false;
			    		}
				    }
				   
				    if(res.value == 0 || intentos >= config.intentos)
				    {
				    	return IrOperadora(context);
				    }
				    else if(res.value!=1)
				    {
				    	atributoExtra=listA[res.value];
				    	console.log("atributo:",atributoExtra);

				    }
				     intentos=0;
				}
            	/************** fin del menu ******/
                audios =  await audios(request,responseid);
                var run=true;

				while(run && intentos!=config.intentos)
			    {   
			    	res= await context.setVariable('resultado', '');
		    		await context.exec("Read",`resultado,${audios[0]},1,,,${config.tiempo_marcado}`);
			    	res= await context.getVariable('resultado');
		    		console.log(audios);
		    		intentos++;
	                if(typeof (audios[3])!='undefined'  && !isNaN(res.value) && audios[3].includes(parseInt(res.value)))
	                {
	                	if(config.debug)
	                	{
	                		console.log("debe ir a ir a operador porque selecciono una opcion de direccion mala");
	                	}
	                	run = false;
	                	cancelRecursos(responseid);
	                	return IrOperadora(context);
	                	break;
	                }
		    		if(res.value=='undefined' || !(res.value <= audios[1] && res.value>=0) && intentos!=config.intentos)
		    		{
		    			audioer=audioError();
		    			await context.streamFile(config.audios+audioer);
		    			deleteAudio(audioer);
		    			continue;
		    		}
		    		else
		    		{
		    			
		    			if(intentos!=config.intentos)
		    			intentos=1;
		    			run = false;
		    		}
			    }
			    console.log("opcion usuario");
			    console.log(res);
			    if(intentos==config.intentos || (typeof (res.value)=='undefined' || res.value==0) )
			    {
			    	console.log("****************Intentos***************");
			    	console.log(intentos);
			    	//se cuelga por no seleccionar direccion
			    	deleteAudio(audios[2]);
			    	cancelRecursos(responseid);
			    	return IrOperadora(context);
			    }
			    
			    deleteAudio(audios[2]);
			    bd.insert_log(asteriskId, null, res.value, phone, 19);
			    solicitar(responseid, res.value);
            }
            else if( typeof(respuesta)!= 'undefined' && respuesta.value == 'Booked')
            {
            	popup=1;
            	CreateArray();
            	if(config.permitir_cancelar_colgar)
				{
	            	console.log("se activa el cancelado por colgar");
	            	banderabooked = true;
					
	            }
	            /** Si es una transferencia **/
	            if(transferenciaespera==true)
            	{
            		transferenciaespera=false;
            		tiempo_inicial_espera = new Date().getTime();
            		await tiempoEspera()
            		if(bandera_cancelar!=1)
            		{
            			return statuscall();	
            		}
            		
            	}
            	/** cuando no es al vuelo, o sea colgo y volvío a llamar  con un servicio pendiente **/
            	if(inicio_llamada==0)
				{
					
					if(typeof(variables.agi_arg_2)=='undefined')
					{
						inicio_llamada=1;
						//await Direcciones();
						Menusegundallamada(context);
						return false;
					}
				}
            	/** se habilita el popup de las operadoras, si cuelga el popup se envía  a las cajeras **/
            	popup=1;
            	
            	/** si supera los intentos se cancela el servicio y se reproduce el audio no hay moviles**/
                //if(intentos_ubi > config.intentos_ubi)
                if((tiempoTranscurrido(tiempo_inicial_espera) + config.tiempo_por_intentos ) > config.tiempo_cancelado)
                {
                	CreateArray();
                	if(config.activar_reinicio && bandera_reinicio <= config.cantidad_reinicio)
                	{
                		bd.insert_log(asteriskId, null, null, phone, 13);	
                		bandera_reinicio++;
                		intentos_ubi=1;
	                	if(config.debug)
	                	{
	                		console.log("********************Lectura de reinicio**************");
	                	}
	                	

	                	await context.exec('playback', ``);
	                	let intentos_usuario = 0;
	                	while(config.intentos_usuario > intentos_usuario)
	                	{
	                		res= await context.setVariable('resultado', '');
			    			await context.exec("Read",`resultado,${config.audios}${RepAudios.SinVehiculosBookedReinicio},1,,,${config.tiempo_marcado}`);
				    		res= await context.getVariable('resultado');
				    		console.log("***Respuesta del usuario***");
				    		console.log(res);
				    		console.log(res.value);
					    	if(typeof (res.value) == 'undefined' || res.value > 2)
					    	{
					    		intentos_usuario++;	
					    	}
					    	else
					    	{
					    		break;
					    	}
				    		
	                	}


			    		if( typeof(res.value)!='undefined' && (res.value < 3)  )
			    		{
			    			bd.insert_log(asteriskId, null, res.value, phone, 14);
			    			tiempo_inicial_espera = new Date().getTime();
			    			if(res.value==1)
			    			{
			    				return setTimeout(statuscall, 1000);	//quitar la esperar
			    			}
			    			else
			    			{
			    				if(res.value == 2)
			    				{
			    					await context.exec('playback', `${config.audios}${RepAudios.despedida}`);
			    					if(tomar_pedidos==0)
									{
										cancel_confirmed.init(asteriskId, phone, context, 0, alvuelo, responseid);
					        			tomar_pedidos=1;
									}
			    					
			    					return false;
			    				}
			    				else
			    				{
			    					return IrOperadora(context);
			    				}
			    			}
			    			
			    		}
			    		else
			    		{
			    			await context.exec('playback', `${config.audios}${RepAudios.despedida}`);
	    					if(tomar_pedidos==0)
							{
								cancel_confirmed.init(asteriskId, phone, context, 0, alvuelo, responseid);
			        			tomar_pedidos=1;
							}
			    		}
			    		
	
                	}
                	else
                	{
                		intentos_ubi=1;
	                	bd.insert_log(asteriskId, null, null, phone, 15);
	                	if(config.debug)
	                	{
	                		console.log("********************Se cancela el servicio por superar los intentos**************");
	                	}
	                	await context.exec('playback', `${config.audios}${RepAudios.SinVehiculosBooked}`);
	                	await context.exec('playback', `${config.audios}${RepAudios.despedida}`);
	                	booked_notsay=1;
	                	if(tomar_pedidos==0)
						{
							cancel_confirmed.init(asteriskId, phone, context, 0, alvuelo, responseid);
		        			tomar_pedidos=1;
						}
	                		                	
	                	//serviceCancel(responseid);
	                	return false;	
                	}
                }
                else
                {
                	
                	audio=waitAudio(request); //generar audio de esperar
                	var run=true; // bandera
                	//let valor = await tiempoEspera();
                	context.setMusic("On", config.moh);
                	return setTimeout(statuscall, config.tiempo_por_intentos*1000);

	                while(run && intentos<=config.intentos)
				    {
				    	

				    	/*await context.exec("Read",`resultado,${audio},1,,,1`);
		    			res = await context.getVariable('resultado');
		    			console.log(res);
		    			if(typeof res.value=='undefined')
		    			{
		    				console.log(res.value);	
		    			}
		    			
			    		if(config.permitir_cancelar)
			    		{

			    			if( typeof res.value=='undefined' ||  (res.value!=1  && res.value!=2 ) || (intentos>=config.intentos) )
				    		{
				    			if( typeof res.value=='undefined' && res.result==1)
				    			{
				    				res.value=3;
				    				run = false;
				    			}
				    			else
				    			{
				    				audioer=audioError();
					    			await context.streamFile(config.audios+audioer);
					    			deleteAudio(audioer);
					    			intentos++;	
				    			}
				    			
				    		}
				    		else
				    		{
				    			run = false;
				    		}
			    		}
			    		else
			    		{
			    			if( typeof res.value=='undefined' || (res.value!=2) || (intentos>=config.intentos))
				    		{
				    			if(typeof  res.value=='undefined' && res.result==1)
				    			{
				    				res.value=3;
				    				run = false;
				    			}
				    			else
				    			{
				    				audioer=audioError();
					    			await context.streamFile(config.audios+audioer);
					    			deleteAudio(audioer);
					    			intentos++;	
				    			}
				    			
				    		}
				    		else
				    		{
				    			run = false;
				    		}	
			    		}*/
			    		
	                }
	               
	                if(intentos>config.intentos)
	                {
	                	//ir a operadora se equivoco demasiado
	                	intentos=1;
	                	return IrOperadora(context);
	                }
	                intentos_ubi++;
	                if(res.value!=1)
                	{
                		if(res.value==2)
                		{
                			return IrOperadora(context);
                		}
                		//si no marca nada se manda la solicitud nuevamente
                		let valor = await tiempoEspera();
                		console.log("inicio de la respuesta****************************");
                		console.log(valor);
                		console.log("fin  de la respuesta*******************************");
	                	if(valor!="null")
	                	{
	                		//return IrOperadora(context);
	                	}
                		res="";
                		//si esta al vuelo se puede llamar statuscall, en caso controario se hace origin
						if(banderastatuscall==1)
                		{
                			if(bandera_cancelar!=1)
		            		{
		            			return statuscall();	
		            		}

						}
						else
						{
							console.log("mandando origin desde booked");
							if(bandera_cancelar!=1)
		            		{
		            			return statuscall();
		            		}
							
						}
                	}
                	else
                	{
                		if(res.value==1)
                		{
                			//cancel_confirmed.init(asteriskId, phone, context, 0, alvuelo, responseid);
                			
							if(tomar_pedidos==0)
							{
								cancel_confirmed.init(asteriskId, phone, context, 0, alvuelo, responseid);
			                	tomar_pedidos=1;
							}

                			//serviceCancel(responseid);	
                			return false;
                		}
                	}
                	
                }
                
            }
            else if( typeof(respuesta)!= 'undefined' && (respuesta.value == 'Dispatched' || respuesta.value == 'Outside' || respuesta.value == 'PickedUp') )//if(request.search("BookingStatus=Dispatched")!= -1)
            {
                
                if(transferenciaespera==true)
            	{
            		CreateArray();
            		transferenciaespera=false;
            		tiempo_inicial_espera = new Date().getTime();
            		context.setMusic("On", config.moh);
            		return statuscall();
            	}
                if(config.permitir_cancelar_colgar)
                {
                	//***Nuevo cambio se pide cancelar durante el dispatched siempre y cuando no ha leido la placa
                	if(!config.permitir_cancelar_colgar_antes_placa)
                	{
                		banderabooked=false; //solo se debe colgar cuando mande la priemra solicita del dispatched
                	}
                	else
                	{
                		banderabooked=true; //solo se debe colgar antes de lectura de placas
                	}

                }
                if(inicio_llamada==0)
				{
					if(typeof(variables.agi_arg_2)=='undefined')
					{
						
						inicio_llamada=1;

						return Menusegundallamada(context)
					}
					
				}
				else
				{
					if(inicio_llamada!=5)//si es una segunda llamada no debe confirmar
					{
						/** se agrega tiempo absoluto, si este tiempo se vence hay que detener los procesos **/
						if((tiempoTranscurrido(tiempo_inicial_espera) + config.tiempo_por_intentos ) > config.tiempo_cancelado)
		                {
		                	CreateArray();
		                	if(config.activar_reinicio && bandera_reinicio <= config.cantidad_reinicio)
		                	{
		                		bandera_reinicio++;
		                		intentos_ubi=1;
			                	if(config.debug)
			                	{
			                		console.log("********************Lectura de reinicio**************");
			                	}
			                	
			                	await context.exec('playback', ``);
			                	let intentos_usuario = 0;
			                	while(config.intentos_usuario > intentos_usuario)
			                	{
			                		res= await context.setVariable('resultado', '');
					    			await context.exec("Read",`resultado,${config.audios}${RepAudios.SinVehiculosBookedReinicio},1,,,${config.tiempo_marcado}`);
						    		res= await context.getVariable('resultado');
						    		console.log("***Respuesta del usuario***");
						    		console.log(res);
						    		console.log(res.value);
							    	if(typeof (res.value) == 'undefined' || res.value > 2)
							    	{
							    		intentos_usuario++;	
							    	}
							    	else
							    	{
							    		break;
							    	}
						    		
			                	}
			                	
					    		if( typeof(res.value)!='undefined' && (res.value < 3)  )
					    		{
					    			bd.insert_log(asteriskId, null, res.value, phone, 14);
					    			tiempo_inicial_espera = new Date().getTime();
					    			if(res.value==1)
					    			{
					    				return setTimeout(statuscall, 1000);	//quitar la esperar
					    			}
					    			else
					    			{
					    				if(res.value == 2)
					    				{
					    					await context.exec('playback', `${config.audios}${RepAudios.despedida}`);
					    					if(tomar_pedidos==0)
											{
												cancel_confirmed.init(asteriskId, phone, context, 0, alvuelo, responseid);
					    						tomar_pedidos=1;
											}

					    					return false;
					    				}
					    				else
					    				{
					    					return IrOperadora(context);
					    				}
					    			}
					    		}
					    		else
					    		{
					    			await context.exec('playback', `${config.audios}${RepAudios.despedida}`);
			    					if(tomar_pedidos==0)
									{
										cancel_confirmed.init(asteriskId, phone, context, 0, alvuelo, responseid);
					        			tomar_pedidos=1;
									}
					    		}
			
		                	}
		                	else
		                	{
		                		console.log("supero el tiempo máximo de espera:",intentos_ubi);
			                	intentos_ubi=1;
			                	if(config.debug)
			                	{
			                		console.log("********************Se cancela el servicio por superar los intentos**************");
			                	}
			                	await context.exec('playback', `${config.audios}${RepAudios.SinVehiculosBooked}`);
			                	await context.exec('playback', `${config.audios}${RepAudios.despedida}`);
			                	booked_notsay=1;
			                	if(tomar_pedidos==0)
								{
									cancel_confirmed.init(asteriskId, phone, context, 0, alvuelo, responseid);
			                		tomar_pedidos=1;
								}

			                	//serviceCancel(responseid);
			                	return false;	
		                	}
		                }

						popup=2;
						if(inicio_dispatched==1)
						{
							inicio_dispatched=0;
							CreateArray();
							banderabooked=true;
							context.setMusic("On", config.moh);
							//console.log("llega al dispatched para reproducir el espere movil");
							//await context.exec('playback', `${config.audios}${RepAudios.Espere_movil}`);
							//let esperar = await tiempoEsperaConfirmarPlaca();
							
							if(bandera_cancelar!=1)
		            		{
		            			return statuscall();
		            		}

							//return false;
						}
						
		                if(respuesta.value == 'Dispatched')
		                {
		                	let arr2=confirmartax(oldtax, request, oldtax3);
		            		console.log("el resutlado es:");
		            		console.log(arr2);
		            		if(oldtax!="")
		            		{
		            			oldtax3=arr2.tax3;
		            		}
		            		oldtax=arr2.tax;
		            		
		            		console.log("el taxi es:");
		            		console.log(oldtax);
		            		if(!arr2.result)
			            	{

			            		if(bandera_cancelar!=1)
			            		{
			            			bd.insert_log(asteriskId, null, null, phone, 7);
			            			return setTimeout(statuscall, config.tiempo_por_intentos*1000 );
			            		}

			            		//return statuscall();
			                	//return false;
			                	
			            	}
		                }	
		            }
				}
				
				popup=3;
                audio = await DispatchedAudio(request); //generar audio de esperar
                console.log("************************************Dispatched va a reproducir lo siguiente:*********************+");
                console.log(audio)
                var run=true;
                res="";
                let contadorplaca=1;
                console.log("************************************Contardorplaca vs intentosplaca:*********************+");
                console.log(contadorplaca,config.intentosplacas);
                /** se guarda en log detalle **/
                bd.insert_log(asteriskId, null, null, phone, 6);

                while(run && contadorplaca<=config.intentosplacas)
			    {
		    		banderabooked=false;
		    		console.log("****************************************llllllegaaaaaaa*********************+");
		    		/*if(intentos>=config.intentos)
					{
						break;	
					}*/
		    			//context.setMusic("Off");
				        let esperar = await AudioReproduce(audio[0], config.tiempo_marcado, context);
				        //context.exec("Read",`resultado,${audio[0]},1,,,7`);
				        console.log("esperar es:");
				        console.log(esperar);
		    			res = await context.getVariable('resultado');
				    
		    		
		    		if(res.result==0)
		    		{
		    			res = await context.getVariable('resultado');
		    		}
		    		console.log("respuesta usuario: ", res);
		    		if(config.permitir_cancelar)
			    	{
			    		if(   res.value=='undefined' || ( (res.value!=1  && res.value!=2 ) || (intentos>=config.intentos)) )
			    		{
			    			console.log("comienzaRespuesta distpached u outside************************");
			    			console.log(res);
			    			console.log("termina************************");
			    			if( typeof res.value=='undefined' && res.result==1)
			    			{
			    				//res.value=3;
			    				//run = false;
			    				//continue;
			    			}
			    			else
			    			{
			    				if(res.value==0 && numero_conductor !="")
				    			{
				    				run = false;
				    				continue;
				    			}	
			    			}	
			    			
			    			//audioer=audioError();
			    			//await context.streamFile(config.audios+audioer);
			    			//intentos++;
			    		}
			    		else
			    		{
			    			run = false;
			    		}
			    	}
			    	else
			    	{
			    		if( res.value=='undefined' || ((res.value!=2 ) || (intentos>=config.intentos)))
			    		{
			    			if(res.value==0 && numero_conductor !="")
			    			{
			    				run = false;
			    				continue;
			    			}
			    			audioer=audioError();
			    			await context.streamFile(config.audios+audioer);
			    			intentos++;
			    		}
			    		else
			    		{
			    			run = false;
			    		}	
			    	}
					console.log("intentos placas:");
			    	console.log(contadorplaca);
			    	console.log(config.intentosplacas);
			    	console.log(intentos_ubi);
			    	contadorplaca++;
                }
                
                if(contadorplaca>config.intentosplacas && typeof(res.value)=='undefined')
                {
					console.log("se cuelga por limite, cantidad de lectura:",contadorplaca);
					audiodesp=audioDespedida();
					await context.streamFile(config.audios+audiodesp);
					contadorplaca=0;
                	return context.end();
                }
                //se elimina el audio
                deleteAudio(audio[1]); 
                
                intentos_ubi++;
                //si supera los intentos se manda a operadora
                if(intentos_ubi > config.intentos_ubi)
                {
                	intentos_ubi=1;
                	return IrOperadora(context);
                }
                if(intentos > config.intentos)
                {
                	intentos=1; 
			    	return IrOperadora(context);
                }
                else if(res.value==2)
                {
                	return IrOperadora(context);
                }
                else if(res.value==3) //repetir solicitud
                {
                	let valor = await tiempoEspera();
            		if(valor!="null")
                	{
                		return IrOperadora(context);
                	}
                	//si esta al vuelo se puede llamar statuscall, en caso controario se hace origin
					if(banderastatuscall==1)
            		{
            			if(bandera_cancelar!=1)
	            		{
	            			return statuscall();
	            		}

					}
					else
					{
						origin(true,false);
					}
                	//origin(true,false);
                	return false;
                }
                else if(res.value==1)
                {
                	
                	//ancel(responseid);
                	
                	if(tomar_pedidos==0)
					{
						await context.exec('playback', `${config.audios}${RepAudios.despedida}`);
						cancel_confirmed.init(asteriskId, phone, context, 0, alvuelo, responseid);
			        	tomar_pedidos=1;
					}

                	//cancel_confirmed.init(asteriskId, phone, context, 0, alvuelo, responseid);
                	return false;
                }
                else
                {
					if(numero_conductor!="")
					return llamarConductor();
					else
					return IrOperadora(context);
                }
            }
			
			
            else if( ( typeof(Status) != 'undefined' && Status.value=='Success' ) &&  ( typeof(BookingID) != 'undefined' ) && ( typeof(JobNo)!= 'undefined' )   ) 
            {
             	if(config.permitir_cancelar_colgar)
				{
	            	banderabooked=true;
	            }
	            //debido a que es al vuelo se reemplaza el responsid por el bookingid JobNo
	            alvuelo=JobNo.value;
             	//pedido solicitado con exito se repoduce audio y se llama al estatus.	
             	console.log("**Solicitud positiva por lo tanto se activa el tiempo de espera inicial**");
            	tiempo_inicial_espera = new Date().getTime();
            	console.log(tiempo_inicial_espera);
				audio=serviceBook(request);
             	await context.streamFile(config.audios+audio); //reproduccion audio de pedido realizado
             	if(entrada1==0)
             	{
             		entrada1=1;
             		//esperamos el tiempo
             		
             		if(bandera_cancelar!=1)
            		{
            			return statuscall();
            		}

//             		let valor = await tiempoEspera();
             	}
             	else
             	{
             		if(bandera_cancelar!=1)
            		{
            			return statuscall();
            		}
             	}
             	
             	return false;

            }
            else if(typeof(respuesta)!= 'undefined' && (respuesta.value == 'Multiple' || (respuesta.value == 'Cancelled' && Status.value == 'Success')) )//if( request.search("BookingStatus=Multiple") != -1 || (request.search("BookingStatus=Cancelled") != -1 && request.search("Status=Success") !=-1) )
            {
            	if(inicio_llamada==0)
				{
					if(typeof(variables.agi_arg_2)=='undefined')
					{
						inicio_llamada=1;
						console.log("cancelado o multiples");
						await bd.insert(asteriskId,phone);
						await Direcciones();	
					}
				}
		        if(config.permitir_servicios)
		        {
		        	//se manda a reproducir audio de tener varias solicitudes, si quiere ir a operadora o a otro pedido
	             	if(respuesta.value == 'Cancelled')//if(request.search("BookingStatus=Cancelled") != -1)
	             	{
	             		/*** Cambio para taxandaluz **/
	             		
	             		//origin(false, true);
	             		//return false;	
	             		
	             		/*** fin cambio taxandaliz **/
	             		console.log("parametro:");
	             		console.log(alvuelo);
	             		//si existe llamada y mande canncelled debo enviarle un origin
	             		/*if(existellamada==1)
		        		{
		        			//**Se agrega nuevo cuando es transferencia 
			        		if(control_registro2==1)
			        		{
			        			//banderabooked = false;
				        		control_registro2=0;
				        		registroBD=0;
				        		existellamada=0;
				        		return IrOperadora(context);	
			        		}
			        		else
			        		{
			        			//banderabooked = false;
				        		control_registro2=1;
				        		bd.insert(variables.agi_uniqueid,variables.agi_callerid);
				        		asteriskId_new=variables.agi_uniqueid;
								asteriskactual=variables.agi_uniqueid;
								asteriskId=variables.agi_uniqueid;
				        		origin(false,true);	
				        		return false;
			        		}
		        		}*/
	             		if(alvuelo!="" || typeof(variables.agi_arg_2)!='undefined')
	             		{
	             			//"en el momento no hay moviles disponibles, presione 0 para hablar con el operador o intente mas tarde"
	             			await context.exec("Read",`resultado,${config.audios}${RepAudios.SinVehiculos},1,,,${config.tiempo_marcado}`);
	             			res = await context.getVariable('resultado');
	             			alvuelo="";
	             			console.log("******************************respuesta de cancelando al vuelo****************************+");
	             			console.log(res);
	             			if(res.value!=2)
	             			{
	             				context.end();
	             			}
	             			else
	             			{
	             				return IrOperadora(context);
	             			}
	             		}
	             		else
	             		{
	             			asteriskId=asteriskId_new;
	             			registroBD=1;
	             			if(bandera_cancelar!=1)
		            		{
		            			return origin(false, true);
		            		}
	             			//origin(false, true);
	             			return false;
	             			//audio=otroServicio(request, 1);	
	             		}
	             		
	             	}
	             	else
	             	{
	             		//audio=otroServicio(request, 2);
	             		return IrOperadora(context);
	             	}
	             	
	             	await context.exec("Read",`resultado,${audio},1,,,${config.tiempo_marcado}`);
	             	res = await context.getVariable('resultado');
	             	if(res.value != 'undefined' && res.value == 1)
	             	{
	             		deleteAudio(audio);
	             		origin(false, true);
	             		return false;		
	             	}
	             	else
	             	{
	             		deleteAudio(audio)
	             		return IrOperadora(context);
	             	}
		        }
		        else
		        {
		        	return IrOperadora(context);
		        }
            }
            else if(typeof(respuesta)!= 'undefined' && respuesta.value=='PickedUp')//if( request.search("BookingStatus=PickedUp") != -1 )
            {
            	if(inicio_llamada==0)
				{
					if(typeof(variables.agi_arg_2)=='undefined')
					{
						inicio_llamada=1;
						//await Direcciones();	
						return Menusegundallamada(context)
					}
				}
            	// ya el taxi llego.
            	//requerimiento nuevo, se manda a leer direccion.
            	return IrOperadora(context);
            	//origin(false, true);
            	//audio=llegoTax();
            	//audio=otroServicio(request, 2);
            	/*res = await context.getData(config.audios+audio, 5000, 1);
            	if(res.result==2)
            	{
		        	return IrOperadora(context);
            	}
            	else
            	{
            		if(res.result==1)
            		{
            			origin(false, true);
            		}
            		else
            		{
            			audiodesp=audioDespedida();
            			await context.streamFile(config.audios+audiodesp);
						context.end();	
            		}
            		
            	}*/

            }
            else if(typeof(JobStatus) != 'undefined' && (typeof(Status) != 'undefined' && Status.value=='Success') )//if( request.search("JobStatus=") != -1 &&  request.search("Status=Success") != -1)
            {
            	if(booked_notsay==1)
            	{
            		booked_notsay=0;
            		context.end();	
            		return false;
            	}
            	audio=exitosa();
            	await context.streamFile(config.audios+audio); //reproduccion audio de pedido realizado
             	audiodesp=audioDespedida();
				await context.streamFile(config.audios+audiodesp);
				context.setVariable('operadora', '0');
				context.setVariable('llamar', '0');
				context.end();

            }
            else
            {
            	if(typeof(JobStatus) == 'undefined' && (typeof(Status) != 'undefined' && Status.value=='Success') )
            	{
            		return false;
            	}
		        return IrOperadora(context);
            }
	    }
	}
	/*
	* Pasar llamada a la operadora
	*
	*/
    async function IrOperadora(context)
	{

		
		try {
			console.log("***********************++IR a Operador *************************");
			banderabooked=false;
			/** Se guarda en el log del detalle **/
			bd.insert_log(asteriskId,null, null,phone, 5);
			await context.exec("Read",`'',${config.audios}${RepAudios.audio_a_operadora},,,,1`);
	    	context.setVariable('operadora', '1');
	    	context.end();
	    	return false;
	    } catch (err) {
		    console.log(err);
		  }
	}
	//llamarConductor
	/*
	* Pasar llamada al conductor
	*
	*/
    async function llamarConductor()
	{
		bd.insert_log(asteriskId,null, null,phone, 10);
		await context.streamFile(`${config.audios}${RepAudios.audio_a_operadora}`);
		context.setVariable('llamar', '1');
		context.setVariable('numberTax', numero_conductor);
		numero_conductor="";
    	context.end();
    	return false;
	}


	/*
	*	BookingRequest
	*/
	function solicitar(ResponseID, opcion)
	{
	    aleatorio=Math.floor((Math.random() * 1000) + parseInt(phone/100)*10);
	    banderastatuscall=1;
	    popup=1; //${asteriskId}
	    let mensaje=`MessageID=${aleatorio}
	    MessageType=BookingRequest
	    Password=${config.autocab.password}
	    FromCliBooking=${ResponseID},${opcion}
	    BookedForNow=true
	    PhoneSystemID=${asteriskactual}`;
	    if(config.multipania && callerfrom!="")
		{
			multip=`DialledNumber=${callerfrom}`;
			mensaje=`${mensaje}
			${multip}`;
		}
		if(config.servicios_atributo && atributoExtra!="")
		{
			extra=`JobType=${atributoExtra}`;
			mensaje=`${mensaje}
			${extra}`;	
		}
		
	    if(config.debug)
	    {
	    	console.log("***************Bookingrequest(dirección seleccionada)*****************");
	    	console.log(mensaje);
	    }
	    console.log("insertando datos");
	    console.log(asteriskactual,variables.agi_callerid);
	    solicitudbooking=1;
	    if(registroBD==1)
	    {
	    	registroBD=0;
	    	bd.insert(asteriskactual,variables.agi_callerid);
	    }
	    
	    asteriskId = asteriskactual;
	    bd.insert_log(asteriskId, aleatorio, mensaje, phone, null);
	    getConn('conectar', mensaje);
	    // como no trae request se debe consultar de una vez
	}

	/*
	*	Status service
	*/
	function statuscall()
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
	    
	    if(tomar_pedidos==0)
	    {
	    	/** se agrega log de registros **/
			bd.insert_log(asteriskId,aleatorio, mensaje, phone, null);
		    getConn('conectar', mensaje);	
	    }
	    
	}

	/*
	*	Ghost send number
	*/
	function origin(BOP, phoneid)
	{
		aleatorio=Math.floor((Math.random() * 1000) + parseInt(phone/100)*10);
		var mensaje="";
		if(phoneid && BOP)
		{
			mensaje=`MessageID=${aleatorio}
			Password=${config.autocab.password}
			MessageType=BopJob
			ApiVersion=${config.version}
			PhoneNumber=${phone}
			BOP=${BOP}
			CLI=false
			AddResponseID=true
			PhoneSystemID=${asteriskId}
			OnlySameCall=true`;
		}
		else
		{
			if(!BOP)
			{
				mensaje=`MessageID=${aleatorio}
				Password=${config.autocab.password}
				MessageType=BopJob
				ApiVersion=${config.version}
				PhoneNumber=${phone}
				BOP=${BOP}
				CLI=true
				AddResponseID=true`;
			}
			else
			{
				
				mensaje=`MessageID=${aleatorio}
				Password=${config.autocab.password}
				MessageType=BopJob
				ApiVersion=${config.version}
				PhoneNumber=${phone}
				BOP=${BOP}
				CLI=false
				AddResponseID=true`;
			}
			
		}
		if(config.multipania && callerfrom!="")
		{
			
			var multip=`DialledNumber=${callerfrom}`;
			mensaje=`${mensaje}
			${multip}`
		}
		if(config.debug)	
		{
			console.log("****************mensaje inicial(origin)*******************");
			console.log(mensaje);	
		}
		/** se agrega log de registros **/
		//console.log("******************Guarda", asteriskId, mensaje);
		bd.insert_log(asteriskId, aleatorio, mensaje, phone, null);
		getConn('conectar', mensaje);
	}

	/*
	*
	* cancel services, only reserve or dispachet
	*/
	function serviceCancel(id)
	{
		cancelado_dos=1;
		aleatorio=Math.floor((Math.random() * 1000) + parseInt(phone/100)*10);
		let mensaje="";
		if(eliminarasterisk!="")
		{
			asteriskId=eliminarasterisk;
		}
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
		/** se agrega log de registros **/
		bd.insert_log(asteriskId, aleatorio, mensaje, phone, null);
		getConn('cancelar', mensaje);
		if(config.debug)
		{
			console.log("*************************Cancelar servicio********************");
			console.log(mensaje);
		}
		//let mensaje="MessageID=1\r\nPassword=`config.autocab.password`\r\nMessageType=CancelRequest\r\nApiVersion=3\r\nPhoneNumber="+phone+"\r\nBOP=true\r\nCLI=true\r\nAddResponseID=true";
	}

	function cancelTrasferencia()
	{
		cancelado_dos=1;
		aleatorio=Math.floor((Math.random() * 1000) + parseInt(phone/100)*10);
		let mensaje="";
		if(eliminarasterisk!="")
		{
			asteriskId=eliminarasterisk;
		}
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
		/** se agrega log de registros **/
		bd.insert_log(asteriskId, aleatorio, mensaje, phone, null);
		getConn('cancelar', mensaje);

		if(config.debug)
		{
			console.log("*************************Cancelar servicio********************");
			console.log(mensaje);
		}
	}


	/**
	** Cancela para liberar recursos
	**/
	function cancelRecursos(id)
	{
		
		aleatorio=Math.floor((Math.random() * 1000) + parseInt(phone/100)*10);
		let mensaje="";
		if(eliminarasterisk!="")
		{
			asteriskId=eliminarasterisk;
		}
		if(alvuelo!="")
		{
			id = alvuelo;
		}
		
		mensaje =`MessageID=${aleatorio}
		Password=${config.autocab.password}
		MessageType=CancelCallerIDJob
		ResponseID=${id}`;
		
		/** se agrega log de registros **/
		bd.insert_log(asteriskId, aleatorio, mensaje, phone, null);
		getConn('cancelar', mensaje);
		
		if(config.debug)
		{
			console.log("*************************Liberar Recurso********************");
			console.log(mensaje);
		}
		
	}



	/**
	*
	* lee el mensaje de bienvenida.
	*/
	async function Direcciones()
	{
		if(config.debug)
		{
			console.log("reproduce bivenido");	
		}
		
		if(config.multipania)
		{
			
			
			//callerfrom="7001";
			// se reproduce el audio de la compañia
			call = bienvenidaM();
			//await context.streamFile(config.audios+call);
			//await context.exec("Read",`resultado,${call},,,,1`); original con espera
			//return context.exec("Read",`resultado,${call},,,,1`);
			//return await context.exec('playback', call);
			// await context.streamFile(call);
				
		}
		else
		{
			call=bienvenidaInicial();
			//await context.exec("Read",`resultado,${call},,,,1`); original con espera
			//return context.exec("Read",`resultado,${call},,,,1`);
			//return await context.exec('playback', call);
			//return await context.streamFile(call);
		}
		bd.insert_log(asteriskId, null, call, phone, 4);
		return await context.exec('playback', call);
	}



	/***
	** funcionq ue se encarga de enviar lo smensajes y recibirlos
	*/
	// This function create and return a net.Socket object to represent TCP client.
		function getConn(connName, mensaje){
			//parametros de conexion al api de autocab
		    var option = {
		        host:config.autocab.host,
		        port: config.autocab.port,
		    }

		    // Create TCP client.
		    var client = new net.Socket();
		    client.connect(option, function () {
		        client.write(encode(mensaje)+"\r\n\r\n");
		    });
		    
		    client.setTimeout(config.timeoutGhost*1000);

		    client.setEncoding('utf8');
		    // When receive server send back data.
		    client.on('data', function (data) {
		        //return decode(data);
		        if(bandera_timeout==1 || bandera_cancelar==1)
		        {
		        	bandera_timeout=0;
		        	return false;
		        }
		        Setrequest(decode(data));
		        //console.log('Server return data : ' + decode(data));
		    });
		    // When connection disconnected.
		    client.on('end',function () {
		        console.log('Client socket disconnect. ');
		    });

		    client.on('timeout', function () {
		    	client.destroy();
		        console.log('Client connection timeout.');
		        bandera_timeout=1;
		        bd.insert_log(asteriskId, null, 'timeout', phone, 12);
		        return IrOperadora(context);


		    });

		    client.on('error', function (err) {
		        client.destroy();
		        console.log('Client connection timeout.');
		        bandera_timeout=1;
		        return IrOperadora(context);
		        console.error(JSON.stringify(err));
		    });
		    //console.log(client);
		    return client;
		}


		/***
		*
		* funcion que retorna si el taxista confirmo el movil
		*
		*
		*/
		function confirmartax(old,newtax,old3)
		{
			//placa
			let array={};
			let idtax=newtax.find(valor => valor.name === 'VehicleCallsign');
			for(let i = 0; i< oldTaxArray.length; i++)
			{
				if(oldTaxArray[i]=="")
				{
					oldTaxArray[i] = idtax.value;
					//verificamos si no es el primero
					if(i==0)
					{
						return array={'tax': idtax.value, 'result' :false, 'tax3': i};	
					}
					else
					{
						if(oldTaxArray[i]==oldTaxArray[i-1])
						{
							return array={'tax': idtax.value, 'result' :false, 'tax3': i};	
						}
						else
						{
							// se resetea el array y se agrega en la primera posicion el tax nnuevo
							CreateArray();
							oldTaxArray[0] = idtax.value;
							return array={'tax': idtax.value, 'result' :false, 'tax3': 0};
						}
					}
				}
				else
				{
					if(oldTaxArray.length == (i+1) )
					{
						let comparar="";
						let bandera=0;
						for (let i = 0; i< oldTaxArray.length; i++) {
							if(i == 0)
							{
								comparar = oldTaxArray[i];
								continue;
							}
							else
							{
								if(comparar == oldTaxArray[i])
								{
									comparar=oldTaxArray[i];
								}
								else
								{
									bandera = 1;
									break;
								}
							}
						}
						if(bandera==1)
						{
							return array={'tax' : oldTaxArray[0], 'result' : false, 'tax3' : i};
						}
						else
						{
							return array={'tax' : oldTaxArray[0], 'result' : true, 'tax3' : oldTaxArray[0]};
						}
					}
				}

			}
			
			/** cambio para que este parametrizado **/
			/*if(old=="")
			{
				return array={'tax': idtax.value, 'result' :false, 'tax3': ''};
				
			}
			//if(old3 == "")
			//{
			//	return array={'tax': old, 'result' :false, 'tax3': idtax.value};
			//}
			//else
			//{
				if(typeof(idtax)!='undefined' && (typeof(idtax.value)!='undefined' && idtax.value != '') )
				{
					//&& oldtax3==idtax.value
					if(oldtax==idtax.value)
					{
						return array={'tax' : old, 'result' : true, 'tax3' : oldtax3};
					}
					else
					{
						oldtax="";
						oldtax3="";
						return array={'tax' : oldtax, 'result' : false, 'tax3' : oldtax3};
					}

				}
				else
				{
					return array={'tax' : old, 'result' : false, 'tax3' : oldtax3};
				}*/
			//}
			
		}
		/**
		*
		* Audios donde se dice las direcciones del cliente
		*/
		async function audios(audios, id)
		{
			direcciones="";
			total=audios.find(valor => valor.name === 'BookingCount');
			total=total.value;
			var edicion="";//'-eval "(Parameter.set \'Duration_Stretch  1.2)"';
			let arraybad=[];
			// se agrega el limite de direcciones.
			if(config.maxdirection!=-1)
			{
				if(total > config.maxdirection)
				{
					total=config.maxdirection;	
				}
			}
			console.log(total);
			for (n = 1 ; n <= total ; n ++)
			{
				
				result = audios.find(valor => valor.name === `Booking${n}-PickupStreet`);
				//result.value=leerdirecion.lecturaDireccion(result.value);
				//result.value="madrid 50-60";
				let arrayresult = await  leerdirecion.lecturaDireccion(result.value);
				if(config.debug)
				{
					console.log("****************************************************************");
					console.log("****************************************************************rsultado de direccion");
					console.log(arrayresult);
				}
				if(arrayresult[0]=="false")
				{
					console.log("entra la varo")
					arrayresult[0]=`&${config.audios}${RepAudios.direccion_incorrecta}&`; //se reproduce audio de error 
					arraybad.push(n); // se registra la opcion mala para despues saber si mandar a operadora.
				}
				
				if(arrayresult[0].search('festival_'))
				{
					let string=arrayresult[0].split('&');
					console.log("verificando como queda el string");
					console.log(string);
					//no existen audios, hay que crearlos con el festival
					for(k = 0; k < string.length; k++ )
					{
						if(string[k].search('festival_')!=-1)
						{
							if(!config.festival)
							{
								console.log("Festival no conectado");
								return IrOperadora(context);
							}
							let numero_festival = string[k].substring(9);
							crear_texto=arrayresult[1][numero_festival];
							//se crea el audio
							if(config.debug)
							console.log(` echo '${crear_texto}' | iconv -f utf-8 -t iso-8859-1 | text2wave  ${edicion} -o /var/lib/asterisk/sounds/${config.audios}${id}${n}festival_${numero_festival}.ulaw -otype ulaw -`);

							shell.exec(` echo '${crear_texto}' | iconv -f utf-8 -t iso-8859-1 | text2wave  ${edicion} -o /var/lib/asterisk/sounds/${config.audios}${id}${n}festival_${numero_festival}.ulaw -otype ulaw -`);
							shell.exec(`chmod -R 777 /var/lib/asterisk/sounds/${config.audios}${id}${i}festival_${numero_festival}.ulaw`);

							eliminar2[k]=`${id}${n}festival_${numero_festival}`;
							arrayresult[0]=arrayresult[0].replace(`&festival_${numero_festival}`, `&${config.audios}${id}${n}festival_${numero_festival}`);
						}
					}

				}
				
				console.log("direccion que retornda es la siguiente;");
				console.log(arrayresult);
				textofinal=arrayresult[0];
				arrayresult="";
				console.log("*************************direccion:"+n);
				console.log(textofinal);
				if(n==1)
				{
					if(total==1)
					{
						
						direcciones+=`${config.audios}${RepAudios.Escoja_direccion_unica}${textofinal}`;
					}
					else
					{
						direcciones+=`${config.audios}${RepAudios.Escoja_direccion}&${config.audios}${RepAudios.Direccion}&${config.audios_path}${n}${textofinal}`;
					}

				}
				else
				{
					
					if(direcciones=="")
					{
						direcciones+=`${config.audios}${RepAudios.Escoja_direccion}&${config.audios}${RepAudios.Direccion}&${config.audios_path}${n}${textofinal}`;
					}
					else
					{
						direcciones+=`&${config.audios}${RepAudios.Direccion}&${config.audios_path}${n}${textofinal}`;
						
					}
					
				}
			}
			
			if(config.debug)
			{
				console.log("cantidad de errorres*****");
				console.log(arraybad.length);
				console.log("total de direccion");
				console.log(total);
			}
			if(arraybad.length==total)
			{
				//se manda a operadora porque no tiene direcciones validas
				if(config.debug)
				{
					console.log("no tiene direcciones validas se manda a operadora");
				}
				return IrOperadora(context);
			}
			if(total==1)
			{
				direcciones+=`&${config.audios}${RepAudios.Contactar_operadora_unica}`;	
			}
			else
			{
				direcciones+=`&${config.audios}${RepAudios.Contactar_operadora}`;	
			}
			
            if(config.debug)
            {
            	console.log("********************Direcciones******************");
            	console.log(direcciones);
            }
            bd.insert_log(asteriskId, null, direcciones, phone, 11);
            return [direcciones, total, eliminar, arraybad];
		}

		/**
		*
		* Eliminar audios generados
		*/
		function deleteAudio(audio)
		{
			console.log(audio);
			if(Array.isArray(audio))
			{
				for(i=0;i<audio.length;i++)
				{
					shell.exec(`rm /var/lib/asterisk/sounds/${config.audios}${audio[i]}.ulaw`);
					
				}
			}
			else
			{
				id=audio;
				shell.exec(`rm /var/lib/asterisk/sounds/${config.audios}${id}.ulaw`);
				
			}
			
		}

		/**
		*
		* audio con el mensaje de esperar
		*/
		function waitAudio()
		{
			var texto="";
			//por favor espere mientras ubicamos un movil cerca a ud
			if(config.debug)
			{
				console.log("aqui comienza");
				console.log(Primera_Espera);
				console.log(alvuelo);
				console.log("aqui termina");	
			}
			
			if(Primera_Espera==0 && alvuelo!="")
			{
				
				texto=`${config.audios}${RepAudios.Espere_movil}`;
				Primera_Espera=1;

			}
			else
			{
				if(intentos_ubi!=0)
				{
					let number2=intentos_ubi/(config.intentos_ubi/config.tiempo_audio_intentos);
					//console.log("*******************************intentos numero:"+intentos_ubi);
	            	if(Number.isInteger(number2))
	            	{

						if(config.permitir_cancelar)
						{
							
							texto=`${config.audios}${RepAudios.Solicitud_pendiente}&${config.audios}${RepAudios.audio_cancelar_book}`
						}
						else
						{
							texto=`${config.audios}${RepAudios.Solicitud_pendiente}&${config.audios}${RepAudios.audio_cancelar_book_false}`
						}	
					}
				}
			}
			
            return texto;
		}
		/**
		*
		* Audio con la reserva exitosa.
		**/
		function serviceBook(audios)
		{
		 	bookingid=audios.find(valor => valor.name === 'BookingID');
			if(typeof(bookingid) !='undefined' && bookingid.result != '' )
			{
				bookingid= bookingid.value;
			}
            return RepAudios.exitoso_peticion;
		}

		/*
		*	dispached audio con los detalles del despacho
		*/
		async function DispatchedAudio(audios)
		{
			
			//var texto="el despacho, ";
			var texto=`${config.audios}${RepAudios.El_despacho}`;
			var id="";
			var codigo="";
			var tiempo="";
			edicion="";//'-eval "(Parameter.set \'Duration_Stretch  1.3)"';
			id="datos";
			id=id+new Date().getTime();
			id=id.replace(" ", "");
			//nombre
			nombre=audios.find(valor => valor.name === 'CustomerName');
			if(typeof(nombre)!='undefined' && (typeof(nombre.value)!= 'undefined' && nombre.value != '') && config.lectura_conductor)
			{
				//texto + = ` ${texto} a nombre de  ${nombre.value} ha sido asignado con éxito, `;
				texto  = `${texto}&${config.audios}${RepAudios.A_nombre_de}`;
				shell.exec(`echo ${nombre.value} | iconv -f utf-8 -t iso-8859-1 | text2wave  ${edicion} -o /var/lib/asterisk/sounds/${config.audios}${id}1.ulaw -otype ulaw -`);
				shell.exec(`chmod -R 777 /var/lib/asterisk/sounds/${config.audios}${id}1.ulaw`);
				texto = `${texto}&${config.audios}${id}1&${config.audios}${RepAudios.Asignado_exito}`;
				
			}
			else
			{
				//texto  =` ${texto} ha sido asignado con éxito, `;
				texto = `${texto}&${config.audios}${RepAudios.Asignado_exito}`;
			}
			//placa
			placa=audios.find(valor => valor.name === 'VehicleRegistration');
			let placa1="";
			if(typeof(placa)!='undefined' && (typeof(placa.value)!='undefined' && placa.value != '') && config.lectura_placa)
			{
				placa.value=placa.value.replace(/ /g, "");
				placa1=placa.value;
				placa.value=placa.value.substring(0,6);
				let aqui=placa.value.match(/.{1,1}/g);
				placa.value="";
				texto  =`${texto}&${config.audios}${RepAudios.Placa_vehiculo}`;
				aqui.forEach(function (element)
				{
				  
				  if(isNaN(element))
				  {
				  	//si es letra se busca audio de letra
					texto  =`${texto}&${config.audios_path_letters}${element.toLowerCase()}`;

				  }
				  else
				  {
				  	//si es numero 
					texto  =`${texto}&${config.audios_path}${element}`;
				  }
				});
			}
			//ETA
			eta=audios.find(valor => valor.name === 'ETA');
			if(typeof(eta)!='undefined' && (typeof(eta.value)!='undefined' && eta.value!='') && config.ETARequest)
			{
				eta.value=config.ETA < eta.value ? config.ETA : eta.value;
				eta.value=eta.value == 0 ? config.ETA : eta.value;
				texto = `${texto}&${config.audios}${RepAudios.ETA}`;
				texto  =`${texto}&${config.audios_path}${eta.value}&${config.audios}${RepAudios.Minutos}`;	
			}
			//codigo
			if(config.lectura_codigo)
			{
				codigo=phone.substr(-2);
				resultCodigo = await leerdirecion.dispatchedNumber(codigo);
				texto  =`${texto}&${config.audios}${RepAudios.Codigo}${resultCodigo}`;
				console.log("el codigo:")
				console.log(texto);
				
			}
			var llamar;
			driver=audios.find(valor => valor.name === 'DriverPhone');
			if(typeof(driver)!='undefined' && (typeof(driver.value)!='undefined' && driver.value!='') )
			{
				texto = `${texto}&${config.audios}&${config.audios}${RepAudios.llamada_conductor}`;
				numero_conductor=driver.value;
			}

            if(config.permitir_cancelar)
            {
            	texto = `${texto}&${config.audios}${RepAudios.cancelar_dispatcher}`;
            }
            else
            {
            	texto = `${texto}&${config.audios}${RepAudios.cancelar_dispatcher_false}`;
            }
            
            eliminar=[`${id}1`,`${id}2`, `${id}3`, `${id}4`];
            /** comienza el envio de mensaje **/
            /*console.log("****************+Comienza las variables********************");
            console.log("inicio de llamada",inicio_llamada);
            console.log("sms second call",config.smsSecond_call);
            console.log("sendsmscall",config.smsActive);
            console.log("bandera sms",sms_bandera);
            console.log("bandera phone",variables.agi_callerid);
            if((inicio_llamada!=5 || config.smsSecond_call==true) && config.smsActive && sms_bandera==0)
            {
            	console.log("llega al sms");
            	sms_bandera=1;
            	let drivername1="";
            	let driversign="";
            	let VehicleRegistration=audios.find(valor => valor.name === 'VehicleRegistration');
            	console.log(placa1);
            	if(placa1!="" && config.lectura_placa)
            	{
            		console.log("llega al palca smsmssm");
            		
            	}
            	//conductor
            	let DriverName=audios.find(valor => valor.name === 'DriverName');
            	if(typeof(DriverName)!='undefined' && (typeof(DriverName.value)!='undefined' && DriverName.value!=''))
            	{
            		drivername1=DriverName.value;
            	}
            	let DriverCallsign=audios.find(valor => valor.name === 'DriverCallsign');
            	if(typeof(DriverCallsign)!='undefined' && (typeof(DriverCallsign.value)!='undefined' && DriverCallsign.value!=''))
            	{
            		driversign=DriverCallsign.value;
            	}
            	bd.insert_log(asteriskId, null, null, phone, 20);
            	await sms.sendsms(phone,placa1,drivername1,driversign);
            }*/
            return [texto,eliminar];
		}

		/**
		*
		*Pedidos multiples.
		*/
		function otroServicio(Audio, tipo)
		{
			console.log(tipo)
			if(tipo==1)
			{
				return `${config.audios}${RepAudios.Servicio_cancelado}`;
			}
			else
			{
				return `${config.audios}${RepAudios.Servicios_pendientes}`;
			}
		}

		/*
		*llegoTax
		*
		*/
		function llegoTax()
		{
            return RepAudios.Servicio_en_progreso;
		}

		/**
		*
		*Audio despedida
		*/
		function audioDespedida()
		{
            return RepAudios.despedida;
		}

		/**
		*
		*Audio despedida
		*/
		function audioError()
		{
            return RepAudios.audioError2;
		}

		function exitosa()
		{
			
            console.log("cancelado funciona");
            console.log(cancelado_dos);
            bandera_cancelar=1;
            if(cancelado_dos==1)
            {
            	banderabooked=false;
            	cancelado_dos=0;

            	return RepAudios.exitoso_cancel;
            }
            else
            {
            	return RepAudios.exitoso;	
            }
            
		};

		async function verificar()
		{
			let valor = await context.exec("MusicOnHold",`${config.moh},${config.tiempo_por_intentos}`);


			if(valor.result != 0)
            {
            	return String.fromCharCode(valor.result);
            }
            else
            {
            	return 'null';
            }

		}
		async function  tiempoEspera()
		{
            //valor = await context.exec("WaitExten",`${config.tiempo_por_intentos},macroform-the_simplicity`);

            valor = await context.exec("MusicOnHold",`${config.moh},${config.tiempo_por_intentos}`);
            
            
            if(valor.result != 0)
            {
            	return String.fromCharCode(valor.result);
            }
            else
            {
            	return 'null';
            }
		}

		async function  tiempoEsperaConfirmarPlaca()
		{
            //valor = await context.exec("WaitExten",`${config.tiempo_por_intentos},macroform-the_simplicity`);
            valor = await context.exec("MusicOnHold",`${config.moh},${config.tiempo_intentos_confirmar_placa}`);	
            
            if(valor.result != 0)
            {
            	return String.fromCharCode(valor.result);
            }
            else
            {
            	return 'null';
            }
		}


		function bienvenidaInicial()
        {
			return `${config.audios}${RepAudios.bienvenida}`;
        };


		function bienvenidaM()
		{
            return `${config.audios}${RepAudios.bienvenidaMulti}&${config.audios}${listC[callerfrom]}`;
		};

		function servicioAtributos()
		{
            texto=`${config.audios}${RepAudios.Seleccione_una}&${config.audios}${RepAudios.Opcion}`;
            let opciones="";
            for(i=1;i<=Object.keys(listA).length;i++)
            { console.log(i);
            	opciones=`${opciones}&${config.audios}${RepAudios.Opcion}&${config.audios_path}${i}&${config.audios}${listA[i]}`;
            }
            texto=`${texto}${opciones}`;
            return texto;
		};
		/**
		*
		* menu, esto lo dice cuando llaman a la segunda vez
		*/
		async function Menusegundallamada(context)
		{
            console.log("llega al menu");
            texto=`${config.audios}${RepAudios.Menu_segunda_llamada}`;
            banderabooked=false;
            await context.exec("Read",`resultado,${texto},1,,,${config.tiempo_marcado}`);
			res= await context.getVariable('resultado');
			if(( typeof(res.value)=='undefined' || res.value < 0 ) || (intentos>=config.intentos))
    		{
    			return IrOperadora(context);
    		}
    		else
    		{
    			if(res.value == 1 )
    			{
    				res="";
    				inicio_llamada=5; //no deno esperar confirmacion de placas
    				 tiempo_inicial_espera = new Date().getTime();
    				statuscall();
    				//return false;
    			}
    			else if(res.value == 2)
    			{
    				res="";
    				despacharEnseguida=1;
    				//parametro para registrar la solicitud
    				registroBD=1;
    				origin(false, true);
    				
    			}
    			else
    			{
    				//console.log(context);
    				await bd.insert(asteriskId,variables.agi_callerid);
    				return IrOperadora(context);
    			}
    		}
            
            
		};


		/***
		**
		*
		* si esta habilitado la primera vez que llama se activa este menú
		*/
		async function MenuUnicaDireccion(request, responseid, context)
		{
            	
        	console.log("Menu_no_direccion");
            await context.exec("Read",`resultado,${config.audios}${RepAudios.Menu_no_direccion},1,,,${config.tiempo_marcado}`);
		    res= await context.getVariable('resultado');
	    	console.log(res);
    		if(res.value!=1)
    		{
    			console.log("cualquier opcion diferente a 1 se enviía a operador, cambio opcion valet");
    			return IrOperadora(context);	
    		}
    		else
    		{
    			console.log(res);
    			return solicitar(responseid, res.value);
    		}
		};
		async function CreateArray()
		{
			oldTaxArray=[];
			for (var i = 0; i < config.validacion_placa; i++) {
			    oldTaxArray[i] = "";
			}
		}

	
}
//fin del handler

//codifica los mensajes en base64
function encode(message)
{
    let data = message;
    let buff = new Buffer.from(data);  
    return  base64data = buff.toString('base64');
}

//decodifica los mensajes
function decode(message)
{
    let data = message;
    let buff = new Buffer.from(data, 'base64');  
    return text = buff.toString('ascii');
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

function  certificar()
{
	//shell.exec(`echo ${eta.value} | iconv -f utf-8 -t iso-8859-1 | text2wave  ${edicion} -o /var/lib/asterisk/sounds/${config.audios}${id}3.ulaw -otype ulaw -`);
	shell.exec(`dmidecode | grep UUID > ./1.txt`);
	shell.exec(`ifconfig -a | grep -o -E '([[:xdigit:]]{1,2}:){5}[[:xdigit:]]{1,2}' >> ./1.txt`);
	archivo="";
	
	
	//return false;
}
function cifrar(mensaje)
{
	var text = JSON.stringify(mensaje);
    var textBuffer = new Buffer(text, 'utf8');
    var cipher = crypto.createCipher('aes-256-ecb', 'AcSXDAgfmFbxs56m');
    cipher.write(textBuffer);
    cipher.end();
    return cipher.read().toString('hex');
	
}

function decifrar(mensaje)
{
	var hexBuffer = new Buffer(mensaje, 'hex');
    var decipher = crypto.createDecipher('aes-256-ecb', 'AcSXDAgfmFbxs56m');
    decipher.write(hexBuffer);
    decipher.end();
    var data = decipher.read().toString('utf8');
    return JSON.parse(data);
	
}

function tiempoTranscurrido(tiempo_inicial_espera){
	/** se resta el tiempo inicial con el tiempo actual para saber cuanto tiempo ha transcurrido **/
	let now = new Date().getTime();
	return ( (now - tiempo_inicial_espera) / 1000 );

}

function exitoCallback()
{
	console.log("se hace la promesa");
}

function falloCallback()
{
	console.log("se hace la promesa2621");
}

async function AudioReproduce(audio, time, context) {
   
    return  await context.exec("Read",`resultado,${audio},1,,,${time}`);
    
}




//levanta el servidor
var agi = new AGIServer(handler);
agi.start(3000);


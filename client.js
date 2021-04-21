let net = require('net');
let IVR2PopUpMessages = require('./includes/IVR2PopUpMessages.js');
const config={};
//config.operators = ['192.168.2.101', '192.168.2.102', '192.168.2.103', '192.168.2.104', '192.168.2.105', '192.168.15.240']; //ips clientPopups
config.operators = ['192.168.25.30']; //ips clientPopups
config.popUpPort=4242; //port node clientPopup
var extend = require('util')._extend;
let config2 = require('./includes/config');
/***
** funcionq ue se encarga de enviar lo smensajes y recibirlos
*/
// This function create and return a net.Socket object to represent TCP clientPopup.
function SendNotifications(phone, estatus)
{
    // Create TCP clientPopup.
    
    let date='';
    let clientPopup = [];
    if(estatus==1)
    {
    	for (var i = 0; i < config.operators.length; i++) 
	    {
	    	clientPopup[i] = new net.createConnection(config.popUpPort, config.operators[i]);
			if(!config2.config.permitir_cancelar_colgar)
			{
				clientPopup[i].on('connect', function ()
				{
					var date = new Date();
					popUpMessage = extend({}, IVR2PopUpMessages.PopUpMessage);
					popUpMessage.Message = date.toLocaleTimeString() + " > LLAMADA DEL " + phone + " FUE COLGADA. SERVICIO NO DESPACHADO.";
					this.write(JSON.stringify(popUpMessage));
					console.log('mensaje enviado');
					this.end();
					this.destroy();
				});	
			}
			else
			{
				clientPopup[i].on('connect', function ()
				{
					var date = new Date();
					popUpMessage = extend({}, IVR2PopUpMessages.PopUpMessage);
					popUpMessage.Message = date.toLocaleTimeString() + " > LLAMADA DEL " + phone + " FUE COLGADA. SERVICIO CANCELADO.";
					this.write(JSON.stringify(popUpMessage));
					console.log('mensaje enviado');
					this.end();
					this.destroy();
				});
			}

			clientPopup[i].on('error', function(err) {
				console.log(err);
			});
		};	
    }
    else
    {
    	if(estatus==2)
    	{
    		for (var i = 0; i < config.operators.length; i++) 
			{
				clientPopup[i] = net.createConnection(config.popUpPort, config.operators[i]);
				clientPopup[i].on('connect', function () 
				{
					var date = new Date();
					popUpMessage = extend({}, IVR2PopUpMessages.PopUpMessage);
					popUpMessage.Message = date.toLocaleTimeString() + " > LLAMADA DEL " + phone + " FUE COLGADA. ADVERTENCIA: SERVICIO DESPACHADO.";
					
					this.write(JSON.stringify(popUpMessage));
					
					this.end();
					this.destroy();
				});

				clientPopup[i].on('error', function(err) {
					console.log(err);
				});
			};	
    	}
    	
    }
}

module.exports ={SendNotifications};

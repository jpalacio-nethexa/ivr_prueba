let config2 = require('./config');
let fs = require('fs');
const config = config2.config;
var writtenNumber = require('written-number');
writtenNumber.defaults.lang = 'es';
//const expresion="^[A-Za-z #.]{3,5}[0-9]{1,3}[ #]{0,1}[A-Za-z]{0,2}[ #]{0,1}[A-Za-z]{0,1}[ #]{0,1}[0-9]{1,3}[A-Za-z]{0,2}[ #A-Za-z]{0,2}[-]{0,1}[0-9]{0,3}";
const expresion ="^[A-Za-z]{2}[ #.]{1,2}[0-9]{1,3}[ #]{0,1}[A-Za-z]{0,2}[ A-Za-z]{0,2}[ ]{0,1}[#.]{0,1}[ ]{0,1}[0-9]{1,3}[a-zA-Z]{0,2}[ A-Za-z]{0,2}[- ]{1}[0-9]{1,3}";
const list2 =
{
	"cl" : "Calle",
	"av" : "Avenidad",
	"ap" : "Apartamento",
	"autop" : "Autopista",
	"brr" : "Barrio",
	"cc" : "Circular",
	"conj" : "Conjunto",
	"cr" : "Carrera",
	"depto" : "Departamento",
	"dg" : "Diagonal",
	"esq": "Esquina",
	"kr" : "Carrera",
	"lot" : "Lote",
	"manz" : "manz",
	"mezz" : "Mezzanine",
	"occ" : "Occidente",
	"of" : "Oficina",
	"pis" : "Piso",
	"secc" : "Seccion",
	"transv" : "Transversal",
	"trr" : "Torre",
	"tv" : "Transversal",
	"#" : " numero "
	
};
const list =
{
	"#" : " numero ",
	"-" : " "
	
};
async function lecturaDireccion(mensaje)
{
	//addres=addressToStreams(mensaje);
	addres=mensaje.match(expresion);
	console.log("*****DireccionOriginal*****************************************************************");
	console.log(mensaje);
	console.log("*****Fin***********");
	console.log(addres);
	if(addres!=null && addres[0]!="")
	{
		mensaje=addres[0];
		/*** Agregar numero en el sgundo espacio ***/
		if(config.agregarnumero)
		{
			cadenas= mensaje.split(" ");
			console.log("*******************************++viene un:");
			console.log(cadenas[2].substring(0,1));

			if(typeof cadenas[2]!= 'undefined' && cadenas[2].substring(0,1)!='#' && (cadenas[2].substring(0,1)!='S' && cadenas[2].substring(0,1)!='s') && (cadenas[2].substring(0,1)!='N' && cadenas[2].substring(0,1)!='n' ) && (cadenas[2].substring(0,1)!='E' && cadenas[2].substring(0,1)!='e') && (cadenas[2].substring(0,1)!='O' && cadenas[2].substring(0,1)!='o') )
			{
			  mensaje2="";
			  let i=0;
			  for (let value of cadenas)
			  {
			    if(i==2)
			    {
			      mensaje2+='número ' + cadenas[i] + ' ';
			    }
			    else
			    {
			      mensaje2 += cadenas[i] + ' ';  
			    }
			    
			    i++;
			    
			  }
			  mensaje=mensaje2;
			}
		}
		/** fin de agregawr numero **/
	}
	else
	{
		addres="";
		/*if(!config.festival)
		{
			return ["false"];	
		}*/
		
	}
	mensaje = mensaje.replace(/ S /gi, ' Sur ');
	mensaje = mensaje.replace(/ N /gi, ' Norte ');
	mensaje = mensaje.replace(/ E /gi, ' Este ');
	mensaje = mensaje.replace(/ O /gi, ' Oeste ');
	
		console.log("*****Dirección comienza*************");
		if(addres!="")
		console.log(addres[0]); 
		console.log(mensaje);
		console.log("*******Dirección termina************");	
		console.log("antes de agregar diccionario");
		console.log(mensaje);
	
	let prueba = JSON.parse(JSON.stringify(list));
	let keys = (Object.keys(prueba));
	for(j=0;j<keys.length;j++)
	{
		if(mensaje.search(new RegExp(keys[j], 'i')) != -1)
		{
			mensaje = mensaje.replace(new RegExp(keys[j], 'gi'), prueba[keys[j]]);
		}
	}
	console.log("despues de agregar diccionario");
	console.log(mensaje);
	mensaje = mensaje.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
	mensaje = mensaje.toLowerCase();
	//mensaje = SepararDireccion(mensaje);
	//mensaje = mensaje.toUpperCase();
	//mensaje = SepararNumeros(mensaje);
	console.log("despues de agregar todo");
	console.log(mensaje);
	// preparando audios
	/**
	*
	* se separa las palabras
	**/
	let reg = new RegExp(',')
	mensaje = mensaje.replace(/[,.]/gm, '')
	mensaje2 = mensaje.split(' ');
	console.log("mensaje separados");
	console.log(mensaje2);
	//preparar audios
	texto = await buscarAudios(mensaje2);

	/***
	**** se termina los cambios
	*/
	return texto;
	//return texto;
};


/**
*
* proceso nuevo para combinar festival con audios pregrabados
*/
async function buscarAudios(mensaje)
{
	
	console.log("llega los mensajes**************************+");
	console.log(mensaje);
	//limpiamos el array
	var mensaje = mensaje.filter(function (el) {
	  if(el != null && el !="")
	  {
	  	return el
	  }
	});

	
	console.log("mensaje original antes de procesar todo");
	console.log(mensaje);

	let audio="";
	let festival=[];
	//se recorre el mensaje para ir generando los audios
	for(i=0; i < mensaje.length; i++)
	{
		
		if(mensaje[i]!="")
		{
			if(mensaje[i].match(".*\\d.*")!=null)
			{
				//verificar si es numero
				if(!isNaN(mensaje[i]))
				{
					//si es numero
					//respuesta = await  existeDireccionNumero(mensaje[i]);
					search = writtenNumber(mensaje[i]);
					console.log("resultado de la librería")
					console.log(search)
					datos= search.split(" ");
					for( ii= 0; ii<datos.length; ii++)
					{
						respuesta = await  existeDireccionNumero(datos[ii]);
						if(respuesta=='true')
						{
					    	console.log('Se encuentra el audio de numero');
					    	audio+=`&${config.audios_path}${datos[ii]}`;
						}
					}
				}
				else
				{
					//letra pegado de numero
					//se manda a una funciona que me devuelve un array con los valores
					datos2 = await separarNumerosLetras(mensaje[i]);
					console.log("valor devuelto;")
					for (iii=0; iii<datos2.length; iii++)
					{
						if(!isNaN(datos2[iii]))
						{
							//si es numero
							search2 = writtenNumber(datos2[iii]);
							console.log("resultado de la librería")
							console.log(search2)
							datos3= search2.split(" ");
							for( j= 0; j<datos3.length; j++)
							{
								respuesta = await  existeDireccionNumero(datos3[j]);
								if(respuesta=='true')
								{
							    	console.log('Se encuentra el audio de numero');
							    	audio+=`&${config.audios_path}${datos3[j]}`;
								}
							}

						}
						else
						{
							//si es letra

							respuesta3 = await  existeDireccionString(datos2[iii]);
							if(respuesta3=='true'){
							    console.log('Se encuentra el audio');
							    audio+=`&${config.audios_path_letters}${datos2[iii]}`;
							}
							else
							{
								console.log("no existe el audio, debe registrarse en el block y reproducir con festival");
								audio+="&festival_"+i;
								festival[i] = datos2[iii];
								escribirNota(datos2[iii]);
							}
						}
					}
				}
			}
			else //caso en que es una letra o palabra sin números.
			{
				respuesta = await  existeDireccionString(mensaje[i]);
				if(respuesta=='true'){
				    console.log('Se encuentra el audio');
				    console.log(mensaje[i]);
				    audio+=`&${config.audios_path_letters}${mensaje[i]}`;
				}
				else
				{
					console.log("no existe el audio, debe registrarse en el block y reproducir con festival");
					audio+="&festival_"+i;
					festival[i] = mensaje[i];
					await escribirNota(mensaje[i]);
				}
			}	
		}
		else
		{
			continue;
		}
	}
	console.log("como queda el audio:");
	console.log(audio);
	console.log(festival);
	return [audio, festival];
}


/**
*
* revisa si existe el audio
**/
async function existeDireccionString(texto)
{
	let valor ="";
	let path="";
	
	//si es palabra o letra
	path='extras/address/';
	if (fs.existsSync(`${path}${texto}.wav`)) {
		valor='true';
	}
	else{
		valor='false';
	}
	return valor;
}

function separarNumerosLetras(texto)
{
	retornar=[];
	contador=0;
	for(k=0; k<texto.length; k++)
	{
		valor = texto.charAt(k);
		if(!isNaN(valor))
		{
			if(k==0)
			{
				retornar[contador]=valor;
				contador++;
			}
			else
			{
				if(!isNaN(texto.charAt(k-1)))
				{
					retornar[contador-1]=`${retornar[contador-1]}${valor}`;
				}
				else
				{
					retornar[contador]=valor;
					contador++;		
				}
			}
		}
		else
		{
			retornar[contador]=valor;
			contador++;
		}
	}
	
	console.log(" resultado de la separacion");
	console.log(retornar);
	return retornar;
}
/**
*
* revisa si existe el auddio numero
**/
async function existeDireccionNumero(texto)
{
	let valor ="";
	let path="";
	path='extras/numbers/';
	
	console.log(`${path}${texto}.wav`);
	if (fs.existsSync(`${path}${texto}.wav`)) {
		valor='true';
	}
	else{
		valor='false';
	}
	console.log("retorno del valor");
	console.log(valor);
	return valor;
}

/**
*
* Agrega el audio falntante en el txt
*
*/
function escribirNota(mensaje)
{

	fs.readFile(`extras/AudiosFaltantes.txt`, 'utf8', function (err, data) 
	{
	  /*console.log("datos del archiv es:");
	  console.log(data);*/
	  if(err) 
	  {
	  	console.log("ha ocurrido un error al intentar leer archivo de AudiosFaltantes");
	  }

	  if(data == "") 
	  {
	  	fs.appendFile(`extras/AudiosFaltantes.txt`,  mensaje+'\r\n', (err) => 
		{
			if(err) 
			{
			    
			    console.log("Ha ocurrido un error mientras se intentaba guardar mensaje en archivo")
			    console.log('error: ', err);
			} 
			else 
			{
			    
			    console.log("mensaje guardado en archivo priemra vez");
			    console.log(mensaje);
			}
		});		
	  }
	  else
	  {
	  	
   		if(data.indexOf(mensaje) < 0)
		{
			fs.appendFile(`extras/AudiosFaltantes.txt`,  mensaje+'\r\n', (err) => 
			{
				if(err) 
				{
				    
				    console.log("Ha ocurrido un error mientras se intentaba guardar mensaje en archivo")
				    console.log('error: ', err);
				} 
				else 
				{
				    console.log("mensaje guardado en archivo");
				    console.log(mensaje);
				}
			});  	
		}	
	  }
	});	
}

function SepararNumeros(mensaje)
{
	// se buscan los numeros
	valores=mensaje.match(/\d+/g);
	if(valores!=null && valores!="")
	{

		valores.forEach(function(elemento)
		{
		  console.log(elemento);
		  mensaje = mensaje.replace(elemento, elemento+' ');
		});	
	}
	
	return mensaje;
}

function SepararDireccion(mensaje)
{
	return mensaje.replace(new RegExp(' ', 'gi'), ' ');
}

async function dispatchedNumber(leer)
{
	//letra pegado de numero
	//se manda a una funciona que me devuelve un array con los valores
	audio="";
	festival="";
	datos2 = separarNumerosLetras(leer);
	console.log("valor devuelto;")
	if(!isNaN(datos2))
	{
		//si es numero
		search2 = writtenNumber(datos2);
		console.log("resultado de la librería")
		console.log(search2)
		datos3= search2.split(" ");
		for( j= 0; j<datos3.length; j++)
		{
			respuesta = await  existeDireccionNumero(datos3[j]);
			if(respuesta=='true')
			{
		    	console.log('Se encuentra el audio de numero');
		    	audio+=`&${config.audios_path}${datos3[j]}`;
			}
		}
	}
	console.log("llegaaaa")
	return audio;
}


function addressToStreams(address) 
{
  addressStreams = "ivr/taxi/su-direccion-es";
  addressParts = address.match(/[\w]*/g);
  console.log(addressParts);

	for (var i = 0; i < addressParts.length; i++) 
	{

		if (i == 3) 
		{
			addressStreams += "&ivr/address/con";
			continue;
		}

		if (addressParts[i] === "") { continue; }

		if (/^[0-9]+$/g.test(addressParts[i])) 
		{ //Numeric
			console.log("Number: " + addressParts[i]);
			addressStreams = numericAddress(addressParts[i]);

		} else if (/^[a-zA-Z]+$/.test(addressParts[i])) { // Alpha
			console.log("Alpha: " + addressParts[i]);
			addressStreams += "&ivr/address/" + addressParts[i].toLowerCase();

		} else if (/[\w]*/g.test(addressParts[i])) 
		{ // AlphaNumeric
			console.log("Alphanumeric: " + addressParts[i]);
			parts = addressParts[i].match(/(\d+|[\D]+)/g);

			console.log(parts);

			for (var k = 0; k < parts.length; k++) 
			{
				if (/^[a-zA-Z]+$/.test(parts[k])) { // The alpha part
				  addressStreams = letterAddress(parts[k]);
				} else { //Numeric
				  addressStreams = numericAddress(parts[k]);
				}
			}
		}
	}
  
  return addressStreams;

  function numericAddress(addressPart) 
  {
    if (Number(addressPart) <= 20) {
      addressStreams += "&ivr/numbers/" + Number(addressPart);

    } else if (Number(addressPart) >= 21 && Number(addressPart) <= 29) {
      digits = addressPart.split("");
      addressStreams += "&ivr/numbers/veinti";
      addressStreams += "&ivr/numbers/" + digits[1];

    } else if (Number(addressPart) >= 101 && Number(addressPart) <= 199) {
      digits = addressPart.split("");
      ten = Number(digits[1] + digits[2]);

      addressStreams += "&ivr/numbers/ciento";

      if (ten <= 20) {
        addressStreams += "&ivr/numbers/" + ten;

      } else if (ten >= 21 && ten <= 29) {
        addressStreams += "&ivr/numbers/veinti";
        addressStreams += "&ivr/numbers/" + digits[2];

      } else if (ten % 10 == 0) {
        addressStreams += "&ivr/numbers/" + ten;

      } else {
        addressStreams += "&ivr/numbers/" + digits[1] + "0";
        addressStreams += "&ivr/numbers/y";
        addressStreams += "&ivr/numbers/" + digits[2];
      }

    } else if (Number(addressPart) % 10 == 0) {
      addressStreams += "&ivr/numbers/" + Number(addressPart);

    } else {
      digits = addressPart.split("");
      for (var j = 0; j < digits.length; j++) {
        if (digits.length >= 2) {
          if (digits.length >= 2 && j + 1 == digits.length) {
            addressStreams += "&ivr/numbers/y";
          }
        }
        if (Number(digits[j] != 0)) {
          addressStreams += "&ivr/numbers/" + digits[j] + (Array(digits.length - j).join("0"));
        }
      }
    }
    return addressStreams;
  }

  function letterAddress(letters) {
    letters = parts[k].split("");
    console.log("Letters: " + letters);
    for (var w = 0; w < letters.length; w++) {
      if (letters[w].toLowerCase() == 's') {
        addressStreams += "&ivr/phonetic/sur";
      } else {
        addressStreams += "&ivr/phonetic/" + letters[w].toLowerCase();
      }
    }
    return addressStreams;
  }
}

function phoneToStreams (phoneNumber) {
  var msg = "";
  for (var i in phoneNumber) {
    if (i == 0) {
      msg += "ivr/numbers/" + phoneNumber[i];
    } else {
      msg += "&ivr/numbers/" + phoneNumber[i];
    }
  }

  return msg;
}




/**
**
* Verifica si existe un archivo
*
*/
function fileExists(file, cb) {
  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return cb(null, false);
      } else { // en caso de otro error
        return cb(err);
      }
    }
    // devolvemos el resultado de `isFile`.
    return cb(null, stats.isFile());
  });
}


module.exports ={lecturaDireccion, dispatchedNumber};




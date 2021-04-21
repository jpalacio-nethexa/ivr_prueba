var requests = require("request");
let config2 = require('./config');
const config = config2.config;
const fetch = require('node-fetch');
const axios = require('axios');


async function sendsms(telefono, placa, conductor, Nromovil)
{
  
  let mensaje = `${config.smsMensaje1} ${placa} ${config.smsMensaje2} ${config.smsMensaje3} ${conductor} ${config.smsMensaje4} ${Nromovil} ${config.smsMensaje5} ${config.smsEmpresa}`;
  var options = {

    method: config.smsMethod,
    //url: config.smsUrl,
    //headers: { 'content-type': 'application/x-www-form-urlencoded' },

    params : 
    {
      key : config.smsApikey,
      client: config.smsClientId,
      phone: telefono,
      sms: mensaje,
      'country-code': config.smsCountry_code,
    },
    paramsSerializer: (params) => {
        // Sample implementation of query string building
        let result = '';
        Object.keys(params).forEach(key => {
            result += `${key}=${encodeURIComponent(params[key])}&`;
        });
        return result.substr(0, result.length - 1);
    }
    

  };
axios.defaults.headers = 
{
  'content-type': 'application/x-www-form-urlencoded'
}
//console.log(options);
var data="";
try {
    data  = await axios(config.smsUrl, options)
} catch (error) {
  //console.log(Object.keys(error), error.message); 
  
  console.log(error.response.data)
  return 0;
}
return 1;
/*const response = await axios(config.smsUrl, options);
const body = await response;
if(typeof (body.error) == 'undefined')
{
  return 1;
  console.log("Enviado");
}
else
{
  console.log(body.msg);
  return 0;
  
}*/

  //let {error, response, body} = await requests(options);
  /*await requests(options, async function (error, response, body) {
  if (error) throw new Error(error);
  if(typeof (body.error) != 'undefined')
  {
    console.log("Enviado");
  }
  else
  {
    
    console.log("No Enviado");
  }
  
});*/



  /*if (response.statusCode !== 200){
    return error(response);
  }*/

  //success(response, body);
  /*await requests(options, function (error, response, body) {

    if (error) throw new Error(error);

    console.log(body);

  }); */
 

}


async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}
function success (response, body) {
    //const $ = cheerio.load(body)
    console.log(`Status: ${response.statusCode}`)
    console.log(`Message: ${response.statusMessage}`)
    //console.log(`Request: ${$('.g').length} results found!`)
}

function error (response) {
    console.log(`Status: ${response.statusCode}`)
    console.log(`Message: ${response.statusMessage}`)
}


module.exports = {sendsms};

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(__dirname+'/autocab.db');
let config2 = require('./config');
const config = config2.config;
//console.log("***********************************************************************************kkkkkkkkkkkkkkkkkkk",config.datatime);
let clientTime=config.datatime*60;

/**
*revisa llamadas de hace 10 minutos
*returna un array con boolean del resultado e id del servicio de ser positivo
**/
async function find(phone){
  	let actual= Math.floor(Date.now() / 1000);
	console.log(`SELECT * FROM servicios where telefono_usuario=${phone} and (${actual}-fecha)<${clientTime} order by fecha desc limit 1;`);
	query=`SELECT * FROM servicios where telefono_usuario=${phone} and (${actual}-fecha)<${clientTime} order by fecha desc limit 1;`;
  	function datos()
  	{
	   return new Promise ((resolve, reject) => 
	   {
		  	db.get(query, function (err, rows) 
		  	{
		    	if(err)
		    	{	
		    		reject (`Error en la consulta : ${query}`);
		    		
		    	}else{
		        	resolve (rows);
		    	}
		  	});
		});
	}
	 try {
        let result = await datos ();
        return {'result': true ,'id' : result.phonesystemid};
    } catch (error) {
        return {'result': false, 'id' : null};
        //return error;
    }
}
function print(error, result) {
  console.log("lleg33333333333a")
  console.log(result);
}
async function find1(phone)
{
	//buscamos el registro del contacto que tenga menos de 10 minutos.
	let actual= Math.floor(Date.now() / 1000);
	db.runAsync(`SELECT * FROM servicios where telefono_usuario=${phone} and (${actual}-fecha)<600 order by fecha desc limit 1;`, function(err, row) {
				console.log("llega333");
				console.log(row);
				return {'respuesta' : true, 'id' : row.phonesystemid};
	})
	
}

//obtener valor de select
db.getAsync = function (sql) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that.get(sql, function (err, row) {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
};
//correr comando sql
db.runAsync = function (sql) {
    var that = this;
    return new Promise(function (resolve, reject) {
        that.run(sql, function(err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    })
};
async function insert(id,phone)
{

	//se inserta el registro.
	let actual= Math.floor(Date.now() / 1000);
	//db.serialize( () => {
    let query=`insert into servicios (id, phonesystemid, telefono_usuario, noservicio, fecha) values (null, '${id}', '${phone}', null, '${actual}');`;
    console.log(query);
    
    let row = await db.runAsync(query);
}



async function insert_log(phonesystemid, id_messages, data, phone, type)
{

	//se inserta el registro.
	let actual= Math.floor(Date.now() / 1000);
	query=`SELECT id, phonesystemid FROM servicios where telefono_usuario=${phone} and phonesystemid='${phonesystemid}' order by fecha desc limit 1;`;
	//console.log(query);
  	function datos()
  	{
	   return new Promise ((resolve, reject) => 
	   {
		  	db.get(query,async function (err, rows) 
		  	{
		    	if(err)
		    	{	
		    		reject (`************Error en la consulta : ${query}`);
		    		
		    	}else{
		    		
		        	await resolve (rows);
		    	}
		  	});
		});
	}
	 try {
        
       	let row = await db.getAsync(query);
        if(typeof(row) !== 'undefined')
        {
        	db.serialize(async () => {
	        	//console.log(`insert into services_details (id, id_services, id_messages, data, date, type) values (null, ${row.id}, ${id_messages}, '${data}', '${actual}', '${type}');`);
	        	await db.each(`insert into services_details (id, id_services, id_messages, data, date, type) values (null, ${row.id}, ${id_messages}, '${data}', '${actual}', '${type}');`, (err, row) => {
			        if (err) 
			        {
			            return console.error(err.message);
			        }
			        else
			        {
			        	return console.log(row);	
			        }
			    });
			});	
        }
        else
        {
        	console.log(row,"********************No se encontró registro alguno*****************");	
        }
        

    } catch (error) {
        return {'result': false, 'id' : null};
        //return error;
    }
}

module.exports ={find, insert, print, insert_log};

 
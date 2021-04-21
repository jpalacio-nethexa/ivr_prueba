var mysql = require('mysql')
var config = require('./config');


var pool  = mysql.createPool({
  	host     : config.db.host,
	user     : config.db.user,
 	password : config.db.password,
	database : config.db.database,
	timezone: 'utc'
})


var pool2  = mysql.createPool({
        host     : config.db.host,
        user     : config.db.user,
        password : config.db.password,
        database : config.db.database2,
        timezone: 'utc'
})



exports.getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection)
    })



}

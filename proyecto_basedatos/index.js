var dbdiff = require('dbdiff')
var diff = new dbdiff.DbDiff()
var	db = require('./db');
diff.compare(db.getConnection(), db.getConnection())
  .then(() => {
    console.log(diff.commands('drop'))
  })


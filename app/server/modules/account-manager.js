var crypto 		= require('crypto');
var mysql       = require('mysql');
var moment 		= require('moment');
var crypt       = require('crypt3');

var PropertiesReader = require('properties-reader');

var properties = PropertiesReader('./kyrosview.properties');

/*
	ESTABLISH DATABASE CONNECTION
*/

var colors = require('colors');

var dbMysqlName = properties.get('bbdd.mysql.name');
var dbMysqlHost = properties.get('bbdd.mysql.ip');
var dbMysqlPort = properties.get('bbdd.mysql.port');
var dbMysqlUser = properties.get('bbdd.mysql.user');
var dbMysqlPass = properties.get('bbdd.mysql.passwd');

var dbConfig = {
    host: dbMysqlHost,
    user: dbMysqlUser,
    password: dbMysqlPass,
    database: dbMysqlName,
    connectionLimit: 50,
    queueLimit: 0,
    waitForConnection: true
};

var pool = mysql.createPool(dbConfig);


exports.autoLogin = function(user, pass, callback)
{
    pool.getConnection(function(err, connection) {
        if (connection) {        
            var sql = "SELECT USERNAME as username, PASSWORD as password FROM USER_GUI WHERE USERNAME= '" + user + "'";
            console.log(colors.green('Query: %s'), sql);
            connection.query(sql, function(error, rows)
            {
              connection.release();
              if(error)
              {
                  callback('user-not-found');
              }
              else
              {
                  var passDB = rows[0].password;                  
                  if( crypt(pass,passDB) !== passDB) {
                     callback(null);
                  } else {
                    callback(null, rows[0]);
                  }
              }
            });
        } else {
            callback(null);
        }
    });        
}

exports.manualLogin = function(user, pass, callback) 
{
    pool.getConnection(function(err, connection) {
        if (connection) {        
            var sql = "SELECT USERNAME as username, PASSWORD as password FROM USER_GUI WHERE USERNAME= '" + user + "'";
            console.log(colors.green('Query: %s'), sql);
             //debugger;
            connection.query(sql, function(error, rows)
            {
              connection.release();
              if(error)
              {
                  console.log(colors.red('Query error: %s'), error);
                  callback('user-not-found');
              }
              else
              {
                  var passDB = rows[0].password;                  
                  if( crypt(pass,passDB) !== passDB) {
                     callback(null);
                  } else {
                    callback(null, rows[0]);
                  }
              }
            });
        } else {
            callback(null);
        }
    });            
}

/* record insertion, update & deletion methods */
exports.addNewAccount = function(newData, callback)
{
    pool.getConnection(function(err, connection) {
        if (connection) {        
            var sqlUser = "SELECT * FROM USER_GUI WHERE USERNAME= '" + newData.user + "'";
            console.log(colors.green('Query: %s'), sqlUser);
            connection.query(sqlUser, function(error, row) {
              if(error) {
                callback('db-error');
              } else {
                  if(row[0] != undefined) {
                      callback('username-taken');
                  } else {
                      var sqlEmail = "SELECT * FROM USER_GUI WHERE EMAIL= '" + newData.email + "'";
                      console.log(colors.green('Query: %s'), sqlEmail);
                      connection.query(sqlEmail, function(error, row2) {
                      if(error) {
                        callback(null);
                      } else {
                        if(row[0] != undefined) {
                            callback('email-taken');
                        } else {
                            saltAndHash(newData.pass, function(hash){
						      newData.pass = hash;
					          // append date stamp when record was created //
						      newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						      var cryptPass = crypt(newPass);
					           var sqlInsert = "INSERT INTO USER_GUI SET EMAIL= '" + newData.email + "',USERNAME='" + newData.user + "',PASSWORD='" + cryptPass + "' ,CREATED='" + newData.date + "'";
                               console.log(colors.green('Query: %s'), sqlInsert);
                               connection.query(sqlInsert, function(error, result) {
                                connection.release();
                                if(error) {
                                    callback('db-error');
                                } else {
                                    callback(null);
                                }					                                   
                                }); // insert
                            });  // saltAndHash
                        }
                      }
                    }); // sqlEmail                      
                    }
                }
                }); // sqlUsername  
        } else { // connection
            callback('db-error');
        }
    });            
}

exports.updateAccount = function(newData, callback)
{
    pool.getConnection(function(err, connection) {
        if (connection) {        
            var sql = "SELECT USERNAME as username, PASSWORD as password FROM USER_GUI WHERE USERNAME= '" + newData.user + "'";
            console.log(colors.green('Query: %s'), sql);
            connection.query(sql, function(error, rows)
            {
              connection.release();
              if(error)
              {
                  console.log(colors.red('Query error: %s'), error);
                  callback('user-not-found');
              }
              else
              {
                  callback(null, rows[0]);
              }
            });
        } else {
            callback(null);
        }
    });            
}


exports.updatePassword = function(email, newPass, callback)
{
     pool.getConnection(function(err, connection) {
        if (connection) {        
            var sql = "SELECT USERNAME as user, PASSWORD as pass, EMAIL as email FROM USER_GUI WHERE EMAIL= '" + email + "'";
            console.log(colors.green('Query: %s'), sql);
            connection.query(sql, function(error, rows)
            {
              if(error)
              {
                  callback(error, null);
              }
              else
              {
                  // actualizar la password
                    var cryptPass = crypt(newPass);
                    var sqlUpdate = "UPDATE USER_GUI set PASSWORD='" + cryptPass + "' WHERE EMAIL= '" + email + "'";
                    console.log(colors.green('Query: %s'), sqlUpdate);
                    connection.query(sqlUpdate, function(error, result)
                    {
                        connection.release();
                        if(error) {
                            callback(error, null);
                        } else {
                            callback('ok', 'ok');
                        }
                    });  // update
              }
            });
        } else {
            callback('error', null);
        }
    });               
}

/* account lookup methods */

exports.deleteAccount = function(id, callback)
{
	accounts.remove({_id: getObjectId(id)}, callback);
}

exports.getAccountByEmail = function(email, callback)
{
     pool.getConnection(function(err, connection) {
        if (connection) {        
            var sql = "SELECT USERNAME as user, PASSWORD as pass, EMAIL as email FROM USER_GUI WHERE EMAIL= '" + email + "'";
            console.log ("Query mail: "+sql);
            connection.query(sql, function(error, rows)
            {
              connection.release();
              if(error)
              {
                  callback('user-not-found');
              }
              else
              {
                  callback(rows[0]);
              }
            });
        } else {
            callback(null);
        }
    });           
}

exports.validateResetLink = function(email, passHash, callback)
{
    pool.getConnection(function(err, connection) {
        if (connection) {        
            var sql = "SELECT * FROM USER_GUI WHERE EMAIL= '" + email + "' and PASSWORD='" + passHash + "'" ;
            console.log(colors.green('Query: %s'), sql);
            connection.query(sql, function(error, rows)
            {
              connection.release();
              if(error)
              {
                  console.log(colors.red('Query error: %s'), error);
                  callback(null);
              }
              else
              {
                  callback('ok');
              }
            });
        } else {
            callback(null);
        }
    });      
    
}

exports.getAllRecords = function(callback)
{
	accounts.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
}

exports.delAllRecords = function(callback)
{
	accounts.remove({}, callback); // reset accounts collection for testing //
}

/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

var getObjectId = function(id)
{
	return new require('mongodb').ObjectID(id);
}

var findById = function(id, callback)
{
	accounts.findOne({_id: getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
}

var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	accounts.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}

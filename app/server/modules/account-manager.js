var crypto 		= require('crypto');
var mysql         = require('mysql');
var moment 		= require('moment');
var PropertiesReader = require('properties-reader');

var properties = PropertiesReader('./kyrosview.properties');

/*
	ESTABLISH DATABASE CONNECTION
*/

var colors = require('colors');

var dbMysqlName = process.env.DB_MYSQL_NAME || 'nodeLogin';
var dbMysqlHost = process.env.DB_MYSQL_HOST || 'localhost'
var dbMysqlPort = process.env.DB_MYSQL_PORT || 3306;
var dbMysqlUser = process.env.DB_MYSQL_USER || 'root';
var dbMysqlPass = process.env.DB_MYSQL_PASS || 'root';

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
            console.log ("Query: "+sql);
            connection.query(sql, function(error, rows)
            {
              connection.release();
              if(error)
              {
                  callback('user-not-found');
              }
              else
              {
                  callback(rows);
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
                  //var person = {firstName:"John", lastName:"Doe", age:50, eyeColor:"blue"};
                  callback(null, rows[0]);
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
						      //accounts.insert(newData, {safe: true}, callback);
					           var sqlInsert = "INSERT INTO USER_GUI SET EMAIL= '" + newData.email + "',USERNAME='" + newData.user + "',PASSWORD='" + newData.pass + "' ,CREATED='" + newData.date + "'";
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

exports.updateAccount0 = function(newData, callback)
{
	accounts.findOne({_id:getObjectId(newData.id)}, function(e, o){
		o.name 		= newData.name;
		o.email 	= newData.email;
		o.country 	= newData.country;
		if (newData.pass == ''){
			accounts.save(o, {safe: true}, function(e) {
				if (e) callback(e);
				else callback(null, o);
			});
		}	else{
			saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				accounts.save(o, {safe: true}, function(e) {
					if (e) callback(e);
					else callback(null, o);
				});
			});
		}
	});
}

exports.updatePassword = function(email, newPass, callback)
{
	accounts.findOne({email:email}, function(e, o){
		if (e){
			callback(e, null);
		}	else{
			saltAndHash(newPass, function(hash){
		        o.pass = hash;
		        accounts.save(o, {safe: true}, callback);
			});
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
	 //accounts.findOne({email:email}, function(e, o){ callback(o); });
    
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
	accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
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

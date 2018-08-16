/**
 * Module to manage tokens
 */

 //Dependencies
 var helper = require('./helper');
 var _data = require('./data');

 //Container for the token module
 var token = {};

 //Container to handle the various methods
 var _token = {};

 // Directory name for token
 var dir = 'tokens';

 //Handle request for tokens
 token.request = (data, callback) => {
    if (typeof(data) == 'object') {
        _token[data.method](data, callback);
    }
    else {
        callback(400, {'Error': 'Invalid payload'});
    }
 }

 token.verifyToken = (id, email, callback) => {
    // Read the token data
    _data.read(dir, id, (err, tokenData) => {
        if (!err && tokenData) {
            //Check that token belongs the user and token has not expired
            if (email == tokenData.email && tokenData.expires > Date.now()) {
                callback(true);
            }
            else {
                callback(false);
            }
        }
        else {
            callback(false);
        }
    });
 };

 //Token -post
 // Required data: email, password
 // Optional data: none
 // Return data: tokenObject
 _token.post = (data, callback) => {
     if (typeof(data.payload) == 'object') {
        var payload = data.payload;
        
        // Verify the parameters
        var email = typeof(payload.email) == 'string' && payload.email.trim().length > 0 
            && helper.validateEmail(payload.email.trim()) ? payload.email.trim() : false;

        var password = typeof(payload.password) == 'string' && payload.password.trim().length > 0
            ? payload.password.trim() : false;

        if (email && password) {
            // Check the user
            _data.read('users', email, (err, userData) => {
                if (!err && userData) {
                    // Hash the password
                    var hashedPassword = helper.hash(password);
                    console.log(userData);
                    console.log(hashedPassword);
                    if (hashedPassword !== userData.hashedPassword) {
                        // Get the token id (string)
                        var tokenId = helper.createRandomString(20);

                        // Expire the token an hour form now
                        var expires = Date.now() + (1000 * 60 * 60);
                        // Create the token object
                        var tokenObject = {
                            tokenId: tokenId,
                            email: email,
                            expires: expires
                        }

                        // Save the token to disk
                        _data.create(dir, tokenId, tokenObject, (err) => {
                            if (!err) {
                                // Return the token object
                                callback(false, tokenObject);
                            }
                            else {
                                callback(400, {'Error': 'Error saving token'})
                            }
                        })
                    }
                    else {
                        callback(400, {'Error': 'Invalid Credentials'});
                    }
                }
                else {
                    callback(400, {'Error': 'User not found'});
                }
            });
        }
        else {
            callback(400, {'Error': 'Invalid parameters'});
        }
     }
     else {
         callback(400, {'Error': 'Invalid payload'});
     }
 }

 //tokens - get
//Required data: id
// Optional data: none
_token.get = (data, callback) => {
    
    //Check that the id is valid
    var id = typeof(data.query.id) == 'string' 
            && data.query.id.trim().length == 20 ?
            data.query.id.trim() : false;
    console.log(id);
    
    if (id) {
        //Lookup the token
        _data.read(dir, id, function(err, returnedData) {
            if(!err && returnedData) {
                callback(200, returnedData);
            }
            else {
                callback(404);
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
} 

//tokens - put
//Required data: id, extend 
//Optional data: none
_token.put = function(data, callback){
    
    //Check that the phone number is valid
    var id = typeof(data.payload.id) == 'string' 
            && data.payload.id.trim().length == 20 ?
            data.payload.id.trim() : false;
        
    var extend = typeof(data.payload.extend) == 'boolean' && 
        data.payload.extend == true ? true : false;
    
    // If id and extend is valid
    if (id && extend) {
        //Lookup the toekn
        _data.read(dir, id, function(err, tokenData) {
            if(!err && data) {
                //Check token isn't already expired
                if(tokenData.expires > Date.now()) {
                    //Set the expiration an hour from now
                    tokenData.expires = Date.now() + (1000 * 60 * 60);

                    //Store the new update
                    _data.update(dir,id, tokenData, function(err){
                        if(!err) {
                            callback(false);
                        } else {
                            callback(500, {'Error': 'Could not update token\'s expiration' });
                        }
                    });
                } else {
                    callback(400, {'Error': 'Token already expired'})
                }
            }
            else {
                callback(404, {'Error': 'Specified token does not exist'});
            }
        });
    } 
    else {
        callback(400, {'Error': 'Missing required field(s) or field(s) are invalid'})
    }
}

   

//tokens - delete
// Required data: id
// Optional data: none
_token.delete = function(data, callback){
    //Check that the id is valid
    var id = typeof(data.query.id) == 'string' 
            && data.query.id.trim().length == 20 ?
            data.query.id.trim() : false;
        
    
    if (id) {
        //Lookup the token
        _data.read(dir, id, function(err, tokenData) {
            if(!err && tokenData) {
                _data.delete(dir, id, function(err) {
                    if(!err) {
                        callback(false);
                    } else {
                        callback(500, {'Error': 'Could not delete the specified token'});
                    }
                })
            }
            else {
                callback(404, {'Error': 'Token not found'});
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }    
}

 //export the module
 module.exports = token;
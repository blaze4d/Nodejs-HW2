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
    _data.read(dir, id, (err, tokenString) => {
        if (!err && tokenString) {
            //Convert returnedData to object
            var tokenData = helper.getJsonObject(tokenString);
            
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
                        _data.create(dir, tokenId, tokenObject, (err, data) => {
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
     

    //verify 
 }

 //export the module
 module.exports = token;
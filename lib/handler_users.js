/**
 * Handles requests to the users resource
 */

 //Dependences
 var _data = require('./data');
 var helper = require('./helper');
 var _token = require('./handler_tokens');


 //Container for the module
 var users = {};

 //Container to handle the requests
 var _user = {};

 //Recieve the call from handler module
 users.request = (data, callback) => {
     if (typeof(data) == "object"){
        _user[data.method](data, callback);
     }
     else {
         callback(400);
     }
 }

var  dir = 'users';

 //Users - post
 // Required data: email, password, firstname, lastname, address
 // Optional data: none
_user.post = (data, callback) => {

    
    if (typeof(data.payload) == "object") {
        var payload = data.payload;
        
        //Check that all required data available
        var email = typeof(payload.email) == "string" && payload.email.trim().length > 0 
            && helper.validateEmail(payload.email.trim()) ? payload.email.trim() : false;

        var password = typeof(payload.password) == "string" && payload.password.trim().length > 0 
            ? payload.password.trim() : false;

        var firstname = typeof(payload.firstname) == "string" && payload.firstname.trim().length > 0 
            ? payload.firstname.trim() : false;

        var lastname = typeof(payload.lastname) == "string" && payload.lastname.trim().length > 0 
            ? payload.lastname.trim() : false;

        var address = typeof(payload.address) == "string" && payload.address.trim().length > 0 
            ? payload.address.trim() : false;

        console.log(firstname, lastname, email, password, address);
        if (email && password && firstname && lastname && address) {

            //Check if user already exist
            _data.read(dir, email, (err) => {
                if(err) {
                    var hashedPassword = helper.hash(password);

                    // Create the user object
                    var userObject = {
                        email: email,
                        firstname: firstname,
                        lastname: lastname, 
                        address: address,
                        hashedPassword: hashedPassword
                    }
                    _data.create(dir, email, userObject, (err, returnedData) => {
                        if (!err) {
                            callback(false, returnedData);
                        }
                        else {
                            callback(err, returnedData);
                        }
                    });
                }
                else {
                    callback(400, {'Error': 'User already exists'});
                }
            })
            
        }
        else {
            callback(400, {'Error': 'Invalid or missing parameters'});
        }       
        
    } 
    else {
        callback(400, {'Error': 'Invalid payload'});
    }
}

//Get user information
_user.get = (data, callback) => {
    
    if(typeof(data.query) == "object" && typeof(data.query.email) == "string") {
        
        //Get the token from the header
        var token = typeof(data.headers) == 'object' && typeof(data.headers.token) == 'string'
            ? data.headers.token : false;

        if (token) {
            
            //Validate token
            _token.verifyToken(token, data.query.email, (err) => {
                if (!err) {
                    
                    _data.read(dir, data.query.email, (err, returnedData) =>{
                        if (!err && returnedData) {
                            var jsonData = helper.getJsonObject(returnedData);
                            //Remove password from the data
                            delete jsonData.hashedPassword;
                            callback(false, jsonData);
                        }
                        else {
                            callback(404);
                        }
                    });
                }
                else {
                    callback(400, {'Error': 'Invalid token'});
                }
                
            });
        }
        else {
            callback(400, {'Error': 'Invalid token'});
        }

        
    }
    else {
        callback(400);
    }
}

//Update user information
_user.put = (data, callback) => {
    if(typeof(data.payload) == "object") {
        var payload = data.payload;
        _data.read(dir, payload.id, (err, returnedData) =>{
            if (!err && returnedData) {
                // Convert returned data to JSON
                var userData = JSON.parse(returnedData);
                // Update the user attributes
                userData.name = payload.name;
                userData.email = payload.email;
                userData.address = payload.address;
                userData.phone = payload.phone;

                // Write update to disk
                _data.update(dir, payload.id, userData, (err) =>{
                    if (!err) {
                        callback(false);
                    }
                    else {
                        callback(400);
                    }
                });
            }
            else {
                callback(404);
            }
        });
    }
    else {
        callback(400);
    }
}

 //Export the module
 module.exports = users;
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

//Users - get
//Required data: email in query string, token in header
//Optional data: none
_user.get = (data, callback) => {
    
    if(typeof(data.query) == "object" && typeof(data.query.email) == "string") {
        
        //Get the token from the header
        var token = typeof(data.headers) == 'object' && typeof(data.headers.token) == 'string'
            ? data.headers.token : false;

        if (token) {
            console.log(token);
            //Validate token
            _token.verifyToken(token, data.query.email, (isTokenValid) => {
                if (isTokenValid) {
                    
                    _data.read(dir, data.query.email, (err, returnedData) =>{
                        if (!err && returnedData) {
                            //Remove password from the data
                            delete returnedData.hashedPassword;
                            callback(false, returnedData);
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
            console.log('Here 2');
            callback(400, {'Error': 'Invalid token'});
        }

        
    }
    else {
        callback(400);
    }
}

//Users - put
//Required data: email, token
//Optional data: firstname, lastname, address, password
_user.put = (data, callback) => {
    if(typeof(data.payload) == "object") {
        var payload = data.payload;

        //Check the paramters
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

        var token = typeof(data.headers) == 'object' && typeof(data.headers.token) == 'string'
            ? data.headers.token : false;

        if (email && token) {
            //Check the optional parameters
            if (firstname || lastname || password || address) {

                //Validate the token
                _token.verifyToken(token, email, (isTokenValid) => {
                    if (isTokenValid) {
                        
                        _data.read(dir, email, (err, userData) =>{
                            if (!err && userData) {
                                // Update the user attributes
                                if (firstname) {
                                    userData.firstname = firstname;
                                }
                                if (lastname) {
                                    userData.lastname = lastname;
                                }
                                if (address) {
                                    userData.address = address;
                                }
                                if (password) {
                                    var hashedPassword = helper.hash(password);
                                    userData.hashedPassword = hashedPassword;
                                }                
                                // Write update to disk
                                _data.update(dir, email, userData, (err) =>{
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
                        callback(400, {'Error': 'Invalid token'});
                    }
                    
                });

            }
            else {
                callback(400, {'Error': 'Parameters for update invalid or mssing'});
            }
        }
        else {
            callback(400, {'Error': 'Required paramter invalid or missing'});
        }

        
    }
    else {
        callback(400);
    }
}

//Users - delete
//Required data: email in query string, token in header
//Optional data: none
_user.delete = (data, callback) => {
    
    if(typeof(data.query) == "object" && typeof(data.query.email) == "string") {
        
        //Get the token from the header
        var token = typeof(data.headers) == 'object' && typeof(data.headers.token) == 'string'
            ? data.headers.token : false;

        if (token) {
            //Validate token
            _token.verifyToken(token, data.query.email, (isTokenValid) => {
                if (isTokenValid) {
                    
                    _data.read(dir, data.query.email, (err, returnedData) =>{
                        if (!err && returnedData) {

                            //Delete the user data
                            _data.delete(dir, data.query.email, (err) => {
                                if (!err) {
                                    callback(false);
                                }
                                else {
                                    callback(500, {'Error': 'Error deleting the user'});
                                }
                            });
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
        callback(400, {'Erorr': 'Missing or invalid parameters'});
    }
}

 //Export the module
 module.exports = users;
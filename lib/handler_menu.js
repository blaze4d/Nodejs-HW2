/**
 * Module to handle menu requests
 */

 //Dependencies
 var _data = require('./data');
 var _token = require('./handler_tokens');

 //Container for the module
 var menu = {};

 //Menu - get
//Required data: none
//Optional data: none
menu.get = (data, callback) => {
    
    if(typeof(data) == "object") {
        
        //Get the token from the header
        var token = typeof(data.headers) == 'object' && typeof(data.headers.token) == 'string'
            ? data.headers.token : false;

        if (token) {
            //Get token object
            _data.read('tokens', token, (err, tokenObject) => {
                if (!err && tokenObject) {
                    //Validate token
                    _token.verifyToken(token, tokenObject.email, (isTokenValid) => {
                        if (isTokenValid) {
                            
                            _data.read('menu', 'pizza', (err, menuObject) =>{
                                if (!err && menuObject) {
                                    callback(false, menuObject);
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
                    callback(404, {'Error': 'Invalid token'});
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

//Export the module
module.exports = menu;
/**
 * Handles requests to the Shopping Cart resource
 */

 //Dependences
 var _data = require('./data');
 var helper = require('./helper');
 var _token = require('./handler_tokens');


 //Container for the module
 var cart = {};

 //Container to handle the requests
 var _cart = {};

 //Recieve the call from handler module
 cart.request = (data, callback) => {
     if (typeof(data) == "object"){
        _cart[data.method](data, callback);
     }
     else {
         callback(400);
     }
 }

var  dir = 'shopping_cart';

 //cart - post
 // Required data: cartObject, email
 // Optional data: none
_cart.post = (data, callback) => {

    
    if (typeof(data.payload) == "object" && typeof(data.payload.cart) == 'object') {
        var payload = data.payload;

        //Check that all required data available
        var email = typeof(payload.email) == "string" && payload.email.trim().length > 0 
            && helper.validateEmail(payload.email.trim()) ? payload.email.trim() : false;

        var cartObject = typeof(payload.cart) == "object" ? payload.cart : false;

        var token = typeof(data.headers) == 'object' && typeof(data.headers.token) == 'string'
            ? data.headers.token : false;

        //Check for parameters. Ensure cartObject is array
        if (email && cartObject && cartObject.constructor === Array && token) {

            //verify the token
            _token.verifyToken(token, email, (isTokenValid) => {
                if (isTokenValid) {

                    //Get menu list
                    _data.read('menu', 'pizza', (err, menuObject) => {
                        if (!err && menuObject) {
                            //Container for the cart from users
                            var cartList = [];
                            //Check that the cart list is from menu list
                            menuObject.forEach((menuItem) => {
                                cartObject.forEach((cart) => {
                                    if (cart.name == menuItem.name) {
                                        cartList.push(cart);
                                    }
                                });
                            });
                            //Get id for the cart
                            var cartId = helper.createRandomString(20);

                            //Create the cart object 
                            var cartToSave = {
                                'id': cartId,
                                'email': email,
                                'cart': cartList
                            }
                            //Save the cart
                            _data.create(dir,cartId, cartToSave, (err) => {
                                if(!err) {
                                    //Read the user info and update the user info with the cart detail
                                    _data.read('users', email, (err, userData) => {
                                        if (!err && userData) {
                                            //console.log(typeof(userData.cartIds) === "undefined");
                                            if (typeof(userData.cartIds) == "object" && userData.cartIds.constructor === Array) {
                                                var oldCart = userData.cartIds;
                                                var newCart = oldCart.concat(cartToSave.id);
                                                userData.cartIds = newCart;

                                            }
                                            else {
                                                userData.cartIds = [cartToSave.id];
                                            }
                                            //Save the cart information
                                            _data.update('users',email, userData, (err) => {
                                                if (!err) {
                                                    callback(false, cartToSave);
                                                }
                                                else {
                                                    callback(500, {'Error': 'Error updating user '})
                                                }
                                            });
                                        }
                                        else {
                                            callback(500, {'Error': 'Error reading user data'});
                                        }
                                    });
                                }
                                else {
                                    callback(500, {'Error': 'Error saving cart'});
                                }

                            });
                            
                        }
                        else {
                            callback(400, menuObject);
                        }
                    });

                }
                else {
                    callback(400, {'Error': 'Invalid token'});
                }
            });
            
        }
        else {
            callback(400, {'Error': 'Invalid or missing parameters'});
        }       
        
    } 
    else {
        callback(400, {'Error': 'Invalid payload'});
    }
}

//cart - get
//Required data: email in query string, token in header
//Optional data: none
_cart.get = (data, callback) => {
    
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

//cart - put
//Required data: email, token
//Optional data: firstname, lastname, address, password
_cart.put = (data, callback) => {
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

//cart - delete
//Required data: email in query string, token in header
//Optional data: none
_cart.delete = (data, callback) => {
    
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
 module.exports = cart;
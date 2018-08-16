/**
 * The route handler module
 */

 //Dependencies
 var _user = require('./handler_users');
 var _token = require('./handler_tokens');
 var menu = require('./handler_menu');
 var _cart = require('./handler_shopping_cart');


 //Container for the handler
 var handler = {};

 handler._methods = ['get', 'put', 'post', 'delete'];

 //User handler
 handler.users = (data, callback) => {
    if (handler._methods.indexOf(data.method) > -1) {
        //Send request to the handler_users module        
        _user.request(data, callback);
    } 
    else {
        callback(405);
    }
 }

  //User handler
  handler.tokens = (data, callback) => {
    if (handler._methods.indexOf(data.method) > -1) {
        //Send request to the handler_tokens module       
        _token.request(data, callback);
    } 
    else {
        callback(405);
    }
 }

   //Menu handler
   handler.menu = (data, callback) => {
    if (handler._methods.indexOf(data.method) > -1 && data.method == "get") {
        //Get the menu list
        menu[data.method](data, callback);
    } 
    else {
        callback(405);
    }
 }

   //Shopping cart handler
   handler.cart = (data, callback) => {
    if (handler._methods.indexOf(data.method) > -1) {
        //Send request to the handler_tokens module       
        _cart.request(data, callback);
    } 
    else {
        callback(405);
    }
 }

 handler.notFound = (data, callback) => {
     callback(404);
 }


 //Export the module
 module.exports = handler;
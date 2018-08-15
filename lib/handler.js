/**
 * The route handler module
 */

 //Dependencies
 var _user = require('./handler_users');
 var _token = require('./handler_tokens');


 //Container for the handler
 var handler = {};

 handler._methods = ['get', 'put', 'post', 'delete'];

 //User handler
 handler.users = (data, callback) => {
    if (handler._methods.indexOf(data.method) > -1) {
        
        _user.request(data, (err, returnedData) => {
            if(!err) {
                callback(false, returnedData);
            } else {
                callback(400, returnedData);
            }
        });
    } 
    else {
        callback(405);
    }
 }

  //User handler
  handler.tokens = (data, callback) => {
    if (handler._methods.indexOf(data.method) > -1) {
        
        _token.request(data, (err, returnedData) => {
            if(!err) {
                callback(false, returnedData);
            } else {
                callback(400, returnedData);
            }
        });
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
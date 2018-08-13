/**
 * The route handler module
 */

 //Dependencies
 var _user = require('./handler_users');


 //Container for the handler
 var handler = {};

 handler._methods = ['get', 'put', 'post', 'delete'];

 //User handler
 handler.users = (data, callback) => {
    if (handler._methods.indexOf(data.method) > -1) {
        
        var payload = data.payload;
        _user[data.method](payload, (err, data) => {
            if(!err) {
                callback(false);
            } else {
                callback(400, data);
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
/**
 * Handles requests to the users resource
 */

 //Dependences
 var _data = require('./data');
 var helper = require('./helper');


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

 //Create user
_user.post = (data, callback) => {
    if (typeof(data.payload) == "object") {
        var payload = data.payload;
        _data.create(dir, payload.id, payload, (err, returnedData) => {
            if (!err) {
                callback(false, returnedData);
            }
            else {
                callback(err, returnedData);
            }
        });
    } 
    else {
        callback('No data', returnedData);
    }
}

//Get user information
_user.get = (data, callback) => {
    if(typeof(data.query) == "object" && typeof(data.query.id) !== "undefined") {
        _data.read(dir, data.query.id, (err, returnedData) =>{
            if (!err && returnedData) {
                var jsonData = helper.getJsonObject(returnedData);
                callback(false, jsonData);
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
/**
 * Handles requests to the users resource
 */

 //Dependences
 var _data = require('./data');


 //Container for the module
 var users = {};

var  dir = 'users';

 //Create user
users.post = (data, callback) => {
    if (data) {
        _data.create(dir, data.id, data, (err, data) => {
            if (!err) {
                callback(false, data);
            }
            else {
                callback(err, data);
            }
        });
    } 
    else {
        callback('No data', data);
    }
}

 //Export the module
 module.exports = users;
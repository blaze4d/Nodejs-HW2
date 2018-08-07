/**
 * The module for the server
 */

 //Dependencies
 var http = require('http');
 var _data = require('./data');
 
 //Container for the server
 var server = {}

 server.httpServer = http.createServer((req, res) => {
     var data = {
         'name': 'Uchenna Ozuu',
         'email': 'blazed@gmail.com',
         'address': 'FIRS Annex 1',
         'id': '2'
     };
     _data.create('users', data.id, data, (err) => {
         if(!err) {
             res.end('Data successfully saved');
         } else {
             res.end('Error saving data: ' + err);
         }
     });
 });



 //Initialize the server 
 server.init = () => {
    server.httpServer.listen(3000, () => {
        console.log('Listening on port 3000');
    });
 }


 //Export the module
 module.exports = server;
/**
 * The module for the server
 */

 //Dependencies
 var http = require('http');
 
 //Container for the server
 var server = {}

 server.httpServer = http.createServer((req, res) => {
     console.log('I got here');
     res.end('Hello here');
 })

 //Initialize the server 
 server.init = () => {
    server.httpServer.listen(3000, () => {
        console.log('Listening on port 3000');
    });
 }


 //Export the module
 module.exports = server;
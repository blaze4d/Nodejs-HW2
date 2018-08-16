/**
 * The module for the server
 */

 //Dependencies
 var http = require('http');
 var _data = require('./data');
 var url = require('url');
 var helper = require('./helper');
 var handler = require('./handler');
 
 //Container for the server
 var server = {}

 // Create the server
 server.httpServer = http.createServer((req, res) => {
    

    // var str = "uchenna.ozuzu@gmail.";
    // var validEmail = helper.validateEmail(str);
    // console.log(validEmail);
    // res.end("done");

    // Get request parameters from helper
    helper.getRequestParameters(req, (reqParams) => {
        var chosenHandler = typeof(server.router[reqParams.path]) !== "undefined" ? server.router[reqParams.path] : handler.notFound;
        //console.log(server.router[reqParams.query]);
        chosenHandler(reqParams, (statusCode, data) => {
            //Check why token get 200 is giving 400
            // console.log(typeof(statusCode));
            // console.log(data);
            // Use the status code called by the handler or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200 ;
            
            // Use the data called by the handler or default to empty object
            data = typeof(data) == 'object' ? data : {};
            //payload = typeof(payload) == 'object' ? payload : {};
            
            // Convert the data to string            
            var payload = JSON.stringify(data);
            
            // Return the response
            res.setHeader('content-type', 'appllication/json');
            res.writeHead(statusCode);
            res.end(payload);
            
        });
    });
 });

//Router container
server.router = {
    'users': handler.users,
    'tokens': handler.tokens,
    'menu': handler.menu,
    'cart': handler.cart
}


 //Initialize the server 
 server.init = () => {
    server.httpServer.listen(3000, () => {
        console.log('Listening on port 3000');
    });
 }


 //Export the module
 module.exports = server;
/**
 * This contains the helper functions
 */

 //Dependencies
 var url = require('url');
 var StringDecoder = require('string_decoder').StringDecoder;

 //Container for the functions
 var helper = {};

 helper.getRequestParameters = (req, callback) => {
     // Get the parse the url
     var parsedUrl = url.parse(req.url, true);

     // Get the path
     var path = parsedUrl.pathname;

     //Trim the url of leading and trailing /
     var trimmedPath = path.replace(/^\/+|\/+$/g, '');

     // Get the method in the request
     var method = req.method.toLowerCase();

     // Get the query as object
     var queryObject = parsedUrl.query;

     // Get request headers as an object
     var headers = req.headers;

     // Get the payload if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        var payloadObject = helper.getJsonObject(buffer);
        // Create the object to return
        var requestObject = {
            'path': trimmedPath,
            'method': method,
            'query': queryObject,
            'headers': headers,
            'payload': payloadObject
        };
        callback(requestObject);
    });
 }

 helper.getJsonObject = (jsonString) => {
     try {
         return JSON.parse(jsonString);
     }
     catch (ex) {
         return {};
     }
 }

 //export the module
 module.exports = helper;
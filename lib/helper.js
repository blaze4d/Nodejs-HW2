/**
 * This contains the helper functions
 */

 //Dependencies
 var url = require('url');
 var StringDecoder = require('string_decoder').StringDecoder;
 var crypto = require('crypto');
 var config = require('./config');

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
        buffer += decoder.end()
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

 helper.createRandomString = (strLength) => {
     if (typeof(strLength) == "number" && strLength > 0) {
        //Get the valid characters
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        //Start the string creation
        var str = '';

        for (var i = 0; i < strLength; i++) {
            str += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        }

        return str;
     }
     else {
         return false;
     }
 }

 helper.validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Create a SHA256 hash
helper.hash = (str) => {
    if(typeof(str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret)
            .update(str)
            .digest('hex');
        return hash;

    } else {
        return false;
    }
}

 //export the module
 module.exports = helper;
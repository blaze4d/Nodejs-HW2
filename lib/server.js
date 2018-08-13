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

 server.httpServer = http.createServer((req, res) => {
    // Get request parameters from helper
    var reqObj = helper.getRequestParameters(req, (reqParams) => {
        console.log(reqParams.path);
        var chosenHandler = typeof(server.router[reqParams.path]) !== "undefined" ? server.router[reqParams.path] : handler.notFound;
        console.log(server.router[reqParams.path]);
        chosenHandler(reqParams, (statusCode, data) => {
            if (!statusCode) {
                res.end('Good job');
            } else {
                res.writeHead(statusCode);
                res.end();
            }
        })
    });
    
    var data = {
        'name': 'Uchenna Ozuu',
        'email': 'blazed@gmail.com',
        'address': 'National SIO',
        'phone': '0907038950375',
        'id': '2'
     };
    //  _data.create('users', data.id, data, (err) => {
    //      if(!err) {
    //          res.end('Data successfully saved');
    //      } else {
    //          res.end('Error saving data: ' + err);
    //      }
    //  });

//      _data.read('users', data.id, (err, data) => {
//         if(!err) {
//             var parsedData = JSON.parse(data);
//             res.setHeader('content-type', 'application/json');
//             res.end(data)
//         } 
//         else {
//             res.writeHead(400);
//             res.end(err);
//         }
//   });

    //  Update data
    //  _data.update('users', data.id, data, (err) => {
    //     if (!err) {
    //         res.end('Data updated successfully');
    //     }
    //     else {
    //         res.writeHead(400);
    //         res.end('Error updating data:', err);
    //     }
    //  });

    //  //Delete data
    //  _data.delete('users', data.id, (err) => {
    //      if (!err) {
    //          res.end('File deleted successfully');
    //      } else {
    //          res.writeHead(400);
    //          res.end(err);
    //      }

    //  });
 });

//Router container
server.router = {
    'users': handler.users
}


 //Initialize the server 
 server.init = () => {
    server.httpServer.listen(3000, () => {
        console.log('Listening on port 3000');
    });
 }


 //Export the module
 module.exports = server;
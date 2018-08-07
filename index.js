/**
 * The entry point of app
 */

 //Dependencies
 var lib = require('./lib/server');

 //Container for the app
 var app = {};

 //Initial the app
 app.init = () => {
     lib.init();
 }

 app.init();

 //Export the app
 module.exports = app;
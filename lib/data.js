/**
 * Library for storing and editing data
 */

 //Dependencies
 var fs = require('fs');
 var path = require('path');

 // Container for the module to be exported
 var lib = {};

 //Base directory of the folder
 lib.baseDir = path.join(__dirname, '/../.data/');

 //Form the filename and return
lib.getName = (dir, file) => {
    return lib.baseDir+dir+'\\'+file + '.json';
}

lib.create = (dir, file, data, callback) => {
    //Get the filename 
    var filename = lib.getName(dir, file);
    console.log(filename);
    //Open the file for writing
    fs.open(filename, 'wx', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            //Convert data to string
            var dataString = JSON.stringify(data);

            //Write to file and close it
            fs.writeFile(fileDescriptor, dataString, (err) => {
                if (!err) {
                    //Close the file
                    fs.close(fileDescriptor, (err) => {
                        if(!err) {
                            callback(false);
                        } else {
                            callback('Error closing file');
                        }
                    });
                } else {
                    callback('Error writing to file');
                }
            })

        } else {
            callback('Error opening file');
        }
    });
}

//Export the module
module.exports = lib;
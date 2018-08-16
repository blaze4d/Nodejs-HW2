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

//Create method
lib.create = (dir, file, data, callback) => {
    //Get the filename 
    var filename = lib.getName(dir, file);
    
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

//Get file content
lib.read = (dir, file, callback) => {
    //Get the filename
    var filename = lib.getName(dir, file);

    //Read file
    fs.readFile(filename, 'utf8', (err, data) => {
        if (!err && data) {
            //Convert to object
            var dataObj = JSON.parse(data)
            callback(false, dataObj);
        }
        else {
            callback(err, data)
        }
    });
}

lib.update = (dir, file, data, callback) => {
    //Get the filename
    var filename = lib.getName(dir, file);

    var stringData = JSON.stringify(data);

    //Open the file for update
    fs.open(filename, 'r+', data, (err, fileDescriptor) => {
        if (!err) {
            //Truncate the file
            fs.truncate(fileDescriptor, (err) => {
                if (!err) {
                    //Write to file and close it 
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            //Close the file
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false);
                                }
                                else {
                                    callback('Error closing file ');
                                }
                            });
                        }
                        else {
                            callback('Error writing to file ');
                        }
                    });
                }
                else {
                    callback('Error truncating file ');
                }
            });
        }
        else {
            callback('Error opening file ');
        }
    });
}

lib.delete = (dir, file, callback) => {
    //Get the filename 
    var filename = lib.getName(dir, file);

    //Delete (unlink) the file
    fs.unlink(filename, (err) => {
        if (!err) {
            callback(false);
        }
        else {
            callback('Error deleting file');
        }
    })
}

//Export the module
module.exports = lib;
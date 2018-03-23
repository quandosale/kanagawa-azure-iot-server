var azure = require('azure-storage');
var accountName = 'kanagawawfdb';
var accountConnectStr = 'DefaultEndpointsProtocol=https;AccountName=kanagawawfdb;AccountKey=bGnQQDlYX7vVx+u69sEzwRLN5TKdLeqFMu5pr8wSDi+jYkyxYO5haFBz5x47XMqWeUfQ4FC8dSvQfrTGesc+Sg==;EndpointSuffix=core.windows.net';
var fileService = azure.createFileService(accountConnectStr);
var SHARE_NAME = 'calm-share';
var DIRECTORY = 'wfdb';
fileService.createShareIfNotExists(SHARE_NAME, function (error, result, response) {
    if (!error) {
        // if result = true, share was created.
        // if result = false, share already existed.

    }
    console.log(error)
    console.log(result);
});

fileService.createDirectoryIfNotExists(SHARE_NAME, DIRECTORY, function (error, result, response) {
    if (!error) {
        // if result = true, share was created.
        // if result = false, share already existed.
        console.log(result);
    }
});

fileService.createFileFromLocalFile(SHARE_NAME, DIRECTORY, 'storage.js', 'storage.js', function (error, result, response) {
    if (!error) {
        // file uploaded
        console.log(result)
    }
    console.log(error)
});

var fs = require('fs');
fileService.getFileToStream(SHARE_NAME, DIRECTORY, 'read.js', fs.createWriteStream('output.txt'), function (error, result, response) {
    if (!error) {
        // file retrieved
        console.log(result)
    }
});

var tt = "?sv=2017-07-29&ss=bqtf&srt=sco&sp=rwdlacup&se=2018-03-23T10:17:23Z&sig=n0veMchXPiANrWR6aogqik136NFXoTEK7VXKrjCzRDs%3D"
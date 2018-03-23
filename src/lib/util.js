var config = require("../../config");
var connectionString = config.IOT_CONNECTION_STRING;
var iothub = require("azure-iothub");
var registry = iothub.Registry.fromConnectionString(connectionString);
var fs = require('fs');
var FILE_TYPE = config.FILE_TYPE;

var AZURE_STORAGE_CONNECTSTRING = config.AZURE_STORAGE.accountConnectStr;
var azure_storage = require('azure-storage');
var fileService = azure_storage.createFileService(AZURE_STORAGE_CONNECTSTRING);
var blobService = azure_storage.createBlobService(AZURE_STORAGE_CONNECTSTRING);
var SHARE_NAME = config.AZURE_STORAGE.SHARE_NAME;
var DIRECTORY = config.AZURE_STORAGE.DIRECTORY;

module.exports = {
  responseHandler: (res, success, message, data) => {
    res.send({
      success: success,
      message: message,
      data: data,
    });
  },
  removeDevice: (deviceId, cb) => {
    registry.removeDevices(
      [{
        deviceId: deviceId,
      }, ],
      false,
      (err, res) => {
        console.log(err, res);
        cb(err);
      }
    );
  },
  moveTmpToStorage: (dataset) => {
    initStorage();
    moveItem(dataset, FILE_TYPE.ECG);
    moveItem(dataset, FILE_TYPE.HEART_RATE);
    moveItem(dataset, FILE_TYPE.POSTURE);
    moveItem(dataset, FILE_TYPE.AF);
  }
};

var moveItem = function (dataset, fileType) {
  if (fs.existsSync(`${config.STORAGE_TMP_PATH}/${dataset.file}${fileType}`)) {
    // fs.rename(`${config.STORAGE_TMP_PATH}/${dataset.file}${fileType}`, `${config.STORAGE_PATH}/${dataset.file}${fileType}`, function (err) {});
    uploadToStorage(dataset, fileType);
  } else {
    console.log('Cannot find file for upload', `${config.STORAGE_TMP_PATH}/${dataset.file}${fileType}`);
  }
};

var uploadToStorage = function (dataset, fileType) {
  let source_file_url = `${config.STORAGE_TMP_PATH}/${dataset.file}${fileType}`;
  let dest_file_name = `${dataset.file}${fileType}`;

  blobService.createBlockBlobFromLocalFile(SHARE_NAME, dest_file_name, source_file_url, function(error, result, response) {
    if (!error) {
      // file uploaded
      console.log('uploaded & delete tmp');
      fs.unlinkSync(`${config.STORAGE_TMP_PATH}/${dataset.file}${fileType}`);
    }
  });
};

var initStorage = function () {
  blobService.createContainerIfNotExists(SHARE_NAME, {
    publicAccessLevel: 'blob'
  }, function (error, result, response) {
    if (!error) {
      // if result = true, container was created.
      // if result = false, container already existed.
    }
  });

  // fileService.createDirectoryIfNotExists(SHARE_NAME, DIRECTORY, function (error, result, response) {
  //   if (!error) {
  //     // if result = true, share was created.
  //     // if result = false, share already existed.
  //   }
  // });
}
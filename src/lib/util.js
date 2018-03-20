var config = require("../../config");
var connectionString = config.IOT_CONNECTION_STRING;
var iothub = require("azure-iothub");
var registry = iothub.Registry.fromConnectionString(connectionString);
var fs = require('fs');
var FILE_TYPE = config.FILE_TYPE;
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
    if (fs.existsSync(`${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.ECG}`))
      fs.rename(`${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.ECG}`, `${config.STORAGE_PATH}/${dataset.file}${FILE_TYPE.ECG}`, function (err) {});
    if (fs.existsSync(`${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.HEART_RATE}`))
      fs.rename(`${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.HEART_RATE}`, `${config.STORAGE_PATH}/${dataset.file}${FILE_TYPE.HEART_RATE}`, function (err) {});
    if (fs.existsSync(`${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.POSTURE}`))
      fs.rename(`${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.POSTURE}`, `${config.STORAGE_PATH}/${dataset.file}${FILE_TYPE.POSTURE}`, function (err) {});
  }
};
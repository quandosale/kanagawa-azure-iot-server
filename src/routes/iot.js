var router = require("express").Router();
var config = require("../../config");
var Client = require("azure-iothub").Client;
var connectionString = config.IOT_CONNECTION_STRING;
var client = Client.fromConnectionString(connectionString);

var CONFIG = require('../../config');
var RPI_GATEWAY_VERSION = CONFIG.RPI_GATEWAY_VERSION;

router.post("/direct-method", (req, res) => {
  console.log(req.body);
  const deviceId = req.body.deviceId;
  const methodName = req.body.methodName;
  const data = JSON.stringify(req.body.data);
  console.log('data', data)
  var methodParams = {
    methodName: methodName,
    payload: data,
    timeoutInSeconds: 30,
  };

  client.invokeDeviceMethod(deviceId, methodParams, function (err, result) {
    if (err) {
      console.error(
        "Failed to invoke method '" + methodName + "': " + err.message
      );
      return res.json({
        success: false,
        message: "Failed to invoke method '" + methodName + "': " + err.message,
      });
    } else {
      console.log(methodName + " on " + deviceId + ":");
      console.log(JSON.stringify(result, null, 2));
      return res.json({
        success: true,
        result: result,
      });
    }
  });
});
var md5File = require('md5-file');
var fs = require('fs');
var dist_path = './public/rpi-server-dist.zip';
// return gateway firmware version
router.get("/firmware-version", (req, res) => {

  if (fs.existsSync(dist_path)) {
    const hash = md5File.sync(dist_path);
    return res.json({
      RPI_GATEWAY_VERSION: RPI_GATEWAY_VERSION,
      checksum: hash
    });
  } else {
    return res.json({
      RPI_GATEWAY_VERSION: RPI_GATEWAY_VERSION,
      checksum: '7dd2c10821a37444d3dc504eaaa16fba'
    });
  }

});

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function (err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function (err) {
    done(err);
  });
  wr.on("close", function (ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}
var DOWNLOAD_TMP_FOLDER = 'download_tmp';

var createTmpDirectory = function () {
  if (!fs.existsSync(DOWNLOAD_TMP_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_TMP_FOLDER);
  }
};

const uuidv1 = require('uuid/v1');


// Download gateway firmware
router.get("/firmware-download", (req, res) => {
  console.log('================ firmware-download ===================')
  res.download(dist_path);
  
  // var tmp_file = `./${DOWNLOAD_TMP_FOLDER}/${uuidv1()}.zip`;
  // createTmpDirectory();
  // copyFile(dist_path, tmp_file, function (error) {
  //   if(error){console.log('copyFile', error);}
  //   console.log(`cloned to ${tmp_file}`);
  //   res.download(tmp_file, function (err_download) {
  //     if (err_download) {
  //       console.log('err_download', err_download);
  //     }
  //     fs.unlinkSync(tmp_file);
  //   });
  // })
});
module.exports = router;
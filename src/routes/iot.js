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
// return gateway firmware version
router.get("/firmware-version", (req, res) => {
  return res.json({
    RPI_GATEWAY_VERSION: RPI_GATEWAY_VERSION,
    checksum: '7dd2c10821a37444d3dc504eaaa16fba'
  });
});

// Download gateway firmware
router.get("/firmware-download", (req, res) => {
  res.download('./public/rpi-server-dist.zip');
});
module.exports = router;
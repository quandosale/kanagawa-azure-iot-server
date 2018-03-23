var router = require("express").Router();
var mongoose = require("mongoose");
var Gateway = mongoose.model("Gateway");
var Device = mongoose.model("Device");

var util = require("../lib/util");

router.param("gateway", function (req, res, next, deviceId) {
  Gateway.findOne({
    deviceId: deviceId,
  })
    .then(function (gateway) {
      if (!gateway) {
        return res.sendStatus(404);
      }

      req.gateway = gateway;

      return next();
    })
    .catch(next);
});

// return a list of gateways
router.get("/", function (req, res, next) {
  Gateway.find()
    .populate({ path: "devices" })
    .then(function (gateways) {
      return res.json({
        gateways: gateways,
      });
    })
    .catch(next);
});

// return specific gateway with deviceID
router.get("/:deviceId", (req, res) => {
  Gateway.findOne({
    deviceId: req.params.deviceId,
  })
    .populate("devices")
    .then(gateway => {
      return res.json({
        gateway: gateway,
      });
    });
});

// post gateway
router.post("/", (req, res, next) => {
  var newGateway = new Gateway(req.body.gateway);
  Gateway.findOne({
    deviceId: newGateway.deviceId,
  }).then(gateway => {
    if (gateway) {
      if (gateway.isApprove)
        return res.json({
          message: "Gateway already registered",
          gateway: gateway,
          isFirstRequestApprove: false
        });
      else
        return res.json({
          message: "Gateway Register Request already sended",
          gateway: gateway,
          isFirstRequestApprove: false
        });
    }
    return newGateway
      .save()
      .then(() => {
        return res.json({
          message: "Succesfully create request for register gateway",
          gateway: newGateway,
          isFirstRequestApprove: true
        });
      })
      .catch(next);
  });
});

// update gateway
router.put("/", (req, res) => {
  const gateway = req.body.gateway;
  const devices = gateway.devices.map(device => {
    return Object.assign(device, { gateway: device.gatewayID });
  });

  return Gateway.findByDeviceID(gateway.deviceId)
    .populate('devices')
    .then(async gatewayInstance => {
      for (let i = 0; i < gatewayInstance.devices.length; i++) {
        await gatewayInstance.devices[i].remove();
      }
      // Remove connected devices
      gatewayInstance.devices = [];

      const docs = await Device.insertMany(devices);
      docs.forEach(doc => {
        gatewayInstance.devices.push(doc._id);
      });
      gatewayInstance.name = gateway.name;
      gatewayInstance.isApprove = gateway.isApprove;

      gatewayInstance.save().then(() => {
        res.json({ success: true });
      });
    });
});

// delete gateway by deviceId
router.delete("/:gateway", (req, res, next) => {
  var gatewayID = req.gateway._id;
  console.log('delete gateway: => ', gatewayID)
  util.removeDevice(req.params.gateway, err => {
    // console.log(err);
     return req.gateway
       .remove()
       .then(() => {
        Device.deleteMany({
          gateway: gatewayID
        }).exec();
        res.status(204).json({
          success: true,
        });
       })
       .catch(next);
  });
});

module.exports = router;

var mongoose = require("mongoose");
var Gateway = mongoose.model("Gateway");

var express = require('express');
var router = express.Router();

router.use('/gateways', require('./gateways'));
router.use('/iot', require('./iot'));
router.use('/dataset', require('./dataset'));
router.use('/errormessage', require('./errormessage'));

router.get('/check', (req, res) => {
    res.json({
        success: true
    });
});

// check licence key, & gateway status
router.post('/request-licence-key', (req, res) => {
    const key = req.body.key;
    const deviceId = req.body.deviceId;

    const CONFIG = require('../../config');
    if (key == CONFIG.LICENCE_KEY) {
        Gateway.findOne({
                deviceId: deviceId,
            })
            .then(function (gateway) {
                if (gateway) {
                    if (gateway.isApprove)
                        return res.json({
                            success: true,
                            iotConnectionString: CONFIG.IOT_CONNECTION_STRING,
                            iotHostName: CONFIG.IOT_HOSTNAME,
                            message: "Gateway already registered",
                            gateway: gateway,
                            isFirstRequestApprove: false

                        });
                    else
                        return res.json({
                            success: true,
                            iotConnectionString: CONFIG.IOT_CONNECTION_STRING,
                            iotHostName: CONFIG.IOT_HOSTNAME,
                            message: "Gateway Register Request already sended",
                            gateway: gateway,
                            isFirstRequestApprove: false
                        });
                } else {
                    return res.json({
                        success: true,
                        iotConnectionString: CONFIG.IOT_CONNECTION_STRING,
                        iotHostName: CONFIG.IOT_HOSTNAME
                    });
                }

            })

    } else {
        return res.json({
            success: false
        });
    }
});

module.exports = router;
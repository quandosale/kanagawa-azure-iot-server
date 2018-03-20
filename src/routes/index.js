var express = require('express');
var router = express.Router();

router.use('/gateways', require('./gateways'));
router.use('/iot', require('./iot'));
router.use('/dataset', require('./dataset'));

router.get('/check', (req, res) => {
    res.json({
        success: true
    })
})
router.post('/request-licence-key', (req, res) => {
    const key = req.body.key;
    const CONFIG = require('../../config');
    if (key == CONFIG.LICENCE_KEY)
        return res.json({
            success: true,
            iotConnectionString: CONFIG.IOT_CONNECTION_STRING,
            iotHostName: CONFIG.IOT_HOSTNAME
        })
    return res.json({
        success: false
    })
})

module.exports = router;
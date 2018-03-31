var router = require("express").Router();
var mongoose = require("mongoose");

var config = require('../../config');
var util = require("../lib/util");

var ErrorMessage = mongoose.model("ErrorMessage");

router.post("/insert", (req, res, next) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var newErrorMessage = new ErrorMessage(req.body.errormessage);
    newErrorMessage.detail = `ip: ${ip}`;
    newErrorMessage.time = new Date();
    newErrorMessage.save().then(() => {
        res.json({
            success: true
        });
    });
});
module.exports = router;
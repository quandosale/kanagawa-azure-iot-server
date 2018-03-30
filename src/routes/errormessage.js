var router = require("express").Router();
var mongoose = require("mongoose");

var config = require('../../config');
var util = require("../lib/util");

var ErrorMessage = mongoose.model("ErrorMessage");

router.post("/insert", (req, res, next) => {
    var newErrorMessage = new ErrorMessage(req.body.errormessage);
    newErrorMessage.save().then(() => {
        res.json({
            success: true
        });
    });
});
module.exports = router;
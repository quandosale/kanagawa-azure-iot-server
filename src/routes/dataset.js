var router = require("express").Router();
var mongoose = require("mongoose");
var Gateway = mongoose.model("Gateway");
var Device = mongoose.model("Device");
var Dataset = mongoose.model("Dataset");
var config = require('../../config');
var util = require("../lib/util");

router.post("/get-list", (req, res, next) => {
    Dataset.find({})
    .populate('gatewayId')
    .populate('deviceId')
    .then ((datasets) => {
        return util.responseHandler(res, true, "Success", datasets);
    })
    .catch(err => {
        return util.responseHandler(res, false, "Error", err);
    });
});

router.put("/recordcancel", (req, res, next) => {
    var deviceId = req.body.deviceId;
    console.log(deviceId);
    Device.findByIdAndUpdate(deviceId, {
        $set: {
            isRecord: false
        }
    }, {
        new: true
    }, function (err, device) {
        if (err) return util.responseHandler(res, false, "Error", err);
        return util.responseHandler(res, true, "Success", deviceId);
    });
});

router.put("/recordstart", (req, res, next) => {
    var newDataset = new Dataset(req.body);
    console.log(newDataset.gatewayId, newDataset.deviceId, newDataset.start);
    Device.findByIdAndUpdate(newDataset.deviceId, {
        $set: {
            isRecord: true,
            currentRecordingDatasetId: newDataset._id
        }
    }, {
        new: true
    }, function (err, device) {
        if (err) return util.responseHandler(res, false, "Error", err);
        createDataset(res, next, newDataset);
    });
});

createDataset = function (res, next, newDataset) {
    Dataset.findOne({
            datasetId: newDataset.datasetId,
        }).then(dataset => {
            if (dataset) return util.responseHandler(res, false, "Already exist dataset with ", newDataset);
            return newDataset
                .save()
                .then(() => {
                    return util.responseHandler(res, true, "Succesfully create new Dataset", newDataset);
                })
                .catch(next);
        })
        .catch(next);
};

router.put("/recordstop", (req, res, next) => {
    var newDataset = new Dataset(req.body);
    console.log(newDataset);
    util.moveTmpToStorage(newDataset);
    Device.findByIdAndUpdate(newDataset.deviceId, {
        $set: {
            isRecord: false
        }
    }, {
        new: true
    }, function (err, device) {
        if (err) return util.responseHandler(res, false, "Error", err);
        updateDataset(res, next, newDataset);
    });
});

var fs = require('fs');

router.get("/download/:fileName", (req, res, next) => {
    let filePath = `${config.STORAGE_PATH}/${req.params.fileName}`;
    if (!fs.existsSync(filePath)) {
        console.error('file not found', filePath);
        return res.sendStatus(404);
    }
    return res.download(filePath);
});

updateDataset = function (res, next, newDataset) {
    Dataset.findOne({
        datasetId: newDataset.datasetId
    }, function (err, dataset) {
        if (err || !dataset) {
            return newDataset
                .save()
                .then(() => {
                    return util.responseHandler(res, true, "Succesfully create new Dataset with duration", newDataset);
                })
                .catch(next);
        } else {
            Dataset.findByIdAndUpdate(dataset._id, {
                $set: {
                    isRecord: false,
                    duration: newDataset.duration
                }
            }, {
                new: true
            }, function (err, updatedDataset) {
                if (err) return util.responseHandler(res, false, "Error", err);
                return util.responseHandler(res, true, 'success update dataset with duration', updatedDataset);
            });
        }
    })
};

module.exports = router;
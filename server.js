const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const moment = require("moment");
const path = require("path");
const iotHubClient = require("./IoTHub/iot-hub.js");
const mongoose = require('mongoose');
var Device, Dataset;
const bodyParser = require('body-parser');
const config = require('./config');
const FILE_TYPE = config.FILE_TYPE;
const cors = require('cors');
var keys = Object.keys || require('object-keys');
const app = express();
var util = require('./src/lib/util');
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({
  limit: '5mb',
  extended: true
}));
app.use(bodyParser.json({
  limit: '5mb'
}));

app.use(cors());
app.use(function (err, req, res, next) {
  if (err.name === 'StatusError') {
    res.send(err.status, err.message);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(err);
  }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({
  server
});

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        console.log("sending data " + data);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

require("./src/models");
app.use(require("./src/routes"));
app.use(function (req, res /*, next*/ ) {
  res.redirect("/");
});

var iotHubReader = new iotHubClient(
  require("./config").IOT_CONNECTION_STRING,
  require("./config").IOT_CONSUMER_GROUP
);
iotHubReader.startReadMessage(function (obj, date) {
  try {
    console.log(date);
    date = date || Date.now();
    checkRecordStatus(obj);
    wss.broadcast(
      JSON.stringify(
        Object.assign(obj, {
          time: moment.utc(date).format("YYYY:MM:DD[T]hh:mm:ss"),
        })
      )
    );
  } catch (err) {
    console.log(obj);
    console.error(err);
  }
});

var fs = require('fs');

var createStorage = function () {
  if (!fs.existsSync(config.STORAGE_PATH)) {
    fs.mkdirSync(config.STORAGE_PATH);
  }
  if (!fs.existsSync(config.STORAGE_TMP_PATH)) {
    fs.mkdirSync(config.STORAGE_TMP_PATH);
  }
};
// Check Record Status from mongodb, by device(calm-device), isRecord flag, append the data
var checkRecordStatus = function (obj) {
  const mac = obj.data.row.emitter;
  if (Device == null) {
    console.log("Mongo 'Device' still not inited.");
    return;
  }
  Device.findOne({
      mac: mac
    })
    .then(function (device) {
      if (!device) return console.log('the device is not exist', mac);

      if (!device.isRecord) return;

      findDataset(obj, device.currentRecordingDatasetId);
    });
};
var findDataset = function (obj, datasetId) {
  Dataset.findOne({
      _id: datasetId
    })
    .then(function (dataset) {
      if (!dataset) return console.log('dataset is not exist', datasetId);
      var current = new Date().getTime();
      if ((current - dataset.start) >= config.RECORD_MAX_DURATION) {
        util.moveTmpToStorage(dataset);
        Device.findByIdAndUpdate(dataset.deviceId, {
          $set: {
            isRecord: false
          }
        }, {
          new: true
        }, function (err, device) {});
        return;
      }
      writeFile(obj, dataset);
    });
};

var writeFile = function (obj, dataset) {

  const mac = obj.data.row.emitter;
  createStorage();
  var ecgFile_Size = 0;
  var hrFile_Size = 0;
  // ecg
  try {
    var ecgArr = obj.data.row.ecg.data;
    var ecgBuffer = Buffer.from(ecgArr);

    fs.appendFile(`./${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.ECG}`, ecgBuffer, "binary", (err) => {
      if (err) throw err;
      console.log(`The ecg file has been saved!, size = ${ecgArr.length}, mac = ${mac}, file = ${dataset.file}`);
    });

    if (fs.exists(`./${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.ECG}`))
      ecgFile_Size = fs.statSync(`./${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.ECG}`).size;

    if (fs.exists(`./${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.HEART_RATE}`))
      hrFile_Size = fs.statSync(`./${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.HEART_RATE}`).size;

  } catch (error) {
    console.log(error);
  }

  // heart rate
  try {
    var heartRateArr = obj.data.row.heartrate.data;
    var heartrateBuffer = Buffer.from(heartRateArr);
    fs.appendFile(`./${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.HEART_RATE}`, heartrateBuffer, "binary", (err) => {
      if (err) throw err;
      console.log(`The hr file has been saved!, size = ${heartRateArr.length}`);
    });
  } catch (error) {
    console.log(error);
  }

  // AF
  try {
    var AFArr = obj.data.row.af.data;
    var deAFArr = buffer8ToArray(AFArr);
    console.log(AFArr, deAFArr, 'af')
    var resultStr = [];
    console.log(ecgFile_Size, hrFile_Size)
    var ecgIndex = Math.round(ecgFile_Size / 2 * 3);
    var hrIndex = Math.round(hrFile_Size / 2 * 3);
    deAFArr.forEach((value, index) => {
      if (value == 0) { // if af
        resultStr.push(ecgIndex + index * 250);
        resultStr.push(hrIndex + index);
      }
    });
    console.log(resultStr)
    var AFBuffer = Buffer.from(resultStr);
    fs.appendFile(`./${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.AF}`, resultStr, "binary", (err) => {
      if (err) throw err;
      console.log(`The af file has been saved!, size = ${deAFArr.length}`);
    });
  } catch (error) {
    console.log(error);
  }
  // posture
  try {
    var posture = obj.data.row.pos;
    fs.appendFile(`./${config.STORAGE_TMP_PATH}/${dataset.file}${FILE_TYPE.POSTURE}`, posture, (err) => {
      if (err) throw err;
      console.log('The posture file has been saved!');
    });
  } catch (error) {
    console.log(error);
  }
};

function buffer8ToArray(buf) {
  var arr = [];
  for (var i = 0; i < buf.length; i++)
    arr.push(buf[i] & 0xFF);
  return arr;
}
var port = normalizePort(process.env.PORT || "8080");
server.listen(port, function listening() {
  console.log("Listening on %d", server.address().port);
});
setInterval(function () {
  var date = date || Date.now();
  wss.broadcast(JSON.stringify({
    TAG: 'For Socket Debug',
    time: moment.utc(date).format("YYYY:MM:DD[T]hh:mm:ss")
  }));
}, 1000);
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

mongoose
  .connect(config.DB.URI)
  .then(() => {
    console.log("mongodb connected ...");
    Device = mongoose.model("Device");
    Dataset = mongoose.model("Dataset");
  })
  .catch(err => {
    console.log("err", err);
  });
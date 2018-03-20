require("./device");
require("./gateway");
require("./dataset");

const mongoose = require("mongoose");

module.exports = {
  Device: mongoose.model("Device"),
  Gateway: mongoose.model("Device"),
  Daataset:mongoose.model("Dataset")
};

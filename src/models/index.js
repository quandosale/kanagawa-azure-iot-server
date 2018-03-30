require("./device");
require("./gateway");
require("./dataset");
require("./errormessage");

const mongoose = require("mongoose");

module.exports = {
  Device: mongoose.model("Device"),
  Gateway: mongoose.model("Gateway"),
  Daataset:mongoose.model("Dataset"),
  ErrorMessage:mongoose.model("ErrorMessage")
};

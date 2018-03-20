const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var datasetSchema = new Schema({
  datasetId: String,
  gatewayId: {
    type: Schema.Types.ObjectId,
    ref: "Gateway",
  },
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: "Device",
  },
  file: String,
  start: Number,
  duration: Number
});

mongoose.model("Dataset", datasetSchema);
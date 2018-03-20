const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var deviceSchema = new Schema({
  type: String,
  deviceName: String,
  mac: String,
  name: String,
  isRecord: Boolean,
  currentRecordingDatasetId: String,
  gateway: {
    type: Schema.Types.ObjectId,
    ref: "Gateway",
  },
});

mongoose.model("Device", deviceSchema);
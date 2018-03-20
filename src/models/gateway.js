const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var deviceSchema = new Schema({
  name: String,
  deviceId: String,
  deviceKey: String,
  isApprove: Boolean,
  devices: [
    {
      type: Schema.Types.ObjectId,
      ref: "Device",
    },
  ],
}, {
    timestamps: true
  });

deviceSchema.statics.findByDeviceID = (deviceId) => {
  return mongoose.model('Gateway').findOne({ deviceId: deviceId })
}

mongoose.model("Gateway", deviceSchema);

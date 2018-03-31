const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var errorMessageSchema = new Schema({
  from: String,
  type: String,
  message: String,
  detail: String,
  time: Date
});

mongoose.model("ErrorMessage", errorMessageSchema);
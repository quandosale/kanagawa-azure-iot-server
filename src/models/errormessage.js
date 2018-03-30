const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var errorMessageSchema = new Schema({
  type: String,
  message: String,
  detail: String,
});

mongoose.model("ErrorMessage", errorMessageSchema);
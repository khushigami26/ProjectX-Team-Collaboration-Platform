const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Chat",
  new mongoose.Schema({
    sender: String,
    receiver: String,
    message: String,
    time: { type: Date, default: Date.now },
  }),
);

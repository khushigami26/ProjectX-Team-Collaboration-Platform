const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Story",
  new mongoose.Schema({
    userId: String,
    userName: String,
    userAvatar: String,
    image: String,
    expiresAt: Date,
    likes: { type: [String], default: [] },
  }),
);

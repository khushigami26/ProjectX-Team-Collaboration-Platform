const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  userAvatar: String,
  caption: String,
  image: String,
  location: String,
  music: String,
  hideLikes: { type: Boolean, default: false },
  likes: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);

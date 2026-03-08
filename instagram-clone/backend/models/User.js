const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  avatar: String,
  bio: String,
  followers: { type: [String], default: [] },
  following: { type: [String], default: [] },
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);

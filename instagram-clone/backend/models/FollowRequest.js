const mongoose = require("mongoose");

module.exports = mongoose.model(
  "FollowRequest",
  new mongoose.Schema({
    fromUserId: String,
    toUserId: String,
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now },
  }),
);

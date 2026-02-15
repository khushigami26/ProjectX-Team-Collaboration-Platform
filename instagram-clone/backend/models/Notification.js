const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Notification",
  new mongoose.Schema(
    {
      userId: String,
      type: String,
      message: String,
      fromUserId: String,
      fromUserName: String,
      fromUserAvatar: String,
      postId: String,
      postImage: String,
      requestId: String,
      seen: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);

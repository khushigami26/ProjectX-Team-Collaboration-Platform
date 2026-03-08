const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Comment",
  new mongoose.Schema(
    {
      postId: String,
      userId: String,
      text: String,
    },
    { timestamps: true },
  ),
);

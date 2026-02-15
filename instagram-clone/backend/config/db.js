const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://khushigami262:mahadevhar@cluster0.ef118.mongodb.net/instagram_clone",
  );
  console.log("MongoDB connected");
};

module.exports = connectDB;

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/post"));
app.use("/api/users", require("./routes/users"));
app.use("/api/follow", require("./routes/follow"));
app.use("/api/stories", require("./routes/story"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/notifications", require("./routes/notifications"));

require("./socket/chatSocket")(io);

server.listen(5000, () => {
  console.log("Backend running at http://localhost:5000");
});

const router = require("express").Router();
const Chat = require("../models/Chat");
const User = require("../models/User");
const auth = require("../middleware/auth");

async function canMessage(userId, otherId) {
  const user = await User.findById(userId);
  const other = await User.findById(otherId);
  if (!user || !other) return false;

  const follows = (user.following || []).includes(otherId);
  const followedBy = (user.followers || []).includes(otherId);
  return follows || followedBy;
}

router.get("/:userId", auth, async (req, res) => {
  const otherId = req.params.userId;
  const allowed = await canMessage(req.user.id, otherId);
  if (!allowed) return res.status(403).json("Follow required");

  const messages = await Chat.find({
    $or: [
      { sender: req.user.id, receiver: otherId },
      { sender: otherId, receiver: req.user.id },
    ],
  }).sort({ time: 1 });

  res.json(messages);
});

router.post("/", auth, async (req, res) => {
  const { receiverId, message } = req.body;
  if (!receiverId || !message) return res.status(400).json("Invalid payload");

  const allowed = await canMessage(req.user.id, receiverId);
  if (!allowed) return res.status(403).json("Follow required");

  const chat = new Chat({
    sender: req.user.id,
    receiver: receiverId,
    message,
  });
  await chat.save();
  res.json(chat);
});

module.exports = router;

const router = require("express").Router();
const multer = require("multer");
const Story = require("../models/Story");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

const upload = multer({ dest: "uploads/" });

router.post("/", auth, upload.single("image"), async (req, res) => {
  const user = await User.findById(req.user.id).select("name avatar");
  const story = new Story({
    userId: req.user.id,
    userName: user?.name || "",
    userAvatar: user?.avatar || "",
    image: req.file.filename,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  await story.save();
  res.json(story);
});

router.get("/", auth, async (req, res) => {
  const me = await User.findById(req.user.id);
  const allowed = Array.from(
    new Set([req.user.id, ...(me?.following || []), ...(me?.followers || [])]),
  ).map((id) => String(id));
  const stories = await Story.find({
    userId: { $in: allowed },
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
  const userIds = Array.from(new Set(stories.map((s) => s.userId)));
  const users = await User.find({ _id: { $in: userIds } }).select(
    "name avatar",
  );
  const usersById = new Map(
    users.map((u) => [String(u._id), { name: u.name, avatar: u.avatar }]),
  );

  res.json(
    stories.map((story) => {
      const user = usersById.get(String(story.userId)) || {};
      return {
        ...story.toObject(),
        userName: story.userName || user.name || "",
        userAvatar: story.userAvatar || user.avatar || "",
      };
    }),
  );
});

router.get("/highlights/:userId", auth, async (req, res) => {
  const stories = await Story.find({
    userId: req.params.userId,
    expiresAt: { $lte: new Date() },
  }).sort({ createdAt: -1 });
  res.json(stories);
});

router.post("/:id/like", auth, async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) return res.status(404).json("Story not found");

  const userId = req.user.id;
  const likes = story.likes || [];
  const hadLike = likes.includes(userId);
  if (likes.includes(userId)) {
    story.likes = likes.filter((id) => id !== userId);
  } else {
    story.likes = [...likes, userId];
  }
  await story.save();

  if (!hadLike && String(story.userId) !== String(userId)) {
    const liker = await User.findById(userId).select("name avatar");
    await Notification.create({
      userId: story.userId,
      type: "story_like",
      message: `${liker?.name || "Someone"} liked your story`,
      fromUserId: userId,
      fromUserName: liker?.name || "Someone",
      fromUserAvatar: liker?.avatar || "",
      postImage: story.image,
    });
  }
  res.json(story);
});

router.delete("/:id", auth, async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) return res.status(404).json("Story not found");
  if (String(story.userId) !== String(req.user.id)) {
    return res.status(403).json("Not allowed");
  }

  await story.deleteOne();
  res.json({ status: "deleted" });
});

module.exports = router;

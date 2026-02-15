const router = require("express").Router();
const multer = require("multer");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

const upload = multer({ dest: "uploads/" });

router.post("/", auth, upload.single("image"), async (req, res) => {
  const user = await User.findById(req.user.id);
  const post = new Post({
    userId: req.body.userId || req.user.id,
    userName: user?.name || req.body.userName,
    userAvatar: user?.avatar || req.body.userAvatar,
    caption: req.body.caption,
    location: req.body.location,
    music: req.body.music,
    hideLikes: req.body.hideLikes === "true" || req.body.hideLikes === true,
    image: req.file.filename,
  });
  await post.save();
  res.json(post);
});

router.get("/", auth, async (req, res) => {
  const me = await User.findById(req.user.id);
  const allowed = [req.user.id, ...(me?.following || [])];
  res.json(
    await Post.find({ userId: { $in: allowed } }).sort({ createdAt: -1 }),
  );
});

router.get("/user/:id", auth, async (req, res) => {
  const targetId = req.params.id;
  const me = await User.findById(req.user.id);
  const allowed = [req.user.id, ...(me?.following || [])];

  if (!allowed.includes(targetId)) return res.json([]);

  res.json(await Post.find({ userId: targetId }).sort({ createdAt: -1 }));
});

router.post("/:id/like", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json("Post not found");

  const userId = req.user.id;
  const likes = post.likes || [];
  const hadLike = likes.includes(userId);
  if (likes.includes(userId)) {
    post.likes = likes.filter((id) => id !== userId);
  } else {
    post.likes = [...likes, userId];
  }
  await post.save();

  if (!hadLike && String(post.userId) !== String(userId)) {
    const liker = await User.findById(userId).select("name avatar");
    await Notification.create({
      userId: post.userId,
      type: "like",
      message: `${liker?.name || "Someone"} liked your post`,
      fromUserId: userId,
      fromUserName: liker?.name || "Someone",
      fromUserAvatar: liker?.avatar || "",
      postId: String(post._id),
      postImage: post.image,
    });
  }
  res.json(post);
});

router.post("/:id/comment", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json("Post not found");

  const text = (req.body.text || "").trim();
  if (!text) return res.status(400).json("Comment required");

  const comment = await Comment.create({
    postId: post._id,
    userId: req.user.id,
    text,
  });

  if (String(post.userId) !== String(req.user.id)) {
    const commenter = await User.findById(req.user.id).select("name avatar");
    const snippet = text.length > 80 ? `${text.slice(0, 77)}...` : text;
    await Notification.create({
      userId: post.userId,
      type: "comment",
      message: `${commenter?.name || "Someone"} commented: ${snippet}`,
      fromUserId: req.user.id,
      fromUserName: commenter?.name || "Someone",
      fromUserAvatar: commenter?.avatar || "",
      postId: String(post._id),
      postImage: post.image,
    });
  }

  res.json(comment);
});

router.get("/:id/comments", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json("Post not found");

  const comments = await Comment.find({ postId: String(post._id) }).sort({
    createdAt: -1,
  });
  const userIds = comments.map((c) => c.userId).filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } }).select(
    "name avatar",
  );
  const usersById = new Map(
    users.map((u) => [String(u._id), { name: u.name, avatar: u.avatar }]),
  );

  res.json(
    comments.map((c) => {
      const user = usersById.get(String(c.userId)) || {};
      return {
        id: c._id,
        text: c.text,
        createdAt: c.createdAt,
        userId: c.userId,
        userName: user.name || "",
        userAvatar: user.avatar || "",
      };
    }),
  );
});

router.patch("/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json("Post not found");
  if (String(post.userId) !== String(req.user.id)) {
    return res.status(403).json("Not allowed");
  }

  const { caption, location, music, hideLikes } = req.body;
  if (caption !== undefined) post.caption = caption;
  if (location !== undefined) post.location = location;
  if (music !== undefined) post.music = music;
  if (hideLikes !== undefined) post.hideLikes = Boolean(hideLikes);

  await post.save();
  res.json(post);
});

router.delete("/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json("Post not found");
  if (String(post.userId) !== String(req.user.id)) {
    return res.status(403).json("Not allowed");
  }

  await post.deleteOne();
  res.json({ status: "deleted" });
});

module.exports = router;

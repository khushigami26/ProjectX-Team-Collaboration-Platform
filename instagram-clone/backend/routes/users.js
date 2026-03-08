const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

router.get("/me", auth, async (req, res) => {
  const me = await User.findById(req.user.id);
  res.json({
    followers: me?.followers?.length || 0,
    following: me?.following?.length || 0,
  });
});

router.patch("/me", auth, async (req, res) => {
  const me = await User.findById(req.user.id);
  if (!me) return res.status(404).json("User not found");

  const { name, avatar, bio } = req.body || {};
  if (name !== undefined) me.name = String(name).trim();
  if (avatar !== undefined) me.avatar = avatar;
  if (bio !== undefined) me.bio = String(bio);

  await me.save();
  res.json({
    id: me._id,
    name: me.name,
    avatar: me.avatar || "",
    bio: me.bio || "",
  });
});

router.get("/search", auth, async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);

  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ],
  }).select("name email avatar");

  res.json(
    users.map((u) => ({
      id: u._id,
      name: u.name,
      handle: u.name,
      avatar: u.avatar || "",
    })),
  );
});

router.get("/connections", auth, async (req, res) => {
  const me = await User.findById(req.user.id);
  const ids = Array.from(
    new Set([...(me?.following || []), ...(me?.followers || [])]),
  );

  const users = await User.find({ _id: { $in: ids } }).select(
    "name email avatar",
  );
  res.json(
    users.map((u) => ({
      id: u._id,
      name: u.name,
      handle: u.name,
      avatar: u.avatar || "",
    })),
  );
});

router.get("/:id/followers", auth, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json("User not found");
  const ids = user.followers || [];
  const users = await User.find({ _id: { $in: ids } }).select("name avatar");
  res.json(
    users.map((u) => ({
      id: u._id,
      name: u.name,
      handle: u.name,
      avatar: u.avatar || "",
    })),
  );
});

router.get("/:id/following", auth, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json("User not found");
  const ids = user.following || [];
  const users = await User.find({ _id: { $in: ids } }).select("name avatar");
  res.json(
    users.map((u) => ({
      id: u._id,
      name: u.name,
      handle: u.name,
      avatar: u.avatar || "",
    })),
  );
});

router.get("/:id", auth, async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "name avatar bio followers following",
  );
  if (!user) return res.status(404).json("User not found");
  res.json({
    id: user._id,
    name: user.name,
    handle: user.name,
    avatar: user.avatar || "",
    bio: user.bio || "",
    followers: user.followers?.length || 0,
    following: user.following?.length || 0,
  });
});

module.exports = router;

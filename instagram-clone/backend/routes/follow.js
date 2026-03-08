const router = require("express").Router();
const FollowRequest = require("../models/FollowRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

router.post("/request", auth, async (req, res) => {
  const fromUserId = req.user.id;
  const toUserId = req.body.toUserId;

  if (!toUserId) return res.status(400).json("Missing user id");
  if (fromUserId === toUserId) return res.status(400).json("Invalid request");

  const toUser = await User.findById(toUserId);
  if (!toUser) return res.status(404).json("User not found");

  const alreadyFollowing = (toUser.followers || []).includes(fromUserId);
  if (alreadyFollowing) return res.json({ status: "following" });

  const existing = await FollowRequest.findOne({
    fromUserId,
    toUserId,
    status: "pending",
  });

  if (existing) return res.json({ status: "requested" });

  const request = await FollowRequest.create({ fromUserId, toUserId });
  const fromUser = await User.findById(fromUserId).select("name avatar");
  await Notification.create({
    userId: toUserId,
    type: "follow_request",
    message: `${fromUser?.name || "Someone"} sent you a follow request`,
    fromUserId,
    fromUserName: fromUser?.name || "Someone",
    fromUserAvatar: fromUser?.avatar || "",
    requestId: String(request._id),
  });
  res.json({ status: "requested", requestId: request._id });
});

router.get("/requests", auth, async (req, res) => {
  const requests = await FollowRequest.find({
    toUserId: req.user.id,
    status: "pending",
  });

  const userIds = requests.map((r) => r.fromUserId);
  const users = await User.find({ _id: { $in: userIds } }).select(
    "name avatar",
  );

  const usersById = new Map(
    users.map((u) => [String(u._id), { name: u.name, avatar: u.avatar }]),
  );

  res.json(
    requests.map((r) => ({
      id: r._id,
      fromUserId: r.fromUserId,
      user: usersById.get(String(r.fromUserId)) || {},
    })),
  );
});

router.post("/accept", auth, async (req, res) => {
  const request = await FollowRequest.findById(req.body.requestId);
  if (!request) return res.status(404).json("Request not found");
  if (request.toUserId !== req.user.id)
    return res.status(403).json("Not allowed");

  request.status = "accepted";
  await request.save();

  const fromUser = await User.findById(request.fromUserId);
  const toUser = await User.findById(request.toUserId);

  if (fromUser && toUser) {
    if (!toUser.followers.includes(fromUser._id)) {
      toUser.followers.push(fromUser._id);
    }
    if (!fromUser.following.includes(toUser._id)) {
      fromUser.following.push(toUser._id);
    }
    await toUser.save();
    await fromUser.save();
  }

  res.json({ status: "accepted" });
});

router.post("/reject", auth, async (req, res) => {
  const request = await FollowRequest.findById(req.body.requestId);
  if (!request) return res.status(404).json("Request not found");
  if (request.toUserId !== req.user.id)
    return res.status(403).json("Not allowed");

  request.status = "rejected";
  await request.save();
  res.json({ status: "rejected" });
});

router.post("/back", auth, async (req, res) => {
  const targetId = req.body.userId;
  if (!targetId) return res.status(400).json("Missing user id");
  if (targetId === req.user.id) return res.status(400).json("Invalid request");

  const me = await User.findById(req.user.id);
  const target = await User.findById(targetId);
  if (!me || !target) return res.status(404).json("User not found");

  if (!me.following.includes(target._id)) {
    me.following.push(target._id);
  }
  if (!target.followers.includes(me._id)) {
    target.followers.push(me._id);
  }

  await me.save();
  await target.save();

  await Notification.create({
    userId: targetId,
    type: "follow",
    message: `${me.name || "Someone"} started following you`,
    fromUserId: String(me._id),
    fromUserName: me.name || "Someone",
    fromUserAvatar: me.avatar || "",
  });

  res.json({ status: "following" });
});

router.get("/status/:userId", auth, async (req, res) => {
  const userId = req.params.userId;
  const me = await User.findById(req.user.id);
  const following = (me?.following || []).includes(userId);

  const pending = await FollowRequest.findOne({
    fromUserId: req.user.id,
    toUserId: userId,
    status: "pending",
  });

  res.json({
    following,
    requested: Boolean(pending),
  });
});

router.post("/unfollow", auth, async (req, res) => {
  const targetId = req.body.userId;
  if (!targetId) return res.status(400).json("Missing user id");
  if (targetId === req.user.id) return res.status(400).json("Invalid request");

  const me = await User.findById(req.user.id);
  const target = await User.findById(targetId);
  if (!me || !target) return res.status(404).json("User not found");

  me.following = (me.following || []).filter(
    (id) => String(id) !== String(targetId),
  );
  target.followers = (target.followers || []).filter(
    (id) => String(id) !== String(req.user.id),
  );

  await me.save();
  await target.save();

  res.json({ status: "unfollowed" });
});

router.post("/remove-follower", auth, async (req, res) => {
  const targetId = req.body.userId;
  if (!targetId) return res.status(400).json("Missing user id");
  if (targetId === req.user.id) return res.status(400).json("Invalid request");

  const me = await User.findById(req.user.id);
  const target = await User.findById(targetId);
  if (!me || !target) return res.status(404).json("User not found");

  me.followers = (me.followers || []).filter(
    (id) => String(id) !== String(targetId),
  );
  target.following = (target.following || []).filter(
    (id) => String(id) !== String(req.user.id),
  );

  await me.save();
  await target.save();

  res.json({ status: "removed" });
});

module.exports = router;

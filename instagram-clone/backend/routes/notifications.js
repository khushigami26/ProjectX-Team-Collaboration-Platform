const router = require("express").Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifications);
});

router.get("/unread-count", auth, async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user.id,
    seen: false,
  });
  res.json({ count });
});

router.patch("/mark-seen", auth, async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, seen: false },
    { $set: { seen: true } },
  );
  res.json({ status: "ok" });
});

module.exports = router;

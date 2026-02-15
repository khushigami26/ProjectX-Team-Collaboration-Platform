const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.post("/register", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || "");

  if (!name || !email || !password) {
    return res.status(400).json("Missing required fields");
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json("Email already registered");

  const hash = await bcrypt.hash(password, 10);
  await new User({ ...req.body, name, email, password: hash }).save();
  res.json("Registered");
});

router.post("/login", async (req, res) => {
  const identifier = String(req.body?.email || "").trim();
  const password = String(req.body?.password || "");

  if (!identifier || !password) {
    return res.status(400).json("Email/username and password are required");
  }

  const safe = escapeRegExp(identifier);
  const user = await User.findOne({
    $or: [
      { email: { $regex: `^${safe}$`, $options: "i" } },
      { name: { $regex: `^${safe}$`, $options: "i" } },
    ],
  });
  if (!user) return res.status(404).json("User not found");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json("Wrong password");

  const token = jwt.sign({ id: user._id }, "SECRET123");
  res.json({ token, user });
});

module.exports = router;

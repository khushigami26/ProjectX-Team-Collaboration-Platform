const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : authHeader;
  if (!token) return res.status(401).json("No token");

  try {
    req.user = jwt.verify(token, "SECRET123");
    next();
  } catch {
    res.status(401).json("Invalid token");
  }
};

const jwt = require("jsonwebtoken");

// Attaches req.user when a valid token is present, but never rejects.
// Used on routes that behave differently for logged-in users
// (e.g. the feed's "Following" tab).
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const decoded = jwt.verify(
        authHeader.split(" ")[1],
        process.env.JWT_SECRET
      );
      req.user = { id: decoded.id };
    }
  } catch (error) {
    // Invalid or missing token: continue as anonymous
  }

  next();
};

module.exports = optionalAuth;

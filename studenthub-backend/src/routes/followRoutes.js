const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing,
} = require("../controllers/followController");

router.post("/:id/follow", protect, toggleFollow);
router.get("/:id/follow-status", protect, getFollowStatus);
router.get("/:id/followers", protect, getFollowers);
router.get("/:id/following", protect, getFollowing);

module.exports = router;
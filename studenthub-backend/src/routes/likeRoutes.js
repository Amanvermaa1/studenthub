const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  toggleLike,
  getLikesCount,
  getLikeStatus,
} = require("../controllers/likeController");

router.post("/:postId", protect, toggleLike);

router.get("/:postId/status", protect, getLikeStatus);

router.get("/:postId", getLikesCount);

module.exports = router;
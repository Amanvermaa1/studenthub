const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createComment,
  getCommentsByPost,
  deleteComment,
  editComment,
  toggleCommentLike,
  getCommentLikeStatus,
  getCommentsEngagement,
} = require("../controllers/commentController");

router.post("/", protect, createComment);

router.get("/post/:postId", getCommentsByPost);
router.get("/engagement", protect, getCommentsEngagement);
router.delete("/:id", protect, deleteComment);
router.put("/:id", protect, editComment);
router.post("/:commentId/like", protect, toggleCommentLike);
router.get("/:commentId/like-status", protect, getCommentLikeStatus);

module.exports = router;
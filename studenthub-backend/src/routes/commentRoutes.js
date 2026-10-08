const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createComment,
  getCommentsByPost,
  deleteComment,
} = require("../controllers/commentController");

router.post("/", protect, createComment);

router.get("/post/:postId", getCommentsByPost);
router.delete("/:id", protect, deleteComment);

module.exports = router;
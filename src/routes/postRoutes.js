const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createPost,
  getAllPosts,
  getPostById,
} = require("../controllers/postController");

router.post("/", protect, createPost);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
module.exports = router;

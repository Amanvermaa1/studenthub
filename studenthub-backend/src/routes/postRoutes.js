const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getMyPosts,
} = require("../controllers/postController");

router.post(
    "/",
    protect,
    upload.single("image"),
    createPost
);
router.get("/", getAllPosts);
router.get("/my-posts", protect, getMyPosts);
router.get("/:id", getPostById);
router.put(
    "/:id",
    protect,
    upload.single("image"),
    updatePost
);
router.delete("/:id", protect, deletePost);
module.exports = router;

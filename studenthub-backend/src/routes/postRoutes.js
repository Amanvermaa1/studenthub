const express = require("express");
const { upload } = require("../middleware/upload");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");

const { postValidation } = require("../validators/postValidator");
const { validate } = require("../validators/userValidator");

const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getMyPosts,
  getEngagement,
} = require("../controllers/postController");

router.post(
    "/",
    protect,
    upload.single("image"),
    postValidation,
    validate,
    createPost
);
router.get("/", optionalAuth, getAllPosts);
router.get("/my-posts", protect, getMyPosts);
router.get("/engagement", protect, getEngagement);
router.get("/:id", getPostById);
router.put(
    "/:id",
    protect,
    upload.single("image"),
    postValidation,
    validate,
    updatePost
);
router.delete("/:id", protect, deletePost);
module.exports = router;

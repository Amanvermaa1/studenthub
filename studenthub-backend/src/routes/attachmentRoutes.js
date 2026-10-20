const express = require("express");
const router = express.Router();
const { uploadRaw } = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");

const {
  uploadAttachment,
  getAttachments,
  deleteAttachment,
  addTagsToPost,
  removeTagFromPost,
  getPostTags,
  getTrendingTags,
  getTrendingUsers,
  fullTextSearch,
  getRelatedPosts,
  searchByTag,
} = require("../controllers/attachmentController");

// Attachments
router.post("/posts/:postId/attachments", protect, uploadRaw.single("file"), uploadAttachment);
router.get("/posts/:postId/attachments", getAttachments);
router.delete("/attachments/:attachmentId", protect, deleteAttachment);

// Tags / Hashtags
router.post("/posts/:postId/tags", protect, addTagsToPost);
router.delete("/posts/:postId/tags/:tagId", protect, removeTagFromPost);
router.get("/posts/:postId/tags", getPostTags);
router.get("/tags/trending", getTrendingTags);
router.get("/users/trending", getTrendingUsers);
router.get("/posts/search", fullTextSearch);
router.get("/posts/search-by-tag", searchByTag);
router.get("/posts/:postId/related", getRelatedPosts);

module.exports = router;
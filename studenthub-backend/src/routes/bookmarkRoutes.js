const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    toggleBookmark,
    getBookmarks,
    getBookmarkStatus,
} = require("../controllers/bookmarkController");

router.post("/:postId", protect, toggleBookmark);

router.get("/:postId/status", protect, getBookmarkStatus);

router.get("/", protect, getBookmarks);

module.exports = router;
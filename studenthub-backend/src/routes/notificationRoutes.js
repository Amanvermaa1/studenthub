const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
} = require("../controllers/notificationController");

router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.post("/read", protect, markAsRead);

module.exports = router;
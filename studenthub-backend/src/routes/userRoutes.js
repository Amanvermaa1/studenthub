const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const { upload } = require("../middleware/upload");

const { authLimiter } = require("../middleware/rateLimit");

const {
  registerValidation,
  loginValidation,
  validate,
} = require("../validators/userValidator");

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  updateProfileImage,
  changePassword,
  getPublicProfile,
  getUserPosts,
} = require("../controllers/userController");

router.post("/register", authLimiter, registerValidation, validate, registerUser);

router.post("/login", authLimiter, loginValidation, validate, loginUser);

router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.put(
  "/profile/image",
  protect,
  upload.single("image"),
  updateProfileImage
);

router.put(
  "/change-password",
  protect,
  changePassword
);

router.get("/:id/public", getPublicProfile);

router.get("/:id/posts", getUserPosts);

module.exports = router;
const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const {
  notFound,
  errorHandler,
} = require("./src/middleware/errorMiddleware");

// Routes
const userRoutes = require("./src/routes/userRoutes");
const postRoutes = require("./src/routes/postRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
const likeRoutes = require("./src/routes/likeRoutes");
const bookmarkRoutes = require("./src/routes/bookmarkRoutes");
const followRoutes = require("./src/routes/followRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const attachmentRoutes = require("./src/routes/attachmentRoutes");
// Database
const pool = require("./src/config/db");

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Attachment/tag/search routes are mounted BEFORE postRoutes so that
// exact paths like /api/posts/search aren't swallowed by GET /:id.
app.use("/api", attachmentRoutes);
app.use("/api/posts", postRoutes);

// Test DB Connection Route
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      message: "Database Connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Database Connection Failed",
    });
  }
});

// User Routes
app.use("/api/users", userRoutes);
app.use("/api/users", followRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

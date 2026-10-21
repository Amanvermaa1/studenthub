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

/* ------------------------------------------------------------
   Production middleware
   ------------------------------------------------------------ */

// Render (and most PaaS) terminate TLS at their proxy. Trusting the proxy
// makes express-rate-limit see the real client IP instead of the proxy's.
app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS allow-list. Set CLIENT_ORIGIN to a comma separated list of allowed
// origins in production, e.g. "https://studenthub-gray.vercel.app".
const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No origin = same-origin / curl / mobile app -> allow.
      if (!origin) return callback(null, true);

      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes("*")) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

/* ------------------------------------------------------------
   Health check (used by Render + uptime monitors)
   ------------------------------------------------------------ */

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      status: "ok",
      service: "studenthub-api",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      service: "studenthub-api",
      database: "unreachable",
    });
  }
});

// Root route (kept for backwards compatibility with the original API)
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

/* ------------------------------------------------------------
   API routes
   ------------------------------------------------------------ */

// Attachment/tag/search routes are mounted BEFORE postRoutes so that
// exact paths like /api/posts/search aren't swallowed by GET /:id.
app.use("/api", attachmentRoutes);
app.use("/api/posts", postRoutes);

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

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (allowedOrigins.length) {
    console.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);
  }
});

/* ------------------------------------------------------------
   Graceful shutdown (Render sends SIGTERM on deploy/restart)
   ------------------------------------------------------------ */

const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(async () => {
    try {
      await pool.end();
    } catch (error) {
      console.error("Pool close error:", error.message);
    }
    process.exit(0);
  });

  // Force exit if connections hang.
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

module.exports = app;

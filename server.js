const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config();

const express = require("express");
const cors = require("cors");

const app = express();

// Routes
const userRoutes = require("./src/routes/userRoutes");

const postRoutes = require("./src/routes/postRoutes");
// Database
const pool = require("./src/config/db");

// Middleware
app.use(cors());
app.use(express.json());
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const getProfile = async (req, res) => {
  
  try {
    const result = await pool.query(
      `
      SELECT id, name, email, bio, profile_image, created_at
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET name = $1,
          bio = $2
      WHERE id = $3
      RETURNING id, name, email, bio, profile_image, created_at;
      `,
      [name, bio || null, req.user.id]
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
const updateProfileImage = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "Profile image is required",
      });
    }

    const imageUrl = req.file.path;

    const result = await pool.query(
      `
      UPDATE users
      SET profile_image = $1
      WHERE id = $2
      RETURNING id, name, email, bio, profile_image, created_at;
      `,
      [imageUrl, req.user.id]
    );

    res.status(200).json({
      message: "Profile image updated successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
const changePassword = async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const result = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    // Compare old password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await pool.query(
      `
      UPDATE users
      SET password = $1
      WHERE id = $2
      `,
      [hashedPassword, req.user.id]
    );

    res.status(200).json({
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
const loginUser = async (req, res) => {
  try {

    const password = req.body.password;
    const email = String(req.body.email || "").trim().toLowerCase();

    const result = await pool.query(
      "SELECT * FROM users WHERE lower(email) = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });

  }
};
const registerUser = async (req, res) => {
  try {

    const name = req.body.name;
    const password = req.body.password;
    const email = String(req.body.email || "").trim().toLowerCase();

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Check Existing User

    const userExists = await pool.query(
      "SELECT * FROM users WHERE lower(email) = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash Password

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save User

    const result = await pool.query(
      `
      INSERT INTO users(name,email,password)
      VALUES($1,$2,$3)
      RETURNING id,name,email,created_at
      `,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User Registered Successfully",
      user: result.rows[0]
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};

// PUBLIC PROFILE (any viewer)
const getPublicProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        users.id,
        users.name,
        users.bio,
        users.profile_image,
        users.created_at,
        (SELECT COUNT(*) FROM posts WHERE posts.user_id = users.id)::int AS post_count,
        (
          SELECT COUNT(*)
          FROM likes
          INNER JOIN posts ON likes.post_id = posts.id
          WHERE posts.user_id = users.id
        )::int AS like_count
      FROM users
      WHERE users.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// POSTS OF A USER (any viewer)
const getUserPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.subject,
        posts.image_url,
        posts.created_at,
        posts.user_id,
        users.name AS author,
        users.profile_image AS author_avatar,
        (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id)::int AS like_count,
        (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)::int AS comment_count
      FROM posts
      INNER JOIN users ON posts.user_id = users.id
      WHERE posts.user_id = $1
      ORDER BY posts.created_at DESC
      `,
      [req.params.id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  updateProfileImage,
  changePassword,
  getPublicProfile,
  getUserPosts,
};
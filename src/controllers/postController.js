const pool = require("../config/db");

// CREATE POST
const createPost = async (req, res) => {
  try {
    const { title, content, subject } = req.body;

    if (!title || !content || !subject) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO posts (title, content, subject, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [title, content, subject, req.user.id]
    );

    res.status(201).json({
      message: "Post created successfully",
      post: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET ALL POSTS
const getAllPosts = async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.subject,
        posts.created_at,
        users.name AS author
      FROM posts
      INNER JOIN users
      ON posts.user_id = users.id
      ORDER BY posts.created_at DESC;
      `
    );

    res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET SINGLE POST
const getPostById = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.subject,
        posts.created_at,
        users.name AS author
      FROM posts
      INNER JOIN users
      ON posts.user_id = users.id
      WHERE posts.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
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

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
};
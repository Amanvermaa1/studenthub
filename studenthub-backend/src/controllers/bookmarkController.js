const pool = require("../config/db");

const toggleBookmark = async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await pool.query(
      "SELECT * FROM posts WHERE id = $1",
      [postId]
    );

    if (post.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if bookmark already exists
    const existingBookmark = await pool.query(
      `
      SELECT *
      FROM bookmarks
      WHERE user_id = $1
      AND post_id = $2
      `,
      [req.user.id, postId]
    );

    // Remove bookmark
    if (existingBookmark.rows.length > 0) {

      await pool.query(
        `
        DELETE FROM bookmarks
        WHERE user_id = $1
        AND post_id = $2
        `,
        [req.user.id, postId]
      );

      return res.status(200).json({
        message: "Bookmark removed",
      });
    }

    // Add bookmark
    await pool.query(
      `
      INSERT INTO bookmarks(user_id, post_id)
      VALUES($1,$2)
      `,
      [req.user.id, postId]
    );

    res.status(201).json({
      message: "Post bookmarked",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getBookmarks = async (req, res) => {
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
      FROM bookmarks
      INNER JOIN posts
      ON bookmarks.post_id = posts.id
      INNER JOIN users
      ON posts.user_id = users.id
      WHERE bookmarks.user_id = $1
      ORDER BY bookmarks.created_at DESC;
      `,
      [req.user.id]
    );

    res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getBookmarkStatus = async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `
      SELECT 1
      FROM bookmarks
      WHERE user_id = $1
      AND post_id = $2
      `,
      [req.user.id, postId]
    );

    res.status(200).json({
      bookmarked: result.rows.length > 0,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
    toggleBookmark,
    getBookmarks,
    getBookmarkStatus,
};
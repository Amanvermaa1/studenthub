const pool = require("../config/db");

// CREATE COMMENT
const createComment = async (req, res) => {
  try {

    const { content, postId } = req.body;

    if (!content || !postId) {
      return res.status(400).json({
        message: "Content and Post ID are required",
      });
    }

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

    // Insert comment
    const result = await pool.query(
      `
      INSERT INTO comments (content, user_id, post_id)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [content, req.user.id, postId]
    );

    res.status(201).json({
      message: "Comment added successfully",
      comment: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET COMMENTS OF A POST
const getCommentsByPost = async (req, res) => {
  try {

    const { postId } = req.params;

    const result = await pool.query(
      `
      SELECT
        comments.id,
        comments.content,
        comments.user_id,
        comments.created_at,
        users.name AS author
      FROM comments
      INNER JOIN users
      ON comments.user_id = users.id
      WHERE comments.post_id = $1
      ORDER BY comments.created_at ASC;
      `,
      [postId]
    );

    res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
// Delete Comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the comment
    const comment = await pool.query(
      "SELECT * FROM comments WHERE id = $1",
      [id]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Check ownership
    if (comment.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to delete this comment",
      });
    }

    // Delete comment
    await pool.query(
      "DELETE FROM comments WHERE id = $1",
      [id]
    );

    res.status(200).json({
      message: "Comment deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  deleteComment,
};
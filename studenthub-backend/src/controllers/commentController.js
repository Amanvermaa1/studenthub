const pool = require("../config/db");

// CREATE COMMENT (or reply)
const createComment = async (req, res) => {
  try {
    const { content, postId, parentId } = req.body;

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

    // If parentId provided, check it exists and is not already a reply (1 level max)
    if (parentId) {
      const parent = await pool.query(
        "SELECT * FROM comments WHERE id = $1 AND post_id = $2",
        [parentId, postId]
      );
      if (parent.rows.length === 0) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      if (parent.rows[0].parent_id) {
        return res.status(400).json({ message: "Cannot reply to a reply (max 1 level)" });
      }
    }

    // Insert comment
    const result = await pool.query(
      `
      INSERT INTO comments (content, user_id, post_id, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [content, req.user.id, postId, parentId || null]
    );

    const comment = result.rows[0];

    // Create notification
    if (parentId) {
      // Reply notification to parent comment author
      if (parent.rows[0].user_id !== req.user.id) {
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, type, post_id, comment_id) VALUES ($1, $2, 'reply', $3, $4)`,
          [parent.rows[0].user_id, req.user.id, postId, comment.id]
        );
      }
    } else {
      // Regular comment notification to post owner
      if (post.rows[0].user_id !== req.user.id) {
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, type, post_id, comment_id) VALUES ($1, $2, 'comment', $3, $4)`,
          [post.rows[0].user_id, req.user.id, postId, comment.id]
        );
      }
    }

    res.status(201).json({
      message: parentId ? "Reply added successfully" : "Comment added successfully",
      comment,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET COMMENTS OF A POST (with replies)
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `
      SELECT
        comments.id,
        comments.content,
        comments.user_id,
        comments.parent_id,
        comments.created_at,
        users.name AS author,
        (SELECT COUNT(*)::int FROM comment_likes WHERE comment_likes.comment_id = comments.id) AS like_count
      FROM comments
      INNER JOIN users
      ON comments.user_id = users.id
      WHERE comments.post_id = $1
      ORDER BY comments.created_at ASC;
      `,
      [postId]
    );

    // Build nested structure: top-level comments + their replies
    const commentMap = {};
    const topLevel = [];

    result.rows.forEach((c) => {
      c.replies = [];
      commentMap[c.id] = c;
    });

    result.rows.forEach((c) => {
      if (c.parent_id) {
        const parent = commentMap[c.parent_id];
        if (parent) parent.replies.push(c);
      } else {
        topLevel.push(c);
      }
    });

    res.status(200).json(topLevel);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Edit Comment
const editComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        message: "Content is required",
      });
    }

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
        message: "Not authorized to edit this comment",
      });
    }

    // Update comment
    const result = await pool.query(
      `UPDATE comments SET content = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [content, id]
    );

    res.status(200).json({
      message: "Comment updated successfully",
      comment: result.rows[0],
    });

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

    // Delete comment (cascades to replies)
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

// TOGGLE COMMENT LIKE
const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await pool.query(
      "SELECT * FROM comments WHERE id = $1",
      [commentId]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const existingLike = await pool.query(
      `SELECT 1 FROM comment_likes WHERE user_id = $1 AND comment_id = $2`,
      [req.user.id, commentId]
    );

    let liked;

    if (existingLike.rows.length > 0) {
      await pool.query(
        `DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2`,
        [req.user.id, commentId]
      );
      liked = false;
    } else {
      await pool.query(
        `INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2)`,
        [req.user.id, commentId]
      );
      liked = true;

      // Notification for comment author (if not self-like)
      if (comment.rows[0].user_id !== req.user.id) {
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, type, post_id, comment_id) VALUES ($1, $2, 'reply', $3, $4)`,
          [comment.rows[0].user_id, req.user.id, comment.rows[0].post_id, commentId]
        );
      }
    }

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM comment_likes WHERE comment_id = $1`,
      [commentId]
    );

    res.status(200).json({
      liked,
      totalLikes: countResult.rows[0].total,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getCommentLikeStatus = async (req, res) => {
  try {
    const { commentId } = req.params;

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM comment_likes WHERE comment_id = $1`,
      [commentId]
    );

    const likeResult = await pool.query(
      `SELECT 1 FROM comment_likes WHERE user_id = $1 AND comment_id = $2`,
      [req.user.id, commentId]
    );

    res.status(200).json({
      totalLikes: countResult.rows[0].total,
      liked: likeResult.rows.length > 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Bulk engagement for a set of comments (liked flag for current user + like totals)
const getCommentsEngagement = async (req, res) => {
  try {
    const ids = String(req.query.ids || "")
      .split(",")
      .map((value) => parseInt(value, 10))
      .filter((value) => Number.isInteger(value) && value > 0);

    if (ids.length === 0) {
      return res.status(200).json({ engagement: {} });
    }

    const engagement = {};
    ids.forEach((id) => {
      engagement[id] = { liked: false, likes: 0 };
    });

    const counts = await pool.query(
      `SELECT comment_id, COUNT(*)::int AS total
       FROM comment_likes
       WHERE comment_id = ANY($1)
       GROUP BY comment_id`,
      [ids]
    );
    counts.rows.forEach((row) => {
      engagement[row.comment_id].likes = row.total;
    });

    if (req.user) {
      const liked = await pool.query(
        `SELECT comment_id FROM comment_likes
         WHERE user_id = $1 AND comment_id = ANY($2)`,
        [req.user.id, ids]
      );
      liked.rows.forEach((row) => {
        engagement[row.comment_id].liked = true;
      });
    }

    res.status(200).json({ engagement });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  deleteComment,
  editComment,
  toggleCommentLike,
  getCommentLikeStatus,
  getCommentsEngagement,
};